import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Career } from "@/lib/types";
import { SkillIcon } from "./SkillIcon";

export function CareerCard({ career }: { career: Career }) {
  return <Link className="card career-card card-link" href={`/careers/${career.id}`}><div className="career-card-top"><span className="category-label">{career.category}</span><ArrowUpRight size={18} aria-hidden="true" /></div><h2 lang="en">{career.title}</h2><p lang="en">{career.description}</p><div className="career-card-bottom"><div className="skill-stack" aria-label={`ทักษะหลัก: ${(career.top_skills || []).slice(0, 5).map(s => s.name).join(", ")}`}>{career.top_skills?.slice(0, 5).map(skill => <SkillIcon key={skill.id} name={skill.name} skillType={skill.skill_type} iconKey={skill.icon_key} iconKind={skill.icon_kind} size="sm" />)}</div><div className="card-foot"><span>{career.required_skill_count} ทักษะ</span><strong>ดูเส้นทางอาชีพ <ArrowUpRight size={14} /></strong></div></div></Link>;
}
