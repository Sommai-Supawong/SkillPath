"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Status } from "@/components/Shell";
import { SkillIcon } from "@/components/SkillIcon";
import { api } from "@/lib/api";
import { Career } from "@/lib/types";

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api<Career[]>("/careers").then(setCareers).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const categories = ["All", ...Array.from(new Set(careers.map(career => career.category)))];
  const visibleCareers = category === "All" ? careers : careers.filter(career => career.category === category);
  return <section>
    <p className="eyebrow">Career explorer</p><h1>What are you aiming for?</h1>
    <p className="lead">Choose a career to review its skill requirements and begin your assessment.</p>
    <label htmlFor="career-category">Category</label>
    <select id="career-category" value={category} onChange={event => setCategory(event.target.value)}>
      {categories.map(value => <option key={value} value={value}>{value}</option>)}
    </select>
    <Status loading={loading} error={error} empty={!loading && !error && !careers.length ? "No careers are available yet." : undefined} />
    <div className="grid">{visibleCareers.map(career => <Link href={`/careers/${career.id}`} className="card card-link" key={career.id}>
      <span className="badge">{career.category}</span><h2>{career.title}</h2><p>{career.description}</p>
      {!!career.top_skills?.length && <div className="skill-stack" aria-label={`Top skills: ${career.top_skills.map(skill => skill.name).join(", ")}`}>
        {career.top_skills.map(skill => <SkillIcon key={skill.id} name={skill.name} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} size="sm" />)}
      </div>}
      <p className="skill-count">{career.required_skill_count} required skills</p><strong>View requirements →</strong>
    </Link>)}</div>
  </section>;
}
