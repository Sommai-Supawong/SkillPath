import { ArrowRight, Check, LockKeyhole, X } from "lucide-react";
import { SkillIdentity } from "@/components/SkillIcon";
import { SkillBadge } from "@/components/ui";
import { Profile, Roadmap, RoadmapGraph, RoadmapGraphNode, Skill } from "@/lib/types";

export type CompletionTarget = Pick<RoadmapGraphNode, "skill_id" | "name" | "target_level">;
export function RoadmapDetails({ node, graph, roadmap, skills, profile, onComplete, busy, onClose }: { node: RoadmapGraphNode; graph: RoadmapGraph; roadmap: Roadmap; skills: Skill[]; profile: Profile | null; onComplete: (node: CompletionTarget) => void; busy: boolean; onClose: () => void }) {
  const skill = skills.find(s => s.id === node.skill_id);
  const prerequisites = skill?.prerequisites || graph.edges.filter(e => e.target === node.id).map(e => ({ skill_id: Number(e.source), skill_name: graph.nodes.find(n => n.id === e.source)?.name || "ทักษะพื้นฐาน", minimum_level: e.minimum_level }));
  const unlocks = graph.edges.filter(e => e.source === node.id).map(e => graph.nodes.find(n => n.id === e.target));
  const hasItem = roadmap.items.some(item => item.skill_id === node.skill_id);
  return <aside className="roadmap-details" aria-label={`รายละเอียด ${node.name}`}><button className="icon-button close-details" onClick={onClose} aria-label="ปิดรายละเอียด"><X size={19} /></button><SkillIdentity name={node.name} skillType={node.skill_type} iconKey={node.icon_key} iconKind={node.icon_kind} size="lg" /><p><SkillBadge status={node.status} /></p><p lang="en">{node.description}</p><dl className="roadmap-details-grid"><div><dt>Current Level</dt><dd>{node.current_level} / 5</dd></div><div><dt>Target Level</dt><dd>{node.target_level} / 5</dd></div><div><dt>Skill Gap</dt><dd>{node.gap} ระดับ</dd></div><div><dt>เวลาโดยประมาณ</dt><dd>{node.estimated_hours} ชั่วโมง</dd></div></dl>
    <h3>พื้นฐานที่จำเป็น</h3>{!skill && <p className="caption">แสดงเฉพาะความสัมพันธ์ในแผนภาพนี้</p>}<ul>{prerequisites.map(p => { const level = profile ? profile.assessments.find(a => a.skill_id === p.skill_id)?.current_level ?? 0 : graph.nodes.find(n => n.skill_id === p.skill_id)?.current_level; const met = level !== undefined && level >= p.minimum_level; return <li key={p.skill_id}>{met ? <Check size={14} /> : <LockKeyhole size={14} />} {p.skill_name}<small>ต้องการระดับ {p.minimum_level} · {level === undefined ? "ยังไม่มีข้อมูลระดับปัจจุบัน" : `Current ${level} · ${met ? "พร้อมแล้ว" : "ยังไม่ถึงเป้าหมาย"}`}</small></li>; })}</ul>{!prerequisites.length && <p>ไม่มีพื้นฐานระบุในข้อมูลที่แสดง</p>}
    {!!unlocks.length && <><h3>ต่อยอดไปยัง</h3><ul>{unlocks.map(n => n && <li key={n.id}><ArrowRight size={14} /> {n.name}</li>)}</ul></>}
    <h3>แหล่งเรียนรู้</h3>{node.resources.length ? <ul>{node.resources.map(r => <li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}<span className="sr-only"> เปิดในแท็บใหม่</span></a><small>{r.resource_type} · Difficulty {r.difficulty}/5 · {r.estimated_hours} ชั่วโมง</small></li>)}</ul> : <p>ยังไม่มีแหล่งเรียนรู้สำหรับทักษะนี้</p>}
    {node.status !== "completed" && <><p>เมื่อบันทึก ระบบจะอัปเดต {node.name} เป็นระดับ {node.target_level} แล้วคำนวณแผนใหม่</p><button className="full-width" onClick={() => onComplete(node)} disabled={busy || node.status === "locked" || !hasItem}>{node.status === "locked" ? "เรียนพื้นฐานให้ถึงระดับก่อน" : !hasItem ? "คำนวณใหม่เพื่ออัปเดตขั้นตอน" : busy ? "กำลังบันทึก…" : "บันทึกว่าถึงเป้าหมายแล้ว"}</button></>}
  </aside>;
}
