'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getCurrentUser } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../app/App.module.css';

import { useToasts, ToastStack } from '../app/helpers';
import { TabOwner } from '../app/TabOwner';
import { UserMenu } from '../app/UserMenu';

export default function OwnerPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const { toasts, push: pushToast } = useToasts();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      router.push('/');
      return;
    }

    setUser(currentUser);

    // Check if user has 'owner' role
    const rolesStr = localStorage.getItem('roles');
    const roles = rolesStr ? JSON.parse(rolesStr) : [];

    if (roles.includes('owner')) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
  }, [router]);

  if (!user) {
    return null;
  }

  if (!hasAccess) {
    return (
      <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
        <LoginBackground isDark={isDark} />

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.brand}>Access Request<br />System</div>
            <button className={styles.sidebarThemeBtn} onClick={toggleTheme} aria-label="Đổi giao diện">
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            <div className={styles.sideNavLabel}>Ngữ cảnh</div>
            <button className={`${styles.navItem}`} onClick={() => router.push('/requester')}>
              <span className={`${styles.navDot} ${styles.dotRequester}`} />
              <span className={styles.navLabel}>Requester</span>
            </button>
            <button className={`${styles.navItem}`} onClick={() => router.push('/admin')}>
              <span className={`${styles.navDot} ${styles.dotAdmin}`} />
              <span className={styles.navLabel}>Admin</span>
            </button>
            <button className={`${styles.navItem} ${styles.navItemActive} ${styles.navOwner}`} onClick={() => router.push('/owner')}>
              <span className={`${styles.navDot} ${styles.dotOwner}`} />
              <span className={styles.navLabel}>Owner</span>
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            {user && <UserMenu user={user} onLogout={() => router.push('/')} onProfileUpdate={setUser} />}
          </div>
        </aside>

        {/* ── Main content: Access Denied ── */}
        <main className={styles.main}>
          <div className={styles.mainContent}>
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Không có quyền truy cập</h2>
              <p style={{ color: 'var(--color-gray)', marginBottom: '2rem' }}>Bạn không có quyền để truy cập trang Owner. Vui lòng liên hệ quản trị viên.</p>
              <button onClick={() => router.push('/requester')} style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--color-red)',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}>
                Quay lại Requester
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />
      <ToastStack toasts={toasts} />

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>Access Request<br />System</div>
          <button className={styles.sidebarThemeBtn} onClick={toggleTheme} aria-label="Đổi giao diện">
            {isDark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sideNavLabel}>Ngữ cảnh</div>
          <button className={`${styles.navItem}`} onClick={() => router.push('/requester')}>
            <span className={`${styles.navDot} ${styles.dotRequester}`} />
            <span className={styles.navLabel}>Requester</span>
          </button>
          <button className={`${styles.navItem}`} onClick={() => router.push('/admin')}>
            <span className={`${styles.navDot} ${styles.dotAdmin}`} />
            <span className={styles.navLabel}>Admin</span>
          </button>
          <button className={`${styles.navItem} ${styles.navItemActive} ${styles.navOwner}`} onClick={() => router.push('/owner')}>
            <span className={`${styles.navDot} ${styles.dotOwner}`} />
            <span className={styles.navLabel}>Owner</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          {user && <UserMenu user={user} onLogout={() => router.push('/')} onProfileUpdate={setUser} />}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <TabOwner pushToast={pushToast} />
        </div>
      </main>
    </div>
  );
}
