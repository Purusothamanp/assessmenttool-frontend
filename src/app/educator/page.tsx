'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock,
  TrendingUp,
  ArrowRight,
  FileText,
  Calendar,
  ChevronRight,
  Trophy,
  Award,
  LayoutGrid,
  List
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface Assessment {
  id: string;
  title: string;
  type: string;
  category: string;
  topic: string;
  questionFormats: string[];
  creatorId: string;
  date: string;
  deadline?: string;
}

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}

export default function EducatorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [stats, setStats] = useState([
    { label: 'My Assessments', value: '0', icon: BookOpen, color: '#10b981', trend: 'Live' },
    { label: 'Active Students', value: '0', icon: Users, color: '#3b82f6', trend: 'Live' },
    { label: 'Completed Submissions', value: '0', icon: CheckCircle, color: '#8b5cf6', trend: 'Live' },
    { label: 'Avg. Score', value: '0%', icon: Clock, color: '#f59e0b', trend: 'Live' },
  ]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch Assessments
      const aRes = await fetch(`${API_BASE_URL}/assessments`);
      const allAssessments = await aRes.json();
      const myAssessments = allAssessments.filter((a: Assessment) => a.creatorId === user?.id);

      // Fetch Students
      const uRes = await fetch(`${API_BASE_URL}/users?role=student`);
      const allUsers = await uRes.json();
      const students = Array.isArray(allUsers)
        ? allUsers.filter((u: any) => u.role?.toLowerCase() === 'student')
        : [];
        
      const validStudentNames = new Set(students.map((u: any) => u.name));

      // Fetch Submissions
      const sRes = await fetch(`${API_BASE_URL}/submissions`);
      const allSubmissions = await sRes.json();
      
      // Filter submissions for user's assessments
      const myAssessmentTitles = myAssessments.map((a: Assessment) => a.title);
      // Only include submissions that are not 'Pending' and belong to existing students
      const mySubmissions = allSubmissions.filter((s: Submission) => 
        myAssessmentTitles.includes(s.assessmentTitle) && 
        s.status !== 'Pending' && 
        validStudentNames.has(s.studentName)
      );
      setSubmissions(mySubmissions.reverse());

      // Calculate Avg Score
      const avgScore = mySubmissions.length > 0
        ? Math.round(mySubmissions.reduce((acc: number, curr: Submission) => acc + curr.score, 0) / mySubmissions.length)
        : 0;

      setStats([
        { label: 'My Assessments', value: myAssessments.length.toString(), icon: BookOpen, color: '#10b981', trend: 'Live Data' },
        { label: 'Active Students', value: students.filter((s: any) => s.status?.toLowerCase() === 'active').length.toString(), icon: Users, color: '#3b82f6', trend: 'Live Data' },
        { label: 'Completed Submissions', value: mySubmissions.length.toString(), icon: CheckCircle, color: '#8b5cf6', trend: 'Live Data' },
        { label: 'Avg. Score', value: `${avgScore}%`, icon: Clock, color: '#f59e0b', trend: 'Live Data' },
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [user, fetchDashboardData]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Educator Dashboard</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
          Welcome back, <span style={{ fontWeight: 800, color: 'var(--educator-primary)' }}>{user?.name || 'Educator'}</span>!
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.12)' }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                padding: '1.25rem',
                borderRadius: '1.25rem',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: `linear-gradient(135deg, ${stat.color}15 0%, #ffffff 100%)`, 
                  color: stat.color, 
                  padding: '0.75rem', 
                  borderRadius: '0.85rem',
                  boxShadow: `0 4px 12px ${stat.color}20` 
                }}>
                  <Icon size={26} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a' }}>{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

        {/* Recent Submissions Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ 
            padding: '0', 
            overflow: 'hidden', 
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', 
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 4px 10px -5px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--educator-accent)', color: 'var(--educator-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
                  <TrendingUp size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', margin: 0, letterSpacing: '-0.02em' }}>Recent Student Submissions</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', marginBottom: 0, fontWeight: 500 }}>Real-time student assessment attempts & grades</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '0.75rem', padding: '0.25rem', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
                <button 
                  onClick={() => setViewMode('list')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', background: viewMode === 'list' ? 'var(--educator-accent)' : 'transparent', color: viewMode === 'list' ? 'var(--educator-primary)' : 'var(--muted-foreground)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', background: viewMode === 'grid' ? 'var(--educator-accent)' : 'transparent', color: viewMode === 'grid' ? 'var(--educator-primary)' : 'var(--muted-foreground)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
              <Link href="/educator/results" style={{ textDecoration: 'none' }}>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-secondary"
                  style={{ 
                    fontSize: '0.82rem', color: 'var(--educator-primary)', fontWeight: 700, 
                    padding: '0.5rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--card-border)'
                  }}
                >
                  View All Submissions
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Table Body */}
          <div style={{ padding: '1.25rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading latest submissions...</div>
            ) : submissions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                <FileText size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontWeight: 600 }}>No recent student submissions yet.</p>
              </div>
            ) : (
              <div style={{ 
                display: viewMode === 'grid' ? 'grid' : 'flex', 
                flexDirection: viewMode === 'grid' ? 'row' : 'column',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
                gap: '0.85rem',
                alignItems: viewMode === 'grid' ? 'flex-start' : 'stretch'
              }}>
                {submissions.slice(0, 5).map((sub, i) => {
                  const scoreColor = sub.score >= 70 ? '#10b981' : sub.score >= 50 ? '#3b82f6' : '#f59e0b';
                  const initials = sub.studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

                  return (
                    <motion.div 
                      key={sub.id || i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ 
                        padding: viewMode === 'grid' ? '0.85rem 1rem' : '1rem 1.25rem', 
                        background: 'var(--card)', 
                        border: '1px solid var(--card-border)',
                        borderRadius: '1rem',
                        display: 'flex',
                        flexDirection: viewMode === 'grid' ? 'column' : 'row',
                        alignItems: viewMode === 'grid' ? 'flex-start' : 'center',
                        justifyContent: viewMode === 'grid' ? 'flex-start' : 'space-between',
                        gap: viewMode === 'grid' ? '0.85rem' : '1rem',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      whileHover={{ translateY: -2, boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)', borderColor: 'var(--educator-primary)' }}
                    >
                      {/* Left: Student Avatar + Info */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '1 1 220px', minWidth: '180px' }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                        }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sub.studentName}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <FileText size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sub.assessmentTitle}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle & Right Stats */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        flexWrap: 'wrap', 
                        flexShrink: 0,
                        width: viewMode === 'grid' ? '100%' : 'auto',
                        justifyContent: viewMode === 'grid' ? 'space-between' : 'flex-end'
                      }}>
                        {/* Score & Progress Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', width: '110px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: scoreColor }}>
                              {sub.score}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--accent)', borderRadius: '3px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${sub.score}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{ height: '100%', background: scoreColor, borderRadius: '3px' }} 
                            />
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span style={{ 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: sub.status === 'Passed' ? 'rgba(16, 185, 129, 0.12)' : sub.status === 'Submitted' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: sub.status === 'Passed' ? '#10b981' : sub.status === 'Submitted' ? '#3b82f6' : '#f59e0b',
                          border: `1px solid ${sub.status === 'Passed' ? 'rgba(16, 185, 129, 0.25)' : sub.status === 'Submitted' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
                        }}>
                          {sub.status || 'Submitted'}
                        </span>

                        {/* Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                          <Calendar size={13} style={{ opacity: 0.7 }} />
                          {sub.date}
                        </div>

                        {/* Evaluate Button */}
                        <Link href="/educator/results" style={{ textDecoration: 'none' }}>
                          <button style={{ 
                            background: 'var(--educator-accent)', color: 'var(--educator-primary)', border: 'none', 
                            padding: '0.45rem 0.85rem', borderRadius: '0.6rem', fontSize: '0.78rem', fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s ease'
                          }}>
                            Evaluate
                            <ChevronRight size={14} />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

