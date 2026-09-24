"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Readiness, Status } from "@/components/Shell";
import { SkillIdentity } from "@/components/SkillIcon";
import { api, getSession } from "@/lib/api";
import { Analysis } from "@/lib/types";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(() => { const {profileId}=getSession(); if(!profileId){setError("No learner profile found. Start with a skill assessment.");setLoading(false);return;} api<Analysis>(`/profiles/${profileId}/analysis`).then(setAnalysis).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[]);
  if(!analysis) return <><Status loading={loading} error={error}/>{!loading&&<Link className="button" href="/careers">Start assessment</Link>}</>;
  const gaps=analysis.skills.filter(s=>s.gap>0);
  return <section><p className="eyebrow">Readiness dashboard</p><h1>{analysis.career}</h1><Readiness value={analysis.readiness}/>
    <div className="grid"><div className="card"><div className="metric">{gaps.length}</div><p>skills to develop</p></div><div className="card"><div className="metric">{analysis.skills.filter(s=>s.status==='ready').length}</div><p>requirements ready</p></div><div className="card"><div className="metric">{gaps[0]?.gap || 0}</div><p>largest priority gap</p></div></div>
    <div className="card priority-card"><p className="eyebrow">Priority skills</p>{gaps.length ? <ol className="priority-list">{gaps.slice(0,5).map(skill=><li key={skill.skill_id}><SkillIdentity name={skill.skill} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} size="sm" compact/><span className="badge">Gap {skill.gap}</span></li>)}</ol> : <p>All required skills are ready.</p>}</div>
    <div className="actions"><Link className="button" href="/roadmap">Build my roadmap</Link><Link className="button secondary" href="/analysis">View full gap analysis</Link></div>
  </section>;
}
