'use client';

import { useRouter } from 'next/navigation';
import styles from './AdminNav.module.css';

const PAGES = [
  {
    path: '/apps',
    label: 'Quản lý App',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    path: '/users',
    label: 'Tạo User',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    path: '/user-list',
    label: 'Danh sách User',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function AdminNav({ current }) {
  const router = useRouter();

  return (
    <div className={styles.adminNav}>
      {PAGES.map(page => (
        <button
          key={page.path}
          className={`${styles.navBtn} ${current === page.path ? styles.navBtnActive : ''}`}
          onClick={() => router.push(page.path)}
          title={page.label}
        >
          <span className={styles.navBtnIcon}>{page.icon}</span>
          <span className={styles.navBtnLabel}>{page.label}</span>
        </button>
      ))}
    </div>
  );
}
