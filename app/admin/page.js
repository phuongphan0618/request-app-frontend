'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getCurrentUser } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../app/App.module.css';

import { useToasts, ToastStack, shortId } from '../app/helpers';
import { RejectReasonModal } from '../app/RejectReasonModal';
import { RevertReasonModal } from '../app/RevertReasonModal';
import { TabAdmin } from '../app/TabAdmin';
import { TabManage } from '../app/TabManage';
import { BatchQueue } from '../app/BatchQueue';
import { getAccessRequests, approveAccessRequest, rejectAccessRequest, revertAccessRequest, getBatches, sendBatch } from '../../lib/api';

export default function AdminPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingIds, setApprovingIds] = useState(new Set());
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

  // Tự động cập nhật danh sách requests, không cần người dùng chủ động refresh.
  // overridesRef giữ tạm các thay đổi optimistic (duyệt/từ chối/hoàn tác) để polling
  // không ghi đè ngược trạng thái nếu backend xử lý có độ trễ.
  const inFlightRef = useRef(false);
  const requestOverridesRef = useRef(new Map());

  useEffect(() => {
    if (!hasAccess) return;

    let cancelled = false;

    async function fetchRequests(isInitial) {
      if (inFlightRef.current) return; // bỏ qua nếu lần fetch trước chưa xong
      inFlightRef.current = true;
      try {
        if (isInitial) setLoading(true);
        const requests = await getAccessRequests();
        const merged = (requests || []).map(r => {
          const ov = requestOverridesRef.current.get(r.id);
          if (!ov) return r;
          if (Date.now() > ov.expiresAt || r.status === ov.fields.status) {
            requestOverridesRef.current.delete(r.id);
            return r;
          }
          return { ...r, ...ov.fields };
        });
        if (!cancelled) setAllRequests(merged);
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

  // Batch được backend tự tạo khi request được duyệt (item tách theo owner) — chỉ cần poll danh sách
  const batchInFlightRef = useRef(false);
  const batchOverridesRef = useRef(new Map());

  useEffect(() => {
    if (!hasAccess) return;

    let cancelled = false;

    async function fetchBatches() {
      if (batchInFlightRef.current) return;
      batchInFlightRef.current = true;
      try {
        const data = await getBatches();
        const merged = (data || []).map(b => {
          const ov = batchOverridesRef.current.get(b.id);
          if (!ov) return b;
          if (Date.now() > ov.expiresAt || b.status === ov.fields.status) {
            batchOverridesRef.current.delete(b.id);
            return b;
          }
          return { ...b, ...ov.fields };
        });
        if (!cancelled) setBatches(merged);
      } catch (err) {
        console.error('Lỗi tải batches:', err);
      } finally {
        batchInFlightRef.current = false;
      }
    }

    fetchBatches();
    const interval = setInterval(fetchBatches, 800);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasAccess]);

  const pendingAdmin = allRequests.filter(r => r.status === 'pending_admin').length;

  function setRequestOverride(reqId, fields) {
    requestOverridesRef.current.set(reqId, { fields, expiresAt: Date.now() + 15000 });
    setAllRequests(p => p.map(r => r.id === reqId ? { ...r, ...fields } : r));
  }

  async function handleAdminApprove(req) {
    setApprovingIds(p => new Set(p).add(req.id));
    try {
      await approveAccessRequest(req.id);
      setRequestOverride(req.id, { status: 'pending_owner' });
      // Backend tự tách item theo owner và tạo batch — danh sách batch sẽ tự cập nhật qua polling
      pushToast(`${shortId(req.id)} đã được duyệt, item sẽ vào batch theo owner`, 'success', '✓');
    } catch (err) {
      console.error('Lỗi duyệt request:', err);
      pushToast(err.message || 'Không thể duyệt yêu cầu', 'error', '✕');
    } finally {
      setApprovingIds(p => { const next = new Set(p); next.delete(req.id); return next; });
    }
  }

  function handleAdminReject(req) {
    setRejectTarget(req);
  }

  async function handleRejectConfirm(req, reason) {
    try {
      await rejectAccessRequest(req.id, reason);
      setRequestOverride(req.id, { status: 'rejected_by_admin', review_note: reason });
      setRejectTarget(null);
      pushToast(`Đã từ chối ${shortId(req.id)}`, 'info', '✕');
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
        // Hoàn tác từ chối → coi như duyệt lại: chuyển chờ owner, backend tự tách item vào batch theo owner
        setRequestOverride(req.id, { status: 'pending_owner', review_note: null });
        pushToast(`Đã hoàn tác ${shortId(req.id)} → chuyển chờ owner`, 'info', '↩');
      } else {
        // Hoàn tác duyệt (pending_owner/completed) → coi như từ chối: chuyển đã xử lý
        setRequestOverride(req.id, { status: 'rejected_by_admin', review_note: reason });
        pushToast(`Đã hoàn tác ${shortId(req.id)} → chuyển sang bị từ chối`, 'info', '↩');
      }

      setRevertTarget(null);
    } catch (err) {
      console.error('Lỗi hoàn tác request:', err);
      pushToast(err.message || 'Không thể hoàn tác yêu cầu', 'error', '✕');
    }
  }

  async function handleSendSelected(selectedBatches) {
    try {
      await Promise.all(selectedBatches.map(b => sendBatch(b.id)));
      selectedBatches.forEach(b => {
        batchOverridesRef.current.set(b.id, { fields: { status: 'sent' }, expiresAt: Date.now() + 15000 });
      });
      setBatches(p => p.map(b => selectedBatches.some(sb => sb.id === b.id) ? { ...b, status: 'sent' } : b));
      pushToast(`Đã gửi ${selectedBatches.length} batch đến ${selectedBatches.length} owner`, 'success', '📨');
    } catch (err) {
      console.error('Lỗi gửi batch:', err);
      pushToast(err.message || 'Không thể gửi batch', 'error', '✕');
    }
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
            <TabAdmin requests={allRequests} approvingIds={approvingIds} onApprove={handleAdminApprove} onReject={handleAdminReject} onRevert={handleAdminRevertOpen} onManage={() => setAdminView('manage')} />
          )}
        </div>
      </main>

      {/* ── Right panel: batch queue (admin only) ── */}
      {adminView !== 'manage' && (
        <div className={styles.rightPanel}>
          <BatchQueue batches={batches} onSendSelected={handleSendSelected} />
        </div>
      )}
    </div>
  );
}
