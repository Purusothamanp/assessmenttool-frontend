'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  CheckCircle2,
  HelpCircle,
  FileText,
  Send,
  List,
  LayoutGrid,
  Layers,
  Award,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface Assessment {
  id: string;
  title: string;
  type: string;
  category: string;
  topic: string;
  questionFormats: string[];
  questions?: {
    id: number;
    text: string;
    type: 'MCQ' | 'ShortAnswer' | 'TrueFalse' | 'Essay';
    options?: string[];
    correctAnswer?: number;
    marks?: number;
  }[];
  creatorId: string;
  date: string;
  deadline?: string;
  timeDuration?: string;
}

export default function ManageAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Assignment specific states
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(['All']);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Quiz');
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [deadline, setDeadline] = useState('');
  const [timeDuration, setTimeDuration] = useState('');
  const [questions, setQuestions] = useState<{ id: number; text: string; type: 'MCQ' | 'ShortAnswer' | 'TrueFalse' | 'Essay'; options?: string[]; correctAnswer?: number; marks?: number }[]>([]);
  const [formats, setFormats] = useState({
    multipleChoice: true,
    trueFalse: false,
    shortAnswer: false,
    essay: false
  });

  const fetchAssessments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments`);
      const data = await response.json();
      const myData = data.filter((a: Assessment) => a.creatorId === user?.id);
      setAssessments(myData.reverse());
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchAssessments();

    const getStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users?role=student`);
        const data = await res.json();
        const studentOnly = Array.isArray(data)
          ? data.filter((u: any) => u.role?.toLowerCase() === 'student')
          : [];
        setStudentsList(studentOnly);
      } catch (e) {
        console.error('Failed to load students for assignment:', e);
      }
    };
    getStudents();
  }, [user, fetchAssessments]);

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    const selectedFormats = Object.entries(formats)
      .filter(([, checked]) => checked)
      .map(([name]) => name);

    const assessmentData = {
      id: Math.random().toString(36).substring(2, 15),
      title,
      type,
      category,
      topic,
      deadline,
      timeDuration,
      questionFormats: selectedFormats,
      questions,
      date: new Date().toLocaleDateString('en-CA'),
      creatorId: user?.id || 'educator_1'
    };

    try {
      if (editingAssessment) {
        await fetch(`${API_BASE_URL}/assessments/${editingAssessment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingAssessment, title, type, category, topic, deadline, timeDuration, questionFormats: selectedFormats, questions })
        });
      } else {
        await fetch(`${API_BASE_URL}/assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData)
        });
      }
      fetchAssessments();
      closeModal();
    } catch (err) {
      console.error('Error saving assessment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      try {
        await fetch(`${API_BASE_URL}/assessments/${id}`, { method: 'DELETE' });
        fetchAssessments();
      } catch (err) {
        console.error('Error deleting assessment:', err);
      }
    }
  };

  const handleExportAssessment = async (assessment: Assessment) => {
    try {
      const [sRes, uRes] = await Promise.all([
        fetch(`${API_BASE_URL}/submissions`),
        fetch(`${API_BASE_URL}/users?role=student`)
      ]);
      
      if (!sRes.ok) throw new Error('Failed to fetch submissions');
      
      const allSubmissions = await sRes.json();
      const allUsers = await uRes.json();
      const validStudentNames = new Set(allUsers.map((u: any) => u.name));
      
      // Filter submissions for this assessment that have been attempted and belong to existing students
      const attended = allSubmissions.filter((s: any) => 
        (s.assessmentId === assessment.id || s.assessmentTitle === assessment.title) && 
        s.status !== 'Pending' &&
        validStudentNames.has(s.studentName)
      );

      if (attended.length === 0) {
        alert('No students have completed this assessment yet. No data to export.');
        return;
      }

      // Generate CSV
      const headers = ['Student Name', 'Department', 'Assessment Title', 'Score (%)', 'Status'];
      const rows = attended.map((s: any) => {
        const dept = assessment.category || 'N/A';
        return `"${s.studentName || 'Unknown'}","${dept}","${s.assessmentTitle || assessment.title}",${s.score},"${s.status}"`;
      });
      
      const csvContent = [headers.join(','), ...rows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${assessment.title.replace(/\s+/g, '_')}_student_results.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Error exporting data. Please try again.');
    }
  };

  const openEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setTitle(assessment.title);
    setType(assessment.type);
    setCategory(assessment.category);
    setTopic(assessment.topic);
    setDeadline(assessment.deadline || '');
    setTimeDuration(assessment.timeDuration || '');
    setQuestions(assessment.questions || []);

    const newFormats = {
      multipleChoice: assessment.questionFormats.includes('multipleChoice'),
      trueFalse: assessment.questionFormats.includes('trueFalse'),
      shortAnswer: assessment.questionFormats.includes('shortAnswer'),
      essay: assessment.questionFormats.includes('essay')
    };
    setFormats(newFormats);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssessment(null);
    setTitle('');
    setType('Quiz');
    setCategory('');
    setTopic('');
    setDeadline('');
    setTimeDuration('');
    setQuestions([]);
    setFormats({
      multipleChoice: true,
      trueFalse: false,
      shortAnswer: false,
      essay: false
    });
  };

  // Stats calculation
  const totalAssessments = assessments.length;
  const quizCount = assessments.filter(a => a.type === 'Quiz').length;
  const assignmentCount = assessments.filter(a => a.type === 'Assignment').length;
  const examCount = assessments.filter(a => a.type === 'Exam' || a.type === 'Test').length;

  const stats = [
    { label: 'Total Assessments', value: totalAssessments, icon: BookOpen, color: '#059669', filterKey: 'all' },
    { label: 'Quizzes', value: quizCount, icon: Layers, color: '#10b981', filterKey: 'Quiz' },
    { label: 'Assignments', value: assignmentCount, icon: FileText, color: '#f59e0b', filterKey: 'Assignment' },
    { label: 'Exams', value: examCount, icon: Award, color: '#8b5cf6', filterKey: 'Exam' },
  ];

  const filtered = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'Exam' ? (a.type === 'Exam' || a.type === 'Test') : a.type === typeFilter);
    return matchesSearch && matchesType;
  });

  const displayedAssessments = showAll ? filtered : filtered.slice(0, 3);

  const getNewQ = () => {
    const type = formats.multipleChoice ? 'MCQ' : formats.trueFalse ? 'TrueFalse' : formats.shortAnswer ? 'ShortAnswer' : formats.essay ? 'Essay' : 'MCQ';
    return {
      id: Date.now(),
      text: '',
      type,
      options: type === 'TrueFalse' ? ['True', 'False'] : type === 'ShortAnswer' || type === 'Essay' ? [] : ['', '', '', ''],
      correctAnswer: type === 'ShortAnswer' || type === 'Essay' ? undefined : 0,
      marks: 1
    };
  };

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              ASSESSMENT MANAGEMENT
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Manage assessment</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.1rem',
            fontSize: '0.85rem',
            background: 'var(--educator-primary)',
            boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.4)'
          }}
        >
          <Plus size={18} />
          Create assessments
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = typeFilter === stat.filterKey;
          return (
            <div 
              key={stat.label} 
              onClick={() => setTypeFilter(typeFilter === stat.filterKey ? 'all' : stat.filterKey)}
              className="premium-card stat-hover-card" 
              style={{ 
                padding: '0.85rem 1rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                border: isSelected ? `2px solid ${stat.color}` : '1px solid var(--card-border)',
                background: isSelected ? `color-mix(in srgb, ${stat.color} 15%, var(--card))` : 'var(--card)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{ 
                  background: `${stat.color}20`, 
                  color: stat.color, 
                  padding: '0.65rem', 
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--foreground)' }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Table Container */}
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1px solid var(--card-border)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem', color: 'var(--foreground)' }}>Active Assessments</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Create, organize and assign assessments.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Showing {displayedAssessments.length} of {filtered.length}</span>
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--educator-primary)', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {showAll ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + View Switcher) */}
        <div style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              placeholder="Search by assessment title, department or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--card-border)',
                background: 'var(--card)',
                color: 'var(--foreground)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--card)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'table' ? 'var(--educator-accent)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--educator-primary)' : 'var(--muted-foreground)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'grid' ? 'var(--educator-accent)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--educator-primary)' : 'var(--muted-foreground)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem 1.5rem', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading your studio...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={40} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>No assessments found.</p>
              <button onClick={() => setShowModal(true)} className="btn-secondary" style={{ border: 'none', background: 'var(--educator-accent)', color: 'var(--educator-primary)', fontWeight: 700 }}>
                Get Started
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 0.75rem' }}>Title</th>
                  <th style={{ padding: '0 0.75rem' }}>Type</th>
                  <th style={{ padding: '0 0.75rem' }}>Question Formats</th>
                  <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAssessments.map((a) => (
                  <tr
                    key={a.id}
                    className="report-row-premium"
                    style={{ background: 'var(--card)', borderRadius: '0.75rem', border: '1px solid var(--card-border)', transition: 'all 0.2s' }}
                  >
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem', borderLeft: '1px solid var(--card-border)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', flexShrink: 0, background: 'var(--accent)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--educator-primary)' }}>
                          <FileText size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{a.title}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>{a.topic || 'General Topic'} • Created: {a.date}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--accent)', border: '1px solid var(--card-border)', borderRadius: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>{a.type}</span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {a.questionFormats.slice(0, 3).map(f => (
                          <span key={f} style={{
                            fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'var(--accent)',
                            borderRadius: '2rem', border: '1px solid var(--card-border)', fontWeight: 600, color: 'var(--foreground)'
                          }}>
                            {f.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right', borderRight: '1px solid var(--card-border)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setSelectedAssessment(a); setShowAssignModal(true); }}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: 'var(--educator-accent)',
                            color: 'var(--educator-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Assign Assessment"
                        >
                          <Send size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleExportAssessment(a)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)',
                            color: '#2563eb', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Export Data"
                        >
                          <Download size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEdit(a)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent)',
                            color: 'var(--foreground)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(a.id)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)',
                            color: 'var(--destructive)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {displayedAssessments.map((a) => (
                <div key={a.id} className="user-card-item" style={{ padding: '1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--educator-accent)', color: 'var(--educator-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>
                      {a.type}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.85rem' }}>{a.topic || 'General Topic'}</p>

                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    {a.questionFormats.slice(0, 3).map(f => (
                      <span key={f} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', fontWeight: 600 }}>
                        {f.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.date}</span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => { setSelectedAssessment(a); setShowAssignModal(true); }}
                        className="user-action-btn edit"
                        title="Assign"
                      >
                        <Send size={16} />
                      </button>
                      <button 
                        onClick={() => handleExportAssessment(a)}
                        className="user-action-btn edit"
                        title="Export Data"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => openEdit(a)}
                        className="user-action-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="user-action-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.65)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="premium-card"
              style={{ width: '100%', maxWidth: '650px', padding: '3rem', borderRadius: '1.5rem', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'absolute', inset: 0, background: '#059669', filter: 'blur(20px)', opacity: 0.4, borderRadius: '50%' }} />
                  <div style={{
                    position: 'relative', width: '72px', height: '72px',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
                  }}>
                    <Send size={32} />
                  </div>
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '0.4rem', color: '#0f172a' }}>Publish Content</h2>
                <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>{selectedAssessment?.title}</p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Target Audience
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem', paddingBottom: '0.5rem' }}>
                  <div
                    onClick={() => setSelectedAssignees(['All'])}
                    style={{
                      gridColumn: '1 / -1',
                      padding: '1rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: selectedAssignees.includes('All') ? '#ecfdf5' : '#f8fafc',
                      border: `2px solid ${selectedAssignees.includes('All') ? '#10b981' : 'transparent'}`,
                      boxShadow: selectedAssignees.includes('All') ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedAssignees.includes('All') ? '#10b981' : '#e2e8f0', color: selectedAssignees.includes('All') ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🚀</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: selectedAssignees.includes('All') ? '#065f46' : '#0f172a', fontSize: '0.95rem' }}>All Active Students</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: selectedAssignees.includes('All') ? '#047857' : '#64748b' }}>Assign to everyone</p>
                    </div>
                    {selectedAssignees.includes('All') && <CheckCircle2 size={20} color="#10b981" />}
                  </div>

                  {studentsList.map(s => {
                    const isSelected = selectedAssignees.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (selectedAssignees.includes('All')) {
                            setSelectedAssignees([s.id]);
                          } else {
                            if (isSelected) {
                              const newSelection = selectedAssignees.filter(id => id !== s.id);
                              setSelectedAssignees(newSelection.length > 0 ? newSelection : ['All']);
                            } else {
                              setSelectedAssignees([...selectedAssignees, s.id]);
                            }
                          }
                        }}
                        style={{
                          padding: '1rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.2s ease',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          background: isSelected ? '#ecfdf5' : '#f8fafc',
                          border: `2px solid ${isSelected ? '#10b981' : 'transparent'}`,
                          boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isSelected ? '#10b981' : '#e2e8f0', color: isSelected ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: isSelected ? '#065f46' : '#0f172a', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: isSelected ? '#047857' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={20} color="#10b981" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAssignModal(false)} 
                  style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)' }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      const targets = selectedAssignees.includes('All')
                        ? studentsList
                        : studentsList.filter(s => selectedAssignees.includes(s.id));

                      for (const student of targets) {
                        await fetch(`${API_BASE_URL}/submissions`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: Math.random().toString(36).substring(2, 10),
                            studentName: student.name,
                            assessmentId: selectedAssessment?.id || '',
                            assessmentTitle: selectedAssessment?.title || '',
                            score: 0,
                            status: 'Pending',
                            date: new Date().toLocaleDateString('en-CA')
                          })
                        });
                      }
                      alert(`Published to ${targets.length} student(s) successfully!`);
                      setShowAssignModal(false);
                      setSelectedAssignees(['All']);
                    } catch (err) {
                      console.error(err);
                      alert('Error assigning assessment');
                    }
                  }}
                  style={{ flex: 2, padding: '1rem', borderRadius: '1rem', border: 'none', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(5, 150, 105, 0.39)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Send size={18} /> Publish Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="premium-card"
              style={{
                width: '100%', maxWidth: '820px', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--card-border)',
                borderRadius: '1.75rem', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)', overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem 2rem', borderBottom: '1px solid var(--card-border)', background: 'var(--accent)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.4)'
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--foreground)' }}>
                      {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                      Configure assessment details, department, subject and questions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    color: 'var(--muted-foreground)', cursor: 'pointer', width: '34px', height: '34px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="Close"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>

                {/* Basic Details Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--educator-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    1. Basic Information
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.45rem', fontWeight: 700, color: 'var(--foreground)' }}>
                        Assessment Title <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        style={{
                          padding: '0.85rem 1.1rem', width: '100%', borderRadius: '0.85rem',
                          border: '1px solid var(--card-border)', background: 'var(--accent)',
                          color: 'var(--foreground)', fontSize: '0.95rem', outline: 'none'
                        }}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      />
                    </div>

                    {/* Department & Subject: Side-by-Side (50% / 50%) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.45rem', fontWeight: 700, color: 'var(--foreground)' }}>
                          Department
                        </label>
                        <input
                          style={{
                            padding: '0.85rem 1.1rem', width: '100%', borderRadius: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--accent)',
                            color: 'var(--foreground)', fontSize: '0.95rem', outline: 'none'
                          }}
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.45rem', fontWeight: 700, color: 'var(--foreground)' }}>
                          Subject
                        </label>
                        <input
                          style={{
                            padding: '0.85rem 1.1rem', width: '100%', borderRadius: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--accent)',
                            color: 'var(--foreground)', fontSize: '0.95rem', outline: 'none'
                          }}
                          value={topic}
                          onChange={e => setTopic(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Deadline and Duration Field: Side-by-Side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.45rem', fontWeight: 700, color: 'var(--foreground)' }}>
                          Assessment Deadline
                        </label>
                        <input
                          type="datetime-local"
                          style={{
                            padding: '0.85rem 1.1rem', width: '100%', borderRadius: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--accent)',
                            color: 'var(--foreground)', fontSize: '0.95rem', outline: 'none'
                          }}
                          value={deadline}
                          onChange={e => setDeadline(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.45rem', fontWeight: 700, color: 'var(--foreground)' }}>
                          Time Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 60"
                          style={{
                            padding: '0.85rem 1.1rem', width: '100%', borderRadius: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--accent)',
                            color: 'var(--foreground)', fontSize: '0.95rem', outline: 'none'
                          }}
                          value={timeDuration}
                          onChange={e => setTimeDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Assessment Type Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.45rem', fontWeight: 700, color: 'var(--foreground)' }}>
                        Assessment Type
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {[
                          { key: 'Quiz', label: 'Quiz', icon: Layers, desc: 'Quick check-in' },
                          { key: 'Assignment', label: 'Assignment', icon: FileText, desc: 'Task / Homework' },
                          { key: 'Exam', label: 'Exam', icon: Award, desc: 'Formal evaluation' }
                        ].map((t) => {
                          const isSelected = type === t.key;
                          const TIcon = t.icon;
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setType(t.key)}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '0.85rem 0.5rem', borderRadius: '0.85rem',
                                border: isSelected ? '2px solid var(--educator-primary)' : '1px solid var(--card-border)',
                                background: isSelected ? 'var(--educator-accent)' : 'var(--accent)',
                                color: isSelected ? 'var(--educator-primary)' : 'var(--foreground)',
                                cursor: 'pointer', transition: 'all 0.2s', gap: '0.25rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                                <TIcon size={16} />
                                {t.label}
                              </div>
                              <span style={{ fontSize: '0.72rem', color: isSelected ? 'var(--educator-primary)' : 'var(--muted-foreground)' }}>
                                {t.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Formats Section */}
                <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.75rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--educator-primary)', marginBottom: '0.35rem' }}>
                    2. Allowed Question Formats
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Select which question formats students will see in this assessment.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
                    {[
                      { id: 'multipleChoice', label: 'Multiple Choice', icon: CheckCircle2 },
                      { id: 'trueFalse', label: 'True / False', icon: HelpCircle },
                      { id: 'shortAnswer', label: 'Short Answer', icon: FileText },
                      { id: 'essay', label: 'Essay Question', icon: BookOpen },
                    ].map((f) => {
                      const Icon = f.icon;
                      const isChecked = formats[f.id as keyof typeof formats];
                      return (
                        <label key={f.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
                          background: isChecked ? 'var(--educator-accent)' : 'var(--accent)',
                          border: `1.5px solid ${isChecked ? 'var(--educator-primary)' : 'var(--card-border)'}`,
                          borderRadius: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                          boxShadow: isChecked ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none'
                        }}>
                          <input
                            type="radio"
                            name="questionFormat"
                            style={{ width: '17px', height: '17px', accentColor: 'var(--educator-primary)' }}
                            checked={isChecked}
                            onChange={() => setFormats({
                              multipleChoice: f.id === 'multipleChoice',
                              trueFalse: f.id === 'trueFalse',
                              shortAnswer: f.id === 'shortAnswer',
                              essay: f.id === 'essay'
                            })}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <Icon size={16} color={isChecked ? 'var(--educator-primary)' : 'var(--muted-foreground)'} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isChecked ? 'var(--educator-primary)' : 'var(--foreground)' }}>{f.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Questions Builder Section */}
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--educator-primary)', margin: 0 }}>
                        3. Questions ({questions.length})
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', margin: '0.2rem 0 0 0' }}>Build questions and specify the correct answers.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuestions([...questions, getNewQ()])}
                      className="btn-primary"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        background: 'var(--educator-primary)', padding: '0.55rem 1rem', fontSize: '0.82rem', borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                      }}
                    >
                      <Plus size={16} /> Add Question
                    </button>
                  </div>

                  {questions.length === 0 ? (
                    <div
                      onClick={() => setQuestions([getNewQ()])}
                      style={{
                        padding: '2.5rem 1.5rem', textAlign: 'center', background: 'var(--accent)',
                        borderRadius: '1rem', color: 'var(--muted-foreground)', border: '2px dashed var(--card-border)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Plus size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', margin: '0 0 0.25rem 0' }}>No questions added yet</p>
                      <p style={{ fontSize: '0.82rem', margin: 0 }}>Click here or &quot;+ Add Question&quot; to start adding questions.</p>
                    </div>
                  ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {questions.map((q, qIndex) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={q.id}
                        style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '1.25rem', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', background: 'var(--educator-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>{qIndex + 1}</span>
                            <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderRadius: '0.75rem', fontWeight: 600, border: '1px solid var(--card-border)', background: 'var(--accent)', color: 'var(--foreground)' }}>
                              {q.type === 'MCQ' ? 'Multiple Choice' : q.type === 'TrueFalse' ? 'True / False' : q.type === 'ShortAnswer' ? 'Short Answer' : 'Essay Question'}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--card-border)' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Marks</label>
                              <input 
                                type="number" 
                                min="1"
                                value={q.marks || 1} 
                                onChange={e => { const newQ = [...questions]; newQ[qIndex].marks = parseInt(e.target.value) || 0; setQuestions(newQ); }}
                                style={{ width: '55px', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '0.5rem', border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--foreground)', textAlign: 'center' }}
                              />
                            </div>
                          </div>
                          <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} style={{ color: 'var(--destructive)', background: 'rgba(239, 68, 68, 0.12)', border: 'none', padding: '0.45rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <textarea
                          value={q.text}
                          onChange={e => { const newQ = [...questions]; newQ[qIndex].text = e.target.value; setQuestions(newQ); }}
                          placeholder="State the problem or question..."
                          rows={2}
                          style={{ width: '100%', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--accent)', borderRadius: '0.85rem', border: '1px solid var(--card-border)', color: 'var(--foreground)', fontSize: '0.95rem', fontWeight: 500 }}
                        />

                        {q.type === 'ShortAnswer' || q.type === 'Essay' ? (
                          <div style={{ padding: '1.25rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: '0.85rem', border: '1px dashed var(--educator-primary)', color: 'var(--educator-primary)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <HelpCircle size={20} style={{ opacity: 0.7 }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{q.type === 'Essay' ? 'Reflective Essay - Requires manual scoring.' : 'Direct Short Answer - Requires manual scoring.'}</p>
                          </div>
                        ) : q.type === 'TrueFalse' ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {['True', 'False'].map((opt, optIndex) => (
                              <label key={optIndex} style={{
                                display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem',
                                background: q.correctAnswer === optIndex ? 'var(--educator-accent)' : 'var(--accent)',
                                borderRadius: '0.85rem', border: `2px solid ${q.correctAnswer === optIndex ? 'var(--educator-primary)' : 'var(--card-border)'}`,
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}>
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === optIndex}
                                  onChange={() => { const newQ = [...questions]; newQ[qIndex].correctAnswer = optIndex; setQuestions(newQ); }}
                                  style={{ width: '18px', height: '18px', accentColor: 'var(--educator-primary)' }}
                                />
                                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--foreground)' }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {(q.options || []).map((opt, optIndex) => (
                              <div key={optIndex} style={{
                                display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.6rem 1rem',
                                background: 'var(--accent)', borderRadius: '0.85rem', border: q.correctAnswer === optIndex ? '2px solid var(--educator-primary)' : '1px solid var(--card-border)',
                                boxShadow: q.correctAnswer === optIndex ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none'
                              }}>
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === optIndex}
                                  onChange={() => { const newQ = [...questions]; newQ[qIndex].correctAnswer = optIndex; setQuestions(newQ); }}
                                  style={{ width: '18px', height: '18px', accentColor: 'var(--educator-primary)' }}
                                />
                                <input
                                  value={opt}
                                  onChange={e => { const newQ = [...questions]; newQ[qIndex].options![optIndex] = e.target.value; setQuestions(newQ); }}
                                  placeholder={`Option ${optIndex + 1}`}
                                  style={{ width: '100%', padding: '0.35rem', background: 'transparent', border: 'none', boxShadow: 'none', color: 'var(--foreground)', fontWeight: 600 }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.25rem 2rem', borderTop: '1px solid var(--card-border)', background: 'var(--accent)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>Total Questions: <strong style={{ color: 'var(--foreground)' }}>{questions.length}</strong></span>
                  <span style={{ width: '1px', height: '14px', background: 'var(--card-border)' }}></span>
                  <span>Total Marks: <strong style={{ color: 'var(--educator-primary)' }}>{questions.reduce((sum, q) => sum + (q.marks || 1), 0)}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <button onClick={closeModal} className="btn-secondary" style={{ padding: '0.65rem 1.4rem', fontWeight: 700, borderRadius: '0.75rem', fontSize: '0.88rem' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                    style={{
                      padding: '0.65rem 1.85rem', background: 'var(--educator-primary)', fontWeight: 800,
                      borderRadius: '0.75rem', fontSize: '0.88rem', boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.4)'
                    }}
                  >
                    {editingAssessment ? 'Update Assessment' : 'Save Assessment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .report-row-premium:hover {
          background-color: var(--accent) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
