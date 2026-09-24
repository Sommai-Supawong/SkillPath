'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  last_login_at: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const data = await api<UserProfile>('/users/me');
          setProfile(data);
        } catch (err) {
          console.error(err);
        }
      }
    }
    fetchProfile();
  }, [user]);

  if (loading || !user) return <div className="loading-state">Loading...</div>;

  return (
    <div className="profile-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="h2" style={{ marginBottom: '2rem' }}>โปรไฟล์</h1>
      
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-surface-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          )}
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{profile?.display_name || user.displayName}</h2>
            <p className="muted" style={{ margin: 0 }}>{profile?.email || user.email}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>SkillPath Preferences</h3>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="muted" style={{ display: 'block', marginBottom: '0.5rem' }}>เวลาเรียนต่อสัปดาห์ (ชั่วโมง)</label>
            <input type="number" defaultValue={8} min={1} max={40} className="input" disabled style={{ width: '100%', padding: '0.5rem', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
          </div>
          
          <div className="form-group">
            <label className="muted" style={{ display: 'block', marginBottom: '0.5rem' }}>รูปแบบการเรียนที่ต้องการ (Strategy)</label>
            <select className="input" defaultValue="balanced" disabled style={{ width: '100%', padding: '0.5rem', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
              <option value="balanced">Balanced</option>
              <option value="fast_track">Fast Track</option>
              <option value="foundation">Foundation First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
