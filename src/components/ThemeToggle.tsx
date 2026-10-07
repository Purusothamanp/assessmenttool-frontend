'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.85rem',
        borderRadius: '9999px',
        border: '1px solid var(--card-border)',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        color: 'var(--foreground)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.85rem',
        backdropFilter: 'blur(8px)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
        ...style
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: [0.8, 1.1, 1] }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isDark ? (
          <Moon size={18} className="text-amber-400" style={{ color: '#fbbf24' }} />
        ) : (
          <Sun size={18} className="text-amber-500" style={{ color: '#f59e0b' }} />
        )}
      </motion.div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </motion.button>
  );
}

export default ThemeToggle;
