'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getCurrentUser } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../app/App.module.css';

import { useToasts, ToastStack } from '../app/helpers';
import { RejectReasonModal } from '../app/RejectReasonModal';
import { RevertReasonModal } from '../app/RevertReasonModal';
import { TabAdmin } from '../app/TabAdmin';
import { TabManage } from '../app/TabManage';
import { BatchQueue } from '../app/BatchQueue';
import { getAccessRequests, approveAccessRequest, rejectAccessRequest, revertAccessRequest } from '../../lib/api';

export default function AdminPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [revertTarget, setRevertTarget] = useState(null);
  const [adminView, setAdminView] = useState('requests'); // 'requests' | 'manage'
  const { toasts, push: pushToast } = useToasts();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      router.push('/');
      return;
    }

    setUser(currentUser);

    // Check if user has 'sub-admin' role
    const rolesStr = localStorage.getItem('roles');
    const roles = rolesStr ? JSON.parse(rolesStr) : [];

    if (roles.includes('sub-admin')) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      setLoading(false);
    }
  }, [router]);

  // Tự động cập nhật danh sách requests, không cần người dùng chủ động refresh
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!hasAccess) return;

    let cancelled = false;

    async function fetchRequests(isInitial) {
      if (inFlightRef.current) return; // bỏ qua nếu lần fetch trước chưa xong
      inFlightRef.current = true;
      try {
        if (isInitial) setLoading(true);
        const requests = await getAccessRequests();
        if (!cancelled) setAllRequests(requests || []);
      } catch (err) {
        console.error('Lỗi tải requests:', err);
        if (isInitial) pushToast('Không thể tải danh sách requests', 'error', '✕');
      } finally {
        if (isInitial) setLoading(false);
        inFlightRef.current = false;
      }
    }

    fetchRequests(true);
    const interval = setInterval(() => fetchRequests(false), 800);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasAccess, pushToast]);

  const pendingAdmin = allRequests.filter(r => r.status === 'pending_admin').length;

  async function handleAdminApprove(req) {
    try {
      await approveAccessRequest(req.id);
      const newEntries = req.items
        .filter(item => !queue.find(e => e.item.id === item.id))
        .map(item => ({ request: req, item }));
      if (newEntries.length > 0) setQueue(p => [...p, ...newEntries]);
      setAllRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'pending_owner' } : r));
      const owners = [...new Set(req.items.map(i => i.owner_name))];
      pushToast(`${req.id} → ${newEntries.length} item vào ${owners.length} batch`, 'success', '✓');
    } catch (err) {
      console.error('Lỗi duyệt request:', err);
      pushToast(err.message || 'Không thể duyệt yêu cầu', 'error', '✕');
    }
  }

  function handleAdminReject(req) {
    setRejectTarget(req);
  }

  async function handleRejectConfirm(req, reason) {
    try {
      await rejectAccessRequest(req.id, reason);
      setAllRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'rejected_by_admin', review_note: reason } : r));
      setRejectTarget(null);
      pushToast(`Đã từ chối ${req.id}`, 'info', '✕');
    } catch (err) {
      console.error('Lỗi từ chối request:', err);
      pushToast(err.message || 'Không thể từ chối yêu cầu', 'error', '✕');
    }
  }

  function handleAdminRevertOpen(req) {
    setRevertTarget(req);
  }

  async function handleRevertConfirm(req, reason) {
    try {
      await revertAccessRequest(req.id, reason);

      if (req.status === 'rejected_by_admin') {
        // Hoàn tác từ chối → coi như duyệt lại: chuyển chờ owner, tách item vào batch theo owner
        const newEntries = req.items
          .filter(item => !queue.find(e => e.item.id === item.id))
          .map(item => ({ request: req, item }));
        if (newEntries.length > 0) setQueue(p => [...p, ...newEntries]);
        setAllRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'pending_owner', review_note: null } : r));
        const owners = [...new Set(req.items.map(i => i.owner_name))];
        pushToast(`Đã hoàn tác ${req.id} → ${newEntries.length} item vào ${owners.length} batch`, 'info', '↩');
      } else {
        // Hoàn tác duyệt (pending_owner/completed) → coi như từ chối: chuyển đã xử lý, rút item khỏi batch
        setQueue(p => p.filter(e => e.request.id !== req.id));
        setAllRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'rejected_by_admin', review_note: reason } : r));
        pushToast(`Đã hoàn tác ${req.id} → chuyển sang bị từ chối`, 'info', '↩');
      }

      setRevertTarget(null);
    } catch (err) {
      console.error('Lỗi hoàn tác request:', err);
      pushToast(err.message || 'Không thể hoàn tác yêu cầu', 'error', '✕');
    }
  }

  function handleRemoveItem(requestId, itemId) {
    setQueue(p => p.filter(e => !(e.request.id === requestId && e.item.id === itemId)));
    pushToast('Đã xoá item khỏi batch', 'info', '↩');
  }

  function handleSendSelected(selectedGroups) {
    const ownerEmails = new Set(selectedGroups.map(g => g.owner_email));
    setQueue(p => p.filter(e => !ownerEmails.has(e.item.owner_email)));
    pushToast(`Đã gửi ${selectedGroups.length} batch đến ${selectedGroups.length} owner`, 'success', '📨');
  }

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
            <button className={`${styles.navItem} ${styles.navItemActive} ${styles.navAdmin}`} onClick={() => router.push('/admin')}>
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

        {/* ── Main content: Access Denied ── */}
        <main className={styles.main}>
          <div className={styles.mainContent}>
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Không có quyền truy cập</h2>
              <p style={{ color: 'var(--color-gray)', marginBottom: '2rem' }}>Bạn không có quyền để truy cập trang Admin. Vui lòng liên hệ quản trị viên.</p>
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

      {rejectTarget && (
        <RejectReasonModal
          req={rejectTarget}
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}

      {revertTarget && (
        <RevertReasonModal
          req={revertTarget}
          onCancel={() => setRevertTarget(null)}
          onConfirm={handleRevertConfirm}
        />
      )}

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
          <button className={`${styles.navItem} ${styles.navItemActive} ${styles.navAdmin}`} onClick={() => router.push('/admin')}>
            <span className={`${styles.navDot} ${styles.dotAdmin}`} />
            <span className={styles.navLabel}>Admin</span>
            <span className={`${styles.navBadge} ${styles.badgeAdmin}`}>{pendingAdmin}</span>
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
          ) : adminView === 'manage' ? (
            <TabManage onBack={() => setAdminView('requests')} />
          ) : (
            <TabAdmin requests={allRequests} queue={queue} onApprove={handleAdminApprove} onReject={handleAdminReject} onRevert={handleAdminRevertOpen} onManage={() => setAdminView('manage')} />
          )}
        </div>
      </main>

      {/* ── Right panel: batch queue (admin only) ── */}
      {adminView !== 'manage' && (
        <div className={styles.rightPanel}>
          <BatchQueue queue={queue} onRemoveItem={handleRemoveItem} onSendSelected={handleSendSelected} />
        </div>
      )}
    </div>
  );
}
