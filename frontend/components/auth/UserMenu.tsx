'use client';

import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, LogOut, User as UserIcon, BookOpen, LayoutDashboard } from 'lucide-react';

export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  if (loading) {
    return <div className="user-menu-skeleton"></div>;
  }

  if (!user) {
    return (
      <Link href="/login" className="button secondary">
        เข้าสู่ระบบ
      </Link>
    );
  }

  return (
    <div className="user-menu" style={{ position: 'relative' }}>
      <button 
        className="user-menu-trigger button ghost" 
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={user.displayName ? `เมนูบัญชีของ ${user.displayName}` : 'เมนูบัญชี'}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px' }}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--color-surface-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={14} />
          </div>
        )}
        <span>{user.displayName || 'User'}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div 
          className="user-menu-dropdown card"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '8px',
            minWidth: '200px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px'
          }}
          onClick={() => setOpen(false)}
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.displayName}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{user.email}</div>
          </div>
          <Link href="/my-plans" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', textDecoration: 'none', color: 'inherit' }}>
            <BookOpen size={16} /> แผนของฉัน
          </Link>
          <Link href="/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', textDecoration: 'none', color: 'inherit' }}>
            <UserIcon size={16} /> โปรไฟล์
          </Link>
          <Link href="/dashboard" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', textDecoration: 'none', color: 'inherit' }}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <button 
            onClick={logout}
            className="dropdown-item" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', 
              textDecoration: 'none', color: 'var(--color-danger, #ff4d4f)', 
              background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
