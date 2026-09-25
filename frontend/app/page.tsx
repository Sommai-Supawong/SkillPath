import Link from "next/link";
import { ArrowDown, GitBranch } from "lucide-react";
import { CursorRingField, TextEmerge } from "@/components/HomeMotion";
import { HomeContent } from "@/components/HomeContent";
import { NeonGlowButton } from "@/components/ui";
import { BrandLogo } from "@/components/BrandLogo";
import { CareerRoleWriter } from "@/components/CareerRoleWriter";

export default function Home() {
  return <>
    <section className="hero">
      <CursorRingField />
      <div className="hero-content">
        <BrandLogo size="hero" priority />
        <p className="hero-eyebrow"><span className="status-dot" /> SKILLPATH · Career Learning Platform</p>
        <h1>รู้ว่าคุณอยู่ตรงไหน<br /><span>และต้องเรียนอะไรต่อ</span></h1>
        <CareerRoleWriter />
        <p className="hero-lead">เชื่อมทักษะที่คุณมี กับอาชีพที่คุณอยากเป็น<br />วิเคราะห์ Skill Gap และสร้าง Learning Roadmap<br className="mobile-break" /> ที่เริ่มจากพื้นฐานของคุณ</p>
        <div className="actions hero-actions"><NeonGlowButton href="/careers">เริ่มค้นหาเส้นทางของคุณ</NeonGlowButton><Link className="button secondary" href="#career-categories">สำรวจสายอาชีพ <ArrowDown size={17} /></Link></div>
        <div className="hero-support"><span>Software</span><span>AI</span><span>Data</span><span>Cloud</span></div>
        <p className="hero-note"><GitBranch size={15} /> เรียงลำดับจาก Skill Gap และพื้นฐานที่จำเป็น</p>
      </div>
      <div className="hero-coordinate" aria-hidden="true">YOUR NEXT CHAPTER / 01</div>
    </section>
    <HomeContent />
    <section className="home-section final-cta"><p className="eyebrow">Explore your next step</p><TextEmerge><h2>พร้อมรู้หรือยังว่า<br />Skill ต่อไปของคุณคืออะไร?</h2></TextEmerge><p>เริ่มจากสิ่งที่คุณรู้ แล้วค่อย ๆ ไปถึงสิ่งที่คุณอยากเป็น</p><NeonGlowButton href="/careers">เริ่มค้นหาเส้นทางของคุณ</NeonGlowButton></section>
  </>;
}
