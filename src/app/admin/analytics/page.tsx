'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Users,
  Download,
  Search,
  FileText,
  BookOpen,
  BarChart2,
  Trophy,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface RealChartItem {
  title: string;
  rate: number;
  color: string;
}

interface RealReportRow {
  id: string;
  index: number;
  title: string;
  participants: number;
  passRate: number;
  avgScore: number;
  topScore: number;
  iconBg: string;
  iconColor: string;
  rateBg: string;
  rateColor: string;
}

export default function AnalyticsPage() {
  const { } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<RealReportRow | null>(null);
  const [selectedAssessmentTitle, setSelectedAssessmentTitle] = useState<string | null>(null);

  // Assessments list containing ONLY Solar System Quiz (or real created assessments from API)
  const initialChartItems: RealChartItem[] = [
    { title: 'Solar System Quiz', rate: 100, color: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' }
  ];

  const initialReportsList: RealReportRow[] = [
    { id: '1', index: 1, title: 'Solar System Quiz', participants: 1, passRate: 100, avgScore: 100, topScore: 100, iconBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', iconColor: '#2563eb', rateBg: 'linear-gradient(135deg, #dc2626 0%, #dc2626 100%)', rateColor: '#ffffff' }
  ];

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const [assessmentsRes, submissionsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/assessments`).catch(() => null),
        fetch(`${API_BASE_URL}/submissions`).catch(() => null),
        fetch(`${API_BASE_URL}/users?role=student`).catch(() => null)
      ]);

      if (assessmentsRes && assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        if (Array.isArray(data)) {
          const sortedData = data.sort((a: any, b: any) => {
            // Extract numbers from titles (e.g. 'assessment 3' -> 3)
            const getNum = (t: string) => {
              const match = (t || '').match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            };
            const numA = getNum(a.title);
            const numB = getNum(b.title);
            
            if (numA !== numB) {
              return numB - numA; // Descending order (highest number first)
            }
            
            // Fallback to date descending if numbers are the same
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA;
          });
          setAssessments(sortedData);
        }
      }
      let fetchedUsers = [];
      if (usersRes && usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data)) {
          fetchedUsers = data;
          setUsers(data);
        }
      }

      if (submissionsRes && submissionsRes.ok) {
        const data = await submissionsRes.json();
        if (Array.isArray(data)) {
          const validStudentNames = new Set(fetchedUsers.map((u: any) => u.name));
          // Filter out 'Pending' submissions and submissions from deleted users
          const attendedSubmissions = data.filter(s => s.status !== 'Pending' && validStudentNames.has(s.studentName));
          setSubmissions(attendedSubmissions);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Compute stat totals dynamically
  const activeAssessmentsList = assessments.length > 0 ? assessments : initialReportsList;
  const totalAssessmentsCount = activeAssessmentsList.length;
  
  const displaySubmissions = selectedAssessmentTitle 
    ? submissions.filter((s: any) => (s.assessmentTitle || s.title || '').toLowerCase() === selectedAssessmentTitle.toLowerCase())
    : submissions;

  let totalParticipationsCount = displaySubmissions.length > 0 ? 0 : 0;
  let calculatedAvgPassRate = 0;
  
  if (displaySubmissions.length > 0) {
    const globalUniqueSubmissions = new Map();
    const uniqueParticipatingStudents = new Set();
    const registeredStudentNames = new Set(users.map(u => u.name));

    displaySubmissions.forEach((s: any) => {
      // Only count if the student is actually registered
      if (s.studentName && registeredStudentNames.has(s.studentName)) {
        uniqueParticipatingStudents.add(s.studentName);
      }
      const key = `${s.assessmentId || s.assessmentTitle}-${s.studentName}`;
      const current = globalUniqueSubmissions.get(key);
      if (!current || (s.score > current.score)) {
        globalUniqueSubmissions.set(key, s);
      }
    });
    
    // Total Participations is the number of unique REGISTERED students who have attended any test
    totalParticipationsCount = uniqueParticipatingStudents.size;

    // Calculate global pass rate based on all unique test submissions
    const globalUnique = Array.from(globalUniqueSubmissions.values());
    const globalPassed = globalUnique.filter((s: any) => s.status === 'Passed' || (typeof s.score === 'number' && s.score >= 50)).length;
    calculatedAvgPassRate = globalUnique.length > 0 ? Math.round((globalPassed / globalUnique.length) * 100) : 0;
  }

  let highestScoreVal = 0;
  let highestScoreQuizTitle = selectedAssessmentTitle || 'N/A';
  if (displaySubmissions.length > 0) {
    let maxVal = -1;
    displaySubmissions.forEach((s: any) => {
      const score = typeof s.score === 'number' ? s.score : 0;
      if (score > maxVal) {
        maxVal = score;
        highestScoreQuizTitle = s.assessmentTitle || s.title || highestScoreQuizTitle;
      }
    });
    if (maxVal >= 0) highestScoreVal = maxVal;
  }

  // Chart items strictly for Solar System Quiz (or actual created assessments)
  const chartItems: RealChartItem[] = activeAssessmentsList.map((item, index) => {
    const title = item.title || 'Solar System Quiz';
    const relSubmissions = submissions.filter((s: any) => 
      (s.assessmentTitle || s.title || '').toLowerCase().includes(title.toLowerCase())
    );

    let rate = item.passRate || 100;
    if (relSubmissions.length > 0) {
      const uniqueSubmissions = new Map();
      relSubmissions.forEach((s: any) => {
        const current = uniqueSubmissions.get(s.studentName);
        if (!current || (s.score > current.score)) {
          uniqueSubmissions.set(s.studentName, s);
        }
      });
      const uniqueRel = Array.from(uniqueSubmissions.values());
      const passed = uniqueRel.filter((s: any) => s.status === 'Passed' || s.score >= 50).length;
      rate = Math.round((passed / uniqueRel.length) * 100);
    }

    const gradients = [
      'linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)',
      'linear-gradient(180deg, #34d399 0%, #047857 100%)',
      'linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%)',
      'linear-gradient(180deg, #fbbf24 0%, #b45309 100%)',
      'linear-gradient(180deg, #f87171 0%, #b91c1c 100%)'
    ];
    return {
      title,
      rate,
      color: gradients[index % gradients.length]
    };
  });

  // Table rows strictly for Solar System Quiz (or actual created assessments)
  const reportRows: RealReportRow[] = activeAssessmentsList.map((item, i) => {
    const title = item.title || 'Solar System Quiz';
    const relSubmissions = submissions.filter((s: any) => 
      (s.assessmentTitle || s.title || '').toLowerCase().includes(title.toLowerCase())
    );

    let participants = item.participants || 1;
    let passRate = item.passRate || 100;
    let avgScore = item.avgScore || 100;
    let topScore = item.topScore || 100;

    if (relSubmissions.length > 0) {
      const uniqueSubmissions = new Map();
      relSubmissions.forEach((s: any) => {
        const current = uniqueSubmissions.get(s.studentName);
        if (!current || (s.score > current.score)) {
          uniqueSubmissions.set(s.studentName, s);
        }
      });
      const uniqueRel = Array.from(uniqueSubmissions.values());

      participants = uniqueRel.length;
      const passedCount = uniqueRel.filter((s: any) => s.status === 'Passed' || s.score >= 50).length;
      passRate = Math.round((passedCount / participants) * 100);
      avgScore = Math.round(uniqueRel.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / participants);
      topScore = Math.max(...uniqueRel.map((s: any) => s.score || 0));
    }

    const rateBg = passRate >= 80 ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : passRate >= 65 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)';
    const rateColor = passRate >= 80 ? '#15803d' : passRate >= 65 ? '#b45309' : '#b91c1c';

    return {
      id: item.id || `R${i + 1}`,
      index: i + 1,
      title,
      participants,
      passRate,
      avgScore,
      topScore,
      iconBg: item.iconBg || 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      iconColor: item.iconColor || '#2563eb',
      rateBg,
      rateColor
    };
  });

  const filteredReports = reportRows.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateReport = (specificTitle?: string | React.MouseEvent) => {
    const titleToFilter = typeof specificTitle === 'string' ? specificTitle : undefined;
    
    let attended = submissions.filter((s: any) => s.status !== 'Pending');

    if (titleToFilter) {
      attended = attended.filter((s: any) => 
        (s.assessmentTitle || s.title || '').toLowerCase().includes(titleToFilter.toLowerCase())
      );
    }

    if (attended.length === 0) {
      alert(titleToFilter ? `No student submissions available for ${titleToFilter} yet.` : 'No student submissions available to export yet.');
      return;
    }

    const headers = ['Student Name', 'Department', 'Assessment Title', 'Score (%)', 'Status'];
    const rows = attended.map((s: any) => {
      const title = s.assessmentTitle || s.title || 'Unknown';
      const assessment = activeAssessmentsList.find((a: any) => a.id === s.assessmentId || a.title === title);
      const dept = assessment?.category || 'N/A';
      return `"${s.studentName || 'Unknown'}","${dept}","${title}",${s.score},"${s.status}"`;
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', titleToFilter ? `${titleToFilter.replace(/\s+/g, '_')}_student_results.csv` : 'all_student_results_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-premium">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              padding: '0.28rem 0.85rem', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              color: '#1e40af', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              letterSpacing: '0.06em',
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.12)'
            }}>
              ADMIN DASHBOARD
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--foreground, #0f172a)' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Track assessment performance and student engagement.
          </p>
        </div>
      </div>

      {/* Summary Stats Row - 4 Columns Single Line */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.8rem', marginBottom: '1.25rem' }}>
        {/* Card 1: Total Assessments */}
        <div 
          onClick={() => setSelectedAssessmentTitle(null)}
          style={{ cursor: 'pointer', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', borderRadius: '0.9rem', border: '1px solid rgba(226, 232, 240, 0.9)', background: '#ffffff', color: '#0f172a', boxShadow: selectedAssessmentTitle === null ? '0 8px 25px rgba(37, 99, 235, 0.15)' : '0 4px 14px rgba(0, 0, 0, 0.03)', transition: 'all 0.2s ease', transform: selectedAssessmentTitle === null ? 'scale(1.02)' : 'scale(1)' }} 
          className="stat-card-hover"
        >
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#2563eb', width: '40px', height: '40px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(37, 99, 235, 0.15)' }}>
            <FileText size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.15rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Total Assessments</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', margin: 0 }}>{totalAssessmentsCount}</h3>
          </div>
        </div>

        {/* Card 2: Total Participations */}
        <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', borderRadius: '0.9rem', border: '1px solid rgba(226, 232, 240, 0.9)', background: '#ffffff', color: '#0f172a', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)', transition: 'all 0.2s ease' }} className="stat-card-hover">
          <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#059669', width: '40px', height: '40px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(5, 150, 105, 0.15)' }}>
            <Users size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.15rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Total Participations</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', margin: 0 }}>{totalParticipationsCount}</h3>
          </div>
        </div>

        {/* Card 3: Avg. Pass Rate */}
        <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', borderRadius: '0.9rem', border: '1px solid rgba(226, 232, 240, 0.9)', background: '#ffffff', color: '#0f172a', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)', transition: 'all 0.2s ease' }} className="stat-card-hover">
          <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', color: '#7c3aed', width: '40px', height: '40px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(124, 58, 237, 0.15)' }}>
            <BarChart2 size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.15rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Avg. Pass Rate</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', margin: 0 }}>{calculatedAvgPassRate}%</h3>
          </div>
        </div>

        {/* Card 4: Highest Score */}
        <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', borderRadius: '0.9rem', border: '1px solid rgba(226, 232, 240, 0.9)', background: '#ffffff', color: '#0f172a', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)', transition: 'all 0.2s ease' }} className="stat-card-hover">
          <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#d97706', width: '40px', height: '40px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(217, 119, 6, 0.15)' }}>
            <Trophy size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.15rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Highest Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', margin: 0 }}>{highestScoreVal}</h3>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>in {highestScoreQuizTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pass Rate by Assessment Chart Card */}
      <div 
        style={{ 
          background: 'var(--admin-card, #ffffff)', 
          borderRadius: '1.25rem', 
          border: '1px solid var(--admin-card-border, rgba(226, 218, 204, 0.45))',
          boxShadow: '0 6px 24px -2px rgba(15, 23, 42, 0.04)', 
          padding: '1.35rem 1.6rem',
          marginBottom: '1.25rem',
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(124, 58, 237, 0.15)' }}>
            <BarChart2 size={19} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--foreground, #0f172a)', margin: '0 0 0.15rem 0' }}>
              Pass Rate by Assessment
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Percentage of students passed.
            </p>
          </div>
        </div>

        {/* Chart Visualization Area */}
        <div style={{ display: 'flex', gap: '1.25rem', minHeight: '260px', position: 'relative', paddingTop: '2.75rem', paddingBottom: '2.5rem' }}>
          {/* Y-Axis Labels */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, paddingRight: '0.5rem', height: '160px' }}>
            <span style={{ lineHeight: 1 }}>100%</span>
            <span style={{ lineHeight: 1 }}>80%</span>
            <span style={{ lineHeight: 1 }}>60%</span>
            <span style={{ lineHeight: 1 }}>40%</span>
            <span style={{ lineHeight: 1 }}>20%</span>
            <span style={{ lineHeight: 1 }}>0%</span>
          </div>

          {/* Bar Columns Container */}
          <div style={{ flex: 1, position: 'relative', height: '160px' }}>
            {/* Background Horizontal Gridlines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ borderBottom: i === 5 ? '1px solid #cbd5e1' : '1px dashed #e2e8f0', width: '100%' }} />
              ))}
            </div>

            {/* Bars Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', height: '160px', alignItems: 'flex-end', zIndex: 1, padding: '0 1rem' }}>
              {chartItems.map((bar) => {
                const isSelected = selectedAssessmentTitle === bar.title;
                const isFaded = selectedAssessmentTitle && !isSelected;
                return (
                <div 
                  key={bar.title} 
                  onClick={() => setSelectedAssessmentTitle(isSelected ? null : bar.title)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative',
                    cursor: 'pointer',
                    opacity: isFaded ? 0.4 : 1,
                    transition: 'opacity 0.3s ease'
                  }}>
                  
                  {/* Bar Column */}
                  <div style={{
                    width: '80%',
                    maxWidth: '85px',
                    height: `${(Math.min(100, Math.max(0, bar.rate)) / 100) * 160}px`,
                    background: bar.color,
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected 
                      ? '0 12px 25px rgba(37, 99, 235, 0.45), 0 4px 10px rgba(0, 0, 0, 0.1)' 
                      : '0 8px 20px rgba(37, 99, 235, 0.28), 0 2px 6px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'bottom'
                  }}>
                    {/* Top sheen line */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'rgba(255, 255, 255, 0.45)',
                      borderRadius: '8px 8px 0 0'
                    }} />

                    {/* Badge Floating Right Above Bar */}
                    <div style={{
                      position: 'absolute',
                      top: '-32px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '0.22rem 0.75rem',
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      zIndex: 2
                    }}>
                      {bar.rate}%
                    </div>
                  </div>

                  {/* Title Label below 0% baseline */}
                  <div style={{ 
                    position: 'absolute',
                    top: '168px',
                    left: 0,
                    right: 0,
                    textAlign: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 700, 
                      color: '#1e293b', 
                      display: 'block',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      maxWidth: '100%' 
                    }}>
                      {bar.title}
                    </span>
                  </div>

                </div>
              )})}
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Reports Table Card */}
      <div 
        style={{ 
          background: 'var(--admin-card, #ffffff)', 
          borderRadius: '1.25rem', 
          border: '1px solid var(--admin-card-border, rgba(226, 218, 204, 0.45))',
          boxShadow: '0 6px 24px -2px rgba(15, 23, 42, 0.04)', 
          padding: '1.35rem 1.6rem',
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(37, 99, 235, 0.15)' }}>
            <FileText size={19} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--foreground, #0f172a)', margin: '0 0 0.15rem 0' }}>
              Assessment Reports
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              History of test results.
            </p>
          </div>
        </div>

        {/* Embedded Controls Bar (Search Bar) */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              placeholder="Find a report..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.68rem 1rem 0.68rem 2.65rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#edf0f4',
                color: 'var(--foreground, #0f172a)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          {filteredReports.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>No reports matching criteria.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.65rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '0 1.15rem', width: '40px' }}>#</th>
                  <th style={{ padding: '0 1.15rem' }}>Title</th>
                  <th style={{ padding: '0 1.15rem' }}>Participants</th>
                  <th style={{ padding: '0 1.15rem' }}>Pass Rate</th>
                  <th style={{ padding: '0 1.15rem' }}>Avg Score</th>
                  <th style={{ padding: '0 1.15rem' }}>Top Score</th>
                  <th style={{ padding: '0 1.15rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="report-row-premium"
                    style={{ 
                      background: '#ffffff',
                      boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <td style={{ 
                      padding: '0.75rem 1.15rem', 
                      borderRadius: '0.9rem 0 0 0.9rem', 
                      borderLeft: '1px solid #f1f5f9', 
                      borderTop: '1px solid #f1f5f9', 
                      borderBottom: '1px solid #f1f5f9',
                      background: '#ffffff',
                      fontWeight: 700,
                      color: '#64748b',
                      fontSize: '0.85rem'
                    }}>
                      {report.index}
                    </td>
                    <td style={{ padding: '0.75rem 1.15rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div 
                          style={{ 
                            width: '38px', 
                            height: '38px', 
                            borderRadius: '10px', 
                            background: report.iconBg,
                            color: report.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)'
                          }}
                        >
                          <BookOpen size={17} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                          {report.title}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.15rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
                        <Users size={14} style={{ color: '#64748b' }} /> {report.participants}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.15rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      <span 
                        style={{
                          padding: '0.28rem 0.95rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          background: report.rateBg,
                          color: report.rateColor,
                          boxShadow: '0 2px 6px rgba(21, 128, 61, 0.12)'
                        }}
                      >
                        {report.passRate}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.15rem', color: '#0f172a', fontSize: '0.88rem', fontWeight: 700, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      {report.avgScore}
                    </td>
                    <td style={{ padding: '0.75rem 1.15rem', color: '#0f172a', fontSize: '0.88rem', fontWeight: 700, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      {report.topScore}
                    </td>
                    <td style={{ padding: '0.75rem 1.15rem', borderRadius: '0 0.9rem 0.9rem 0', textAlign: 'right', borderRight: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="action-btn-styled"
                          title="Performance Metrics"
                          style={{
                            color: '#2563eb',
                            padding: '0.45rem 0.6rem',
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            borderRadius: '0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <BarChart2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleGenerateReport(report.title)}
                          className="action-btn-styled"
                          title="Download Report"
                          style={{
                            color: '#16a34a',
                            padding: '0.45rem 0.6rem',
                            background: '#f0fdf4',
                            border: '1px solid #dcfce7',
                            borderRadius: '0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="card"
              style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: '#ffffff', borderRadius: '1.25rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)' }}>
                  <FileText size={28} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>Assessment Report</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{selectedReport.title}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '0.85rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Participants</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', margin: 0 }}>{selectedReport.participants}</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '0.85rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Pass Rate</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', margin: 0 }}>{selectedReport.passRate}%</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '0.85rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Avg. Score</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedReport.avgScore}</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '0.85rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Top Score</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: 0 }}>{selectedReport.topScore}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setSelectedReport(null)}
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .stat-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06) !important;
        }
        .report-row-premium {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .report-row-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04) !important;
        }
        .report-row-premium:hover td {
          background-color: #ffffff !important;
        }
        .action-btn-styled {
          transition: all 0.2s ease;
        }
        .action-btn-styled:hover {
          transform: translateY(-1px);
          filter: brightness(0.96);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}
