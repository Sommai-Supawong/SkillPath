"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Readiness, Status } from "@/components/Shell";
import { api, getSession } from "@/lib/api";
import { Roadmap } from "@/lib/types";

const strategyLabels: Record<string,string> = {balanced:"Balanced",fast_track:"Fast Track",foundation_first:"Foundation First"};

export default function RoadmapPage(){
 const [roadmap,setRoadmap]=useState<Roadmap|null>(null);const[strategy,setStrategy]=useState("balanced");const[error,setError]=useState("");const[loading,setLoading]=useState(false);const[message,setMessage]=useState("");
 useEffect(()=>{const{roadmapId}=getSession();if(roadmapId){setLoading(true);api<Roadmap>(`/roadmaps/${roadmapId}`).then(data=>{setRoadmap(data);setStrategy(data.strategy)}).catch(()=>localStorage.removeItem("skillpath_roadmap_id")).finally(()=>setLoading(false));}},[]);
 async function generate(){const{profileId,careerId}=getSession();if(!profileId||!careerId){setError("Please complete your skill assessment first.");return;}setLoading(true);setError("");setMessage("");try{const data=await api<Roadmap>("/roadmaps/generate",{method:"POST",body:JSON.stringify({profile_id:profileId,career_id:careerId,strategy})});localStorage.setItem("skillpath_roadmap_id",String(data.id));setRoadmap(data);}catch(e){setError(e instanceof Error?e.message:"Unable to generate roadmap.");}finally{setLoading(false)}}
 async function update(itemId:number,targetLevel:number){setLoading(true);setError("");try{const data=await api<Roadmap>(`/roadmap-items/${itemId}`,{method:"PATCH",body:JSON.stringify({status:"completed",current_level:targetLevel})});setRoadmap(data);setMessage("Progress saved. Recalculate to adapt your remaining plan.");}catch(e){setError(e instanceof Error?e.message:"Unable to update progress.");}finally{setLoading(false)}}
 async function recalculate(){if(!roadmap)return;setLoading(true);setError("");try{const data=await api<Roadmap>(`/roadmaps/${roadmap.id}/recalculate`,{method:"POST"});setRoadmap(data);setMessage("Readiness and roadmap recalculated from your latest skill levels.");}catch(e){setError(e instanceof Error?e.message:"Unable to recalculate roadmap.");}finally{setLoading(false)}}
 return <section><p className="eyebrow">Personalized roadmap</p><h1>{roadmap?.career||"Build your learning path"}</h1>
 <div className="toolbar"><div><label htmlFor="strategy">Learning strategy</label><select id="strategy" value={strategy} onChange={e=>setStrategy(e.target.value)}><option value="balanced">Balanced</option><option value="fast_track">Fast Track</option><option value="foundation_first">Foundation First</option></select></div><button onClick={generate} disabled={loading}>{roadmap?"Generate new roadmap":"Generate roadmap"}</button>{roadmap&&<button className="secondary" onClick={recalculate} disabled={loading}>Recalculate progress</button>}</div>
 <Status loading={loading&&!roadmap} error={error}/>{message&&<div className="notice">{message}</div>}
 {roadmap&&<><div className="grid"><Readiness value={roadmap.readiness_before}/><div className="card"><div className="metric">{roadmap.estimated_weeks} weeks</div><p>Estimated at {roadmap.weekly_hours} hours/week</p><span className="badge">{strategyLabels[roadmap.strategy]}</span></div><div className="card"><div className="metric">{roadmap.items.length}</div><p>remaining learning steps</p></div></div>
 {roadmap.items.length===0?<div className="notice">You meet every configured requirement for this career. Great work.</div>:<div className="timeline">{roadmap.items.map(item=><article className={`step ${item.status}`} key={item.id}><div className="card"><span className="badge">Step {item.position}</span><h2>{item.skill}</h2><div className="step-meta"><span>Level {item.current_level} → {item.target_level}</span><span>{item.estimated_hours} hours</span><span>Week {item.start_week}–{item.end_week}</span></div>
 <div className="actions"><button onClick={()=>update(item.id,item.target_level)} disabled={loading||item.status==='completed'}>{item.status==='completed'?"Completed":"Mark target complete"}</button></div>
 {item.resources.length>0&&<details><summary>Learning resources</summary><ul className="resource-list">{item.resources.map(resource=><li key={resource.id}><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a> · {resource.estimated_hours}h</li>)}</ul></details>}</div></article>)}</div>}</>}
 {!roadmap&&!loading&&<div className="notice">Your roadmap will appear here after an assessment. <Link href="/careers">Choose a career</Link>.</div>}
 </section>;
}
