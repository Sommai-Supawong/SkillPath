'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Archive, 
  BookOpen, 
  AlertCircle,
  X
} from 'lucide-react';

interface DevelopmentPlan {
  id: number;
  name: string;
  career_id: number;
  learner_profile_id: number;
  strategy: string;
  weekly_hours: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  initial_readiness: number;
  current_readiness: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

interface CareerSummary {
  id: number;
  title: string;
  category: string;
  description: string;
}

const strategyDescriptions: Record<string, string> = {
  balanced: 'สมดุลระหว่างความสำคัญและพื้นฐาน',
  fast_track: 'เน้นทักษะหลักเพื่อพร้อมทำงานเร็วที่สุด',
  foundation_first: 'เน้นปูพื้นฐานที่จำเป็นก่อนต่อยอด',
};

const strategyTitles: Record<string, string> = {
  balanced: 'Balanced',
  fast_track: 'Fast Track',
  foundation_first: 'Foundation First',
};

export default function MyPlansPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DevelopmentPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<DevelopmentPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form inputs for Create
  const [newCareerId, setNewCareerId] = useState<number | ''>('');
  const [newName, setNewName] = useState('');
  const [newStrategy, setNewStrategy] = useState('balanced');
  const [newWeeklyHours, setNewWeeklyHours] = useState(8);

