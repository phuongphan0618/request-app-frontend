'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminManagePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/manage/app'); }, [router]);
  return null;
}
