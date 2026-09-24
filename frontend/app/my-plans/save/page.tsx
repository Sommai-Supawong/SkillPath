'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';

function SavePlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      }
      return;
    }

    if (attempted.current) return;
    attempted.current = true;

    const savePlan = async () => {
      try {
        let profileId = searchParams.get('profile_id');
        let careerId = searchParams.get('career_id');
        let strategy = searchParams.get('strategy') || 'balanced';
        let planName = '';

        // Check fallback in localStorage
        if (typeof window !== 'undefined') {
          const pendingRaw = localStorage.getItem('skillpath_pending_save');
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw);
              if (!profileId && pending.profileId) profileId = String(pending.profileId);
              if (!careerId && pending.careerId) careerId = String(pending.careerId);
              if (pending.strategy) strategy = pending.strategy;
              if (pending.name) planName = pending.name;
            } catch (e) {}
          }

          if (!profileId) {
            profileId = localStorage.getItem('skillpath_profile_id');
          }
          if (!careerId) {
            careerId = localStorage.getItem('skillpath_career_id');
          }
        }

        if (!careerId) {
          setError('ไม่พบข้อมูลสายอาชีพที่ต้องการบันทึก กรุณาเลือกสายอาชีพและประเมินทักษะก่อน');
          return;
        }

        if (!planName) {
          try {
            const career = await api<any>(`/careers/${careerId}`);
            planName = career.title;
          } catch (e) {
            planName = `แผนพัฒนาอาชีพ #${careerId}`;
          }
        }

        const newPlan = await api<any>('/plans', {
          method: 'POST',
          body: JSON.stringify({
            name: planName,
            career_id: parseInt(careerId, 10),
            learner_profile_id: profileId ? parseInt(profileId, 10) : undefined,
            strategy,
            weekly_hours: 8
          })
        });

        // Clean up pending save
        if (typeof window !== 'undefined') {
          localStorage.removeItem('skillpath_pending_save');
        }

        router.push(`/my-plans/${newPlan.id}`);
      } catch (err: any) {
        console.error('Save plan error:', err);
        setError(err.message || 'ไม่สามารถบันทึกแผนได้ กรุณาลองใหม่อีกครั้ง');
      }
    };

    savePlan();
  }, [user, loading, router, searchParams]);

  if (error) {
    return (
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', margin: '4rem auto', maxWidth: '440px', background: 'var(--color-surface, #0f233a)' }}>
        <h2 style={{ color: 'var(--color-danger, #ff4d4f)', marginBottom: '1rem' }}>เกิดข้อผิดพลาด</h2>
        <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="button secondary" onClick={() => router.push('/careers')}>สำรวจอาชีพใหม่</button>
          <button className="button primary" onClick={() => router.push('/my-plans')}>ไปยังแผนของฉัน</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div className="loading-state" style={{ marginBottom: '1rem' }}>กำลังบันทึกแผนการเรียนรู้ของคุณสู่ระบบ...</div>
      <p className="muted">ระบบกำลังผูก Roadmap และทักษะที่ประเมินไว้เข้ากับบัญชีของคุณ</p>
    </div>
  );
}

export default function SavePlanPage() {
  return (
    <Suspense fallback={<div className="loading-state">กำลังโหลด...</div>}>
      <SavePlanContent />
    </Suspense>
  );
}
