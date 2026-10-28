'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Download,
  Plus,
  X,
  File,
  Calendar,
  AlertCircle,
  Send,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadDate: string;
  sentStudentIds?: string[];
  sentStudentIdsJson?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EducatorMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [materialNotification, setMaterialNotification] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  const openSendModal = async (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setShowSendModal(true);
    setSendSuccess(false);
    setSelectedStudentIds([]);
    setMaterialNotification(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users?role=student`);
      if (res.ok) {
        const data = await res.json();
        const studentList = Array.isArray(data)
          ? data.filter((u: any) => u.role?.toLowerCase() === 'student')
          : [];
        setStudents(studentList);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const handleSendMaterial = async () => {
    if (!selectedMaterial || selectedStudentIds.length === 0) return;

    setMaterialNotification(null);
    const sentList = selectedMaterial.sentStudentIds || [];

    // Check if any selected students already received this
    const alreadySent = selectedStudentIds.filter(id => sentList.includes(id));
    const newlySelected = selectedStudentIds.filter(id => !sentList.includes(id));

    if (newlySelected.length === 0) {
      const names = students
        .filter(s => alreadySent.includes(s.id))
        .map(s => s.name)
        .join(', ') || 'Selected student(s)';
      setMaterialNotification({
        type: 'warning',
        message: `⚠️ Already Sent! This study material has already been sent to ${names}. Cannot re-send.`
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/study-materials/${selectedMaterial.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: newlySelected })
      });

      if (res.status === 409) {
        const errJson = await res.json().catch(() => ({}));
        setMaterialNotification({
          type: 'warning',
          message: `⚠️ Already Sent: ${errJson.message || 'This study material has already been sent to the selected student(s).'}`
        });
        setIsSending(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to send material');
      }

      const data = await res.json();
      setSendSuccess(true);
      setMaterialNotification({
        type: 'success',
        message: `✓ Material successfully sent to ${newlySelected.length} student(s)!`
      });

      // Update material's sentStudentIds locally and refresh
      setSelectedMaterial(prev => prev ? { ...prev, sentStudentIds: data.sentStudentIds } : null);
      fetchMaterials();

      setTimeout(() => {
        setShowSendModal(false);
        setMaterialNotification(null);
        setSendSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setMaterialNotification({
        type: 'error',
        message: 'Error sending material. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const isMyMaterial = useCallback((m: StudyMaterial) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const uploadedBy = (m.uploadedBy || '').trim().toLowerCase();
    const userName = (user.name || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const userId = (user.id || '').trim().toLowerCase();
    const educatorId = (user.educatorId || user.studentId || '').trim().toLowerCase();

    return (
      (userName && uploadedBy === userName) ||
      (userEmail && uploadedBy === userEmail) ||
      (userId && uploadedBy === userId) ||
      (educatorId && uploadedBy === educatorId)
    );
  }, [user]);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const queryParam = user?.name ? `?uploadedBy=${encodeURIComponent(user.name)}` : '';
      const res = await fetch(`${API_BASE_URL}/study-materials${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Strict educator isolation: only show materials uploaded by this educator
          setMaterials(data.filter(isMyMaterial));
        } else {
          setMaterials([]);
        }
      }
    } catch (err) {
      console.error('Error fetching materials', err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [user, isMyMaterial]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50 MB limit. Please select a smaller file.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('uploadedBy', user.name || user.email || user.educatorId || 'Educator');
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/study-materials/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Material uploaded successfully!');
        setShowForm(false);
        setTitle('');
        setDescription('');
        setFile(null);
        fetchMaterials();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.message || `Failed to upload material (Server status: ${res.status})`);
      }
    } catch (err: any) {
      console.error('Upload error', err);
      alert(`Error during upload: ${err?.message || 'Network connection failed or server upload limit exceeded.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/study-materials/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMaterials();
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              RESOURCES
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Study Materials</h1>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="animated-gradient-btn"
          style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={18} />
          Upload Material
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '1rem', border: '1px solid var(--card-border)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Upload New Document</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={20} /></button>
          </div>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Document Title *</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 1 Notes"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', background: 'var(--accent)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the material..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', background: 'var(--accent)', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>File (PDF, DOC, etc) *</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  border: '2px dashed var(--card-border)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', 
                  cursor: 'pointer', background: 'var(--accent)', transition: 'all 0.2s',
                  borderColor: file ? 'var(--educator-primary)' : 'var(--card-border)'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }} 
                  required
                />
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--educator-primary)' }}>
                    <FileText size={32} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 600 }}>{file.name}</span>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--muted-foreground)' }}>
                    <UploadCloud size={32} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 600 }}>Click to browse files</span>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>PDF, Word, PPT (Max 50MB)</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUploading || !file || !title}
              style={{ 
                padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, 
                background: isUploading || !file || !title ? 'var(--card-border)' : 'var(--educator-primary)', 
                color: isUploading || !file || !title ? 'var(--muted-foreground)' : 'white', 
                border: 'none', cursor: isUploading || !file || !title ? 'not-allowed' : 'pointer' 
              }}
            >
              {isUploading ? 'Uploading to Server...' : 'Upload Material'}
            </button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading materials...</div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '3rem', gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted-foreground)', background: 'var(--card)', borderRadius: '1rem', border: '1px solid var(--card-border)' }}>
            <File size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>No study materials uploaded yet.</p>
          </div>
        ) : (
          materials.map((m, i) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ 
                background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '1rem', 
                padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ padding: '0.6rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)', borderRadius: '0.75rem' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--foreground)' }}>{m.title}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> {formatDate(m.uploadDate)}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    onClick={() => openSendModal(m)}
                    title="Send to Students"
                    style={{ background: 'transparent', border: 'none', color: 'var(--educator-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.4rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--educator-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Send size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(m.id)}
                    title="Delete"
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.4rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {m.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: 0, padding: '0.75rem', background: 'var(--accent)', borderRadius: '0.5rem' }}>
                  {m.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)', background: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                  {m.fileName}
                </span>
                <a 
                  href={`${API_BASE_URL}/study-materials/download/${m.id}`}
                  target="_blank"
                  download
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)',
                    padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                  }}>
                    <Download size={14} /> Download
                  </button>
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showSendModal && selectedMaterial && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999, 
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', backdropFilter: 'blur(4px)',
          paddingTop: '12vh'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ 
              background: 'var(--card)', padding: '2rem', borderRadius: '1.25rem', 
              width: '90%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column', maxHeight: '80vh'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem' }}>Send Material</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Share <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{selectedMaterial.title}</span>
                </p>
              </div>
              <button onClick={() => { setShowSendModal(false); setMaterialNotification(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                <X size={20} />
              </button>
            </div>

            {/* In-Modal Notification Alert */}
            <AnimatePresence>
              {materialNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    background: materialNotification.type === 'success' ? '#ecfdf5' : materialNotification.type === 'warning' ? '#fffbeb' : '#fef2f2',
                    color: materialNotification.type === 'success' ? '#065f46' : materialNotification.type === 'warning' ? '#92400e' : '#991b1b',
                    border: `1.5px solid ${materialNotification.type === 'success' ? '#a7f3d0' : materialNotification.type === 'warning' ? '#fde68a' : '#fecaca'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {materialNotification.type === 'success' ? (
                    <Check size={18} color="#059669" style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={18} color={materialNotification.type === 'warning' ? '#d97706' : '#dc2626'} style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1 }}>{materialNotification.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {sendSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={28} color="white" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem' }}>Sent Successfully!</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Recipients will now have access to this study resource.
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                      Select Recipients ({students.filter(s => selectedMaterial.sentStudentIds?.includes(s.id)).length} already sent)
                    </label>
                    <button 
                      onClick={() => {
                        setMaterialNotification(null);
                        const unassigned = students.filter(s => !selectedMaterial.sentStudentIds?.includes(s.id));
                        if (unassigned.length === 0) {
                          setMaterialNotification({
                            type: 'warning',
                            message: '⚠️ All students have already received this study material.'
                          });
                          return;
                        }
                        if (selectedStudentIds.length === unassigned.length) {
                          setSelectedStudentIds([]);
                        } else {
                          setSelectedStudentIds(unassigned.map(s => s.id));
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--educator-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      {selectedStudentIds.length > 0 ? 'Deselect All' : 'Select Remaining'}
                    </button>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {students.map(s => {
                      const isAlreadySent = selectedMaterial.sentStudentIds?.includes(s.id);
                      const isSelected = selectedStudentIds.includes(s.id);

                      return (
                        <div 
                          key={s.id}
                          onClick={() => {
                            if (isAlreadySent) {
                              setMaterialNotification({
                                type: 'warning',
                                message: `⚠️ Already Sent! This study material has already been sent to ${s.name}. Cannot re-send.`
                              });
                              return;
                            }
                            setMaterialNotification(null);
                            if (isSelected) {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                            } else {
                              setSelectedStudentIds([...selectedStudentIds, s.id]);
                            }
                          }}
                          style={{
                            padding: '0.85rem',
                            borderRadius: '0.75rem',
                            border: `2px solid ${isAlreadySent ? '#cbd5e1' : isSelected ? 'var(--educator-primary)' : 'var(--card-border)'}`,
                            background: isAlreadySent ? '#f8fafc' : isSelected ? 'var(--educator-accent)' : 'var(--card)',
                            cursor: isAlreadySent ? 'default' : 'pointer',
                            opacity: isAlreadySent ? 0.75 : 1,
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isAlreadySent ? '#64748b' : isSelected ? 'var(--educator-primary)' : 'var(--foreground)' }}>
                              {s.name}
                            </div>
                            {isAlreadySent ? (
                              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '1rem', background: '#e2e8f0', color: '#475569', fontWeight: 700 }}>
                                Already Sent
                              </span>
                            ) : isSelected ? (
                              <Check size={16} color="var(--educator-primary)" />
                            ) : null}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => { setShowSendModal(false); setMaterialNotification(null); }}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendMaterial}
                    disabled={isSending || selectedStudentIds.length === 0}
                    style={{ 
                      flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', 
                      background: isSending ? '#94a3b8' : 'var(--educator-primary)', color: 'white', fontWeight: 700, 
                      cursor: (isSending || selectedStudentIds.length === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      opacity: (isSending || selectedStudentIds.length === 0) ? 0.7 : 1
                    }}
                  >
                    {isSending ? 'Sending...' : <><Send size={16} /> Send Now {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''}</>}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
