export type Prerequisite = { skill_id: number; skill_name: string; minimum_level: number };
export type SkillIconKind = "simple-icons" | "lucide";
export type SkillIdentityFields = { skill_type: string; icon_key?: string | null; icon_kind?: SkillIconKind | null };
export type Skill = SkillIdentityFields & { id: number; name: string; description: string; category: string; difficulty: number; hours_per_level: number; prerequisites: Prerequisite[] };
export type Requirement = { skill: Skill; required_level: number; importance: number };
export type Career = { id: number; title: string; description: string; category: string; required_skill_count: number; requirements?: Requirement[]; top_skills?: Skill[] };
export type Profile = { id: number; name: string; weekly_hours: number; target_career_id: number | null; assessments: { skill_id: number; current_level: number }[] };
export type SkillAnalysis = SkillIdentityFields & { skill_id: number; skill: string; current_level: number; required_level: number; gap: number; importance: number; readiness: number; priority_score: number; status: string };
export type Analysis = { profile_id: number; career_id: number; career: string; readiness: number; skills: SkillAnalysis[] };
export type Resource = { id: number; title: string; url: string; resource_type: string; difficulty: number; estimated_hours: number };
export type RoadmapItem = SkillIdentityFields & { id: number; skill_id: number; skill: string; position: number; current_level: number; target_level: number; estimated_hours: number; start_week: number; end_week: number; status: string; resources: Resource[] };
export type Roadmap = { id: number; profile_id: number; career_id: number; career: string; strategy: string; weekly_hours: number; readiness_before: number; estimated_weeks: number; items: RoadmapItem[] };
export type RoadmapNodeStatus = "completed" | "current" | "available" | "locked" | "critical";
export type RoadmapGraphNode = SkillIdentityFields & {
  id: string; skill_id: number; name: string; current_level: number; target_level: number;
  estimated_hours: number; priority_score: number; status: RoadmapNodeStatus; order: number;
  gap: number; description: string; resources: Resource[];
};
export type RoadmapGraphEdge = { id: string; source: string; target: string; type: "prerequisite"; minimum_level: number };
export type RoadmapGraph = {
  roadmap_id: number; career_id: number; career: string; strategy: string; readiness: number;
  weekly_hours: number; estimated_weeks: number; completed_count: number; total_count: number;
  nodes: RoadmapGraphNode[]; edges: RoadmapGraphEdge[];
};
