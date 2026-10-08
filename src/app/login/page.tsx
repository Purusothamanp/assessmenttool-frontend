'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();
  const registrationSuccess = searchParams.get('registered') === 'true';

  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please check your credentials.');
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      background: '#fff8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Ethereal Multi-Color Aurora Background (Matching Home & Register) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.35, 1],
            x: [0, 90, -40, 0],
            y: [0, 60, 30, 0],
            rotate: [0, 45, 90, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ 
            position: 'absolute', top: '-15%', left: '-5%', width: '70%', height: '70%', 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.08) 50%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 1, 1.3],
            x: [0, -90, 40, 0],
            y: [0, -60, -30, 0],
            rotate: [0, -45, -90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{ 
            position: 'absolute', bottom: '-15%', right: '-5%', width: '70%', height: '70%', 
            background: 'radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, rgba(217, 119, 6, 0.08) 50%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
      </div>

      {/* Toast Notification for Errors / Success */}
      <div style={{ position: 'fixed', top: '2rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <AnimatePresence>
          {(error || registrationSuccess) && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              style={{ 
                color: error ? '#ef4444' : '#10b981', 
                fontSize: '1.2rem',
                padding: '1.5rem 2rem', 
                background: error ? '#fef2f2' : '#f0fdf4',
                borderRadius: '1rem', 
                border: `2px solid ${error ? '#fee2e2' : '#dcfce7'}`,
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 15px -6px rgba(0, 0, 0, 0.15)',
                display: 'flex', alignItems: 'center', gap: '1rem',
                fontWeight: 600,
                pointerEvents: 'auto'
              }}
            >
              {registrationSuccess ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
              {registrationSuccess ? 'Registration successful. Please log in.' : error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glow-card-hover"
        style={{ 
          display: 'flex',
          width: '100%', maxWidth: '1000px', zIndex: 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(28px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 30px 90px -20px rgba(99, 102, 241, 0.15), 0 10px 30px -10px rgba(0, 0, 0, 0.04)',
          borderRadius: '2.5rem',
          overflow: 'hidden'
        }}
      >
        {/* Left Side: Image Panel */}
        <div className="auth-image-panel" style={{ flex: '1.2', position: 'relative', background: '#0f172a' }}>
          <img 
            src="/auth-bg.jpg" 
            alt="Assessment Tool Platform" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
          />
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%)', 
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', 
            padding: '3rem', color: 'white' 
          }}>
            <h2 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
              Assessment Tool
            </h2>
            <p style={{ color: '#f8fafc', fontSize: '1.05rem', lineHeight: 1.5, fontWeight: 500, textShadow: '0 1px 5px rgba(0,0,0,0.4)' }}>
              &quot;Your journey to smarter learning and effortless assessment starts here.&quot;
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div style={{ flex: '1', padding: '2.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Link href="/" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
          color: '#64748b', fontSize: '0.88rem', fontWeight: 700, 
          textDecoration: 'none', marginBottom: '1.5rem', transition: 'color 0.2s ease' 
        }}>
          ← Return to Home
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            style={{ 
              width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: 'white', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 12px 25px -4px rgba(59, 130, 246, 0.45)'
            }}
          >
            <LogIn size={32} />
          </motion.div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: '0.25rem' }}>
            Welcome <span className="animated-gradient-text">Back</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Log in to access your assessment workspace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={19} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  padding: '0.85rem 1.25rem 0.85rem 3.4rem', width: '100%', 
                  background: '#ffffff', border: '1px solid #e2e8f0', 
                  borderRadius: '1rem', color: '#0f172a', fontSize: '0.95rem', outline: 'none',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.02)', transition: 'all 0.25s ease'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={19} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={12}
                style={{ 
                  padding: '0.85rem 3.4rem 0.85rem 3.4rem', width: '100%', 
                  background: '#ffffff', border: '1px solid #e2e8f0', 
                  borderRadius: '1rem', color: '#0f172a', fontSize: '0.95rem', outline: 'none',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.02)', transition: 'all 0.25s ease'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>


          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 15px 30px -5px rgba(124, 58, 237, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            className="animated-gradient-btn"
            type="submit" 
            style={{ 
              width: '100%', padding: '0.9rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 800,
              border: 'none', color: '#ffffff',
              boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.3)', cursor: 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Login to Dashboard'}
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: 0 }}>
            Don&apos;t have an account? <Link href="/register" style={{ color: '#3b82f6', fontWeight: 800, textDecoration: 'none' }}>Register Now</Link>
          </p>

          <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Or use a demo account
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setEmail('educator@gmail.com');
                  setPassword('educator123');
                }}
                style={{
                  padding: '0.6rem 1.2rem', background: '#f8fafc', border: '1px solid #cbd5e1', 
                  borderRadius: '0.5rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                🎓 Educator Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('student@gmail.com');
                  setPassword('student123');
                }}
                style={{
                  padding: '0.6rem 1.2rem', background: '#f8fafc', border: '1px solid #cbd5e1', 
                  borderRadius: '0.5rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                📚 Student Demo
              </button>
            </div>
          </div>
        </form>
        </div>
      </motion.div>

      <style jsx>{`
        @media (max-width: 860px) {
          .auth-image-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff8f0 0%, #fef0db 100%)'
      }}>
        <div className="animate-pulse" style={{ color: 'var(--primary)' }}>Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
