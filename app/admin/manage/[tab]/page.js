'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../../lib/useTheme';
import { getCurrentUser } from '../../../../lib/api';
import LoginBackground from '../../../../components/login/LoginBackground';
import styles from '../../../app/App.module.css';
import { useToasts, ToastStack } from '../../../app/helpers';
import { UserMenu } from '../../../app/UserMenu';
import { AppTable, DomainTable, UserTable } from '../../../app/TabManage';

const TABS = [
  { key: 'app',    label: 'Quản lý app'    },
  { key: 'domain', label: 'Quản lý domain' },
  { key: 'user',   label: 'Quản lý user'   },
];

const ThemeIcon = ({ isDark }) => isDark
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

export default function AdminManageTabPage({ params }) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { toasts, push: pushToast } = useToasts();

  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  const { tab = 'app' } = use(params);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) { router.push('/'); return; }
    setUser(currentUser);
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    if (!roles.includes('sub-admin')) { router.push('/admin'); return; }
    setHasAccess(true);
  }, [router]);

  if (!user || !hasAccess) return null;

  const sidebar = (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <div className={styles.brand}>Access Request<br />System</div>
        <button className={styles.sidebarThemeBtn} onClick={toggleTheme} aria-label="Đổi giao diện">
          <ThemeIcon isDark={isDark} />
        </button>
      </div>
      <nav className={styles.sidebarNav}>
        <div className={styles.sideNavLabel}>Ngữ cảnh</div>
        <button className={styles.navItem} onClick={() => router.push('/requester')}>
          <span className={`${styles.navDot} ${styles.dotRequester}`} />
          <span className={styles.navLabel}>Requester</span>
        </button>
        <button className={`${styles.navItem} ${styles.navItemActive} ${styles.navAdmin}`} onClick={() => router.push('/admin')}>
          <span className={`${styles.navDot} ${styles.dotAdmin}`} />
          <span className={styles.navLabel}>Admin</span>
        </button>
        <button className={styles.navItem} onClick={() => router.push('/owner')}>
          <span className={`${styles.navDot} ${styles.dotOwner}`} />
          <span className={styles.navLabel}>Owner</span>
        </button>
      </nav>
      <div className={styles.sidebarFooter}>
        {user && <UserMenu user={user} onLogout={() => router.push('/')} />}
      </div>
    </aside>
  );

  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />
      <ToastStack toasts={toasts} />
      {sidebar}
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <div>
            <div className={styles.adminTop}>
              <div className={styles.panelHeader} style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button className={styles.mgmtBackBtn} onClick={() => router.push('/admin')} title="Quay lại yêu cầu">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <h2 className={styles.panelTitle}>Quản lý hệ thống</h2>
                </div>
              </div>
              <div className={styles.subTabs} style={{ marginBottom: 0 }}>
                {TABS.map(t => (
                  <button key={t.key}
                    className={`${styles.subTab} ${tab === t.key ? styles.subTabActive : ''}`}
                    onClick={() => router.push(`/admin/manage/${t.key}`)}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            {tab === 'app'    && <AppTable    pushToast={pushToast} />}
            {tab === 'domain' && <DomainTable pushToast={pushToast} />}
            {tab === 'user'   && <UserTable   pushToast={pushToast} />}
          </div>
        </div>
      </main>
    </div>
  );
}
