'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

function LoginContent() {
  const { loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      const redirect = searchParams.get('redirect') || '/my-plans';
      if (redirect.startsWith('/')) {
        router.push(redirect);
      } else {
        router.push('/my-plans');
      }
    }
  }, [user, loading, router, searchParams]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 200px)' 
    }}>
      <div className="card" style={{ 
        maxWidth: '480px', 
        width: '100%', 
        padding: '2rem',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="brand" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            <BrandLogo size="login" />
            SkillPath<span className="brand-dot">.</span>
          </h1>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
            กลับมาพัฒนา Skill ต่อจากที่คุณค้างไว้
          </h2>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            บันทึก Learning Roadmap<br />
            ติดตาม Skill Progress<br />
            และไปให้ถึง Career Goal ของคุณ
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '1rem', 
            backgroundColor: 'rgba(255, 77, 79, 0.1)', 
            color: 'var(--color-danger, #ff4d4f)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn || loading}
          className="button"
          style={{ 
            width: '100%', 
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontWeight: 500,
            border: 'none',
            opacity: (isLoggingIn || loading) ? 0.7 : 1
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'Continue with Google'}
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          ใช้บัญชี Google เพื่อบันทึก Roadmap และ Progress ของคุณ
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-state">กำลังโหลด...</div>}>
      <LoginContent />
    </Suspense>
  );
}
