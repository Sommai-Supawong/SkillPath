import type { SimpleIcon } from "simple-icons";
import {
  siApacheairflow,
  siApachespark,
  siCss,
  siDocker,
  siFastapi,
  siFigma,
  siGit,
  siHtml5,
  siJavascript,
  siKubernetes,
  siLinux,
  siNextdotjs,
  siNumpy,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siReact,
  siScikitlearn,
  siSelenium,
  siTerraform,
  siTypescript,
} from "simple-icons";
import {
  Activity, Boxes, BrainCircuit, Braces, Bug, ChartColumn, ChartNoAxesCombined, Cloud,
  Code2, Database, FileCode2, GitBranch, Layers3, Library, Lightbulb, LucideIcon,
  MessagesSquare, Network, Palette, PanelsTopLeft, Percent, Server, Shield, Table2,
  TestTube, Workflow, Wrench,
} from "lucide-react";

export type SkillIconKind = "simple-icons" | "lucide";

export const normalizeIconKey = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const brandedIcons: Record<string, SimpleIcon> = {
  html5: siHtml5, css: siCss, javascript: siJavascript, typescript: siTypescript,
  python: siPython, react: siReact, nextdotjs: siNextdotjs, fastapi: siFastapi,
  git: siGit, postgresql: siPostgresql, docker: siDocker, kubernetes: siKubernetes,
  terraform: siTerraform, numpy: siNumpy, pandas: siPandas, scikitlearn: siScikitlearn,
  pytorch: siPytorch, linux: siLinux, figma: siFigma, selenium: siSelenium,
  apachespark: siApachespark, apacheairflow: siApacheairflow,
};

const brandedAliases: Record<string, string> = {
  html: "html5", html5: "html5", css3: "css", nextjs: "nextdotjs", fastapi: "fastapi",
  postgres: "postgresql", sklearn: "scikitlearn", scikitlearn: "scikitlearn",
  apacheairflow: "apacheairflow", apachespark: "apachespark",
};

export const genericIcons: Record<string, LucideIcon> = {
  activity: Activity, boxes: Boxes, braincircuit: BrainCircuit, braces: Braces, bug: Bug,
  chartcolumn: ChartColumn, chartnoaxescombined: ChartNoAxesCombined, cloud: Cloud, code2: Code2,
  database: Database, filecode2: FileCode2, gitbranch: GitBranch, layers3: Layers3,
  library: Library, lightbulb: Lightbulb, messagessquare: MessagesSquare, network: Network,
  palette: Palette, panelstopleft: PanelsTopLeft, percent: Percent, server: Server,
  shield: Shield, table2: Table2, testtube: TestTube, workflow: Workflow, wrench: Wrench,
};

const typeIconKeys: Record<string, string> = {
  programminglanguage: "code2", markuplanguage: "filecode2", stylesheet: "palette",
  framework: "layers3", library: "library", runtime: "code2", database: "database",
  apibackend: "server", cloudplatform: "cloud", devops: "workflow",
  aimachinelearning: "braincircuit", data: "chartcolumn", testing: "testtube",
  versioncontrol: "gitbranch", infrastructure: "network", concept: "lightbulb",
  softskill: "messagessquare", tool: "wrench",
};

export function getBrandedIcon(iconKey?: string | null, name?: string): SimpleIcon | undefined {
  const requested = normalizeIconKey(iconKey || "");
  const byName = normalizeIconKey(name || "");
  const key = brandedAliases[requested] || requested || brandedAliases[byName] || byName;
  return brandedIcons[key];
}

export function getGenericIcon(iconKey?: string | null, skillType?: string): LucideIcon {
  const requested = genericIcons[normalizeIconKey(iconKey || "")];
  if (requested) return requested;
  return genericIcons[typeIconKeys[normalizeIconKey(skillType || "")]] || Code2;
}
