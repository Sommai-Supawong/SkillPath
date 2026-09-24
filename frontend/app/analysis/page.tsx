"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCheck } from "lucide-react";
import { SkillIdentity } from "@/components/SkillIcon";
import { SectionHeading, SkillBadge, SkillProgress, Status } from "@/components/ui";
import { getSession } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { Analysis } from "@/lib/types";

export default function AnalysisPage() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => setProfileId(getSession().profileId), []);
  const { data, error, loading, retry } = useApi<Analysis>(profileId ? `/profiles/${profileId}/analysis` : null);
  const skills = data?.skills.filter(s => filter === "all" || (filter === "ready" ? s.gap === 0 : s.gap > 0)) || [];
  return <section><SectionHeading eyebrow="Skill Gap Analysis" title="วิเคราะห์ทักษะที่ยังขาด" page><p>{data?.career || "รู้ระยะห่าง แล้วเลือกก้าวต่อไป"}<br />ลำดับความสำคัญพิจารณาจาก Gap น้ำหนักของทักษะ และพื้นฐานที่ทักษะอื่นต้องใช้</p></SectionHeading>
    {profileId === 0 ? <Status empty="เริ่มประเมินทักษะเพื่อดู Skill Gap ของคุณ" /> : <Status loading={profileId === null || loading} error={error} onRetry={retry} />}
    {data && <><div className="results-heading"><div className="filter-tabs" aria-label="กรองผลวิเคราะห์">{[["all","ทั้งหมด"],["gap","ควรพัฒนา"],["ready","พร้อมแล้ว"]].map(([value,label]) => <button className="ghost" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><span className="muted" role="status">{skills.length} ทักษะ</span></div>
    <div className="analysis-list">{skills.map(skill => <article className="card analysis-row" key={skill.skill_id}><div><SkillIdentity name={skill.skill} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} /><SkillBadge status={skill.status} /></div><SkillProgress current={skill.current_level} target={skill.required_level} /><div className="gap-metric"><span>Gap</span><strong>{skill.gap}<small> ระดับ</small></strong></div><div className="priority-metric"><span>Priority</span><strong>{skill.priority_score}</strong><small>Importance {skill.importance}/5</small></div></article>)}</div>
    {!skills.length && <div className="empty-state"><CheckCheck size={28} /><h2>{data.skills.length ? "ไม่มีทักษะในตัวกรองนี้" : "ยังไม่มีผลวิเคราะห์ทักษะ"}</h2><button className="secondary" onClick={() => setFilter("all")}>ดูทั้งหมด</button></div>}
    <div className="analysis-cta card"><div><h2>เปลี่ยน Skill Gap ให้เป็นแผนการเรียน</h2><p>ดูว่าควรเริ่มจากทักษะไหน แล้วเรียนต่ออะไร</p></div><Link className="button" href="/roadmap">สร้าง Learning Roadmap <ArrowRight size={18} /></Link></div></>}
  </section>;
}
