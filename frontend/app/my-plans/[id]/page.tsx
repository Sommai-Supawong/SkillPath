'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  CheckCheck, 
  X, 
  AlertCircle,
  Sliders,
  Check
} from 'lucide-react';
import { SectionHeading, PageSkeleton, strategyLabels } from '@/components/ui';

const RoadmapDiagram = dynamic(() => import('@/components/roadmap/RoadmapGraph').then(m => m.RoadmapGraph), { 
  ssr: false, 
  loading: () => <PageSkeleton kind="roadmap" /> 
});

export default function PlanPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [plan, setPlan] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editStrategy, setEditStrategy] = useState('balanced');
  const [editWeeklyHours, setEditWeeklyHours] = useState(8);
  const [editStatus, setEditStatus] = useState('ACTIVE');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/my-plans/${id}`);
    }
  }, [user, loading, router, id]);

  const loadData = async () => {
    try {
      setFetching(true);
      setError(null);
      const planData = await api<any>(`/plans/${id}`);
      setPlan(planData);
      setEditName(planData.name);
      setEditStrategy(planData.strategy);
      setEditWeeklyHours(planData.weekly_hours);
      setEditStatus(planData.status);

      const [roadmapData, skillsData, profileData] = await Promise.all([
        api<any>(`/roadmaps/generate`, {
          method: 'POST',
          body: JSON.stringify({ 
            profile_id: planData.learner_profile_id, 
            career_id: planData.career_id, 
            strategy: planData.strategy 
          })
        }),
        api<any[]>('/skills'),
        api<any>(`/profiles/${planData.learner_profile_id}`)
      ]);

      setRoadmap(roadmapData);
      setSkills(skillsData);
      setProfile(profileData);

      const graphInfo = await api<any>(`/roadmaps/${roadmapData.id}/graph`);
      setGraph(graphInfo);

    } catch (err: any) {
      console.error(err);
      setError('ไม่สามารถโหลดแผนได้ หรือแผนอาจถูกลบไปแล้ว');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      loadData();
    }
  }, [user, id]);

  // Mark skill completed
  const completeItem = async ({ skill_id, target_level }: { skill_id: number; target_level: number }) => {
    try {
      setFetching(true);
      await api(`/profiles/${plan.learner_profile_id}/assessments`, {
        method: 'POST',
        body: JSON.stringify({ assessments: [{ skill_id, current_level: target_level }] })
      });
      await api(`/plans/${id}/progress`, { method: 'POST' });
      await api(`/roadmaps/${roadmap.id}/recalculate`, { method: 'POST' });
      await loadData();
      setMessage('บันทึกความก้าวหน้าและคำนวณ Readiness เรียบร้อยแล้ว!');
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      console.error('Error updating progress', err);
    } finally {
      setFetching(false);
    }
  };

  // Change Strategy via toolbar
  const handleStrategyChange = async (newStrategy: string) => {
    try {
      setFetching(true);
      await api(`/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ strategy: newStrategy })
      });
      await loadData();
      setMessage(`ปรับใช้กลยุทธ์ ${strategyLabels[newStrategy] || newStrategy} เรียบร้อยแล้ว`);
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setError('ไม่สามารถเปลี่ยนกลยุทธ์ได้');
    } finally {
      setFetching(false);
    }
  };

  // Submit Edit Modal
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const updated = await api<any>(`/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim() || plan.name,
          strategy: editStrategy,
          weekly_hours: Number(editWeeklyHours),
          status: editStatus
        })
      });
      setPlan(updated);
      setIsEditOpen(false);
      setMessage('บันทึกการแก้ไขแผนเรียบร้อยแล้ว');
      setTimeout(() => setMessage(null), 3500);
      // Reload roadmap if strategy changed
      if (updated.strategy !== plan.strategy) {
        await loadData();
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'ไม่สามารถแก้ไขแผนได้');
    } finally {
      setBusy(false);
    }
  };

  // Delete Plan
  const handleDeleteSubmit = async () => {
    setBusy(true);
    try {
      await api(`/plans/${id}`, { method: 'DELETE' });
      router.push('/my-plans');
    } catch (err: any) {
      console.error(err);
      setFormError('ไม่สามารถลบแผนได้');
      setBusy(false);
    }
  };

  if (loading || (fetching && !plan)) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="loading-state">กำลังโหลดเส้นทางการเรียนรู้...</div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="card glass-panel" style={{ maxWidth: '480px', margin: '4rem auto', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={36} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '0.75rem' }}>{error}</h3>
        <p className="muted" style={{ marginBottom: '2rem' }}>แผนนี้อาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เข้าถึง</p>
        <Link href="/my-plans" className="button primary">
          ← กลับไปยังแผนของฉัน
        </Link>
      </div>
    );
  }

  const isCompleted = plan.status === 'COMPLETED';
  const isArchived = plan.status === 'ARCHIVED';

  return (
    <section className="roadmap-page">
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link 
          href="/my-plans" 
          className="button ghost" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
        >
          <ArrowLeft size={16} />
          <span>กลับไปยังแผนของฉัน</span>
        </Link>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link 
            href={`/assessment/${plan.career_id}`}
            className="button secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '6px 14px', fontSize: '0.875rem' }}
          >
            <Sliders size={15} />
            <span>ประเมินทักษะใหม่</span>
          </Link>
          <button 
            className="button secondary" 
            onClick={() => setIsEditOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '6px 14px', fontSize: '0.875rem' }}
          >
            <Edit3 size={15} />
            <span>แก้ไขแผน</span>
          </button>
          <button 
            className="button secondary" 
            onClick={() => setIsDeleteOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '6px 14px', fontSize: '0.875rem', color: 'var(--danger)' }}
          >
            <Trash2 size={15} />
            <span>ลบแผน</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <SectionHeading eyebrow="Learning Roadmap Workspace" title={plan.name} page>
        <p>เส้นทางพัฒนาทักษะเฉพาะบุคคล คำนวณตาม Prerequisite และ Skill Gap ของคุณ</p>
      </SectionHeading>

      {error && (
        <div className="notice error" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <Link href={`/assessment/${plan.career_id}`} className="button primary" style={{ minHeight: '36px', padding: '6px 14px', fontSize: '0.8125rem' }}>
            ประเมินทักษะตอนนี้
          </Link>
        </div>
      )}

      {/* Summary Box */}
      <div className="roadmap-summary glass-panel" style={{ marginTop: '1rem' }}>
        <div>
          <strong style={{ color: isCompleted ? 'var(--good)' : 'var(--cyan)' }}>
            {Math.round(plan.current_readiness)}%
          </strong>
          <span>Career Readiness</span>
        </div>
        <div>
          <strong>{strategyLabels[plan.strategy] || plan.strategy}</strong>
          <span>กลยุทธ์ที่ใช้อยู่</span>
        </div>
        <div>
          <strong>{plan.weekly_hours} ชั่วโมง</strong>
          <span>เวลาเรียน / สัปดาห์</span>
        </div>
        <div>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: isCompleted ? 'rgba(72,213,151,0.15)' : isArchived ? 'rgba(140,165,190,0.15)' : 'rgba(56,189,248,0.15)',
              borderColor: isCompleted ? 'var(--good)' : isArchived ? 'var(--border)' : 'var(--cyan)',
              color: isCompleted ? 'var(--good)' : isArchived ? 'var(--muted)' : 'var(--cyan)',
              fontWeight: 600
            }}
          >
            {isCompleted ? '✓ สำเร็จแล้ว' : isArchived ? 'เก็บถาวร' : 'กำลังเรียน'}
          </span>
          <span>สถานะแผน</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="roadmap-toolbar glass-panel" style={{ marginTop: '1.25rem' }}>
        <div>
          <label htmlFor="strategy-select">ปรับกลยุทธ์การเรียน</label>
          <select 
            id="strategy-select" 
            value={plan.strategy} 
            onChange={(e) => handleStrategyChange(e.target.value)}
            disabled={fetching}
          >
            {Object.entries(strategyLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <button 
          className="button secondary" 
          onClick={loadData} 
          disabled={fetching}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={16} />
          <span>{fetching ? 'กำลังอัปเดต…' : 'คำนวณใหม่'}</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="notice success" role="status" style={{ marginTop: '1rem' }}>
          <CheckCheck size={20} />
          <p>{message}</p>
        </div>
      )}

      {isCompleted && (
        <div className="notice success" style={{ marginTop: '1.25rem' }}>
          <p>🎉 ยินดีด้วย! คุณมีระดับทักษะครบตาม Requirement ของสายอาชีพนี้แล้ว</p>
        </div>
      )}

      {/* Roadmap Diagram */}
      {graph && (
        <div style={{ marginTop: '2rem' }}>
          <div className="roadmap-section-heading">
            <div>
              <h2>ก้าวต่อไปของคุณ</h2>
              <p>เลือกทักษะเพื่อดูพื้นฐาน แหล่งเรียนรู้ และบันทึกความก้าวหน้า</p>
            </div>
          </div>
          
          <RoadmapDiagram 
            graph={graph} 
            roadmap={roadmap} 
            skills={skills} 
            profile={profile} 
            busy={fetching}
            onComplete={completeItem}
            onFallback={() => {}}
          />
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(4, 11, 20, 0.85)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsEditOpen(false); }}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '520px', 
              width: '100%', 
              padding: '2rem', 
              background: 'var(--glass-strong, #0f233a)', 
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} style={{ color: 'var(--cyan)' }} />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>แก้ไขแผนการเรียนรู้</h2>
              </div>
              <button className="icon-button" onClick={() => setIsEditOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="notice error" style={{ marginBottom: '1rem', padding: '10px 14px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  ชื่อแผนการเรียนรู้
                </label>
                <input 
                  type="text" 
                  className="input" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  กลยุทธ์การเรียนรู้ (Strategy)
                </label>
                <select 
                  className="input" 
                  value={editStrategy} 
                  onChange={(e) => setEditStrategy(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="balanced">Balanced — สมดุลระหว่าง Gap และพื้นฐาน</option>
                  <option value="fast_track">Fast Track — เน้นวิชาหลักเคารพ Prerequisite</option>
                  <option value="foundation_first">Foundation First — ปูพื้นฐานก่อนต่อยอด</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  เวลาเรียนต่อสัปดาห์ (ชั่วโมง)
                </label>
                <input 
                  type="number" 
                  min={1} 
                  max={40} 
                  value={editWeeklyHours} 
                  onChange={(e) => setEditWeeklyHours(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  สถานะของแผน
                </label>
                <select 
                  className="input" 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="ACTIVE">ACTIVE (กำลังเรียน)</option>
                  <option value="COMPLETED">COMPLETED (สำเร็จแล้ว)</option>
                  <option value="ARCHIVED">ARCHIVED (เก็บถาวร)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="button secondary" onClick={() => setIsEditOpen(false)} disabled={busy}>
                  ยกเลิก
                </button>
                <button type="submit" className="button primary" disabled={busy}>
                  {busy ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(4, 11, 20, 0.85)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteOpen(false); }}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '440px', 
              width: '100%', 
              padding: '2rem', 
              background: 'var(--glass-strong, #0f233a)', 
              border: '1px solid var(--danger)',
              borderRadius: '16px',
              textAlign: 'center'
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255, 77, 79, 0.15)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>ยืนยันการลบแผนนี้?</h3>
            <p className="muted" style={{ lineHeight: 1.6, marginBottom: '1.75rem' }}>
              คุณกำลังจะลบแผน <strong>&ldquo;{plan.name}&rdquo;</strong> การดำเนินการนี้ไม่สามารถเรียกคืนได้
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="button secondary" onClick={() => setIsDeleteOpen(false)} disabled={busy}>
                ยกเลิก
              </button>
              <button 
                className="button" 
                onClick={handleDeleteSubmit} 
                disabled={busy}
                style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none' }}
              >
                {busy ? 'กำลังลบ…' : 'ยืนยันลบแผน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
