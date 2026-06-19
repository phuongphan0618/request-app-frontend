'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../lib/useTheme';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getOwnerBatches, clearTokens } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../batch/Batch.module.css';

function norm(data) {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OwnerPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard('owner');

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOwnerBatches();
      setBatches(norm(data));
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  if (!ready) return null;
  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.navBrand}>Access Request System</span>
        </div>

        <div className={styles.navRight}>
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

          <button
            className={styles.navIconBtn}
            onClick={() => { clearTokens(); router.push('/login'); }}
            title="Đăng xuất"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.title}>Batch cần xử lý</h2>
            {!loading && (
              <span className={styles.countText}>
                <strong>{batches.length}</strong> batch
              </span>
            )}
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Số item</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className={styles.loadingState}>Đang tải…</td></tr>
                ) : batches.length === 0 ? (
                  <tr><td colSpan={3} className={styles.emptyState}>Không có batch nào cần xử lý.</td></tr>
                ) : batches.map(b => (
                  <tr
                    key={b.id}
                    className={styles.clickableRow}
                    onClick={() => router.push(`/owner_batch_details?id=${b.id}`)}
                  >
                    <td><strong>#{b.id}</strong></td>
                    <td>{b.item_count ?? 0}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(b.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
