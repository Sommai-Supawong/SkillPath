"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCheck, Clock3, GitBranch } from "lucide-react";
import { SkillIdentity } from "@/components/SkillIcon";
import { MetricCard, Readiness, SectionHeading, SkillBadge, Status, strategyLabels } from "@/components/ui";
import { api, getSession } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { Analysis, Roadmap, RoadmapGraph } from "@/lib/types";

export default function DashboardPage() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [graph, setGraph] = useState<RoadmapGraph | null>(null);
  const [roadmapError, setRoadmapError] = useState(false);
  const [recent, setRecent] = useState("");
  useEffect(() => {
    const session = getSession(); setProfileId(session.profileId);
    if (session.roadmapId) {
      Promise.all([api<Roadmap>(`/roadmaps/${session.roadmapId}`), api<RoadmapGraph>(`/roadmaps/${session.roadmapId}/graph`)]).then(([plan, diagram]) => {
        if (plan.profile_id === session.profileId && plan.career_id === session.careerId) { setRoadmap(plan); setGraph(diagram); }
      }).catch(() => setRoadmapError(true));
    }
    try { const event = JSON.parse(sessionStorage.getItem("skillpath_recent_progress") || "null"); if (event?.profileId === session.profileId) setRecent(event.message); } catch { /* Optional session-only notice. */ }
  }, []);
  const { data, loading, error, retry } = useApi<Analysis>(profileId ? `/profiles/${profileId}/analysis` : null);
  const gaps = data?.skills.filter(s => s.gap > 0) || [];
  const critical = data?.skills.filter(s => s.status === "critical") || [];
  return <section><SectionHeading eyebrow="Your learning workspace" title="ความพร้อมสู่อาชีพ" page><p>{data?.career || "เริ่มจากจุดที่คุณอยู่ แล้วก้าวต่ออย่างมั่นใจ"}</p></SectionHeading>
    {profileId === 0 ? <Status empty="ยังไม่มีข้อมูล Skill Assessment" /> : <Status loading={profileId === null || loading} error={error} onRetry={retry} kind="dashboard" />}
    {data && <><div className="dashboard-top"><div className="card readiness-card"><Readiness value={data.readiness} /><p className="caption">อิงผลประเมินตนเองและ Requirement ที่กำหนด ไม่ใช่การรับประกันการได้งาน</p></div><div className="card next-step-card"><span className="category-icon"><GitBranch size={24} /></span><p className="eyebrow">Your next step</p><h2>{gaps[0] ? `เริ่มพัฒนา ${gaps[0].skill}` : "คุณถึงเป้าหมายแล้ว"}</h2><p>{gaps.length ? "เปลี่ยนทักษะที่ยังขาด ให้เป็นลำดับการเรียนรู้ที่ลงมือทำได้" : "ทักษะปัจจุบันครบตาม Requirement ของสายอาชีพนี้"}</p><Link className="button" href={gaps.length ? "/roadmap" : "/careers"}>{gaps.length ? (roadmap ? "เรียนต่อตาม Roadmap" : "สร้างแผนการเรียนรู้") : "สำรวจอาชีพอื่น"}<ArrowRight size={18} /></Link></div></div>
    <div className="dashboard-metrics"><MetricCard label="ทักษะที่พร้อมแล้ว" value={data.skills.filter(s => s.gap === 0).length}><span className="caption">จาก {data.skills.length} Requirement</span></MetricCard><MetricCard label="ทักษะที่ควรพัฒนา" value={gaps.length} /><MetricCard label="Critical Skill Gaps" value={critical.length} /></div>
    <div className="dashboard-bottom"><section className="card"><div className="panel-heading"><h2>ทักษะสำคัญลำดับแรก</h2><Link className="text-link" href="/analysis">ดูทั้งหมด <ArrowUpRight size={16} /></Link></div>{gaps.length ? <ol className="priority-list">{gaps.slice(0,5).map((skill, i) => <li key={skill.skill_id}><span className="row-number">{String(i + 1).padStart(2,"0")}</span><SkillIdentity name={skill.skill} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} compact /><span className="gap-value">Gap {skill.gap}</span></li>)}</ol> : <div className="success-state"><CheckCheck size={24} /><p>คุณมี Skill ครบตาม Requirement แล้ว</p></div>}</section><section className="card"><div className="panel-heading"><h2>แผนการเรียนของคุณ</h2><Clock3 size={20} /></div>{roadmap && graph ? <><p className="badge">{strategyLabels[roadmap.strategy]}</p><strong className="estimate-number">{roadmap.estimated_weeks}<span> สัปดาห์โดยประมาณ</span></strong><p className="muted">{roadmap.weekly_hours} ชั่วโมง/สัปดาห์ · เหลือประมาณ {roadmap.items.reduce((sum, item) => sum + item.estimated_hours, 0)} ชั่วโมงเรียน</p><div className="progress" role="progressbar" aria-label="Requirement ที่ถึงเป้าหมาย" aria-valuenow={graph.completed_count} aria-valuemin={0} aria-valuemax={Math.max(1,graph.total_count)}><span style={{transform: `scaleX(${graph.total_count ? graph.completed_count / graph.total_count : 0})`}} /></div><p className="caption">ถึงเป้าหมาย {graph.completed_count} / {graph.total_count} Requirement</p><Link className="text-link" href="/roadmap">เปิด Roadmap <ArrowRight size={16} /></Link></> : <><p>{roadmapError ? "ยังโหลดแผนเดิมไม่ได้ ลองเปิด Roadmap อีกครั้ง" : "ยังไม่มี Roadmap สร้างแผนเพื่อดูเวลาและลำดับการเรียนที่เหมาะกับคุณ"}</p><Link href="/roadmap" className="button secondary">เปิดหน้า Roadmap <ArrowRight size={16} /></Link></>}</section></div>
    {!!critical.length && <section className="section-block"><h2>Skill Gap ที่ควรใส่ใจ</h2><div className="critical-skills">{critical.map(skill => <div className="card" key={skill.skill_id}><SkillIdentity name={skill.skill} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} compact /><SkillBadge status="critical" /><p>Current {skill.current_level} → Target {skill.required_level}</p></div>)}</div></section>}
    {recent && <div className="notice success" role="status"><CheckCheck size={20} /><div><strong>ความก้าวหน้าล่าสุดในเซสชันนี้</strong><p>{recent}</p></div></div>}
    </>}
  </section>;
}
