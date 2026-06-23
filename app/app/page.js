'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import LoginBackground from '../../components/login/LoginBackground';
import styles from './App.module.css';

import { MOCK_USER, INITIAL_ALL_REQUESTS } from './data';
import { useToasts, ToastStack } from './helpers';
import { RejectReasonModal } from './RejectReasonModal';
import { TabRequester } from './TabRequester';
import { TabAdmin } from './TabAdmin';
import { TabOwner } from './TabOwner';
import { BatchQueue } from './BatchQueue';

const NAV_ITEMS = [
  { key: 'requester', label: 'Requester', dot: 'dotRequester', active: 'navRequester', badge: 'badgeRequester' },
  { key: 'admin',     label: 'Admin',     dot: 'dotAdmin',     active: 'navAdmin',     badge: 'badgeAdmin' },
  { key: 'owner',     label: 'Owner',     dot: 'dotOwner',     active: 'navOwner',     badge: 'badgeOwner' },
];

export default function LimeAppPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [role, setRole]               = useState('admin');
  const [allRequests, setAllRequests] = useState(INITIAL_ALL_REQUESTS);
  const [queue, setQueue]             = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null);
  const { toasts, push: pushToast }   = useToasts();

  const myRequests   = allRequests.filter(r => r.requester_email === MOCK_USER.email);
  const pendingAdmin = allRequests.filter(r => r.status === 'pending_admin').length;
  const myPending    = myRequests.filter(r => r.status === 'pending_admin' || r.status === 'pending_owner').length;
  const NAV_COUNTS   = { requester: myPending, admin: pendingAdmin, owner: 2 };

  function handleCreateRequest(newReq) {
    setAllRequests(p => [newReq, ...p]);
    pushToast(`Đã gửi ${newReq.id} — chờ admin xem xét`, 'success', '✓');
  }

  function handleAdminApprove(req) {
    const newEntries = req.items
      .filter(item => !queue.find(e => e.item.id === item.id))
      .map(item => ({ request: req, item }));
    if (newEntries.length === 0) return;
    setQueue(p => [...p, ...newEntries]);
    setAllRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'pending_owner' } : r));
    const owners = [...new Set(req.items.map(i => i.owner_name))];
    pushToast(`${req.id} → ${newEntries.length} item vào ${owners.length} batch`, 'success', '✓');
  }

  function handleAdminReject(req) {
    setRejectTarget(req);
  }

  function handleRejectConfirm(req, reason) {
    setAllRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'rejected_by_admin', reject_note: reason } : r));
    setRejectTarget(null);
    pushToast(`Đã từ chối ${req.id}`, 'info', '✕');
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
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`${styles.navItem} ${role === item.key ? `${styles.navItemActive} ${styles[item.active]}` : ''}`}
              onClick={() => setRole(item.key)}
            >
              <span className={`${styles.navDot} ${styles[item.dot]}`} />
              <span className={styles.navLabel}>{item.label}</span>
              <span className={`${styles.navBadge} ${styles[item.badge]}`}>{NAV_COUNTS[item.key]}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.userAvatar}>{MOCK_USER.initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{MOCK_USER.name}</div>
              <div className={styles.userEmail}>{MOCK_USER.email}</div>
            </div>
          </div>
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
          {role === 'requester' && <TabRequester myRequests={myRequests} onCreate={handleCreateRequest} />}
          {role === 'admin'     && <TabAdmin requests={allRequests} queue={queue} onApprove={handleAdminApprove} onReject={handleAdminReject} />}
          {role === 'owner'     && <TabOwner />}
        </div>
      </main>

      {/* ── Right panel: batch queue (admin only) ── */}
      {role === 'admin' && (
        <div className={styles.rightPanel}>
          <BatchQueue queue={queue} onRemoveItem={handleRemoveItem} onSendSelected={handleSendSelected} />
        </div>
      )}
    </div>
  );
}
