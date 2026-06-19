'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../lib/useTheme';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../../lib/useAuthGuard';
import styles from './Dashboard.module.css';
import LoginBackground from '../../components/login/LoginBackground';
import { getAccessRequests, approveRequest, rejectRequest, clearTokens } from '../../lib/api';

const TABS = [
  { key: 'pending',    label: 'Chưa xử lý' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'done',       label: 'Đã xử lý' },
];

const DONE_STATUSES = ['rejected_by_admin', 'completed', 'canceled'];

function norm(data) {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function shortId(id) {
  return typeof id === 'string' && id.length > 12 ? id.substring(0, 8) : id;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calcWaitHours(createdAt) {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
  if (hours === 0) return 'Vừa gửi';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days} ngày`;
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function sortRequests(requests, sortBy) {
  return [...requests].sort((a, b) => {
    if (sortBy === 'waitTime') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'deadline') {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return String(a.id).localeCompare(String(b.id));
  });
}

const STATUS_INFO = {
  rejected_by_admin: { label: 'Từ chối',    cls: 'statusRejected' },
  completed:         { label: 'Hoàn thành', cls: 'statusCompleted' },
  canceled:          { label: 'Đã hủy',     cls: 'statusCanceled' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard('sub-admin');
  const [activeTab,   setActiveTab]   = useState('pending');
  const [sortBy,      setSortBy]      = useState('waitTime');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [search,      setSearch]      = useState('');

  const [allRequests, setAllRequests] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote,   setRejectNote]   = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [actionError,  setActionError]  = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccessRequests();
      setAllRequests(norm(data));
    } catch {
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const byTab = {
    pending:    allRequests.filter(r => r.status === 'pending_admin'),
    processing: allRequests.filter(r => r.status === 'pending_owner'),
    done:       allRequests.filter(r => DONE_STATUSES.includes(r.status)),
  };

  const searchLower = search.toLowerCase().trim();
  const filtered = searchLower
    ? byTab[activeTab].filter(r =>
        r.requester_email?.toLowerCase().includes(searchLower) ||
        r.requester_name?.toLowerCase().includes(searchLower)
      )
    : byTab[activeTab];

  const requests = sortRequests(filtered, sortBy);
  const total    = allRequests.length;

  const RATIO = [
    { label: 'Chưa xử lý', count: byTab.pending.length,    color: '#DE1A1A' },
    { label: 'Đang xử lý', count: byTab.processing.length, color: '#8B85C1' },
    { label: 'Đã xử lý',   count: byTab.done.length,       color: '#2ecc71' },
  ];

  function buildGradient() {
    if (total === 0) return 'rgba(160,154,185,0.2) 0% 100%';
    let cum = 0;
    return RATIO.filter(r => r.count > 0).map(r => {
      const start = cum;
      cum += (r.count / total) * 100;
      return `${r.color} ${start.toFixed(1)}% ${cum.toFixed(1)}%`;
    }).join(', ');
  }

  async function handleApprove(req) {
    setActionError('');
    try {
      await approveRequest(req.id);
      loadRequests();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleRejectSubmit() {
    setSubmitting(true);
    setActionError('');
    try {
      await rejectRequest(rejectTarget.id, rejectNote);
      setRejectTarget(null);
      setRejectNote('');
      loadRequests();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const tabColSpan = activeTab === 'pending' || activeTab === 'done' ? 8 : 7;

  if (!ready) return null;
  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <div className={styles.modalOverlay} onClick={() => { setRejectTarget(null); setRejectNote(''); setActionError(''); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Từ chối yêu cầu</h3>
            <p className={styles.modalSub}>#{rejectTarget.id} — {rejectTarget.requester_name || rejectTarget.requester_email}</p>
            <textarea
              className={styles.modalNote}
              rows={3}
              placeholder="Ghi chú lý do từ chối (tuỳ chọn)…"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            {actionError && <p className={styles.modalError}>{actionError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => { setRejectTarget(null); setRejectNote(''); setActionError(''); }}>Hủy</button>
              <button
                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem', width: 'auto', height: 'auto' }}
                disabled={submitting}
                onClick={handleRejectSubmit}
              >
                {submitting ? '…' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.navBrand} onClick={() => router.push('/dashboard')}>
            Access Request System
          </span>
          <div className={styles.navLinks}>
            <button className={`${styles.navLink} ${styles.navLinkActive}`}>Dashboard</button>
            <button className={styles.navLink} onClick={() => router.push('/batch')}>Batch</button>
          </div>
        </div>

        <div className={styles.navRight}>
          <div className={styles.searchBar}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm tên / email…"
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className={styles.navIconBtn} title="Thông báo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          <button className={styles.navIconBtn} onClick={toggleTheme} title="Đổi giao diện">
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <div className={styles.settingsWrap}>
            {drawerOpen && <div className={styles.sideBackdrop} onClick={() => setDrawerOpen(false)} />}
            <button
              className={`${styles.navIconBtn} ${drawerOpen ? styles.navIconBtnActive : ''}`}
              onClick={() => setDrawerOpen(o => !o)}
              title="Menu quản trị"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            <div className={`${styles.sideDrawer} ${drawerOpen ? styles.sideDrawerOpen : ''}`}>
              <button className={styles.sideItem} onClick={() => { router.push('/apps'); setDrawerOpen(false); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </span>
                Quản lý App
              </button>

              <button className={styles.sideItem} onClick={() => { router.push('/users'); setDrawerOpen(false); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </span>
                Tạo User
              </button>

              <button className={styles.sideItem} onClick={() => { router.push('/user-list'); setDrawerOpen(false); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                Danh sách User
              </button>

              <div className={styles.sideDivider} />

              <button className={styles.sideItem} onClick={() => { clearTokens(); router.push('/login'); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                Đăng xuất
              </button>
            </div>
          </div>

          <button className={styles.navIconBtn} title="Tài khoản">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className={styles.content}>

        {/* Left panel */}
        <div className={styles.leftPanel}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className={styles.tabBadge}>{byTab[tab.key].length}</span>
              </button>
            ))}
          </div>

          {actionError && !rejectTarget && (
            <div className={styles.actionError}>{actionError}</div>
          )}

          <div className={styles.sortBar}>
            <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="waitTime">Sort: Thời gian chờ</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="id">Sort: Request ID</option>
            </select>
            <span className={styles.countText}>
              Hiển thị <strong>{requests.length}</strong> / {byTab[activeTab].length} yêu cầu
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th style={{ width: '55px' }}></th>
                  <th>Requester</th>
                  <th>PNL / Domain</th>
                  <th>Applications</th>
                  <th>Deadline</th>
                  <th>{activeTab === 'done' ? 'Thời gian hoàn thành' : 'Thời gian chờ'}</th>
                  {activeTab === 'pending' && <th style={{ width: '72px' }}>Thao tác</th>}
                  {activeTab === 'done'    && <th style={{ width: '90px' }}>Trạng thái</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={tabColSpan} className={styles.loadingState}>Đang tải…</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={tabColSpan} className={styles.emptyState}>Không có yêu cầu nào.</td></tr>
                ) : requests.map(req => (
                  <tr
                    key={req.id}
                    className={styles.clickableRow}
                    onClick={() => router.push(`/request_details?id=${req.id}`)}
                  >
                    <td><strong title={req.id}>{shortId(req.id)}</strong></td>
                    <td>
                      {req.is_urgent && <span className={styles.urgentChip}>⚡ Gấp</span>}
                    </td>
                    <td>
                      <div className={styles.requesterCell}>
                        <span>{req.requester_name || '—'}</span>
                        <span className={styles.subText}>{req.requester_email}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.pnlCell}>
                        <span>{req.department_name ?? '—'}</span>
                        <span className={styles.subText}>{req.domain_name ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.appTags}>
                        {(req.items ?? []).slice(0, 3).map(item => (
                          <span key={item.id} className={styles.appTag}>{item.application_name}</span>
                        ))}
                        {(req.items?.length ?? 0) > 3 && (
                          <span className={styles.appTag} style={{ opacity: 0.6 }}>
                            +{req.items.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(req.deadline)}</td>
                    <td><span className={styles.waitBadge}>{activeTab === 'done' ? fmtDateTime(req.reviewed_at) : calcWaitHours(req.created_at)}</span></td>
                    {activeTab === 'pending' && (
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            title="Duyệt"
                            onClick={(e) => { e.stopPropagation(); handleApprove(req); }}
                          >✓</button>
                          <button
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                            title="Từ chối"
                            onClick={(e) => { e.stopPropagation(); setRejectTarget(req); setRejectNote(''); setActionError(''); }}
                          >✗</button>
                        </div>
                      </td>
                    )}
                    {activeTab === 'done' && (
                      <td>
                        {(() => {
                          const info = STATUS_INFO[req.status] ?? { label: req.status, cls: 'statusCanceled' };
                          return (
                            <span className={`${styles.statusBadge} ${styles[info.cls]}`}>
                              {info.label}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Request Ratio
            </div>
            <div className={styles.donutWrap}>
              <div className={styles.donut} style={{ background: `conic-gradient(${buildGradient()})` }} />
              <div className={styles.donutCenter}>
                <span className={styles.donutTotal}>{total}</span>
                <span className={styles.donutLabel}>Total</span>
              </div>
            </div>
            <div className={styles.legend}>
              {RATIO.map(r => (
                <div key={r.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: r.color }} />
                  <span className={styles.legendLabel}>{r.label}</span>
                  <span className={styles.legendCount}>{r.count}</span>
                  <span className={styles.legendPct}>
                    {total > 0 ? Math.round((r.count / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Thống kê nhanh
            </div>
            <div className={styles.quickStats}>
              {[
                { label: 'Cần xử lý',  val: byTab.pending.length,    color: '#DE1A1A' },
                { label: 'Đang xử lý', val: byTab.processing.length, color: '#8B85C1' },
                { label: 'Hoàn thành', val: byTab.done.length,       color: '#2ecc71' },
                { label: 'Tổng cộng',  val: total,                   color: null },
              ].map(s => (
                <div key={s.label} className={styles.quickStat}>
                  <span className={styles.quickStatLabel}>{s.label}</span>
                  <span className={styles.quickStatNum} style={s.color ? { color: s.color } : {}}>
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
