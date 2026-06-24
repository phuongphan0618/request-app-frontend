'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getCurrentUser } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../app/App.module.css';

import { MOCK_USER, INITIAL_ALL_REQUESTS } from '../app/data';
import { useToasts, ToastStack } from '../app/helpers';
import { TabRequester } from '../app/TabRequester';

export default function RequesterPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [allRequests, setAllRequests] = useState(INITIAL_ALL_REQUESTS);
  const { toasts, push: pushToast } = useToasts();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email) {
      setUser(currentUser);
    } else {
      router.push('/');
    }
  }, [router]);

  const myRequests = allRequests.filter(r => r.requester_email === MOCK_USER.email);

  function handleCreateRequest(newReq) {
    setAllRequests(p => [newReq, ...p]);
    pushToast(`Đã gửi ${newReq.id} — chờ admin xem xét`, 'success', '✓');
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
          <button className={`${styles.navItem} ${styles.navItemActive} ${styles.navRequester}`} onClick={() => router.push('/requester')}>
            <span className={`${styles.navDot} ${styles.dotRequester}`} />
            <span className={styles.navLabel}>Requester</span>
          </button>
          <button className={`${styles.navItem}`} onClick={() => router.push('/admin')}>
            <span className={`${styles.navDot} ${styles.dotAdmin}`} />
            <span className={styles.navLabel}>Admin</span>
          </button>
          <button className={`${styles.navItem}`} onClick={() => router.push('/owner')}>
            <span className={`${styles.navDot} ${styles.dotOwner}`} />
            <span className={styles.navLabel}>Owner</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          {user ? (
            <div className={styles.userRow}>
              <div className={styles.userAvatar}>
                {`${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {`${user.first_name || ''} ${user.last_name || ''}`.trim()}
                </div>
                <div className={styles.userEmail}>{user.email || ''}</div>
              </div>
            </div>
          ) : null}
          <div className={styles.footerBtns}>
            <button className={styles.footerBtn} onClick={() => router.push('/')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <TabRequester myRequests={myRequests} onCreate={handleCreateRequest} />
        </div>
      </main>
    </div>
  );
}
