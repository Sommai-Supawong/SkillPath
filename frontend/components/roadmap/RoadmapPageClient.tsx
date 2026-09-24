"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ArrowRight, CheckCheck, GitBranch, List, RotateCcw, Bookmark } from "lucide-react";
import { Status, SectionHeading, strategyLabels, SkillBadge, SkillProgress, PageSkeleton } from "@/components/ui";
import { SkillIdentity } from "@/components/SkillIcon";
import { api, ApiError, getSession } from "@/lib/api";
import { Profile, Roadmap, RoadmapGraph, Skill } from "@/lib/types";
import { RoadmapDetails, CompletionTarget } from "./RoadmapDetails";

const RoadmapDiagram = dynamic(() => import("./RoadmapGraph").then(module => module.RoadmapGraph), { ssr: false, loading: () => <PageSkeleton kind="roadmap" /> });
const descriptions: Record<string, string> = { balanced: "สมดุลระหว่าง Skill Gap ความสำคัญ และพื้นฐาน", fast_track: "ให้ความสำคัญกับทักษะที่จำเป็น โดยยังเคารพ prerequisite", foundation_first: "เน้นสร้างพื้นฐานที่จำเป็น ก่อนต่อยอดทักษะขั้นถัดไป" };

export default function RoadmapPageClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [savingPlan, setSavingPlan] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [graph, setGraph] = useState<RoadmapGraph | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [strategy, setStrategy] = useState("balanced");
  const [view, setView] = useState<"graph" | "list">("graph");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [graphError, setGraphError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [retryAction, setRetryAction] = useState<"load" | "recalculate" | "graph" | "generate">("load");

  async function loadGraph(id: number) {
    setGraph(null);
    try { setGraph(await api<RoadmapGraph>(`/roadmaps/${id}/graph`)); setGraphError(false); }
    catch { setGraphError(true); setView("list"); }
  }
  async function loadContext() {
    const session = getSession();
    const results = await Promise.allSettled([api<Profile>(`/profiles/${session.profileId}`), api<Skill[]>("/skills")]);
    if (results[0].status === "fulfilled") setProfile(results[0].value);
    if (results[1].status === "fulfilled") setSkills(results[1].value);
  }
  async function loadSaved() {
    const session = getSession();
    setHasProfile(Boolean(session.profileId && session.careerId)); setSessionReady(true);
    if (!session.profileId || !session.careerId) return;
    setLoading(true); setError(""); setRetryAction("load");
    try {
      await loadContext();
      if (session.roadmapId) {
        const plan = await api<Roadmap>(`/roadmaps/${session.roadmapId}`);
        if (plan.profile_id === session.profileId && plan.career_id === session.careerId) {
          setRoadmap(plan); setStrategy(plan.strategy); await loadGraph(plan.id);
        } else localStorage.removeItem("skillpath_roadmap_id");
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) { localStorage.removeItem("skillpath_roadmap_id"); setError("ไม่พบ Roadmap เดิม คุณสามารถสร้างแผนใหม่ได้"); }
      else setError("ไม่สามารถโหลด Roadmap เดิมได้");
    } finally { setLoading(false); }
  }
  useEffect(() => { void loadSaved(); }, []);

  async function generate() {
    const { profileId, careerId } = getSession();
    if (!profileId || !careerId) { setHasProfile(false); return; }
    setLoading(true); setError(""); setMessage(""); setRetryAction("generate");
    try {
      const plan = await api<Roadmap>("/roadmaps/generate", { method: "POST", body: JSON.stringify({ profile_id: profileId, career_id: careerId, strategy }) });
      localStorage.setItem("skillpath_roadmap_id", String(plan.id)); setRoadmap(plan); setSelected(null);
      await Promise.all([loadGraph(plan.id), loadContext()]);
      setMessage("สร้าง Roadmap แล้ว เลือกทักษะเพื่อเริ่มเรียนรู้");
    } catch { setError("ไม่สามารถสร้าง Roadmap ได้ กรุณาลองอีกครั้ง"); }
    finally { setLoading(false); }
  }
  async function complete(target: CompletionTarget) {
    const item = roadmap?.items.find(entry => entry.skill_id === target.skill_id);
    if (!roadmap || !item) { setError("ไม่พบขั้นตอนนี้ในแผนล่าสุด กรุณาคำนวณ Roadmap ใหม่"); setRetryAction("recalculate"); return; }
    setLoading(true); setError(""); setMessage(""); setRetryAction("recalculate");
    let saved = false;
    try {
      const updated = await api<Roadmap>(`/roadmap-items/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: "completed", current_level: target.target_level }) });
      saved = true; setRoadmap(updated); setGraph(null);
      const plan = await api<Roadmap>(`/roadmaps/${roadmap.id}/recalculate`, { method: "POST" });
      setRoadmap(plan); await Promise.all([loadGraph(plan.id), loadContext()]);
      const notice = `${target.name} ถึงระดับ ${target.target_level} แล้ว คำนวณเส้นทางที่เหลือใหม่เรียบร้อย`;
      setMessage(notice);
      try { sessionStorage.setItem("skillpath_recent_progress", JSON.stringify({ profileId: getSession().profileId, message: notice })); } catch { /* Optional activity message. */ }
    } catch {
      if (saved) { setGraphError(true); setView("list"); await loadContext(); }
      setError(saved ? "บันทึกทักษะแล้ว แต่ยังคำนวณแผนใหม่ไม่สำเร็จ กดคำนวณใหม่เพื่ออัปเดตเส้นทาง" : "ยังบันทึกความก้าวหน้าไม่สำเร็จ กรุณาลองใหม่");
    } finally { setLoading(false); }
  }
  async function recalculate() {
    if (!roadmap) return;
    setLoading(true); setError(""); setMessage(""); setRetryAction("recalculate");
    try {
      const plan = await api<Roadmap>(`/roadmaps/${roadmap.id}/recalculate`, { method: "POST" });
      setRoadmap(plan); await Promise.all([loadGraph(plan.id), loadContext()]); setMessage("คำนวณความพร้อมและ Roadmap จากทักษะล่าสุดแล้ว");
    } catch { setError("ยังคำนวณแผนใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { setLoading(false); }
  }

  async function handleSavePlan() {
    const session = getSession();
    const pid = session.profileId || (profile?.id ? profile.id : null);
    const cid = session.careerId || (roadmap?.career_id ? roadmap.career_id : null);
    const careerTitle = graph?.career || roadmap?.career || "แผนพัฒนาสายอาชีพ";

    if (!cid) {
      setError("ไม่พบข้อมูลอาชีพเป้าหมาย กรุณาเลือกสายอาชีพและสร้าง Roadmap ก่อนบันทึก");
      return;
    }

    if (!user) {
      localStorage.setItem("skillpath_pending_save", JSON.stringify({
        profileId: pid,
        careerId: cid,
        strategy,
        name: careerTitle
      }));
      const redirectUrl = encodeURIComponent(`/my-plans/save?profile_id=${pid || ''}&career_id=${cid}&strategy=${strategy}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    setSavingPlan(true);
    setError("");
    try {
      const newPlan = await api<any>("/plans", {
        method: "POST",
        body: JSON.stringify({
          name: careerTitle,
          career_id: cid,
          learner_profile_id: pid || undefined,
          strategy,
          weekly_hours: graph?.weekly_hours || 8,
        }),
      });
      setMessage("บันทึกแผนการพัฒนาเรียบร้อยแล้ว!");
      setSaveSuccess(newPlan.id);
      setTimeout(() => {
        router.push(`/my-plans/${newPlan.id}`);
      }, 700);
    } catch (err: any) {
      console.error("Save plan failed:", err);
      setError(err?.message || "ไม่สามารถบันทึกแผนได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSavingPlan(false);
    }
  }

  async function retry() {
    if (retryAction === "recalculate") await recalculate();
    else if (retryAction === "generate") await generate();
    else if (retryAction === "graph" && roadmap) await loadGraph(roadmap.id);
    else await loadSaved();
  }
  const levels = new Map(profile?.assessments.map(a => [a.skill_id, a.current_level]));
  const supplemental = roadmap?.items.filter(item => !graph?.nodes.some(node => node.skill_id === item.skill_id)) || [];
  const orderedNodes = [...(graph?.nodes || [])].sort((a,b) => a.order - b.order);
  const selectedNode = graph?.nodes.find(n => n.id === selected);

  function learningItems() {
    return <ol className="roadmap-list">{supplemental.map(item => {
      const skill = skills.find(s => s.id === item.skill_id);
      const locked = !profile || !skill || skill.prerequisites.some(p => (levels.get(p.skill_id) || 0) < p.minimum_level);
      return <li className="card fallback-item" key={item.id}><div className="row-between"><SkillIdentity name={item.skill} skillType={item.skill_type} iconKey={item.icon_key} iconKind={item.icon_kind} /><span className="badge">ขั้น {item.position}</span></div><SkillProgress current={levels.get(item.skill_id) ?? item.current_level} target={item.target_level} /><p className="caption">{item.estimated_hours} ชั่วโมง · สัปดาห์ {item.start_week}–{item.end_week}</p>{skill && <p className="caption">พื้นฐาน: {skill.prerequisites.map(p => `${p.skill_name} ≥ ${p.minimum_level}`).join(" · ") || "ไม่มี prerequisite"}</p>}{item.resources.length > 0 && <details><summary>แหล่งเรียนรู้</summary><ul className="resource-list">{item.resources.map(r => <li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> · {r.estimated_hours} ชั่วโมง</li>)}</ul></details>}<p className="caption">การบันทึกจะตั้งระดับทักษะเป็น {item.target_level}</p><button disabled={loading || locked || item.status === "completed"} onClick={() => complete({ skill_id: item.skill_id, name: item.skill, target_level: item.target_level })}>{item.status === "completed" ? "ถึงเป้าหมายแล้ว" : locked ? (!profile || !skill ? "รอข้อมูลพื้นฐาน — ลองโหลดใหม่" : "เรียนพื้นฐานให้ถึงระดับก่อน") : "บันทึกว่าถึงเป้าหมายแล้ว"}</button></li>;
    })}</ol>;
  }
  return <section className="roadmap-page">
    <SectionHeading eyebrow="Learning Roadmap" title="เส้นทางการเรียนรู้ของคุณ" page><p>{graph?.career || roadmap?.career || "ก้าวต่อไปอย่างมีทิศทาง ด้วยแผนที่เริ่มจากทักษะของคุณ"}</p></SectionHeading>
    {!sessionReady ? <PageSkeleton kind="roadmap" /> : !hasProfile ? <Status empty="ยังไม่มี Roadmap เริ่มจากประเมินทักษะของคุณ" /> : <>
      {graph && <div className="roadmap-summary"><div><strong>{Math.round(graph.readiness)}%</strong><span>Career Readiness</span></div><div><strong>{strategyLabels[graph.strategy]}</strong><span>กลยุทธ์ที่ใช้อยู่</span></div><div><strong>{graph.weekly_hours} ชั่วโมง</strong><span>ต่อสัปดาห์</span></div><div><strong>{graph.estimated_weeks} สัปดาห์</strong><span>เวลาโดยประมาณ</span></div><div><strong>{graph.completed_count} / {graph.total_count}</strong><span>Requirement ที่ถึงเป้าหมาย</span></div></div>}
      <div className="roadmap-toolbar glass-panel"><div><label htmlFor="strategy">Learning Strategy</label><select id="strategy" value={strategy} onChange={e => setStrategy(e.target.value)} disabled={loading}>{Object.entries(strategyLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div><button className="neon" onClick={generate} disabled={loading}>{loading ? "กำลังอัปเดต…" : roadmap ? "สร้างแผนตามกลยุทธ์นี้" : "สร้าง Roadmap"}<ArrowRight size={17} /></button>{roadmap && <button className="secondary" onClick={recalculate} disabled={loading || savingPlan}><RotateCcw size={16} />คำนวณใหม่</button>}{roadmap && <button className="button primary" onClick={handleSavePlan} disabled={loading || savingPlan} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Bookmark size={16} />{savingPlan ? "กำลังบันทึก…" : saveSuccess ? "บันทึกแล้ว ✓" : "บันทึกแผนของฉัน"}</button>}<p className="toolbar-note">{descriptions[strategy]}</p></div>
      <Status loading={loading && !roadmap} error={error} onRetry={retry} kind="roadmap" />
      {message && <div className="notice success" role="status"><CheckCheck size={20} /><p>{message}</p></div>}
      {graphError && <div className="notice"><div><strong>ยังแสดงแผนภาพไม่ได้ แต่ขั้นตอนการเรียนของคุณยังอยู่</strong><p>ใช้มุมมองรายการด้านล่าง หรือโหลดแผนภาพอีกครั้ง</p><button className="secondary" disabled={loading} onClick={async () => { if (roadmap) { setLoading(true); await Promise.all([loadGraph(roadmap.id), loadContext()]); setLoading(false); } }}>โหลดแผนภาพอีกครั้ง</button></div></div>}
      {graph && <><div className="roadmap-section-heading"><div><h2>ก้าวต่อไปของคุณ</h2><p>เลือกทักษะเพื่อดูพื้นฐาน แหล่งเรียนรู้ และบันทึกความก้าวหน้า</p></div><div className="filter-tabs" aria-label="มุมมอง Roadmap"><button className="ghost" aria-pressed={view === "graph"} onClick={() => setView("graph")}><GitBranch size={16} />แผนภาพ</button><button className="ghost" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16} />รายการ</button></div></div>
      {graph.completed_count === graph.total_count && <div className="notice success"><CheckCheck size={20} /><p>คุณมี Skill ครบตาม Requirement แล้ว <Link className="text-link" href="/careers">สำรวจสายอาชีพอื่น</Link></p></div>}
      {view === "graph" ? <RoadmapDiagram graph={graph} onComplete={complete} busy={loading} roadmap={roadmap!} skills={skills} profile={profile} onFallback={() => setView("list")} /> : <ol className="roadmap-list">{orderedNodes.map(node => <li key={node.id}><button className="list-node-button" aria-expanded={selected === node.id} onClick={() => setSelected(selected === node.id ? null : node.id)}><SkillIdentity name={node.name} skillType={node.skill_type} iconKey={node.icon_key} iconKind={node.icon_kind} /><SkillBadge status={node.status} /></button>{selectedNode?.id === node.id && <RoadmapDetails node={node} graph={graph} roadmap={roadmap!} onComplete={complete} busy={loading} onClose={() => setSelected(null)} skills={skills} profile={profile} />}</li>)}</ol>}</>}
      {!!supplemental.length && <section className="section-block"><SectionHeading eyebrow={graph ? "Supporting foundations" : "Ordered learning plan"} title={graph ? "พื้นฐานเพิ่มเติมในแผนของคุณ" : "ขั้นตอนการเรียนตาม Roadmap"}><p>เรียงตามแผนจากระบบ รวมพื้นฐานที่อยู่นอก Requirement ของสายอาชีพ</p></SectionHeading>{learningItems()}</section>}
      {roadmap && !graph && !supplemental.length && !loading && <div className="notice"><p>ไม่มีขั้นตอนที่ต้องเรียนเพิ่มในแผนนี้ ลองโหลดแผนภาพเพื่อดู Requirement ทั้งหมด</p></div>}
      {!roadmap && !loading && !error && <div className="empty-state"><GitBranch size={32} /><h2>พร้อมวางแผนก้าวต่อไปแล้ว</h2><p>เลือก Learning Strategy แล้วกดสร้าง Roadmap<br />ระบบจะเรียงลำดับจาก Skill Gap และพื้นฐานที่จำเป็น</p></div>}
    </>}
  </section>;
}
