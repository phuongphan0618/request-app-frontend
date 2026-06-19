'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../lib/useTheme';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../../lib/useAuthGuard';
import styles from './Batch.module.css';
import LoginBackground from '../../components/login/LoginBackground';
import { getBatches, clearTokens } from '../../lib/api';

function norm(data) {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const BATCH_STATUS_INFO = {
  waiting: { label: 'Chờ gửi', cls: 'statusPending' },
  sent:    { label: 'Đã gửi',  cls: 'statusCompleted' },
};

export default function BatchPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard('sub-admin');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search,     setSearch]     = useState('');

  const [allBatches, setAllBatches] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBatches();
      setAllBatches(norm(data));
    } catch {
      setAllBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const searchLower = search.toLowerCase().trim();
  const batches = searchLower
    ? allBatches.filter(b =>
        (b.owner_email?.toLowerCase() + ' ' + (b.owner_name?.toLowerCase() || '')).includes(searchLower)
      )
    : allBatches;

  if (!ready) return null;

  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.navBrand} onClick={() => router.push('/dashboard')}>
            Access Request System
          </span>
          <div className={styles.navLinks}>
            <button className={styles.navLink} onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className={`${styles.navLink} ${styles.navLinkActive}`}>Batch</button>
          </div>
        </div>

        <div className={styles.navRight}>
          <div className={styles.searchBar}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm theo owner…"
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

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
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.title}>Danh sách Batch</h2>
            <span className={styles.countText}>
              Hiển thị <strong>{batches.length}</strong> / {allBatches.length} batch
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Owner</th>
                  <th>Số lượng item</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.loadingState}>Đang tải…</td></tr>
                ) : batches.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyState}>Không có batch nào.</td></tr>
                ) : batches.map(batch => {
                  const info = BATCH_STATUS_INFO[batch.status] ?? { label: batch.status, cls: 'statusPending' };
                  return (
                    <tr
                      key={batch.id}
                      className={styles.clickableRow}
                      onClick={() => router.push(`/batch_details?id=${batch.id}`)}
                    >
                      <td><strong>#{batch.id}</strong></td>
                      <td>{batch.owner_name ?? batch.owner_email ?? '—'}</td>
                      <td>{batch.item_count ?? '—'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[info.cls]}`}>{info.label}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(batch.created_at)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(batch.sent_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}