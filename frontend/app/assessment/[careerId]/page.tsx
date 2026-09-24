"use client";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3, UserRound } from "lucide-react";
import { SkillIdentity } from "@/components/SkillIcon";
import { levelLabels, SectionHeading, Status } from "@/components/ui";
import { api, storeSession } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { Career, Profile } from "@/lib/types";

export default function AssessmentPage() {
  const { careerId } = useParams<{ careerId: string }>();
  const router = useRouter();
  const { data: career, error: loadError, loading, retry } = useApi<Career>(`/careers/${careerId}`);
  const [name, setName] = useState("");
  const [hours, setHours] = useState("8");
  const [levels, setLevels] = useState<Record<number, number>>({});
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createdProfile = useRef<number | null>(null);
  useEffect(() => { setLevels({}); setReviewed(new Set()); createdProfile.current = null; }, [careerId]);
  const requirements = career?.requirements || [];
  function updateLevel(id: number, level: number) {
    setLevels(prev => ({ ...prev, [id]: level }));
    setReviewed(prev => new Set(prev).add(id));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const weeklyHours = Number(hours);
    if (!name.trim() || name.trim().length > 100 || !Number.isFinite(weeklyHours) || weeklyHours < 1 || weeklyHours > 80 || weeklyHours * 2 % 1 !== 0) {
      setError("กรุณาระบุชื่อ และชั่วโมงเรียน 1–80 ชั่วโมง โดยเพิ่มครั้งละ 0.5 ชั่วโมง"); return;
    }
    setError(""); setSubmitting(true);
    try {
      const profileData = { name: name.trim(), weekly_hours: weeklyHours, target_career_id: Number(careerId) };
      if (!createdProfile.current) {
        const profile = await api<Profile>("/profiles", { method: "POST", body: JSON.stringify(profileData) });
        createdProfile.current = profile.id;
      } else await api<Profile>(`/profiles/${createdProfile.current}`, { method: "PUT", body: JSON.stringify(profileData) });
      await api(`/profiles/${createdProfile.current}/assessments`, { method: "POST", body: JSON.stringify({ assessments: requirements.map(r => ({ skill_id: r.skill.id, current_level: levels[r.skill.id] ?? 0 })) }) });
      storeSession(createdProfile.current, Number(careerId));
      router.push("/dashboard");
    } catch { setError("บันทึกผลประเมินไม่สำเร็จ ข้อมูลของคุณยังอยู่ กรุณาลองบันทึกอีกครั้ง"); }
    finally { setSubmitting(false); }
  }
  if (!career) return <Status loading={loading} error={loadError} onRetry={retry} kind="form" />;
  return <section className="assessment-page">
    <Link className="back-link" href={`/careers/${career.id}`}><ArrowLeft size={16} /> {career.title}</Link>
    <SectionHeading eyebrow="Skill Assessment" title="ทักษะที่คุณมีอยู่" page><p>ประเมินตามประสบการณ์จริง ไม่มีคำตอบที่ผิด<br /><strong>{career.title}</strong></p></SectionHeading>
    {!requirements.length ? <Status empty="ยังไม่มี Requirement สำหรับการประเมิน" /> : <>
    <details className="level-guide card"><summary>ระดับ 0–5 หมายถึงอะไร?</summary><ol start={0}>{levelLabels.map((label, i) => <li key={label}><b>{i}</b>{label}</li>)}</ol></details>
    <form onSubmit={submit} className="assessment-form">
      <div className="card profile-fields"><div><label htmlFor="name"><UserRound size={16} /> ชื่อของคุณ</label><input id="name" value={name} onChange={e => setName(e.target.value)} required maxLength={100} placeholder="ชื่อที่อยากให้เราเรียก" autoComplete="given-name" /></div><div><label htmlFor="hours"><Clock3 size={16} /> ชั่วโมงเรียน / สัปดาห์</label><input id="hours" type="number" min="1" max="80" step="0.5" value={hours} onChange={e => setHours(e.target.value)} required aria-describedby="hours-help" /><small id="hours-help" className="muted">1–80 ชั่วโมง · ปรับเพิ่มได้ครั้งละ 0.5</small></div></div>
      <div className="assessment-list">{requirements.map((req, index) => <fieldset className="card assessment-skill" key={req.skill.id}><legend className="sr-only">{req.skill.name} Current Level</legend><div className="row-between"><div className="numbered-identity"><span className="row-number">{String(index + 1).padStart(2, "0")}</span><SkillIdentity name={req.skill.name} skillType={req.skill.skill_type} iconKey={req.skill.icon_key} iconKind={req.skill.icon_kind} /></div><span className="badge">Target {req.required_level}/5</span></div><div className="level-control"><label htmlFor={`skill-${req.skill.id}`}>Current Level <output>{levels[req.skill.id] ?? 0}</output></label><input id={`skill-${req.skill.id}`} type="range" min="0" max="5" step="1" value={levels[req.skill.id] ?? 0} onChange={e => updateLevel(req.skill.id, Number(e.target.value))} aria-label={`${req.skill.name} Current Level`} aria-valuetext={`${levels[req.skill.id] ?? 0} — ${levelLabels[levels[req.skill.id] ?? 0]}`} /><div className="range-ticks" aria-hidden="true">{[0,1,2,3,4,5].map(v => <span key={v}>{v}</span>)}</div><div className="level-explanation"><span>{levelLabels[levels[req.skill.id] ?? 0]}</span><button type="button" className="ghost review-button" onClick={() => updateLevel(req.skill.id, levels[req.skill.id] ?? 0)} aria-pressed={reviewed.has(req.skill.id)}><Check size={15} />{reviewed.has(req.skill.id) ? "ตรวจแล้ว" : "ยืนยันระดับนี้"}</button></div></div></fieldset>)}</div>
      <Status error={error} />
      <div className="assessment-submit glass-panel"><div><strong>ตรวจแล้ว {reviewed.size} / {requirements.length} ทักษะ</strong><p>ค่าที่ยังไม่ได้ปรับจะบันทึกเป็นระดับ 0</p></div><button type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? "กำลังบันทึก…" : "วิเคราะห์ Skill Gap"}<ArrowRight size={18} /></button></div>
    </form></>}
  </section>;
}
