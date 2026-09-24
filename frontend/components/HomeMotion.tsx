"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { SkillIcon } from "./SkillIcon";
import { Skill } from "@/lib/types";

export function TextEmerge({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { element.classList.add("emerged"); observer.disconnect(); }
    }, { threshold: .15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`text-emerge ${className}`}>{children}</div>;
}

export function CursorRingField() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const field = ref.current;
    const hero = field?.parentElement;
    if (!field || !hero) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 1024px) and (pointer: fine)");
    const rings = Array.from(field.children) as HTMLElement[];
    let bounds = hero.getBoundingClientRect();
    let pointer = { x: -1000, y: -1000 };
    let frame = 0, last = 0, visible = true;
    const values = rings.map(() => ({ x: 0, y: 0, power: 0 }));
    function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
    function reset() { stop(); values.forEach((v, i) => { v.x = v.y = v.power = 0; rings[i].style.transform = ""; rings[i].style.opacity = ""; }); }
    function animate(now: number) {
      frame = 0;
      if (!visible || document.hidden || preference.matches || !desktop.matches) { reset(); return; }
      const blend = 1 - Math.exp(-Math.min(last ? now - last : 16, 40) / 65); last = now;
      let moving = false;
      rings.forEach((ring, index) => {
        const x = ((index % 8) + .5) / 8 * bounds.width;
        const y = (Math.floor(index / 8) + .5) / 5 * bounds.height;
        const dx = pointer.x - x, dy = pointer.y - y, distance = Math.hypot(dx, dy);
        const power = Math.max(0, 1 - distance / 180);
        const tx = distance ? dx / distance * 6 * power : 0;
        const ty = distance ? dy / distance * 6 * power : 0;
        const value = values[index];
        value.x += (tx - value.x) * blend; value.y += (ty - value.y) * blend; value.power += (power - value.power) * blend;
        if (Math.abs(tx - value.x) + Math.abs(ty - value.y) + Math.abs(power - value.power) > .005) moving = true;
        ring.style.transform = `translate(${value.x}px,${value.y}px) scale(${1 + value.power * .08})`;
        ring.style.opacity = String(.06 + value.power * .12);
      });
      if (moving) frame = requestAnimationFrame(animate); else last = 0;
    }
    function start() { if (!frame && visible && !document.hidden && !preference.matches && desktop.matches) frame = requestAnimationFrame(animate); }
    function move(event: PointerEvent) { pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; start(); }
    function leave() { pointer = { x: -1000, y: -1000 }; start(); }
    function measure() { bounds = hero!.getBoundingClientRect(); }
    function visibility() { if (document.hidden) reset(); }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) reset(); });
    observer.observe(hero);
    hero.addEventListener("pointermove", move); hero.addEventListener("pointerleave", leave);
    window.addEventListener("resize", measure); window.addEventListener("scroll", measure, { passive: true });
    document.addEventListener("visibilitychange", visibility); preference.addEventListener("change", reset); desktop.addEventListener("change", reset);
    return () => { reset(); observer.disconnect(); hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure); document.removeEventListener("visibilitychange", visibility); preference.removeEventListener("change", reset); desktop.removeEventListener("change", reset); };
  }, []);
  return <div ref={ref} className="cursor-ring-field" aria-hidden="true">{Array.from({ length: 40 }, (_, index) => <span key={index} />)}</div>;
}

export function LogoMarquee({ skills }: { skills: Skill[] }) {
  const [paused, setPaused] = useState(false);
  const [inactive, setInactive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !track.current) return;
    let visible = true;
    const update = () => setInactive(!visible || document.hidden);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
    observer.observe(ref.current);
    const resize = new ResizeObserver(() => { if (track.current) track.current.style.setProperty("--marquee-duration", `${track.current.scrollWidth / 2 / 24}s`); });
    resize.observe(track.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  if (!skills.length) return null;
  const items = skills.slice(0, 16);
  return <section className="technology-strip" aria-label="เทคโนโลยีใน SkillPath"><div className="strip-caption"><span>เรียนรู้ทักษะที่ใช้จริง</span><button className="ghost marquee-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? "เล่นต่อ" : "หยุดการเคลื่อนไหว"}</button></div><div ref={ref} className={`marquee-mask${paused || inactive ? " paused" : ""}`}><div ref={track} className="marquee-track">{[0, 1].map(copy => <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className={copy === 1 ? "marquee-copy" : ""}>{items.map(skill => <li key={skill.id}><SkillIcon name={skill.name} iconKey={skill.icon_key} iconKind={skill.icon_kind} skillType={skill.skill_type} monochrome /><span>{skill.name}</span></li>)}</ul>)}</div></div></section>;
}
