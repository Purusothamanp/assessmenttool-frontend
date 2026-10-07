'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Trophy, 
  Clock, 
  Award, 
  CheckSquare, 
  List, 
  LayoutGrid, 
  FileText,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '@/lib/api';
import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}



export default function StudentResults() {
  const { user } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Passed' | 'Submitted' | 'Failed'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAllResults, setShowAllResults] = useState(false);
  const [selectedStatId, setSelectedStatId] = useState<string>('total');
  const [certificateSubmission, setCertificateSubmission] = useState<Submission | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);

  const generateCertificate = (submission: Submission) => {
    setIsGeneratingCert(submission.id);
    setCertificateSubmission(submission);
  };

  const generateIndividualMarksheet = (sub: Submission) => {
    if (!user) return;
    const doc = new jsPDF();
    
    // Outer border
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.rect(5, 5, 200, 287); // thin outer border

    // Header Box (Light Blue)
    doc.setFillColor(230, 240, 248);
    doc.rect(10, 10, 190, 20, 'FD');
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("ASSESSMENT MARKSHEET", 105, 18, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text(`Internal Assessment – ${sub.assessmentTitle}`, 105, 26, { align: 'center' });

    // Student Details
    doc.rect(10, 32, 190, 30); // Details outer box
    doc.line(115, 32, 115, 62); // Vertical separator

    doc.setFontSize(10);
    // Left column
    doc.setFont('times', 'bold');
    doc.text("Name of the Student", 12, 38);
    doc.text("Register Number", 12, 45);
    doc.text("Programme", 12, 52);
    doc.text("Academic Year", 12, 59);

    doc.setFont('times', 'normal');
    doc.text(":", 48, 38);
    doc.text(":", 48, 45);
    doc.text(":", 48, 52);
    doc.text(":", 48, 59);

    doc.text(user.name || '', 52, 38);
    doc.text(user.studentId || '', 52, 45);
    doc.text("Master of Computer Applications (MCA)", 52, 52);
    doc.text("2026 - 2027", 52, 59);

    // Right column
    doc.setFont('times', 'bold');
    doc.text("Semester", 117, 38);
    doc.text("Assessment", 117, 45);
    doc.text("Date of Examination", 117, 52);
    doc.text("Date of Birth", 117, 59);

    doc.setFont('times', 'normal');
    doc.text(":", 150, 38);
    doc.text(":", 150, 45);
    doc.text(":", 150, 52);
    doc.text(":", 150, 59);

    doc.text("I", 154, 38);
    doc.text(sub.assessmentTitle, 154, 45);
    doc.text(sub.date.split(' ')[0], 154, 52);
    doc.text(user.dob || 'N/A', 154, 59);

    // Marks Table
    const result = sub.score >= 50 ? "PASS" : "FAIL";
    autoTable(doc, {
      startY: 65,
      margin: { left: 10, right: 10 },
      theme: 'grid',
      headStyles: { 
        fillColor: [214, 230, 243],
        textColor: 0,
        font: 'times',
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      bodyStyles: {
        font: 'times',
        textColor: 0,
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'left' }
      },
      head: [['S.No.', 'Course Code', 'Course Title', 'Max. Marks', 'Marks Obtained', 'Percentage (%)', 'Result']],
      body: [
        ['1', 'MCA101', 'General', '100', sub.score.toString(), sub.score.toString(), result],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
      ],
      footStyles: {
        fillColor: [214, 230, 243],
        textColor: 0,
        font: 'times',
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      foot: [
        [{ content: 'Total', colSpan: 3, styles: { halign: 'center' } }, '100', sub.score.toString(), `${sub.score.toFixed(2)}`, result]
      ]
    });

    // Remarks box
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(10, finalY, 190, 15, 'FD');
    
    doc.setFont('times', 'bold');
    doc.text("Remarks", 12, finalY + 9);
    doc.setFont('times', 'normal');
    doc.text(":", 30, finalY + 9);
    doc.text(`The student has ${sub.score >= 50 ? 'successfully completed' : 'failed'} the assessment.`, 35, finalY + 9);

    doc.save(`${user.name}_${sub.assessmentTitle}_Marksheet.pdf`);
  };

  const generateOverallMarksheet = () => {
    if (!user) return;
    const doc = new jsPDF();
    
    // Outer border
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.rect(5, 5, 200, 287); // thin outer border

    // Header Box (Light Blue)
    doc.setFillColor(230, 240, 248);
    doc.rect(10, 10, 190, 20, 'FD');
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("OVERALL ACADEMIC MARKSHEET", 105, 18, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text(`Consolidated Report`, 105, 26, { align: 'center' });

    // Student Details
    doc.rect(10, 32, 190, 30); // Details outer box
    doc.line(115, 32, 115, 62); // Vertical separator

    doc.setFontSize(10);
    // Left column
    doc.setFont('times', 'bold');
    doc.text("Name of the Student", 12, 38);
    doc.text("Register Number", 12, 45);
    doc.text("Programme", 12, 52);
    doc.text("Academic Year", 12, 59);

    doc.setFont('times', 'normal');
    doc.text(":", 48, 38);
    doc.text(":", 48, 45);
    doc.text(":", 48, 52);
    doc.text(":", 48, 59);

    doc.text(user.name || '', 52, 38);
    doc.text(user.studentId || '', 52, 45);
    doc.text("Master of Computer Applications (MCA)", 52, 52);
    doc.text("2026 - 2027", 52, 59);

    // Right column
    doc.setFont('times', 'bold');
    doc.text("Total Assessments", 117, 38);
    doc.text("Average Score", 117, 45);
    doc.text("Generated On", 117, 52);
    doc.text("Date of Birth", 117, 59);

    doc.setFont('times', 'normal');
    doc.text(":", 150, 38);
    doc.text(":", 150, 45);
    doc.text(":", 150, 52);
    doc.text(":", 150, 59);

    doc.text(evaluationsDone.length.toString(), 154, 38);
    doc.text(`${avgScore}%`, 154, 45);
    doc.text(new Date().toLocaleDateString(), 154, 52);
    doc.text(user.dob || 'N/A', 154, 59);

    // Marks Table
    const tableColumn = ["S.No.", "Assessment", "Date", "Status", "Score (%)", "Result"];
    const tableRows: any[] = [];
    
    evaluationsDone.forEach((sub, index) => {
      const result = sub.score >= 50 ? "PASS" : "FAIL";
      tableRows.push([
        index + 1,
        sub.assessmentTitle,
        sub.date.split(' ')[0],
        sub.status,
        sub.score.toString(),
        result
      ]);
    });

    autoTable(doc, {
      startY: 65,
      margin: { left: 10, right: 10 },
      theme: 'grid',
      headStyles: { 
        fillColor: [214, 230, 243],
        textColor: 0,
        font: 'times',
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      bodyStyles: {
        font: 'times',
        textColor: 0,
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'left' }
      },
      head: [tableColumn],
      body: tableRows,
      footStyles: {
        fillColor: [214, 230, 243],
        textColor: 0,
        font: 'times',
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      foot: [
        [{ content: 'Overall Average', colSpan: 4, styles: { halign: 'center' } }, `${avgScore}%`, avgScore >= 50 ? 'PASS' : 'FAIL']
      ]
    });

    // Remarks box
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(10, finalY, 190, 15, 'FD');
    
    doc.setFont('times', 'bold');
    doc.text("Remarks", 12, finalY + 9);
    doc.setFont('times', 'normal');
    doc.text(":", 30, finalY + 9);
    doc.text(`The student has an overall average of ${avgScore}%.`, 35, finalY + 9);

    doc.save(`${user.name}_Overall_Marksheet.pdf`);
  };

  useEffect(() => {
    if (certificateSubmission) {
      const renderPdf = async () => {
        try {
          const element = document.getElementById('certificate-template');
          if (element) {
            // Wait a moment to ensure rendering is fully complete
            await new Promise(resolve => setTimeout(resolve, 300));
            const canvas = await html2canvas(element, { 
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'pt',
              format: 'a4'
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
            pdf.save(`${certificateSubmission.studentName}_Certificate.pdf`);
          }
        } catch (err) {
          console.error('Error generating certificate:', err);
        } finally {
          setCertificateSubmission(null);
          setIsGeneratingCert(null);
        }
      };
      renderPdf();
    }
  }, [certificateSubmission]);

  const fetchSubmissions = useCallback(async () => {
    try {
      if (!user) return;
      const response = await fetch(`${API_BASE_URL}/submissions?studentName=${encodeURIComponent(user.name)}`);
      const data = await response.json();
      setSubmissions(data.reverse());
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Compute metrics
  const totalSubmissions = submissions.length;
  const evaluationsDone = submissions.filter(s => s.status === 'Passed' || s.status === 'Failed');
  const passedCount = submissions.filter(s => s.status === 'Passed').length;
  const pendingCount = submissions.filter(s => s.status === 'Submitted' || s.status === 'Pending').length;
  const avgScore = evaluationsDone.length > 0 
    ? Math.round(evaluationsDone.reduce((acc, curr) => acc + curr.score, 0) / evaluationsDone.length) 
    : 0;

  const stats = [
    { id: 'total', label: 'Total Assessments', value: totalSubmissions, icon: CheckSquare, color: '#3b82f6', filterKey: 'all' as const },
    { id: 'avg', label: 'Average Score', value: `${avgScore}%`, icon: Award, color: '#8b5cf6', filterKey: 'all' as const },
    { id: 'passed', label: 'Passed Assessments', value: passedCount, icon: Trophy, color: '#10b981', filterKey: 'Passed' as const },
    { id: 'pending', label: 'Pending Evaluation', value: pendingCount, icon: Clock, color: '#f59e0b', filterKey: 'Submitted' as const },
  ];

  // Process data for Area Chart
  const chartData = React.useMemo(() => {
    // Reverse again for chronological order (left to right)
    const chronological = [...evaluationsDone].reverse();
    return chronological.map((sub, index) => ({
      name: `Assessment ${index + 1}`,
      title: sub.assessmentTitle,
      score: sub.score,
      id: sub.id
    }));
  }, [evaluationsDone]);

  const barColors = [
    { start: '#60a5fa', end: '#2563eb' }, // blue
    { start: '#34d399', end: '#059669' }, // green
    { start: '#a78bfa', end: '#7c3aed' }, // purple
    { start: '#fbbf24', end: '#d97706' }  // orange
  ];

  const CustomizedBarLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    if (x == null || y == null) return null;
    const colorIndex = index % barColors.length;
    const color = barColors[colorIndex].end;
    
    return (
      <g transform={`translate(${x + width / 2}, ${y - 18})`}>
        <rect x="-22" y="-12" width="44" height="24" rx="12" fill={color} />
        <text x="0" y="0" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
          {value}%
        </text>
      </g>
    );
  };

  // Filter logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'Submitted' ? (sub.status === 'Submitted' || sub.status === 'Pending') : sub.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const displayedSubmissions = showAllResults ? filteredSubmissions : filteredSubmissions.slice(0, 3);

  const getStatusBadgeStyle = (status: string) => {
    if (status === 'Passed') {
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Passed' };
    } else if (status === 'Submitted' || status === 'Pending') {
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Awaiting Evaluation' };
    } else {
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Needs Improvement' };
    }
  };

  return (
    <div className="animate-premium">
      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--student-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              STUDENT PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Results & Feedback</h1>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = selectedStatId === stat.id;
          return (
            <div 
              key={stat.label} 
              onClick={() => {
                setSelectedStatId(stat.id);
                setStatusFilter(stat.filterKey);
              }}
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
                  background: `${stat.color}15`, 
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

      {/* Performance Trend Area Chart */}
      {chartData.length > 0 && (
        <div className="premium-card" style={{ padding: '2rem 1.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>Performance Trend</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '3rem', alignSelf: 'flex-start' }}>
            Visualizing your scores over time across different assessments.
          </p>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 35, right: 30, left: 0, bottom: 20 }} barSize={60}>
                <defs>
                  {barColors.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color.start} stopOpacity={1}/>
                      <stop offset="95%" stopColor={color.end} stopOpacity={1}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#0f172a', fontSize: 14, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]} 
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{ background: 'var(--card)', padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                          <p style={{ margin: 0, fontWeight: 800, color: 'var(--foreground)', fontSize: '0.95rem' }}>{payload[0].payload.title}</p>
                          <p style={{ margin: 0, color: '#3b82f6', fontWeight: 900, fontSize: '1.3rem', marginTop: '0.35rem' }}>{payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="score" 
                  radius={[12, 12, 0, 0]}
                  onClick={(data) => router.push(`/student/results/${data.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient-${index % barColors.length})`} />
                  ))}
                  <LabelList dataKey="score" content={<CustomizedBarLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Unified Table Container (matching User Management table format) */}
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}>
        {/* Table Header with Title & See All Toggle */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem', color: 'var(--foreground)' }}>Assessment Submissions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Review your past test attempts, evaluation statuses, and final scores.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {evaluationsDone.length > 0 && (
              <button
                onClick={generateOverallMarksheet}
                className="animated-gradient-btn"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                title="Download Overall Marksheet for all assessments"
              >
                <Download size={14} /> Overall Marksheet
              </button>
            )}
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              Showing {displayedSubmissions.length} of {filteredSubmissions.length}
            </span>
            <button
              onClick={() => setShowAllResults(!showAllResults)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--student-primary)', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {showAllResults ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + View Switcher) */}
        <div style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input 
              placeholder="Search assessment title..." 
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
                  background: viewMode === 'table' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--student-primary)' : 'var(--muted-foreground)',
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
                  background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--student-primary)' : 'var(--muted-foreground)',
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

        {/* Content Section */}
        <div style={{ padding: '0 1.25rem 1.25rem', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading results...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <CheckSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No submission records found.</p>
            </div>
          ) : viewMode === 'table' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 0.75rem' }}>Assessment Title</th>
                  <th style={{ padding: '0 0.75rem' }}>Date Submitted</th>
                  <th style={{ padding: '0 0.75rem' }}>Evaluation Status</th>
                  <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Final Score</th>
                </tr>
              </thead>
              <tbody>
                {displayedSubmissions.map((sub) => {
                  const statusInfo = getStatusBadgeStyle(sub.status);
                  return (
                    <tr 
                      key={sub.id} 
                      className="report-row-premium"
                      style={{ background: 'var(--card)', borderRadius: '0.75rem', border: '1px solid var(--card-border)', transition: 'all 0.2s' }}
                    >
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem', borderLeft: '1px solid var(--card-border)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <FileText size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)', margin: 0 }}>
                              {sub.assessmentTitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--muted-foreground)', fontSize: '0.85rem', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} style={{ opacity: 0.7 }} />
                          {sub.date}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.78rem', 
                          fontWeight: 700,
                          background: statusInfo.background,
                          color: statusInfo.color
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right', borderRight: '1px solid var(--card-border)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                        {sub.status === 'Submitted' || sub.status === 'Pending' ? (
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 500 }}>
                            Pending
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                              onClick={() => generateIndividualMarksheet(sub)}
                              title="Download Marksheet"
                              style={{
                                padding: '0.4rem 0.75rem',
                                background: 'rgba(124, 58, 237, 0.1)',
                                color: '#7c3aed',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'; }}
                            >
                              <Download size={14} /> Marksheet
                            </button>
                            {sub.score >= 40 && (
                              <button
                                onClick={() => generateCertificate(sub)}
                                title="Download Certificate"
                                disabled={isGeneratingCert === sub.id}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: '#3b82f6',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  cursor: isGeneratingCert === sub.id ? 'wait' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  transition: 'all 0.2s',
                                  opacity: isGeneratingCert === sub.id ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => { if (isGeneratingCert !== sub.id) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; }}
                                onMouseLeave={(e) => { if (isGeneratingCert !== sub.id) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }}
                              >
                                {isGeneratingCert === sub.id ? (
                                  <Clock size={14} className="animate-spin" />
                                ) : (
                                  <Download size={14} />
                                )} 
                                {isGeneratingCert === sub.id ? 'Generating...' : 'Certificate'}
                              </button>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: sub.score >= 50 ? '#10b981' : '#ef4444' }}>
                                {sub.score}%
                              </span>
                              <div style={{ height: '4px', width: '60px', background: 'var(--accent)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${sub.score}%`, background: sub.score >= 50 ? '#10b981' : '#ef4444', borderRadius: '2px', transition: 'width 0.8s ease-out' }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {displayedSubmissions.map((sub) => {
                const statusInfo = getStatusBadgeStyle(sub.status);
                return (
                  <div key={sub.id} className="user-card-item" style={{ padding: '1.1rem', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'rgba(124, 58, 237, 0.1)',
                          color: '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <span style={{ 
                        padding: '0.25rem 0.65rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        background: statusInfo.background,
                        color: statusInfo.color
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.assessmentTitle}
                    </h3>
                    
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} style={{ opacity: 0.7 }} /> Submitted: {sub.date}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Final Score</span>
                      {sub.status === 'Submitted' || sub.status === 'Pending' ? (
                        <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>Pending</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <button
                            onClick={() => generateIndividualMarksheet(sub)}
                            title="Download Marksheet"
                            style={{
                              padding: '0.3rem',
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              border: 'none',
                              borderRadius: '0.4rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'; }}
                          >
                            <Download size={16} />
                          </button>
                          {sub.score >= 40 && (
                            <button
                              onClick={() => generateCertificate(sub)}
                              title="Download Certificate"
                              disabled={isGeneratingCert === sub.id}
                              style={{
                                padding: '0.3rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6',
                                border: 'none',
                                borderRadius: '0.4rem',
                                cursor: isGeneratingCert === sub.id ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                opacity: isGeneratingCert === sub.id ? 0.7 : 1
                              }}
                              onMouseEnter={(e) => { if (isGeneratingCert !== sub.id) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; }}
                              onMouseLeave={(e) => { if (isGeneratingCert !== sub.id) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }}
                            >
                              {isGeneratingCert === sub.id ? <Clock size={16} className="animate-spin" /> : <Download size={16} />}
                            </button>
                          )}
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: sub.score >= 50 ? '#10b981' : '#ef4444' }}>
                            {sub.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Premium Certificate Template */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -9999 }}>
        {certificateSubmission && (
          <div 
            id="certificate-template" 
            style={{
              width: '1123px',
              height: '794px',
              backgroundColor: '#F9F6F0',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Times New Roman', Times, serif",
              boxSizing: 'border-box',
              color: '#0a192f'
            }}
          >
            {/* Dark Blue & Gold Corner Accents */}
            <div style={{
              position: 'absolute', top: '-150px', left: '-150px', width: '400px', height: '400px',
              background: 'linear-gradient(135deg, #0a192f, #112240)', transform: 'rotate(45deg)', border: '15px solid #d4af37',
              boxShadow: '0 0 40px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                position: 'absolute', top: '25px', left: '25px', right: '25px', bottom: '25px',
                border: '2px dashed rgba(212, 175, 55, 0.6)'
              }} />
            </div>
            
            <div style={{
              position: 'absolute', bottom: '-150px', right: '-150px', width: '400px', height: '400px',
              background: 'linear-gradient(135deg, #112240, #0a192f)', transform: 'rotate(45deg)', border: '15px solid #d4af37',
              boxShadow: '0 0 40px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                position: 'absolute', top: '25px', left: '25px', right: '25px', bottom: '25px',
                border: '2px dashed rgba(212, 175, 55, 0.6)'
              }} />
            </div>

            {/* Elegant Multiple Borders */}
            <div style={{ position: 'absolute', top: '35px', left: '35px', right: '35px', bottom: '35px', border: '3px solid #d4af37', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '45px', left: '45px', right: '45px', bottom: '45px', border: '1px solid rgba(212, 175, 55, 0.5)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '25px', left: '25px', right: '25px', bottom: '25px', border: '1px solid rgba(212, 175, 55, 0.3)', pointerEvents: 'none' }} />

            {/* Main Content Area */}
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', paddingTop: '50px', position: 'relative', zIndex: 10
            }}>
              
              <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Trophy size={60} color="#d4af37" fill="rgba(212, 175, 55, 0.2)" />
              </div>

              <h1 style={{
                fontSize: '56px', color: '#0a192f', margin: '0',
                fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
                CERTIFICATE
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                <div style={{ width: '100px', height: '2px', background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
                <span style={{ fontSize: '24px', color: '#d4af37', letterSpacing: '8px', fontWeight: 600 }}>OF ACHIEVEMENT</span>
                <div style={{ width: '100px', height: '2px', background: 'linear-gradient(270deg, transparent, #d4af37)' }} />
              </div>

              <p style={{ fontSize: '20px', color: '#475569', margin: '0 0 20px 0', fontStyle: 'italic', letterSpacing: '1px' }}>
                This is to proudly certify that
              </p>

              <h2 style={{
                fontSize: '48px', color: '#0a192f', margin: '0 0 25px 0',
                fontWeight: 800, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px',
                minWidth: '600px', textAlign: 'center', letterSpacing: '2px'
              }}>
                {certificateSubmission.studentName.toUpperCase()}
              </h2>

              <p style={{ fontSize: '20px', color: '#475569', margin: '0 0 20px 0', letterSpacing: '1px' }}>
                has successfully completed the assessment for
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #0a192f, #112240)',
                padding: '12px 60px',
                border: '2px solid #d4af37',
                borderRadius: '4px',
                marginBottom: '25px',
                position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(10, 25, 47, 0.4)'
              }}>
                <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '16px', height: '16px', background: '#d4af37', border: '2px solid #fff' }} />
                <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '16px', height: '16px', background: '#d4af37', border: '2px solid #fff' }} />

                <h3 style={{ fontSize: '28px', color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '3px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {certificateSubmission.assessmentTitle.toUpperCase()}
                </h3>
              </div>

              <p style={{ fontSize: '18px', color: '#475569', margin: '0 0 15px 0', fontStyle: 'italic' }}>
                with a passing score of
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '15px'
              }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #d4af37',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'radial-gradient(circle, #ffffff, #f8f9fa)',
                  boxShadow: '0 0 0 6px rgba(212, 175, 55, 0.2), 0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: '#097969', textShadow: '1px 1px 0px rgba(255,255,255,1)' }}>
                    {certificateSubmission.score}%
                  </span>
                </div>
              </div>

              <div style={{
                position: 'absolute', bottom: '50px', left: '100px', right: '100px',
                display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end'
              }}>
                {/* Date block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', border: '2px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', zIndex: 20 }}>
                  <div style={{ background: '#0a192f', padding: '8px', borderRadius: '8px', color: '#d4af37', display: 'flex' }}>
                    <Clock size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Issue Date</span>
                    <span style={{ fontSize: '18px', color: '#0a192f', fontWeight: 700 }}>
                      {certificateSubmission.date.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .report-row-premium:hover {
          background-color: var(--accent) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}

