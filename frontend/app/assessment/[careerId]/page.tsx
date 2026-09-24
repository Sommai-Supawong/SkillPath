"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Status } from "@/components/Shell";
import { SkillIdentity } from "@/components/SkillIcon";
import { api, storeSession } from "@/lib/api";
import { Career, Profile } from "@/lib/types";

export default function AssessmentPage() {
  const { careerId } = useParams<{ careerId: string }>();
  const router = useRouter();
  const [career, setCareer] = useState<Career | null>(null);
  const [name, setName] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [levels, setLevels] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { api<Career>(`/careers/${careerId}`).then(data => { setCareer(data); setLevels(Object.fromEntries((data.requirements || []).map(r => [r.skill.id, 0]))); }).catch(e => setError(e.message)); }, [careerId]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const profile = await api<Profile>("/profiles", { method:"POST", body:JSON.stringify({name, weekly_hours:weeklyHours, target_career_id:Number(careerId)}) });
      await api(`/profiles/${profile.id}/assessments`, { method:"POST", body:JSON.stringify({assessments:Object.entries(levels).map(([skill_id,current_level]) => ({skill_id:Number(skill_id),current_level}))}) });
      storeSession(profile.id, Number(careerId)); router.push("/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save the assessment."); } finally { setSubmitting(false); }
  }
  if (!career) return <Status loading={!error} error={error} />;
  return <section><p className="eyebrow">Skill assessment</p><h1>{career.title}</h1><p className="lead">0 = never learned, 1 = awareness, 2 = beginner, 3 = intermediate, 4 = proficient, 5 = advanced.</p>
    <form className="form-grid" onSubmit={submit}>
      <div className="card"><label htmlFor="name">Your name</label><input id="name" value={name} onChange={e => setName(e.target.value)} required maxLength={100} placeholder="e.g. Alex" /></div>
      <div className="card"><label htmlFor="hours">Available study hours per week</label><input id="hours" type="number" min="1" max="80" step="0.5" value={weeklyHours} onChange={e => setWeeklyHours(Number(e.target.value))} required /></div>
      {(career.requirements || []).map(req => <div className="card slider-row" key={req.skill.id}>
        <label htmlFor={`skill-${req.skill.id}`}><SkillIdentity name={req.skill.name} skillType={req.skill.skill_type} iconKey={req.skill.icon_key} iconKind={req.skill.icon_kind} /><span className="muted target-level">Target {req.required_level}/5</span></label>
        <input aria-label={`Current ${req.skill.name} level`} id={`skill-${req.skill.id}`} type="range" min="0" max="5" value={levels[req.skill.id] ?? 0} onChange={e => setLevels({...levels,[req.skill.id]:Number(e.target.value)})} />
        <span className="level">{levels[req.skill.id] ?? 0}</span>
      </div>)}
      <Status error={error} /><button disabled={submitting}>{submitting ? "Saving…" : "Save assessment & analyze"}</button>
    </form>
  </section>;
}
