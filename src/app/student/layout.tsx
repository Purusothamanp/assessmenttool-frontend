'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

import { useTheme } from '@/context/ThemeContext';

// Constellation Polygonal Mesh Background Component
function ConstellationMesh() {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '1200px',
        height: '420px',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      viewBox="0 0 1100 400"
      fill="none"
    >
      <defs>
        <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5b869" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#dfa856" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f7ecd9" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Network Lines */}
      <line x1="680" y1="35" x2="840" y2="105" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="840" y1="105" x2="1040" y2="75" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="680" y1="35" x2="590" y2="135" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="590" y1="135" x2="840" y2="105" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="590" y1="135" x2="700" y2="215" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="840" y1="105" x2="700" y2="215" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="840" y1="105" x2="940" y2="195" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="1040" y1="75" x2="940" y2="195" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="700" y1="215" x2="940" y2="195" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="700" y1="215" x2="640" y2="335" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="700" y1="215" x2="820" y2="305" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="940" y1="195" x2="820" y2="305" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="940" y1="195" x2="1060" y2="285" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="820" y1="305" x2="1060" y2="285" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="640" y1="335" x2="820" y2="305" stroke="url(#goldLineGrad)" strokeWidth="1.2" />
      <line x1="590" y1="135" x2="480" y2="115" stroke="url(#goldLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="480" y1="115" x2="400" y2="205" stroke="url(#goldLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="400" y1="205" x2="590" y2="135" stroke="url(#goldLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="400" y1="205" x2="520" y2="285" stroke="url(#goldLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="520" y1="285" x2="640" y2="335" stroke="url(#goldLineGrad)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Nodes / Vertices */}
      <circle cx="680" cy="35" r="3.5" fill="#e5b869" opacity="0.65" />
      <circle cx="840" cy="105" r="4.5" fill="#e5b869" opacity="0.75" />
      <circle cx="1040" cy="75" r="3.5" fill="#e5b869" opacity="0.5" />
      <circle cx="590" cy="135" r="4" fill="#e5b869" opacity="0.7" />
      <circle cx="700" cy="215" r="5" fill="#e5b869" opacity="0.8" />
      <circle cx="940" cy="195" r="4.5" fill="#e5b869" opacity="0.7" />
      <circle cx="820" cy="305" r="3.5" fill="#e5b869" opacity="0.65" />
      <circle cx="640" cy="335" r="3.5" fill="#e5b869" opacity="0.5" />
      <circle cx="1060" cy="285" r="3" fill="#e5b869" opacity="0.4" />
      <circle cx="480" cy="115" r="3" fill="#e5b869" opacity="0.45" />
      <circle cx="400" cy="205" r="3" fill="#e5b869" opacity="0.4" />
      <circle cx="520" cy="285" r="3" fill="#e5b869" opacity="0.4" />
    </svg>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.name) {
      fetch(`${API_BASE_URL}/submissions?studentName=${encodeURIComponent(user.name)}`)
        .then(res => res.json())
        .then(data => {
           if (Array.isArray(data)) {
             const pending = data.filter((s: any) => s.status === 'Pending');
             pending.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             setNotifications(pending);
           }
        })
        .catch(console.error);
    }
  }, [user]);

  // Enforce clean light mode for the student module
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'student') {
        router.push(user.role === 'admin' ? '/admin' : '/educator');
      }
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading || !user || user.role !== 'student') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-foreground)' }}>Loading dashboard...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Assessments', href: '/student/assessments', icon: BookOpen },
    { name: 'Results & Feedback', href: '/student/results', icon: CheckSquare },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--admin-bg, radial-gradient(ellipse 90% 55% at 75% 0%, #fae5c7 0%, #faf1e1 38%, #faf6ee 70%, #f6f1e8 100%))', position: 'relative' }}>
      {/* Sidebar */}
      <aside 
        style={{
          width: '270px',
          padding: '2rem 1.25rem 1.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 50,
          background: 'var(--student-sidebar-bg, #2e1065)',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.75rem', padding: '0 0.5rem' }}>
          <div className="vibrant-gradient-student" style={{ color: 'white', padding: '0.6rem', borderRadius: '1rem', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)', flexShrink: 0 }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              Student <span style={{ color: '#a78bfa' }}>Hub</span>
            </h2>
            <span 
              style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: '#a78bfa', 
                display: 'block', 
                marginTop: '4px',
                letterSpacing: '0.04em',
                textShadow: '0 0 10px rgba(167, 139, 250, 0.45)'
              }}
            >
              Student Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.72rem', 
            color: '#c4b5fd', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            marginBottom: '1rem', 
            padding: '0 0.75rem' 
          }}>
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <div key={item.name} style={{ position: 'relative' }}>
                {isActive && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: '-1.25rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: '4px', 
                      height: '24px', 
                      background: '#dfb15b', 
                      borderRadius: '0 4px 4px 0',
                      boxShadow: '0 0 8px rgba(223, 177, 91, 0.6)'
                    }} 
                  />
                )}
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(item.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '0.6rem',
                    borderRadius: '1.25rem',
                    background: isActive ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                    border: isActive ? '1.5px solid #d8b4fe' : '1.5px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(216, 180, 254, 0.25), inset 0 0 10px rgba(216, 180, 254, 0.1)' : 'none',
                    color: isActive ? '#ffffff' : '#c4b5fd',
                    transition: 'all 0.2s ease',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={20} color={isActive ? '#d8b4fe' : '#c4b5fd'} />
                  {item.name}
                </motion.button>
              </div>
            );
          })}
        </nav>

        {/* Bottom Avatar & Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', paddingBottom: '0.5rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
          <div
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.05)';
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                flexShrink: 0
              }}
            >
              <LogOut size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.02em' }}>Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '270px', padding: '0', minWidth: 0, position: 'relative' }}>
        {/* Constellation Mesh Graphic Layer */}
        <ConstellationMesh />

        {/* Top Header */}
        <header style={{ 
          height: '68px', 
          background: 'rgba(250, 246, 238, 0.65)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--admin-card-border, rgba(226, 218, 204, 0.45))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem',
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
             Dashboard <span style={{ color: '#94a3b8', margin: '0 0.35rem' }}>/</span> <span style={{ color: 'var(--foreground, #0f172a)', fontWeight: 600 }}>{pathname === '/student' ? 'Overview' : pathname.split('/').pop()?.replace(/^\w/, c => c.toUpperCase())}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Bell size={20} color="#64748b" />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '320px', background: '#fff', borderRadius: '1rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: '1rem', zIndex: 50 }}
                  >
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Notifications</h4>
                    {notifications.length === 0 ? (
                       <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>No new assignments.</p>
                    ) : (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                         {notifications.map(n => (
                            <div key={n.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => { setShowNotifications(false); router.push('/student/assessments'); }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '0.4rem', flexShrink: 0 }} />
                              <div>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>New Assessment Assigned</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>You have been assigned <strong>{n.assessmentTitle}</strong>.</p>
                              </div>
                            </div>
                         ))}
                       </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground, #0f172a)', margin: 0 }}>{user?.name || 'Student'}</p>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{user?.role || 'Student'}</p>
              </div>
              <div 
                className="vibrant-gradient-student"
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px -2px rgba(124, 58, 237, 0.35)'
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '1.75rem 2rem', width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
