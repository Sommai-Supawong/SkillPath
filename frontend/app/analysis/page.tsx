"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Status } from "@/components/Shell";
import { SkillIdentity } from "@/components/SkillIcon";
import { api, getSession } from "@/lib/api";
import { Analysis } from "@/lib/types";

export default function AnalysisPage(){
 const [data,setData]=useState<Analysis|null>(null);const[error,setError]=useState("");
 useEffect(()=>{const{profileId}=getSession();if(!profileId){setError("Please complete your skill assessment first.");return;}api<Analysis>(`/profiles/${profileId}/analysis`).then(setData).catch(e=>setError(e.message));},[]);
 if(!data)return <Status loading={!error} error={error}/>;
 return <section><p className="eyebrow">Gap analysis</p><h1>What to learn next</h1><p className="lead">Priority combines your level gap, career importance, and whether other required skills depend on this skill.</p>
 <div className="grid">{data.skills.map(skill=><article className="card" key={skill.skill_id}><span className={`badge ${skill.status}`}>{skill.status}</span><SkillIdentity name={skill.skill} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} size="lg" /><p>Current {skill.current_level}/5 · Required {skill.required_level}/5</p><div className="progress"><div style={{width:`${skill.readiness}%`}}/></div><p>Gap: <strong>{skill.gap}</strong> · Priority: <strong>{skill.priority_score}</strong></p></article>)}</div>
 <div className="actions"><Link className="button" href="/roadmap">Generate roadmap</Link></div></section>;
}
