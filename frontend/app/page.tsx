import Link from "next/link";

export default function Home() {
  return <section>
    <p className="eyebrow">Personalized career readiness</p>
    <h1>Know the gap.<br />Build your path.</h1>
    <p className="lead">Compare your current skills with a career target, understand your readiness, and get a dependency-safe learning roadmap that adapts as you progress.</p>
    <div className="actions"><Link className="button" href="/careers">Explore careers</Link><Link className="button secondary" href="/dashboard">Continue my plan</Link></div>
    <div className="grid">
      <div className="card"><h3>Assess</h3><p>Rate each required skill from 0 to 5 using a clear shared scale.</p></div>
      <div className="card"><h3>Analyze</h3><p>See weighted readiness, gaps, importance, and explainable priorities.</p></div>
      <div className="card"><h3>Plan</h3><p>Choose Balanced, Fast Track, or Foundation First learning order.</p></div>
    </div>
  </section>;
}
