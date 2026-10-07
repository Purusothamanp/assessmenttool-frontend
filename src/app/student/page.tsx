'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, CheckSquare, Clock, ArrowRight, Award, Trophy } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [topStudent, setTopStudent] = useState<{name: string, score: number, assessmentTitle: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchSubmissions = useCallback(async () => {
    try {
      if (!user) return;
      const response = await fetch(`${API_BASE_URL}/submissions?studentName=${encodeURIComponent(user.name)}`);
      const data = await response.json();
      setSubmissions(data.reverse());

      // Fetch all submissions to find top performer
      const allSubRes = await fetch(`${API_BASE_URL}/submissions`);
      const allSubData = await allSubRes.json();
      
      const passedSubmissions = allSubData.filter((s: Submission) => s.status === 'Passed' || s.score > 0);
      if (passedSubmissions.length > 0) {
        const maxScore = Math.max(...passedSubmissions.map((s: Submission) => s.score));
        const topSubs = passedSubmissions.filter((s: Submission) => s.score === maxScore);
        
        const topNames = Array.from(new Set(topSubs.map((s: Submission) => s.studentName))).join(', ');
        const topAssessments = Array.from(new Set(topSubs.map((s: Submission) => s.assessmentTitle))).join(', ');
        
        setTopStudent({
          name: topNames,
          score: maxScore,
          assessmentTitle: topAssessments
        });
      } else {
        setTopStudent(null);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const pending = submissions.filter(s => s.status === 'Pending');
  const completed = submissions.filter(s => s.status === 'Passed' || s.status === 'Failed');

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Student Dashboard</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
          Welcome back, <span style={{ fontWeight: 800, color: 'var(--student-primary)' }}>{user?.name || 'Student'}</span>! 
          {user?.studentId && <span style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>ID: {user.studentId}</span>}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.6rem', borderRadius: '0.75rem' }}>
            <Clock size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.1rem', marginTop: 0 }}>To Do / Pending</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{pending.length}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.6rem', borderRadius: '0.75rem' }}>
            <CheckSquare size={22} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.1rem', marginTop: 0 }}>Completed</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{completed.length}</h3>
          </div>
        </div>
      </div>

      {/* Top Performer Card */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fbbf24', boxShadow: '0 8px 20px -5px rgba(245, 158, 11, 0.3), 0 0 10px rgba(251, 191, 36, 0.2)', position: 'relative', overflow: 'hidden', padding: '1rem 1.25rem', borderRadius: '1rem', marginBottom: '2rem' }}
      >
        <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', opacity: 0.15 }}>
          <Trophy size={100} color="#d97706" />
        </div>
        <div style={{ background: '#f59e0b', color: 'white', padding: '0.6rem', borderRadius: '0.75rem', boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)', zIndex: 1 }}>
          <Award size={24} />
        </div>
        <div style={{ zIndex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem', marginTop: 0 }}>Platform Top Performer</p>
          {topStudent ? (
            <>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topStudent.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#b45309', margin: '0.15rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Scored <b>{topStudent.score}%</b> in {topStudent.assessmentTitle}</p>
            </>
          ) : (
            <p style={{ fontSize: '0.9rem', color: '#b45309', margin: 0 }}>No submissions yet.</p>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Due Soon</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {pending.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div style={{ background: 'var(--accent)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckSquare size={30} style={{ color: 'var(--muted)' }} />
            </div>
            <h3>You are all caught up!</h3>
            <p>No pending assessments at the moment.</p>
          </div>
        ) : (
          pending.slice(0, 3).map((sub, i) => (
            <div key={sub.id} style={{ padding: '1.5rem', borderBottom: i !== pending.length - 1 ? '1px solid var(--card-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: '48px', height: '48px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{sub.assessmentTitle}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> Assigned: {sub.date}
                  </p>
                </div>
              </div>
              <Link href={`/student/assessments/${sub.id}`} style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '2rem', background: '#8b5cf6' }}>
                  Start <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
