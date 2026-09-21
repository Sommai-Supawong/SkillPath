import Link from "next/link";
import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return <>
    <header className="site-header">
      <Link href="/" className="brand">SkillPath</Link>
      <nav aria-label="Main navigation">
        <Link href="/careers">Careers</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/roadmap">Roadmap</Link>
      </nav>
    </header>
    <main className="container">{children}</main>
    <footer>SkillPath · Personalized learning plans based on transparent algorithms.</footer>
  </>;
}

export function Status({ loading, error, empty }: { loading?: boolean; error?: string; empty?: string }) {
  if (loading) return <div className="notice" role="status">Loading…</div>;
  if (error) return <div className="notice error" role="alert">{error}</div>;
  if (empty) return <div className="notice">{empty}</div>;
  return null;
}

export function Readiness({ value }: { value: number }) {
  return <div className="score-card">
    <strong>{Math.round(value)}%</strong><span>career readiness</span>
    <div className="progress"><div style={{ width: `${Math.min(value, 100)}%` }} /></div>
  </div>;
}
