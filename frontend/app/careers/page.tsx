"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CareerCard } from "@/components/CareerCard";
import { SectionHeading, Status, PageSkeleton } from "@/components/ui";
import { Career } from "@/lib/types";
import { useApi } from "@/lib/useApi";

function Explorer() {
  const { data, error, loading, retry } = useApi<Career[]>("/careers");
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get("category") || "";
  const search = params.get("q") || "";
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/careers${next.size ? `?${next}` : ""}`, { scroll: false });
  }
  const categories = Array.from(new Set((data || []).map(c => c.category)));
  const visible = (data || []).filter(c => (!category || c.category === category) && `${c.title} ${c.description} ${c.top_skills?.map(s => s.name).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <section>
    <SectionHeading eyebrow="Career Explorer" title="ค้นหาเส้นทางอาชีพของคุณ" page><p>เลือกเป้าหมายที่ใช่ สำรวจทักษะที่ต้องใช้ แล้วเริ่มวางแผนก้าวต่อไป</p></SectionHeading>
    <div className="explorer-toolbar glass-panel"><div className="search-field"><label htmlFor="career-search">ค้นหาอาชีพหรือเทคโนโลยี</label><div className="input-icon"><Search size={19} /><input id="career-search" type="search" value={search} placeholder="เช่น Developer, Python, Data…" onChange={e => filter("q", e.target.value)} /></div></div><div className="category-select"><label htmlFor="category"><SlidersHorizontal size={15} /> หมวดหมู่</label><select id="category" value={category} onChange={e => filter("category", e.target.value)}><option value="">ทุกสายอาชีพ</option>{categories.map(c => <option key={c}>{c}</option>)}{category && !categories.includes(category) && <option>{category}</option>}</select></div></div>
    <div className="results-heading"><p role="status" aria-live="polite">{loading ? "กำลังค้นหาเส้นทาง…" : <><strong>{visible.length}</strong> เส้นทางที่คุณเลือกได้</>}</p>{(search || category) && <button className="ghost" onClick={() => router.replace("/careers", { scroll: false })}><X size={16} />ล้างตัวกรอง</button>}</div>
    <Status loading={loading} error={error} onRetry={retry} />
    {!loading && !error && (visible.length ? <div className="career-grid">{visible.map(c => <CareerCard key={c.id} career={c} />)}</div> : <div className="empty-state"><Search size={32} /><h2>{data?.length ? "ไม่พบอาชีพที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลอาชีพ"}</h2><p>{data?.length ? "ลองคำค้นอื่น หรือเลือกดูทุกสายอาชีพ" : "ลองโหลดข้อมูลใหม่อีกครั้ง"}</p><button className="secondary" onClick={() => data?.length ? router.replace("/careers") : retry()}>{data?.length ? "ล้างตัวกรอง" : "ลองอีกครั้ง"}</button></div>)}
  </section>;
}
export default function CareersPage() { return <Suspense fallback={<PageSkeleton />}><Explorer /></Suspense>; }
