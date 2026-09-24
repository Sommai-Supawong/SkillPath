import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight, Check, CircleAlert, Compass, LockKeyhole, RotateCcw } from "lucide-react";

export const strategyLabels: Record<string, string> = { balanced: "Balanced", fast_track: "Fast Track", foundation_first: "Foundation First" };
export const levelLabels = ["ยังไม่เคยเรียน", "รู้จักแนวคิดเบื้องต้น", "ทำงานพื้นฐานโดยมีคำแนะนำ", "ทำงานทั่วไปได้ด้วยตนเอง", "ใช้ได้คล่องในงานที่ซับซ้อนขึ้น", "ใช้ได้เชี่ยวชาญและอธิบายแนวทางได้"];

export function SectionHeading({ eyebrow, title, children, page = false }: { eyebrow: string; title: string; children?: ReactNode; page?: boolean }) {
  const Heading = page ? "h1" : "h2";
  return <header className={page ? "page-heading" : "section-heading"}><p className="eyebrow"><span />{eyebrow}</p><Heading>{title}</Heading>{children && <div className="lead">{children}</div>}</header>;
}
export function NeonGlowButton({ href, children }: { href: string; children: ReactNode }) { return <Link className="button neon" href={href}>{children}<ArrowRight size={18} aria-hidden="true" /></Link>; }
export function PageSkeleton({ kind = "cards" }: { kind?: "cards" | "form" | "dashboard" | "roadmap" }) {
  return <div className={`page-skeleton skeleton-${kind}`} role="status" aria-busy="true"><span className="sr-only">กำลังโหลดข้อมูล…</span><div aria-hidden="true"><div className="skeleton skeleton-heading" /><div className="skeleton skeleton-copy" /><div className={kind === "cards" ? "career-grid" : "skeleton-stack"}>{Array.from({ length: kind === "roadmap" ? 1 : kind === "dashboard" ? 3 : 6 }, (_, i) => <div key={i} className="card skeleton-card"><div className="skeleton skeleton-icon" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>)}</div></div></div>;
}
export function Status({ loading, error, empty, onRetry, kind = "cards" }: { loading?: boolean; error?: string; empty?: string; onRetry?: () => void; kind?: "cards" | "form" | "dashboard" | "roadmap" }) {
  if (loading) return <PageSkeleton kind={kind} />;
  if (error) return <div className="notice error" role="alert"><CircleAlert size={22} aria-hidden="true" /><div><strong>{error}</strong><p>กรุณาลองอีกครั้ง ข้อมูลที่กรอกไว้จะยังอยู่</p>{onRetry && <button className="secondary" onClick={onRetry}><RotateCcw size={16} />ลองอีกครั้ง</button>}</div></div>;
  if (empty) return <div className="empty-state"><Compass size={32} aria-hidden="true" /><h2>{empty}</h2><p>เลือกสายอาชีพและประเมินทักษะ เพื่อเริ่มเส้นทางการเรียนรู้ของคุณ</p><Link className="button" href="/careers">สำรวจอาชีพ <ArrowRight size={18} /></Link></div>;
  return null;
}
export function Readiness({ value, label = "Career Readiness" }: { value: number; label?: string }) {
  const score = Math.max(0, Math.min(100, value));
  return <div className="score-card"><div className="readiness-orbit" aria-hidden="true"><svg viewBox="0 0 160 160"><circle className="gauge-track" cx="80" cy="80" r="68" /><circle className="gauge-value" cx="80" cy="80" r="68" pathLength="100" strokeDasharray={`${score} 100`} /></svg><span>{Math.round(score)}<small>%</small></span></div><div><p className="eyebrow">{label}</p><strong className="score-number">{Math.round(score)}<small>%</small></strong><p className="muted">ความพร้อมตามทักษะที่ประเมิน<br />เทียบกับ Requirement ของสายอาชีพ</p></div><span className="sr-only">{label} {Math.round(score)} เปอร์เซ็นต์</span></div>;
}
export function SkillProgress({ current, target }: { current: number; target: number }) {
  return <div className="skill-progress"><div className="level-comparison"><span>Current <b>{current}</b></span><ArrowRight size={15} aria-hidden="true" /><span>Target <b>{target}</b></span></div><div className="level-track" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0, Math.min(5, current)) / 5})` }} /><i style={{ left: `${target / 5 * 100}%` }} /></div><div className="scale-labels" aria-hidden="true"><span>0</span><span>5</span></div></div>;
}
const labels: Record<string, string> = { ready: "พร้อมแล้ว", completed: "ถึงเป้าหมายแล้ว", current: "เรียนต่อขั้นนี้", available: "พร้อมเรียน", locked: "ต้องเรียนพื้นฐานก่อน", critical: "Critical Gap", gap: "ควรพัฒนา", developing: "ควรพัฒนา" };
export function SkillBadge({ status }: { status: string }) { const Icon = status === "ready" || status === "completed" ? Check : status === "locked" ? LockKeyhole : status === "critical" ? CircleAlert : ArrowRight; return <span className={`badge ${status}`}><Icon size={13} aria-hidden="true" />{labels[status] || "ควรพัฒนา"}</span>; }
export function MetricCard({ label, value, children }: { label: string; value: ReactNode; children?: ReactNode }) { return <div className="card metric-card"><span className="muted">{label}</span><strong className="metric">{value}</strong>{children}</div>; }
