'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  GraduationCap,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  dob: string;
  status: string;
  lastLogin: string;
}

export default function StudentDirectory() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users?role=student`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const studentList = data.filter((u: any) => u.role?.toLowerCase() === 'student');
          setStudents(studentList);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              STUDENT DIRECTORY
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>All Enrolled Students</h1>
        </div>
      </div>

      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1px solid var(--card-border)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem', color: 'var(--foreground)' }}>Registered Students</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>View all students registered in the platform.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Showing {filteredStudents.length} Students</span>
          </div>
        </div>

        <div style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              placeholder="Search by student name or ID..."
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
        </div>

        <div style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600 }}>No students found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredStudents.map((s, i) => {
                const initials = s.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                return (
                  <motion.div 
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ 
                      padding: '1.25rem', 
                      background: 'var(--card)', 
                      border: '1px solid var(--card-border)',
                      borderRadius: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.25s'
                    }}
                    whileHover={{ translateY: -2, boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)', borderColor: 'var(--educator-primary)' }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                      }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--foreground)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.name}
                          </h4>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', borderRadius: '2rem', fontSize: '0.65rem', fontWeight: 700,
                            background: s.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: s.status === 'active' ? '#10b981' : '#ef4444'
                          }}>
                            {s.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}>
                          <Hash size={13} style={{ color: 'var(--muted-foreground)' }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                            {s.studentId || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--accent)', padding: '0.85rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: 500 }}>
                        <Mail size={14} style={{ color: 'var(--muted-foreground)' }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: 500 }}>
                        <Calendar size={14} style={{ color: 'var(--muted-foreground)' }} />
                        <span>DOB: {s.dob || 'Not provided'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
