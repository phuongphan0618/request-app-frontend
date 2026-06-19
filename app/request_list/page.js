'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getMyRequests, clearTokens } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import shared from '../../components/requester/Requester.module.css';
import styles from './RequestList.module.css';

function norm(data) {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Requester chỉ cần biết: đang chờ duyệt hoặc bị từ chối
function getStatusInfo(status) {
  if (status === 'rejected_by_admin') {
    return { label: 'Bị từ chối', cls: 'statusRejected' };
  }
  return { label: 'Đang chờ duyệt', cls: 'statusPending' };
}

export default function RequestListPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard('requester');

  const [myRequests,  setMyRequests]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    getMyRequests()
      .then(d => setMyRequests(norm(d)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = myRequests.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      r.items?.some(item => item.application_name?.toLowerCase().includes(q)) ||
      r.domain_name?.toLowerCase().includes(q) ||
      r.department_name?.toLowerCase().includes(q)
    );
  });

  if (!ready) return null;
  return (
    <div className={`${shared.container} ${isDark ? '' : shared.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <nav className={shared.navbar}>
        <div className={shared.navLeft}>
          <span className={shared.navBrand}>Access Request System</span>
        </div>

        <div className={shared.navCenter}>
          <button type="button" className={shared.navTab} onClick={() => router.push('/form')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Yêu cầu mới
          </button>
          <button type="button" className={`${shared.navTab} ${shared.navTabActive}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Yêu cầu của tôi
            {myRequests.length > 0 && (
              <span className={shared.navTabBadge}>{myRequests.length}</span>
            )}
          </button>
        </div>

        <div className={shared.navRight}>
          <button type="button" className={shared.navIconBtn} onClick={toggleTheme} title="Đổi giao diện">
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
          <button type="button" className={shared.navIconBtn} onClick={() => { clearTokens(); router.push('/login'); }} title="Đăng xuất">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── List ── */}
      <div className={shared.content}>
        <div className={styles.listPanel}>
          <div className={styles.listHeader}>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>Yêu cầu của tôi</h2>
              {!loading && (
                <span className={styles.countBadge}>{filtered.length} yêu cầu</span>
              )}
            </div>
            <div className={styles.searchBar}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm theo app, domain, PNL..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && <div className={shared.errorBanner}>{error}</div>}

          <div className={styles.listBody}>
            {loading ? (
              <div className={shared.emptyState}>Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className={shared.emptyState}>
                {search
                  ? 'Không tìm thấy yêu cầu phù hợp.'
                  : 'Bạn chưa có yêu cầu nào. Tạo yêu cầu mới ở tab bên cạnh!'}
              </div>
            ) : filtered.map(r => {
              const { label, cls } = getStatusInfo(r.status);
              return (
                <div
                  key={r.id}
                  className={styles.row}
                  onClick={() => router.push(`/request_details?id=${r.id}`)}
                >
                  {/* ID + date */}
                  <div className={styles.rowId}>
                    <span className={styles.idText}>#{r.id}</span>
                    <span className={styles.dateText}>{fmtDate(r.created_at)}</span>
                  </div>

                  {/* Apps + meta */}
                  <div className={styles.rowInfo}>
                    <div className={styles.appList}>
                      {r.items?.slice(0, 3).map(item => (
                        <span key={item.id} className={shared.appTag}>{item.application_name}</span>
                      ))}
                      {r.items?.length > 3 && (
                        <span className={`${shared.appTag} ${shared.appTagMore}`}>+{r.items.length - 3}</span>
                      )}
                    </div>
                    <div className={styles.metaList}>
                      {r.department_name && <span className={styles.metaChip}>{r.department_name}</span>}
                      {r.domain_name && <span className={styles.metaChip}>{r.domain_name}</span>}
                      {r.is_urgent && <span className={styles.urgentChip}>⚡ Gấp</span>}
                    </div>
                  </div>

                  {/* Status + deadline */}
                  <div className={styles.rowRight}>
                    <span className={`${shared.statusBadge} ${shared[cls]}`}>{label}</span>
                    {r.deadline && (
                      <span className={styles.deadlineText}>Hạn: {fmtDate(r.deadline)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
