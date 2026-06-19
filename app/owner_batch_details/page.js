'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getOwnerBatchDetail, approveItem, rejectItem, revertItem, clearTokens } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import styles from '../batch_details/BatchDetails.module.css';

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ITEM_STATUS_INFO = {
  pending_owner:      { label: 'Chờ xử lý',  cls: 'statusPending' },
  approved:           { label: 'Đã duyệt',    cls: 'statusCompleted' },
  rejected_by_owner:  { label: 'Từ chối',     cls: 'statusPending' },
};

function getItemStatusInfo(status) {
  return ITEM_STATUS_INFO[status] ?? { label: status ?? '—', cls: 'statusPending' };
}

function OwnerBatchDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard('owner');

  const [batch,     setBatch]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Modal state for reject
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [rejectNote,    setRejectNote]    = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [actionError,   setActionError]   = useState('');

  const loadBatch = useCallback(() => {
    if (!id) { setError('Không tìm thấy batch.'); setLoading(false); return; }
    setLoading(true);
    getOwnerBatchDetail(id)
      .then(setBatch)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadBatch(); }, [loadBatch]);

  async function handleApprove(item) {
    setActionError('');
    try {
      await approveItem(id, item.id);
      loadBatch();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectNote.trim()) { setActionError('Phải nhập lý do từ chối.'); return; }
    setSubmitting(true);
    setActionError('');
    try {
      await rejectItem(id, rejectTarget.id, rejectNote.trim());
      setRejectTarget(null);
      setRejectNote('');
      loadBatch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevert(item) {
    setActionError('');
    try {
      await revertItem(id, item.id);
      loadBatch();
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (!ready) return null;
  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <div className={styles.modalOverlay} onClick={() => { setRejectTarget(null); setRejectNote(''); setActionError(''); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Từ chối ứng dụng</h3>
            <p className={styles.modalSub}>{rejectTarget.application_name}</p>
            <textarea
              className={styles.modalNote}
              rows={3}
              placeholder="Lý do từ chối (bắt buộc)…"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            {actionError && <p className={styles.modalError}>{actionError}</p>}
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => { setRejectTarget(null); setRejectNote(''); setActionError(''); }}
              >
                Hủy
              </button>
              <button
                className={styles.btnDanger}
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
          <button type="button" className={styles.backBtn} onClick={() => router.push('/owner')} title="Quay lại">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.navBrand}>Chi tiết Batch</span>
        </div>

        <div className={styles.navRight}>
          <button type="button" className={styles.navIconBtn} onClick={toggleTheme} title="Đổi giao diện">
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
          <button type="button" className={styles.navIconBtn} onClick={() => { clearTokens(); router.push('/login'); }} title="Đăng xuất">
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
          {error && <div className={styles.errorBanner}>{error}</div>}

          {loading ? (
            <div className={styles.emptyState}>Đang tải...</div>
          ) : !batch ? (
            !error && <div className={styles.emptyState}>Không có dữ liệu batch.</div>
          ) : (
            <>
              {/* Title */}
              <div className={styles.card}>
                <div className={styles.titleRow}>
                  <h1 className={styles.title}>Batch #{batch.id}</h1>
                  <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Đã gửi</span>
                </div>
                {actionError && !rejectTarget && <p className={styles.modalError}>{actionError}</p>}
              </div>

              {/* Info */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Thông tin chung</div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Ngày gửi</span>
                    <span className={styles.infoValue}>{fmtDateTime(batch.sent_at)}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Số lượng item</span>
                    <span className={styles.infoValue}>{batch.items?.length ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Danh sách ứng dụng ({batch.items?.length ?? 0})</div>
                {(batch.items?.length ?? 0) === 0 ? (
                  <div className={styles.emptyState}>Không có ứng dụng nào.</div>
                ) : (
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Ứng dụng</th>
                        <th>Requester</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                        <th style={{ width: '120px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.items.map(item => {
                        const { label, cls } = getItemStatusInfo(item.status);
                        const isPending = item.status === 'pending_owner';
                        const isDone    = item.status === 'approved' || item.status === 'rejected_by_owner';
                        return (
                          <tr key={item.id}>
                            <td>
                              {item.application_name}
                              {item.application_code && <div className={styles.appCode}>{item.application_code}</div>}
                            </td>
                            <td>{item.owner_email ?? '—'}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles[cls]}`}>{label}</span>
                            </td>
                            <td>{item.owner_note || '—'}</td>
                            <td>
                              {isPending && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className={styles.btnApprove}
                                    title="Duyệt"
                                    onClick={() => handleApprove(item)}
                                  >✓</button>
                                  <button
                                    className={styles.btnDanger}
                                    title="Từ chối"
                                    onClick={() => { setRejectTarget(item); setRejectNote(''); setActionError(''); }}
                                  >✗</button>
                                </div>
                              )}
                              {isDone && (
                                <button
                                  className={styles.btnSecondary}
                                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                                  onClick={() => handleRevert(item)}
                                >
                                  Hoàn tác
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OwnerBatchDetailsPage() {
  return (
    <Suspense fallback={<div />}>
      <OwnerBatchDetailsContent />
    </Suspense>
  );
}