  // Form inputs for Edit
  const [editName, setEditName] = useState('');
  const [editStrategy, setEditStrategy] = useState('balanced');
  const [editWeeklyHours, setEditWeeklyHours] = useState(8);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ACTIVE');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/my-plans');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          setFetching(true);
          const [plansData, careersData] = await Promise.all([
            api<DevelopmentPlan[]>('/plans'),
            api<CareerSummary[]>('/careers').catch(() => [])
          ]);
          setPlans(plansData);
          setCareers(careersData);
        } catch (err) {
          console.error('Error fetching plans:', err);
        } finally {
          setFetching(false);
        }
      }
    }
    loadData();
  }, [user]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (filter === 'ALL') return true;
      return p.status === filter;
    });
  }, [plans, filter]);

  // Open Create Modal
  function handleOpenCreate() {
    setFormError(null);
    if (careers.length > 0) {
      setNewCareerId(careers[0].id);
      setNewName(`แผน ${careers[0].title}`);
    } else {
      setNewCareerId('');
      setNewName('');
    }
    setNewStrategy('balanced');
    setNewWeeklyHours(8);
    setIsCreateOpen(true);
  }

  // Career change in Create Modal
  function handleCareerSelect(id: number) {
    setNewCareerId(id);
    const selected = careers.find((c) => c.id === id);
    if (selected) {
      setNewName(`แผน ${selected.title}`);
    }
  }

  // Submit Create Plan
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newCareerId) {
      setFormError('กรุณาเลือกสายอาชีพ');
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const created = await api<DevelopmentPlan>('/plans', {
        method: 'POST',
        body: JSON.stringify({
          career_id: Number(newCareerId),
          name: newName.trim() || undefined,
          strategy: newStrategy,
          weekly_hours: Number(newWeeklyHours)
        })
      });
      setPlans((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      showToast('สร้างแผนการเรียนรู้ใหม่สำเร็จแล้ว');
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'ไม่สามารถสร้างแผนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(plan: DevelopmentPlan) {
    setFormError(null);
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditStrategy(plan.strategy);
    setEditWeeklyHours(plan.weekly_hours);
    setEditStatus(plan.status);
  }

  // Submit Edit Plan
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlan) return;
    setBusy(true);
    setFormError(null);
    try {
      const updated = await api<DevelopmentPlan>(`/plans/${editingPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim() || editingPlan.name,
          strategy: editStrategy,
          weekly_hours: Number(editWeeklyHours),
          status: editStatus
        })
      });
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPlan(null);
      showToast('บันทึกการแก้ไขแผนเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'ไม่สามารถแก้ไขแผนได้');
    } finally {
      setBusy(false);
    }
  }

  // Submit Delete Plan
  async function handleDeleteSubmit() {
    if (!deletingPlan) return;
    setBusy(true);
    try {
      await api(`/plans/${deletingPlan.id}`, { method: 'DELETE' });
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setDeletingPlan(null);
      showToast('ลบแผนการเรียนรู้เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'ไม่สามารถลบแผนได้');
    } finally {
      setBusy(false);
    }
  }

  if (loading || fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="loading-state">กำลังโหลดแผนการพัฒนาของคุณ...</div>
      </div>
    );
  }

  const counts = {
    ALL: plans.length,
    ACTIVE: plans.filter((p) => p.status === 'ACTIVE').length,
    COMPLETED: plans.filter((p) => p.status === 'COMPLETED').length,
    ARCHIVED: plans.filter((p) => p.status === 'ARCHIVED').length,
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Toast Notice */}
      {toast && (
        <div 
          className="notice success" 
          style={{ 
            position: 'fixed', 
            bottom: '24px', 
            right: '24px', 
            zIndex: 1000, 
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="h2" style={{ margin: '0 0 0.5rem 0' }}>แผนการพัฒนาของฉัน</h1>
          <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            จัดการและติดตาม Learning Roadmap ส่วนตัวสู่เป้าหมายอาชีพของคุณ
          </p>
        </div>
        <button 
          className="button primary" 
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>สร้างแผนใหม่</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          className={`button ${filter === 'ALL' ? 'secondary' : 'ghost'}`}
          onClick={() => setFilter('ALL')}
          style={{ padding: '6px 14px', fontSize: '0.875rem' }}
        >
          ทั้งหมด ({counts.ALL})
        </button>
        <button
          className={`button ${filter === 'ACTIVE' ? 'secondary' : 'ghost'}`}
          onClick={() => setFilter('ACTIVE')}
          style={{ padding: '6px 14px', fontSize: '0.875rem' }}
        >
          กำลังเรียน ({counts.ACTIVE})
        </button>
        <button
          className={`button ${filter === 'COMPLETED' ? 'secondary' : 'ghost'}`}
          onClick={() => setFilter('COMPLETED')}
          style={{ padding: '6px 14px', fontSize: '0.875rem' }}
        >
          สำเร็จแล้ว ({counts.COMPLETED})
        </button>
        <button
          className={`button ${filter === 'ARCHIVED' ? 'secondary' : 'ghost'}`}
          onClick={() => setFilter('ARCHIVED')}
          style={{ padding: '6px 14px', fontSize: '0.875rem' }}
        >
          เก็บถาวร ({counts.ARCHIVED})
        </button>
      </div>

      {/* Plan Grid */}
      {filteredPlans.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <BookOpen size={40} style={{ color: 'var(--cyan)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.75rem' }}>
            {filter === 'ALL' ? 'คุณยังไม่มีแผนการเรียนรู้' : `ไม่มีแผนในหมวด ${filter.toLowerCase()}`}
          </h3>
          <p className="muted" style={{ maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            {filter === 'ALL' 
              ? 'เริ่มต้นด้วยการสำรวจสายอาชีพและประเมินทักษะ หรือกดสร้างแผนการเรียนรู้ใหม่ได้ทันที'
              : 'ลองสลับไปยังตัวกรองอื่น หรือสร้างแผนใหม่'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="button primary" onClick={handleOpenCreate}>
              <Plus size={16} /> สร้างแผนใหม่
            </button>
            <Link href="/careers" className="button secondary">
              สำรวจอาชีพทั้งหมด
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredPlans.map((plan) => {
            const readinessPct = Math.round(plan.current_readiness);
            const isCompleted = plan.status === 'COMPLETED';
            const isArchived = plan.status === 'ARCHIVED';

            return (
              <div 
                key={plan.id} 
                className="card glass-panel" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.25rem',
                  opacity: isArchived ? 0.75 : 1,
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text)' }}>
                      {plan.name}
                    </h3>
                    <span className="muted" style={{ fontSize: '0.8125rem' }}>
                      สร้างเมื่อ {new Date(plan.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
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
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                    <span className="muted">Career Readiness</span>
                    <strong style={{ color: isCompleted ? 'var(--good)' : 'var(--cyan)' }}>
                      {readinessPct}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--surface-elevated, rgba(17,42,70,0.6))', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${readinessPct}%`, 
                        height: '100%', 
                        background: isCompleted ? 'var(--good)' : 'linear-gradient(90deg, #38bdf8, #0ea5e9)', 
                        transition: 'width 0.4s ease' 
                      }} 
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Strategy</span>
                    <span style={{ fontWeight: 500 }}>{strategyTitles[plan.strategy] || plan.strategy}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">เวลาเรียน</span>
                    <span>{plan.weekly_hours} ชม. / สัปดาห์</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                  <Link 
                    href={`/my-plans/${plan.id}`} 
                    className="button primary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.875rem', minHeight: '40px' }}
                  >
                    <span>{isCompleted ? 'ดู Roadmap' : 'เรียนต่อ'}</span>
                    <ArrowRight size={15} />
                  </Link>

                  <button 
                    className="button secondary" 
                    onClick={() => handleOpenEdit(plan)}
                    title="แก้ไขแผน"
                    style={{ padding: '8px 12px', minHeight: '40px' }}
                  >
                    <Edit3 size={15} />
                  </button>

                  <button 
                    className="button secondary" 
                    onClick={() => setDeletingPlan(plan)}
                    title="ลบแผน"
                    style={{ padding: '8px 12px', minHeight: '40px', color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
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
          onClick={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}
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
                <Sparkles size={20} style={{ color: 'var(--cyan)' }} />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>สร้างแผนการเรียนรู้ใหม่</h2>
              </div>
              <button className="icon-button" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="notice error" style={{ marginBottom: '1rem', padding: '10px 14px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  เลือกสายอาชีพเป้าหมาย <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select 
                  className="input" 
                  value={newCareerId} 
                  onChange={(e) => handleCareerSelect(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  required
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  ชื่อแผนการเรียนรู้
                </label>
                <input 
                  type="text" 
                  className="input" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น แผน Frontend Developer สู่ระดับ Senior"
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
                  value={newStrategy} 
                  onChange={(e) => setNewStrategy(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="balanced">Balanced — สมดุลระหว่าง Gap และพื้นฐาน</option>
                  <option value="fast_track">Fast Track — เน้นวิชาหลักเคารพ Prerequisite</option>
                  <option value="foundation_first">Foundation First — ปูพื้นฐานก่อนต่อยอด</option>
                </select>
                <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '0.8125rem' }}>
                  {strategyDescriptions[newStrategy]}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                  เวลาเรียนต่อสัปดาห์ (ชั่วโมง)
                </label>
                <input 
                  type="number" 
                  min={1} 
                  max={40} 
                  value={newWeeklyHours} 
                  onChange={(e) => setNewWeeklyHours(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="button secondary" onClick={() => setIsCreateOpen(false)} disabled={busy}>
                  ยกเลิก
                </button>
                <button type="submit" className="button primary" disabled={busy}>
                  {busy ? 'กำลังสร้าง…' : 'สร้างแผน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPlan && (
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
          onClick={(e) => { if (e.target === e.currentTarget) setEditingPlan(null); }}
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
              <button className="icon-button" onClick={() => setEditingPlan(null)}>
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
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-elevated, #132a45)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="ACTIVE">ACTIVE (กำลังเรียน)</option>
                  <option value="COMPLETED">COMPLETED (สำเร็จแล้ว)</option>
                  <option value="ARCHIVED">ARCHIVED (เก็บถาวร)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="button secondary" onClick={() => setEditingPlan(null)} disabled={busy}>
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
      {deletingPlan && (
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
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingPlan(null); }}
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
            <h3 style={{ margin: '0 0 0.5rem 0' }}>ยืนยันการลบแผน?</h3>
            <p className="muted" style={{ lineHeight: 1.6, marginBottom: '1.75rem' }}>
              คุณกำลังจะลบ <strong>&ldquo;{deletingPlan.name}&rdquo;</strong> ข้อมูลการตั้งค่าความก้าวหน้าในแผนนี้จะถูกลบถาวร
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="button secondary" onClick={() => setDeletingPlan(null)} disabled={busy}>
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
    </div>
  );
}
