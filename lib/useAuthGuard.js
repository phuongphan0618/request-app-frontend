'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Guard route theo role.
 * - Dùng useState(false): cả server lẫn client đều render null ban đầu → không hydration mismatch.
 * - useEffect chạy sau hydration: check localStorage, redirect hoặc set ready=true.
 * - Đặt `if (!ready) return null` SAU tất cả hooks trong component → không vi phạm Rules of Hooks.
 */
export function useAuthGuard(requiredRole = null) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role  = localStorage.getItem('user_role');
    if (!token || (requiredRole && role !== requiredRole)) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, []);

  return ready;
}
