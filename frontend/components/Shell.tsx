"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
export { Status, Readiness } from "./ui";

const navigation = [["/", "หน้าหลัก"], ["/careers", "สำรวจอาชีพ"], ["/dashboard", "Dashboard"], ["/roadmap", "Roadmap"]];

import { UserMenu } from "@/components/auth/UserMenu";

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(previous => {
          const next = window.scrollY > 48;
          return previous === next ? previous : next;
        });
        frame = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); window.cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    dialog.current?.close();
    setScrolled(window.scrollY > 48);
    if (previousPath.current !== pathname) document.getElementById("main-content")?.focus({ preventScroll: true });
    previousPath.current = pathname;
  }, [pathname]);
  function closeMenu() { dialog.current?.close(); }
  function openMenu() { dialog.current?.showModal(); setMenuOpen(true); }
  const links = navigation.map(([href, label]) => <Link key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined} onClick={closeMenu}>{label}</Link>);
  return <>
    <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหา</a>
    <header className={`site-header${scrolled ? " scrolled" : ""}${pathname === "/" ? " home-header" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="SkillPath หน้าหลัก"><BrandLogo priority />SkillPath<span className="brand-dot">.</span></Link>
        <nav className="desktop-nav" aria-label="เมนูหลัก">{links}</nav>
        <div className="header-actions"><UserMenu />
          <button ref={menu} className="icon-button mobile-menu" aria-label="เปิดเมนู" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={openMenu}><Menu /></button>
        </div>
      </div>
    </header>
    <div className="header-space" aria-hidden="true" />
    <dialog id="mobile-navigation" ref={dialog} className="mobile-drawer" aria-label="เมนูหลัก" onClose={() => { setMenuOpen(false); menu.current?.focus(); }} onClick={event => { if (event.target === dialog.current) closeMenu(); }}>
      <div className="drawer-heading"><span className="brand"><BrandLogo />SkillPath<span className="brand-dot">.</span></span><button className="icon-button" aria-label="ปิดเมนู" onClick={closeMenu}><X /></button></div>
      <nav aria-label="เมนูบนมือถือ">{links}
        {!loading && (user ? <>
          <Link href="/my-plans" onClick={closeMenu}>แผนของฉัน</Link>
          <Link href="/profile" onClick={closeMenu}>โปรไฟล์</Link>
          <button className="drawer-logout" onClick={() => { closeMenu(); void logout(); }}>ออกจากระบบ</button>
        </> : <Link href="/login" onClick={closeMenu}>เข้าสู่ระบบ</Link>)}
      </nav><p className="muted">ก้าวต่อไป เริ่มจากทักษะของคุณ</p>
    </dialog>
    <main id="main-content" tabIndex={-1} className={`container${["/roadmap", "/dashboard"].includes(pathname) ? " workspace-container" : ""}${pathname === "/" ? " home-container" : ""}`}><div className="route-content">{children}</div></main>
    <footer className="site-footer"><div><Link className="brand" href="/" aria-label="SkillPath หน้าหลัก"><BrandLogo size="footer" />SkillPath<span className="brand-dot">.</span></Link><p>รู้จุดเริ่มต้น เห็นเส้นทางที่เป็นของคุณ</p><small>Career Learning Platform · วางแผนด้วยอัลกอริทึมที่อธิบายได้</small></div><nav aria-label="เมนูท้ายหน้า"><Link href="/careers">สำรวจอาชีพ</Link><Link href="/dashboard">Dashboard</Link><Link href="/roadmap">Roadmap</Link></nav></footer>
  </>;
}
