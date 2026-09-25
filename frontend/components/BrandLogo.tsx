import Image from "next/image";

type BrandLogoSize = "nav" | "hero" | "footer" | "state" | "login";

export function BrandLogo({ size = "nav", priority = false }: { size?: BrandLogoSize; priority?: boolean }) {
  return (
    <span className={`brand-symbol brand-symbol-${size}`}>
      <Image
        src="/images/skillpath-logo.png"
        alt="SkillPath"
        width={128}
        height={128}
        sizes={size === "hero" || size === "login" ? "128px" : "64px"}
        priority={priority}
      />
    </span>
  );
}
