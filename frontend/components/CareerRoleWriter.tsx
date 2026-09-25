"use client";

import { CSSProperties, useEffect, useState } from "react";
import { Career } from "@/lib/types";
import { useApi } from "@/lib/useApi";

const fallback = "Explore Your Career Path";
const displayDuration = 3200;

type RoleState = { current: string; previous: string | null; cycle: number };

function shuffle(titles: string[], previous?: string) {
  const result = [...titles];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.length > 1 && result[0] === previous) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

function Letters({ title }: { title: string }) {
  return <>{Array.from(title).map((letter, index) => (
    <span className="career-role-letter" key={index} style={{ "--letter-index": Math.min(index, 28) } as CSSProperties}>
      {letter === " " ? "\u00a0" : letter}
    </span>
  ))}</>;
}

export function CareerRoleWriter() {
  const { data } = useApi<Career[]>("/careers");
  const [role, setRole] = useState<RoleState>({ current: fallback, previous: null, cycle: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const titles = Array.from(new Set((data ?? []).map(career => career.title.trim()).filter(Boolean)));
    if (!titles.length) return;

    let queue = shuffle(titles);
    let index = 0;
    let timer = 0;
    setRole(previous => ({ current: queue[0], previous: previous.current, cycle: previous.cycle + 1 }));

    if (reducedMotion || titles.length === 1) return;

    const schedule = () => {
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(advance, displayDuration);
    };
    const advance = () => {
      const oldTitle = queue[index];
      index += 1;
      if (index === queue.length) {
        queue = shuffle(titles, oldTitle);
        index = 0;
      }
      setRole(previous => ({ current: queue[index], previous: previous.current, cycle: previous.cycle + 1 }));
      schedule();
    };
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", schedule); };
  }, [data, reducedMotion]);

  return <div className="career-role-writer">
    <span className="sr-only">ตัวอย่างเส้นทางอาชีพใน SkillPath</span>
    <div className="career-role-stage" aria-hidden="true" lang="en">
      {role.previous && !reducedMotion && <span key={`out-${role.cycle}`} className="career-role-word exiting"><Letters title={role.previous} /></span>}
      <span key={`in-${role.cycle}`} className={`career-role-word${role.previous && !reducedMotion ? " entering" : ""}`}><Letters title={role.current} /></span>
    </div>
  </div>;
}
