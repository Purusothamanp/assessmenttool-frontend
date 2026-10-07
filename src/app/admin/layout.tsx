'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Users,
  BarChart2,
  LogOut,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Enforce clean light mode for the admin module
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const menuItems = [
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Manage Assessments', icon: BookOpen, path: '/admin/assessments' },
    { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
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
          background: 'var(--admin-sidebar-bg, #131b54)',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* Brand: 3D Isometric Cube Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.75rem', padding: '0 0.5rem' }}>
          <svg width="40" height="40" viewBox="0 0 44 44" fill="none" style={{ flexShrink: 0 }}>
            {/* Outer Hexagon */}
            <path d="M22 3L39 12.8V32.2L22 42L5 32.2V12.8L22 3Z" stroke="#dfb15b" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Inner Cube Edges */}
            <path d="M22 3V22.5M39 12.8L22 22.5M5 12.8L22 22.5M22 22.5V42" stroke="#dfb15b" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Stylized Inner Accents */}
            <path d="M12 18.5L22 24.2L32 18.5" stroke="#dfb15b" strokeWidth="2" strokeLinejoin="round" opacity="0.85" />
            <path d="M12 25.5L22 31.2L32 25.5" stroke="#dfb15b" strokeWidth="2" strokeLinejoin="round" opacity="0.85" />
          </svg>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dfb15b', margin: 0, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              Assessment
            </h2>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dfb15b', margin: 0, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              Tool
            </h2>
            <span 
              style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: '#60a5fa', 
                display: 'block', 
                marginTop: '4px',
                letterSpacing: '0.04em',
                textShadow: '0 0 10px rgba(96, 165, 250, 0.45)'
              }}
            >
              Admin Dashboard
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.72rem', 
            color: '#7b8eb5', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            marginBottom: '1rem', 
            padding: '0 0.75rem' 
          }}>
            General Management
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
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
                  onClick={() => router.push(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '0.6rem',
                    borderRadius: '1.25rem',
                    background: isActive ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    border: isActive ? '1.5px solid #00f0ff' : '1.5px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(0, 240, 255, 0.25), inset 0 0 10px rgba(0, 240, 255, 0.1)' : 'none',
                    color: isActive ? '#ffffff' : '#8da2c0',
                    transition: 'all 0.2s ease',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={20} color={isActive ? '#00f0ff' : '#8da2c0'} />
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

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '270px', padding: '0', minWidth: 0, position: 'relative' }}>
        {/* Constellation Mesh Graphic Layer */}
        <ConstellationMesh />

        {/* Header */}
        <header style={{
          height: '68px',
          background: 'rgba(250, 246, 238, 0.65)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--admin-card-border, rgba(226, 218, 204, 0.45))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
            Dashboard <span style={{ color: '#94a3b8', margin: '0 0.35rem' }}>/</span> <span style={{ color: 'var(--foreground, #0f172a)', fontWeight: 600 }}>{pathname.split('/').pop()?.replace(/^\w/, c => c.toUpperCase())}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground, #0f172a)', margin: 0 }}>{user?.name || 'Admin'}</p>
              <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                {user?.email === 'purusothamanp23@gmail.com' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#1d4ed8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px -2px rgba(29, 78, 216, 0.35)'
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'P'}
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

