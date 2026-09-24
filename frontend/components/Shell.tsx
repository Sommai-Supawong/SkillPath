"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Route, X } from "lucide-react";
export { Status, Readiness } from "./ui";

const navigation = [["/", "หน้าหลัก"], ["/careers", "สำรวจอาชีพ"], ["/dashboard", "Dashboard"], ["/roadmap", "Roadmap"]];

import { UserMenu } from "@/components/auth/UserMenu";

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    dialog.current?.close();
    if (previousPath.current !== pathname) document.getElementById("main-content")?.focus({ preventScroll: true });
    previousPath.current = pathname;
  }, [pathname]);
  function closeMenu() { dialog.current?.close(); }
  const links = navigation.map(([href, label]) => <Link key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined} onClick={closeMenu}>{label}</Link>);
  return <>
    <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหา</a>
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="brand" aria-label="SkillPath หน้าหลัก"><span className="brand-mark"><Route size={22} /></span>SkillPath<span className="brand-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="เมนูหลัก">{links}</nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <UserMenu />
      </div>
      <button ref={menu} className="icon-button mobile-menu" aria-label="เปิดเมนู" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><Menu /></button>
    </header>
    <dialog ref={dialog} className="mobile-drawer" aria-label="เมนูหลัก" onClose={() => menu.current?.focus()} onClick={event => { if (event.target === dialog.current) closeMenu(); }}>
      <div className="drawer-heading"><span className="brand">SkillPath.</span><button className="icon-button" aria-label="ปิดเมนู" onClick={closeMenu}><X /></button></div>
      <nav aria-label="เมนูบนมือถือ">{links}</nav><p className="muted">ก้าวต่อไป เริ่มจากทักษะของคุณ</p>
    </dialog>
    <main id="main-content" tabIndex={-1} className={`container${["/roadmap", "/dashboard"].includes(pathname) ? " workspace-container" : ""}${pathname === "/" ? " home-container" : ""}`}><div className="route-content">{children}</div></main>
    <footer className="site-footer"><div><Link className="brand" href="/"><Route size={20} /> SkillPath.</Link><p>รู้จุดเริ่มต้น เห็นเส้นทางที่เป็นของคุณ</p><small>Career Learning Platform · วางแผนด้วยอัลกอริทึมที่อธิบายได้</small></div><nav aria-label="เมนูท้ายหน้า"><Link href="/careers">สำรวจอาชีพ</Link><Link href="/dashboard">Dashboard</Link><Link href="/roadmap">Roadmap</Link></nav></footer>
  </>;
}
