'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download,
  Calendar,
  Search,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadDate: string;
}

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/study-materials`);
        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        console.error('Error fetching materials', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--student-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              LEARNING RESOURCES
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Study Materials</h1>
        </div>
      </div>

      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1px solid var(--card-border)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem', color: 'var(--foreground)' }}>Available Resources</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Download notes, PDFs, and reading materials shared by educators.</p>
          </div>
        </div>

        <div style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              placeholder="Search by title or description..."
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
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading study materials...</div>
          ) : filteredMaterials.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <BookOpen size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600 }}>No materials found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredMaterials.map((m, i) => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ 
                    background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '1rem', 
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  whileHover={{ translateY: -2, boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)', borderColor: 'var(--student-primary)' }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '0.6rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--student-primary)', borderRadius: '0.75rem', height: 'fit-content' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--foreground)' }}>{m.title}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--student-primary)', fontWeight: 600, margin: 0, marginBottom: '0.25rem' }}>
                        Uploaded by: {m.uploadedBy}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={10} /> {formatDate(m.uploadDate)}
                      </p>
                    </div>
                  </div>
                  
                  {m.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: 0, padding: '0.75rem', background: 'var(--accent)', borderRadius: '0.5rem' }}>
                      {m.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)', background: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.fileName}
                    </span>
                    <a 
                      href={`${API_BASE_URL}/study-materials/download/${m.id}`}
                      target="_blank"
                      download
                      style={{ textDecoration: 'none' }}
                    >
                      <button style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--student-primary)', color: 'white',
                        padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <Download size={14} /> Download
                      </button>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
