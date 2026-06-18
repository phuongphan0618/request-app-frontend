'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getUsers, deleteUser } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import AdminNav from '../../components/AdminNav';
import styles from './UserList.module.css';

function getInitials(first_name, last_name) {
  return `${last_name?.[0] ?? ''}${first_name?.[0] ?? ''}`.toUpperCase();
}

export default function UserListPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getUsers()
      .then(data => setAllUsers(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteUser(confirmId);
      setAllUsers(prev => prev.filter(u => u.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const confirmUser = allUsers.find(u => u.id === confirmId);

  const q = search.toLowerCase();

  const requesters = allUsers.filter(u => u.groups?.includes('requester'));
  const owners     = allUsers.filter(u => u.groups?.includes('owner'));

  const filteredRequesters = requesters.filter(u =>
    `${u.last_name} ${u.first_name}`.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  );
  const filteredOwners = owners.filter(u =>
    `${u.last_name} ${u.first_name}`.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  );

  return (
    <main className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />
      <AdminNav current="/user-list" />

      {/* ── Confirm Delete Modal ── */}
      {confirmId && (
        <div className={styles.modalOverlay} onClick={() => setConfirmId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Xác nhận xóa tài khoản</h3>
            <p className={styles.modalSub}>
              <strong>{confirmUser?.last_name} {confirmUser?.first_name}</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>{confirmUser?.email}</span>
            </p>
            <p className={styles.modalWarn}>Hành động này không thể hoàn tác.</p>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setConfirmId(null)}>Hủy</button>
              <button className={styles.btnDelete} disabled={deleting} onClick={handleDelete}>
                {deleting ? '…' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.headerBar}>
          <div className={styles.titleWrapper}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => router.push('/dashboard')}
              title="Quay lại"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className={styles.title}>Danh Sách Người Dùng</h1>
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={styles.themeToggle} onClick={toggleTheme} title="Đổi giao diện">
            {isDark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Two columns */}
        <div className={styles.columns}>

          {/* Requester column */}
          <div className={styles.column}>
            <div className={`${styles.columnHeader} ${styles.columnHeaderRequester}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Người yêu cầu
              <span className={`${styles.columnBadge} ${styles.badgeRequester}`}>{filteredRequesters.length}</span>
            </div>
            <div className={styles.userList}>
              {loading ? (
                <div className={styles.emptyState}>Đang tải...</div>
              ) : filteredRequesters.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy người dùng.</div>
              ) : filteredRequesters.map(u => (
                <div key={u.id} className={styles.userRow}>
                  <div className={styles.avatar}>
                    {getInitials(u.first_name, u.last_name)}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{u.last_name} {u.first_name}</span>
                    <span className={styles.userEmail}>{u.email}</span>
                  </div>
                  <div className={styles.userMeta}>
                    <span className={`${styles.statusBadge} ${u.is_active ? styles.statusActive : styles.statusInactive}`}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                  <button className={styles.deleteBtn} title="Xóa tài khoản" onClick={() => setConfirmId(u.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Owner column */}
          <div className={styles.column}>
            <div className={`${styles.columnHeader} ${styles.columnHeaderOwner}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Chủ sở hữu
              <span className={`${styles.columnBadge} ${styles.badgeOwner}`}>{filteredOwners.length}</span>
            </div>
            <div className={styles.userList}>
              {loading ? (
                <div className={styles.emptyState}>Đang tải...</div>
              ) : filteredOwners.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy owner.</div>
              ) : filteredOwners.map(u => (
                <div key={u.id} className={styles.userRow}>
                  <div className={`${styles.avatar} ${styles.avatarOwner}`}>
                    {getInitials(u.first_name, u.last_name)}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{u.last_name} {u.first_name}</span>
                    <span className={styles.userEmail}>{u.email}</span>
                  </div>
                  <div className={styles.userMeta}>
                    <span className={`${styles.statusBadge} ${u.is_active ? styles.statusActive : styles.statusInactive}`}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                    {u.app_names?.length > 0 && (
                      <div className={styles.appTags}>
                        {u.app_names.slice(0, 2).map(app => (
                          <span key={app} className={styles.appTag}>{app}</span>
                        ))}
                        {u.app_names.length > 2 && (
                          <span className={`${styles.appTag} ${styles.appTagMore}`}>+{u.app_names.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button className={styles.deleteBtn} title="Xóa tài khoản" onClick={() => setConfirmId(u.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
