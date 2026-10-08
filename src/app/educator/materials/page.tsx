'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Download,
  Plus,
  X,
  File,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
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

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/study-materials`);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('uploadedBy', user.name || 'Educator');
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
        alert('Failed to upload material');
      }
    } catch (err) {
      console.error('Upload error', err);
      alert('Error during upload');
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
                    <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>PDF, Word, PPT (Max 5MB recommended)</span>
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
    </div>
  );
}
