"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Status } from "@/components/Shell";
import { SkillIdentity } from "@/components/SkillIcon";
import { api } from "@/lib/api";
import { Career } from "@/lib/types";

export default function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [career, setCareer] = useState<Career | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<Career>(`/careers/${id}`).then(setCareer).catch(e => setError(e.message)); }, [id]);
  if (!career) return <Status loading={!error} error={error} />;
  return <section>
    <p className="eyebrow">{career.category}</p><h1>{career.title}</h1><p className="lead">{career.description}</p>
    <div className="actions"><Link className="button" href={`/assessment/${career.id}`}>Assess my skills</Link><Link className="button secondary" href="/careers">Back to careers</Link></div>
    <div className="card" style={{marginTop:32}}><h2>Core skill requirements</h2>
      <ul className="requirements">{career.requirements?.map(req => <li key={req.skill.id}><div><SkillIdentity name={req.skill.name} skillType={req.skill.skill_type} iconKey={req.skill.icon_key} iconKind={req.skill.icon_kind} /><div className="muted skill-detail">Difficulty {req.skill.difficulty}/5</div></div><div><span className="badge">Required {req.required_level}/5</span> <span className="badge">Importance {req.importance}/5</span></div></li>)}</ul>
    </div>
  </section>;
}
