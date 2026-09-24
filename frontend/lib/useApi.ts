"use client";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const retry = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    if (!path) { setData(null); setLoading(false); return; }
    let active = true;
    setLoading(true); setError(""); setData(null);
    api<T>(path).then(value => { if (active) setData(value); }).catch(cause => { if (active) setError(cause instanceof ApiError && cause.status === 404 ? "ไม่พบข้อมูลนี้ กรุณาเลือกเส้นทางใหม่" : "ไม่สามารถโหลดข้อมูลได้"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, version]);
  return { data, loading, error, retry };
}
