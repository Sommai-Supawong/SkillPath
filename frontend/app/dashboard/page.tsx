"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Readiness, Status } from "@/components/Shell";
import { api, getSession } from "@/lib/api";
import { Analysis } from "@/lib/types";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(() => { const {profileId}=getSession(); if(!profileId){setError("No learner profile found. Start with a skill assessment.");setLoading(false);return;} api<Analysis>(`/profiles/${profileId}/analysis`).then(setAnalysis).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[]);
  if(!analysis) return <><Status loading={loading} error={error}/>{!loading&&<Link className="button" href="/careers">Start assessment</Link>}</>;
  const gaps=analysis.skills.filter(s=>s.gap>0);
  return <section><p className="eyebrow">Readiness dashboard</p><h1>{analysis.career}</h1><Readiness value={analysis.readiness}/>
    <div className="grid"><div className="card"><div className="metric">{gaps.length}</div><p>skills to develop</p></div><div className="card"><div className="metric">{analysis.skills.filter(s=>s.status==='ready').length}</div><p>requirements ready</p></div><div className="card"><div className="metric">{gaps[0]?.skill || 'None'}</div><p>highest priority gap</p></div></div>
    <div className="actions"><Link className="button" href="/roadmap">Build my roadmap</Link><Link className="button secondary" href="/analysis">View full gap analysis</Link></div>
  </section>;
}
