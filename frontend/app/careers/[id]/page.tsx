"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, GitBranch, Target } from "lucide-react";
import { SkillIdentity, SkillIcon } from "@/components/SkillIcon";
import { SectionHeading, Status } from "@/components/ui";
import { Career } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: career, error, loading, retry } = useApi<Career>(`/careers/${id}`);
  if (!career) return <><Link href="/careers" className="back-link"><ArrowLeft size={16} /> สำรวจอาชีพ</Link><Status loading={loading} error={error} onRetry={retry} kind="form" /></>;
  const requirements = career.requirements || [];
  const prerequisites = requirements.filter(r => r.skill.prerequisites.length);
  return <section>
    <Link href="/careers" className="back-link"><ArrowLeft size={16} /> สำรวจอาชีพ</Link>
    <header className="career-detail-header"><p className="eyebrow">เส้นทางอาชีพ / {career.category}</p><h1 lang="en">{career.title}</h1><p className="lead" lang="en">{career.description}</p><div className="skill-stack large">{requirements.slice(0, 5).map(r => <span key={r.skill.id}><SkillIcon name={r.skill.name} skillType={r.skill.skill_type} iconKey={r.skill.icon_key} iconKind={r.skill.icon_kind} /><span>{r.skill.name}</span></span>)}</div><div className="actions">{requirements.length > 0 ? <Link className="button" href={`/assessment/${career.id}`}>ประเมิน Skill ของฉัน <ArrowRight size={18} /></Link> : <p className="notice">ยังไม่มี Requirement สำหรับการประเมิน</p>}</div></header>
    <div className="detail-layout"><div>
      <section className="section-block"><SectionHeading eyebrow="About this career" title="เกี่ยวกับสายอาชีพ" /><p lang="en" className="muted">{career.description}</p></section>
      <section className="section-block"><SectionHeading eyebrow="Core Skills & Requirements" title="ทักษะที่พาคุณไปถึงเป้าหมาย" /><ul className="requirements">{requirements.map(req => <li className="card" key={req.skill.id}><div><SkillIdentity name={req.skill.name} skillType={req.skill.skill_type} iconKey={req.skill.icon_key} iconKind={req.skill.icon_kind} /><p className="caption">Difficulty {req.skill.difficulty}/5</p></div><div className="requirement-values"><strong>Target {req.required_level}<span>/5</span></strong><span className="muted">Importance {req.importance}/5</span></div></li>)}</ul></section>
      <section className="section-block"><SectionHeading eyebrow="Prerequisites" title="พื้นฐานที่เชื่อมแต่ละทักษะ" /><div className="card prerequisite-list">{prerequisites.length ? prerequisites.map(r => <div key={r.skill.id}><GitBranch size={18} /><p><strong>{r.skill.name}</strong><span>{r.skill.prerequisites.map(p => `${p.skill_name} ≥ ${p.minimum_level}`).join(" · ")}</span></p></div>) : <p className="muted">ไม่มี prerequisite ระบุในข้อมูลของสายอาชีพนี้</p>}</div></section>
    </div><aside className="detail-sidebar"><div className="card"><Target className="accent-icon" size={24} /><h2>เริ่มจากจุดที่คุณอยู่</h2><p>ประเมินทักษะ {requirements.length} รายการ เพื่อดู Skill Gap ของคุณ</p><div className="sidebar-divider" /><Clock3 className="accent-icon" size={24} /><h3>ใช้เวลาเท่าไร?</h3><p>ประเมินทักษะเพื่อดูเวลาที่คาดว่าจะใช้ โดยอิงระดับปัจจุบันและชั่วโมงเรียนต่อสัปดาห์</p>{requirements.length > 0 && <Link className="button full-width" href={`/assessment/${career.id}`}>เริ่มประเมิน <ArrowRight size={16} /></Link>}<p className="caption">ไม่ต้องสมัครบัญชี · ประเมินระดับ 0–5</p></div></aside></div>
  </section>;
}
