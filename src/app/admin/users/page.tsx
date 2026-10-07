'use client';

import React, { useState, useEffect } from 'react';
import { UserRecord } from '@/lib/mockData';
import { 
  Plus,
  Users,
  Search, 
  Trash2, 
  Edit,
  CheckCircle,
  XCircle,
  Shield,
  UserPlus,
  LayoutGrid,
  List,
  Mail,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'educator' | 'student'>('all');
  const [activeCard, setActiveCard] = useState<'all' | 'admin' | 'educator' | 'student' | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form states for user modal
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRecord['role']>('student');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data.reverse()); // Newest first
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalEducators = users.filter(u => u.role === 'educator').length;
  const totalStudents = users.filter(u => u.role === 'student').length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: '#0284c7', bg: '#e0f2fe', filterKey: 'all' as const },
    { label: 'Total Admin', value: totalAdmins, icon: Shield, color: '#ef4444', bg: '#fee2e2', filterKey: 'admin' as const },
    { label: 'Total Educators', value: totalEducators, icon: CheckCircle, color: '#10b981', bg: '#dcfce7', filterKey: 'educator' as const },
    { label: 'Total Students', value: totalStudents, icon: UserPlus, color: '#9333ea', bg: '#f3e8ff', filterKey: 'student' as const },
  ];

  // Filter users based on search & role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 3);

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin') {
      alert('Admin accounts cannot be deleted for security reasons.');
      return;
    }

    if (confirm('Are you sure you want to remove this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (user.role === 'admin') {
      alert('Admin accounts cannot be set to inactive.');
      return;
    }

    const updatedUser = { ...user, status: user.status === 'active' ? 'inactive' : 'active' };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleEdit = (user: UserRecord) => {
    setEditingUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewStatus(user.status);
    setShowModal(true);
  };

  const handleAddUser = async () => {
    if (!newName || !newEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUser = {
        ...editingUser,
        name: newName,
        email: newEmail,
        role: newRole,
        status: newStatus
      };

      try {
        const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });
        if (response.ok) {
          fetchUsers();
          setEditingUser(null);
          setNewName('');
          setNewEmail('');
          setNewRole('student');
          setNewStatus('active');
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      // Create new user
      const newUser = {
        name: newName,
        email: newEmail,
        role: newRole,
        status: newStatus,
        lastLogin: 'Never'
      };

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (response.ok) {
          fetchUsers();
          setNewName('');
          setNewEmail('');
          setNewRole('student');
          setNewStatus('active');
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  };

  const getRoleBadgeClass = (role: UserRecord['role']) => {
    switch (role) {
      case 'admin': return 'role-badge role-badge-admin';
      case 'educator': return 'role-badge role-badge-educator';
      case 'student': default: return 'role-badge role-badge-student';
    }
  };

  return (
    <div className="animate-premium">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              padding: '0.28rem 0.85rem', 
              background: '#dbeafe', 
              color: '#1e40af', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              letterSpacing: '0.06em',
              boxShadow: '0 2px 6px rgba(30, 64, 175, 0.12)'
            }}>
              ADMIN DASHBOARD
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--foreground, #0f172a)' }}>
            User Management
          </h1>
        </div>
        <button 
          onClick={() => { 
            setEditingUser(null);
            setNewName('');
            setNewEmail('');
            setNewRole('student');
            setShowModal(true); 
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            padding: '0.65rem 1.4rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '9999px',
            background: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Summary Stats Grid - 4 Column Single Line Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isSelected = activeCard === stat.filterKey;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)' }}
              onClick={() => {
                if (activeCard === stat.filterKey) {
                  setActiveCard(null);
                  setRoleFilter('all');
                } else {
                  setActiveCard(stat.filterKey);
                  setRoleFilter(stat.filterKey);
                }
              }}
              style={{ 
                padding: '1.15rem 1.25rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                borderRadius: '1.25rem',
                border: isSelected 
                  ? `2px solid ${stat.color}` 
                  : '1px solid rgba(226, 232, 240, 0.85)',
                background: '#ffffff',
                color: 'var(--foreground, #0f172a)',
                boxShadow: isSelected 
                  ? `0 0 25px ${stat.color}35, 0 10px 24px rgba(0, 0, 0, 0.06)` 
                  : '0 8px 24px -6px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isSelected ? 'scale(1.02)' : 'none'
              }}
            >
              <div 
                style={{ 
                  background: `linear-gradient(135deg, ${stat.bg} 0%, #ffffff 100%)`, 
                  color: stat.color, 
                  width: '42px',
                  height: '42px',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${stat.color}25`
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem', fontWeight: 600, whiteSpace: 'normal', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  {stat.label}
                </p>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.1, color: '#0f172a', margin: 0 }}>
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Active Accounts Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ 
          background: '#ffffff',
          borderRadius: '1.75rem', 
          border: '1px solid rgba(226, 232, 240, 0.85)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.08)', 
          padding: '1.75rem 2rem',
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--foreground, #0f172a)', margin: '0 0 0.15rem 0' }}>
              Active Accounts
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Manage member accounts, roles, and status with real-time updates.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
              Showing {displayedUsers.length} of {filteredUsers.length}
            </span>
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              style={{ 
                padding: '0.35rem 1rem', 
                fontSize: '0.8rem', 
                color: '#0f172a', 
                fontWeight: 600, 
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'all 0.2s'
              }}
            >
              {showAllUsers ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + View Switcher) */}
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              placeholder="Search by name or email..." 
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

          <div style={{ display: 'flex', background: '#edf0f4', padding: '3px', borderRadius: '0.75rem' }}>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '0.55rem',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#1d4ed8' : '#94a3b8',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid Card View"
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '0.55rem',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#1d4ed8' : '#94a3b8',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* User Content */}
        <div style={{ overflowX: 'auto' }}>
          {viewMode === 'table' ? (
            loading ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>No users matching criteria.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.85rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '0 1.15rem' }}>User</th>
                    <th style={{ padding: '0 1.15rem' }}>Role</th>
                    <th style={{ padding: '0 1.15rem' }}>Status</th>
                    <th style={{ padding: '0 1.15rem' }}>Last Login</th>
                    <th style={{ padding: '0 1.15rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="report-row-premium"
                      style={{ 
                        background: '#ffffff',
                        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <td style={{ 
                        padding: '0.85rem 1.25rem', 
                        borderRadius: '1.1rem 0 0 1.1rem', 
                        borderLeft: '1px solid #f1f5f9', 
                        borderTop: '1px solid #f1f5f9', 
                        borderBottom: '1px solid #f1f5f9',
                        background: '#ffffff'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div 
                            style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '10px', 
                              background: user.role === 'admin' 
                                ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' 
                                : user.role === 'educator' 
                                ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                                : 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                              color: user.role === 'admin' 
                                ? '#991b1b' 
                                : user.role === 'educator' 
                                ? '#065f46' 
                                : '#5b21b6',
                              boxShadow: user.role === 'admin'
                                ? '0 4px 12px rgba(239, 68, 68, 0.25)'
                                : user.role === 'educator'
                                ? '0 4px 12px rgba(16, 185, 129, 0.25)'
                                : '0 4px 12px rgba(139, 92, 246, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}
                          >
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 0.12rem 0' }}>
                              {user.name}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
                              <Mail size={12} style={{ color: '#94a3b8' }} /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <span 
                          style={{
                            padding: '0.28rem 0.95rem',
                            borderRadius: '9999px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            display: 'inline-block',
                            background: user.role === 'admin' ? '#fee2e2' : user.role === 'educator' ? '#dcfce7' : '#f3e8ff',
                            color: user.role === 'admin' ? '#b91c1c' : user.role === 'educator' ? '#15803d' : '#7e22ce',
                            boxShadow: user.role === 'admin' ? '0 1px 4px rgba(239, 68, 68, 0.12)' : user.role === 'educator' ? '0 1px 4px rgba(16, 185, 129, 0.12)' : 'none'
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ 
                            width: '7.5px', 
                            height: '7.5px', 
                            borderRadius: '50%', 
                            background: user.status === 'active' ? '#10b981' : '#94a3b8',
                            boxShadow: user.status === 'active' ? '0 0 7px rgba(16, 185, 129, 0.65)' : 'none'
                          }}></span>
                          <span style={{ 
                            fontSize: '0.84rem', 
                            fontWeight: 700,
                            color: user.status === 'active' ? '#0f172a' : '#64748b',
                            textTransform: 'capitalize' 
                          }}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 500, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} style={{ color: '#94a3b8' }} />
                          {user.lastLogin}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', borderRadius: '0 1.1rem 1.1rem 0', textAlign: 'right', borderRight: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => toggleStatus(user.id)}
                              className="user-action-btn toggle"
                              title={`Toggle Status (Currently ${user.status})`}
                              style={{ color: '#94a3b8', padding: '0.3rem' }}
                            >
                              {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(user)}
                            className="user-action-btn edit"
                            title="Edit User"
                            style={{ color: '#94a3b8', padding: '0.3rem' }}
                          >
                            <Edit size={16} />
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="user-action-btn delete"
                              title="Delete User"
                              style={{ color: '#94a3b8', padding: '0.3rem' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            /* User Content: Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No users matching criteria.</div>
              ) : (
                displayedUsers.map((user) => (
                  <div key={user.id} className="user-card-item" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1.25rem', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          background: user.role === 'admin' ? '#fee2e2' : user.role === 'educator' ? '#d1fae5' : '#ede9fe',
                          color: user.role === 'admin' ? '#ef4444' : user.role === 'educator' ? '#059669' : '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span 
                        style={{
                          padding: '0.25rem 0.8rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: user.role === 'admin' ? '#fee2e2' : user.role === 'educator' ? '#dcfce7' : '#f3e8ff',
                          color: user.role === 'admin' ? '#b91c1c' : user.role === 'educator' ? '#15803d' : '#7e22ce'
                        }}
                      >
                        {user.role}
                      </span>
                    </div>

                    <h3 className="user-name" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--foreground, #1e293b)' }}>{user.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} style={{ opacity: 0.7 }} /> {user.email}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ 
                          width: '7px', 
                          height: '7px', 
                          borderRadius: '50%', 
                          background: user.status === 'active' ? 'var(--success)' : 'var(--muted-foreground)',
                          boxShadow: user.status === 'active' ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none'
                        }}></span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: user.status === 'active' ? 'var(--foreground)' : 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                          {user.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => toggleStatus(user.id)}
                            className="user-action-btn toggle"
                            title="Toggle Status"
                          >
                            {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(user)}
                          className="user-action-btn edit"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="user-action-btn delete"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>


      {/* Add / Edit User Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--card-border)', animation: 'fadeInSlide 0.3s ease' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem', color: 'var(--foreground)' }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--foreground)' }}>Full Name</label>
              <input 
                placeholder="Alexander Pierce" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--foreground)' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="alex@example.com" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--foreground)' }}>Assign Role</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRecord['role'])}
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {editingUser?.role !== 'admin' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--foreground)' }}>Account Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >Cancel</button>
              <button 
                onClick={handleAddUser}
                className="btn-primary"
              >{editingUser ? 'Update User' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
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
        .user-action-btn {
          cursor: pointer;
          background: transparent;
          border: none;
          transition: all 0.2s ease;
          border-radius: 0.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .user-action-btn:hover {
          transform: scale(1.18);
          color: #0f172a !important;
        }
        .user-action-btn.toggle:hover {
          color: #10b981 !important;
          background: rgba(16, 185, 129, 0.08);
        }
        .user-action-btn.edit:hover {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.08);
        }
        .user-action-btn.delete:hover {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.08);
        }
      `}</style>
    </div>
  );
}
