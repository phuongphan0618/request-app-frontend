'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { getBatchDetail, sendBatch, clearTokens } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import shared from '../../components/requester/Requester.module.css';
import styles from './BatchDetails.module.css';

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusInfo(status) {
  if (status === 'sent') return { label: 'Đã gửi', cls: 'statusCompleted' };
  return { label: 'Chờ gửi', cls: 'statusPending' };
}

function BatchDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isDark, toggleTheme } = useTheme();

  const [batch,      setBatch]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [sending,    setSending]    = useState(false);
  const [sendError,  setSendError]  = useState('');

  const loadBatch = useCallback(() => {
    if (!id) {
      setError('Không tìm thấy batch.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getBatchDetail(id)
      .then(setBatch)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadBatch(); }, [loadBatch]);

  async function handleSend() {
    setSending(true);
    setSendError('');
    try {
      await sendBatch(id);
      loadBatch();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  const { label, cls } = getStatusInfo(batch?.status);
  const ownerName = batch?.owner_detail?.name ?? batch?.owner_detail?.email ?? '—';

  return (
    <div className={`${shared.container} ${isDark ? '' : shared.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/batch')} title="Quay lại">
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
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button type="button" className={styles.navIconBtn} onClick={() => { clearTokens(); router.push('/login'); }} title="Đăng xuất">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
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
              {/* Title + status + send action */}
              <div className={styles.card}>
                <div className={styles.titleRow}>
                  <div className={styles.titleLeft}>
                    <h1 className={styles.title}>Batch #{batch.id}</h1>
                  </div>
                  <div className={styles.titleRight}>
                    <span className={`${styles.statusBadge} ${styles[cls]}`}>{label}</span>
                    {batch.status === 'waiting' && (
                      <button
                        type="button"
                        className={styles.sendBtn}
                        disabled={sending}
                        onClick={handleSend}
                      >
                        {sending ? 'Đang gửi…' : 'Gửi cho owner'}
                      </button>
                    )}
                  </div>
                </div>
                {sendError && <p className={styles.modalError}>{sendError}</p>}
              </div>

              {/* General info */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Thông tin chung</div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Owner</span>
                    <span className={styles.infoValue}>{ownerName}</span>
                    {batch.owner_detail?.email && (
                      <span className={styles.infoValueSub}>{batch.owner_detail.email}</span>
                    )}
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Số lượng item</span>
                    <span className={styles.infoValue}>{batch.items?.length ?? 0}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Ngày tạo</span>
                    <span className={styles.infoValue}>{fmtDateTime(batch.created_at)}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Ngày gửi</span>
                    <span className={styles.infoValue}>{fmtDateTime(batch.sent_at)}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className={styles.card}>
                {(() => {
                  const validItems = (batch.items ?? []).filter(item => item.status !== 'rejected_by_admin');
                  const rejectedCount = (batch.items ?? []).length - validItems.length;
                  return (
                    <>
                      <div className={styles.cardHeader}>Danh sách ứng dụng ({validItems.length}{rejectedCount > 0 ? `, ${rejectedCount} bị từ chối` : ''})</div>
                      {validItems.length === 0 ? (
                        <div className={styles.emptyState}>Không có ứng dụng nào.</div>
                      ) : (
                        <table className={styles.itemsTable}>
                          <thead>
                            <tr>
                              <th>Request ID</th>
                              <th>Ứng dụng</th>
                              <th>Owner</th>
                              <th>Trạng thái</th>
                              <th>Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody>
                            {validItems.map(item => (
                              <tr key={item.id}>
                                <td><strong>{item.access_request_id ?? '—'}</strong></td>
                                <td>
                                  {item.application_name}
                                  {item.application_code && <div className={styles.appCode}>{item.application_code}</div>}
                                </td>
                                <td>{item.owner_email ?? '—'}</td>
                                <td>{item.status ?? '—'}</td>
                                <td>{item.owner_note ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BatchDetailsPage() {
  return (
    <Suspense fallback={<div />}>
      <BatchDetailsContent />
    </Suspense>
  );
}