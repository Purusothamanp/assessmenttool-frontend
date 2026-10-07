'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Home as HomeIcon,
  LayoutGrid,
  Users,
  Info,
  LogIn,
  UserPlus,
  ArrowRight,
  FileText,
  BarChart2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  X,
  MessageCircle,
  Code,
  Briefcase,
  Mail
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'roles' | 'about'>('home');
  const [activeModal, setActiveModal] = useState<'features' | 'roles' | 'about' | null>(null);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #f6f1e9 50%, #f2ebe1 100%)',
      color: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'
    }}>
      {/* Background Soft Warm Ambient Glows */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Soft Warm Amber-Peach Top Right Glow */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 40, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-18%',
            right: '-12%',
            width: '70%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.16) 0%, rgba(245, 158, 11, 0.12) 45%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />

        {/* Soft Warm Rose-Coral Bottom Left Glow */}
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '-18%',
            left: '-12%',
            width: '70%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, rgba(251, 113, 133, 0.1) 45%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />

        {/* Warm Golden Sunlight Center Glow */}
        <motion.div
          animate={{
            scale: [0.9, 1.15, 0.9]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '25%',
            left: '30%',
            width: '45%',
            height: '45%',
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.25) 0%, rgba(251, 191, 36, 0.08) 50%, transparent 75%)',
            filter: 'blur(110px)'
          }}
        />

        {/* Decorative Dot Pattern */}
        <div style={{
          position: 'absolute',
          top: '8%',
          right: '4%',
          width: '180px',
          height: '180px',
          backgroundImage: 'radial-gradient(rgba(147, 51, 234, 0.25) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
          zIndex: 0
        }} />
      </div>

      {/* 1. Floating Pill Navbar (Top) */}
      <header style={{ position: 'relative', zIndex: 10, padding: '1.25rem 1rem 0' }}>
        <div style={{
          maxWidth: '1180px',
          width: '94%',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '0.65rem 1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 12px 35px -5px rgba(124, 58, 237, 0.08), 0 4px 14px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 6px 18px rgba(168, 85, 247, 0.35)'
              }}
            >
              <Rocket size={22} />
            </motion.div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a' }}>
              Assessment<span style={{
                background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Tool</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Home Tab */}
            <button
              onClick={() => { setActiveTab('home'); setActiveModal(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'home' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'home' ? '#7e22ce' : '#64748b',
                fontWeight: activeTab === 'home' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <HomeIcon size={16} />
              Home
            </button>

            {/* Features Tab */}
            <button
              onClick={() => { setActiveTab('features'); setActiveModal('features'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'features' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'features' ? '#7e22ce' : '#64748b',
                fontWeight: activeTab === 'features' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutGrid size={16} />
              Features
            </button>

            {/* Roles Tab */}
            <button
              onClick={() => { setActiveTab('roles'); setActiveModal('roles'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'roles' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'roles' ? '#7e22ce' : '#64748b',
                fontWeight: activeTab === 'roles' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={16} />
              Roles
            </button>

            {/* About Tab */}
            <button
              onClick={() => { setActiveTab('about'); setActiveModal('about'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'about' ? '#f3e8ff' : 'transparent',
                color: activeTab === 'about' ? '#7e22ce' : '#64748b',
                fontWeight: activeTab === 'about' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Info size={16} />
              About
            </button>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: '#f8fafc' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.35rem',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn size={16} />
                Log In
              </motion.button>
            </Link>

            <Link href="/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 10px 25px -4px rgba(168, 85, 247, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.45rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(168, 85, 247, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserPlus size={16} />
                Sign Up
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Hero Section */}
      <main style={{
        position: 'relative',
        zIndex: 5,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 1.5rem',
        maxWidth: '1240px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          alignItems: 'center',
          gap: '2.5rem',
          width: '100%'
        }}>
          {/* Left Column Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', padding: '0.35rem 0.95rem', borderRadius: '9999px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.25)', boxShadow: '0 2px 8px rgba(251, 146, 60, 0.08)' }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c', boxShadow: '0 0 6px rgba(234, 88, 12, 0.5)' }} />
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#c2410c',
                textTransform: 'uppercase'
              }}>
                ONLINE ASSESSMENT PLATFORM
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontSize: 'clamp(2.5rem, 4.2vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.04em',
                color: '#0f172a',
                marginBottom: '1rem'
              }}
            >
              Create and Manage<br />
              <span style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                Assessments
              </span> Easily
            </motion.h1>



            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 15px 35px rgba(147, 51, 234, 0.45)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.85rem 2rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 50%, #ec4899 100%)',
                    color: '#ffffff',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 25px rgba(147, 51, 234, 0.35)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Get Started
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column 3D Graphics Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '100%',
                maxWidth: '540px',
                position: 'relative',
                borderRadius: '2rem',
                padding: '0.35rem',
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 60px -15px rgba(217, 119, 6, 0.14), 0 10px 25px rgba(0, 0, 0, 0.04)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)'
              }}
            >
              <img
                src="/hero_illustration_new.jpg"
                alt="Assessment Tool 3D Laptop Illustration"
                style={{
                  width: '100%',
                  height: '280px',
                  display: 'block',
                  borderRadius: '1.75rem',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* 3. Bottom Feature Highlights Card */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 1rem 1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            maxWidth: '1180px',
            width: '94%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem'
          }}
        >
          {/* Feature 1 */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}
            style={{ background: '#ffffff', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Assessments</h4>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}
            style={{ background: '#ffffff', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Users</h4>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}
            style={{ background: '#ffffff', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Track Performance</h4>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Global Site Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        background: '#ffffff',
        color: '#0f172a',
        padding: '0.75rem 0',
        marginTop: 'auto',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        flexShrink: 0
      }}>
        <div style={{
          maxWidth: '1180px',
          width: '94%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left Side: Logo & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '380px', paddingRight: '2rem', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{ padding: '0.25rem', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '8px', color: '#fff', display: 'flex' }}>
                <Rocket size={14} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Assessment<span style={{ color: '#ec4899' }}>Tool</span>
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
              Empowering modern education with AI-driven assessments and real-time analytics.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.65rem', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
              &copy; {new Date().getFullYear()} AssessmentTool Inc. All rights reserved.
            </p>
          </div>

          {/* Center Side: Quick Links */}
          <div style={{ display: 'flex', gap: '4rem', flex: 1, paddingLeft: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Platform</span>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>Features</span>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>Pricing</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Company</span>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => { setActiveTab('about'); setActiveModal('about'); }}>About Us</span>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>Contact</span>
            </div>
          </div>

          {/* Right Side: Social & Support */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem', width: '200px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Connect</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.div whileHover={{ y: -2 }} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="GitHub">
                <Code size={12} />
              </motion.div>
              <motion.div whileHover={{ y: -2 }} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0077b5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="LinkedIn">
                <Briefcase size={12} />
              </motion.div>
              <motion.div whileHover={{ y: -2 }} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Email">
                <Mail size={12} />
              </motion.div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.2rem' }}>
              <Mail size={10} color="#ec4899" /> support@assessmenttool.com
            </div>
          </div>
        </div>
      </footer>

      {/* Feature Modals for Navigation Tabs */}
      <AnimatePresence>
        {activeModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '520px',
                background: '#ffffff',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => { setActiveModal(null); setActiveTab('home'); }}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>

              {activeModal === 'features' && (
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <LayoutGrid size={24} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Key Features</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Empowering educators and students with modern assessment workflows.</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                      <CheckCircle2 size={18} color="#16a34a" /> Automated instant scoring & detailed metrics
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                      <CheckCircle2 size={18} color="#16a34a" /> Flexible question types (MCQ, Short Answer, Coding)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                      <CheckCircle2 size={18} color="#16a34a" /> Admin & Educator performance dashboard
                    </li>
                  </ul>
                </div>
              )}

              {activeModal === 'roles' && (
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Users size={24} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Supported Roles</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Role-based access control tailored for education.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.85rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#2563eb', display: 'block' }}>Admin</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Full System Control</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.85rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#16a34a', display: 'block' }}>Educator</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Create & Grade</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.85rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#9333ea', display: 'block' }}>Student</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Take Tests & Track</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'about' && (
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Info size={24} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>About AssessmentTool</h2>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                    AssessmentTool is a next-generation education technology platform designed to streamline online examinations, auto-evaluate student submissions, and provide real-time analytical reports.
                  </p>
                </div>
              )}

              <button
                onClick={() => { setActiveModal(null); setActiveTab('home'); }}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
