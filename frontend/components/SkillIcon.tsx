import { SkillIconKind, getBrandedIcon, getGenericIcon } from "@/lib/skills/skillIdentity";

type IconSize = "sm" | "md" | "lg";
type SkillIdentityProps = {
  name: string;
  skillType?: string;
  iconKey?: string | null;
  iconKind?: SkillIconKind | null;
  size?: IconSize;
  compact?: boolean;
  monochrome?: boolean;
};

export function SkillIcon({ name, skillType, iconKey, iconKind, size = "md", monochrome = false }: SkillIdentityProps) {
  const branded = iconKind !== "lucide" ? getBrandedIcon(iconKey, name) : undefined;
  const label = skillType ? `${name} — ${skillType}` : name;
  if (branded) {
    const color = monochrome || branded.hex.toLowerCase() === "000000" ? "var(--text)" : `#${branded.hex}`;
    return <span className={`skill-icon ${size}`} title={label} aria-hidden="true" style={{ color }}>
      <svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d={branded.path} /></svg>
    </span>;
  }
  const GenericIcon = getGenericIcon(iconKey, skillType);
  return <span className={`skill-icon generic ${size}`} title={label} aria-hidden="true"><GenericIcon /></span>;
}

export function SkillIdentity({ name, skillType, iconKey, iconKind, size = "md", compact = false }: SkillIdentityProps) {
  return <span className={`skill-identity${compact ? " compact" : ""}`}>
    <SkillIcon name={name} skillType={skillType} iconKey={iconKey} iconKind={iconKind} size={size} />
    <span className="skill-copy"><strong>{name}</strong>{skillType && <span>{skillType}</span>}</span>
  </span>;
}
