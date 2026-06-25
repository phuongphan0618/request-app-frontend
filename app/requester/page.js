'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getCurrentUser } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../app/App.module.css';

import { useToasts, ToastStack } from '../app/helpers';
import { TabRequester } from '../app/TabRequester';
import { getMyRequests } from '../../lib/api';

export default function RequesterPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, push: pushToast } = useToasts();

  const inFlightRef = useRef(false);
  // Giữ tạm trạng thái vừa cập nhật optimistic (vd. vừa hủy) để polling không ghi đè ngược
  // lại trạng thái cũ nếu backend xử lý có độ trễ. Tự xoá khi backend đã đồng bộ hoặc hết hạn.
  const overridesRef = useRef(new Map());

  async function fetchRequests(isInitial = true) {
    if (inFlightRef.current) return; // bỏ qua nếu lần fetch trước chưa xong
    inFlightRef.current = true;
    try {
      if (isInitial) setLoading(true);
      const requests = await getMyRequests();
      const merged = (requests || []).map(r => {
        const ov = overridesRef.current.get(r.id);
        if (!ov) return r;
        if (Date.now() > ov.expiresAt || r.status === ov.status) {
          overridesRef.current.delete(r.id);
          return r;
        }
        return { ...r, status: ov.status, review_note: ov.review_note ?? r.review_note };
      });
      setMyRequests(merged);
    } catch (err) {
      console.error('Lỗi tải requests:', err);
      if (isInitial) pushToast('Không thể tải danh sách requests', 'error', '✕');
    } finally {
      if (isInitial) setLoading(false);
      inFlightRef.current = false;
    }
  }

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email) {
      setUser(currentUser);
    } else {
      router.push('/');
      return;
    }

    fetchRequests(true);
  }, [router]);

  // Tự động cập nhật danh sách requests, không cần người dùng chủ động refresh
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchRequests(false), 800);
    return () => clearInterval(interval);
  }, [user]);

  function handleCreateRequest(newReq) {
    setMyRequests(p => [newReq, ...p]);
    pushToast(`Đã gửi ${newReq.id} — chờ admin xem xét`, 'success', '✓');
  }

  function handleCancelRequest(reqId, updated) {
    const review_note = updated?.review_note;
    // Giữ override 15s để các vòng polling tiếp theo không ghi đè ngược trạng thái này
    overridesRef.current.set(reqId, { status: 'cancelled', review_note, expiresAt: Date.now() + 15000 });
    // Chỉ cập nhật status/review_note, giữ nguyên các field còn lại của item trong list
    // (response của API cancel có shape khác với response của list API, không merge toàn bộ)
    setMyRequests(p =>
      p.map(r => r.id === reqId ? { ...r, status: 'cancelled', review_note: review_note ?? r.review_note } : r)
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
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray)' }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <TabRequester myRequests={myRequests} onCreate={handleCreateRequest} onRefresh={fetchRequests} onCancelSuccess={handleCancelRequest} />
          )}
        </div>
      </main>
    </div>
  );
}
