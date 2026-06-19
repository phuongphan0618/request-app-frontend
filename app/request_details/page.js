'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getAccessRequestDetail, getMyRequestDetail, cancelMyRequest, disputeMyRequest, revertAccessRequest, clearTokens } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import shared from '../../components/requester/Requester.module.css';
import styles from './RequestDetails.module.css';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusInfo(status) {
  switch (status) {
    case 'rejected_by_admin':
      return { label: 'Bị từ chối', cls: 'statusRejected' };
    case 'approved':
    case 'completed':
      return { label: 'Đã hoàn thành', cls: 'statusCompleted' };
    case 'canceled':
    case 'cancelled':
      return { label: 'Đã hủy', cls: 'statusCanceled' };
    default:
      return { label: 'Đang chờ duyệt', cls: 'statusPending' };
  }
}

function RequestDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard(null);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [revertReason, setRevertReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [role] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('user_role') || '') : null
  );

  useEffect(() => {
    if (role === null) return;
    if (!id) {
      setError('Không tìm thấy yêu cầu.');
      setLoading(false);
      return;
    }
    const fetchDetail = role === 'requester' ? getMyRequestDetail : getAccessRequestDetail;
    fetchDetail(id)
      .then(setRequest)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, role]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy yêu cầu này?')) return;
    setCanceling(true);
    try {
      await cancelMyRequest(id);
      setRequest(prev => ({ ...prev, status: 'canceled' }));
      setError('');
    } catch (e) {
      setError(e.message || 'Hủy yêu cầu thất bại');
    } finally {
      setCanceling(false);
    }
  };

  const handleRevert = () => {
    setRevertReason('');
    setShowRevertDialog(true);
  };

  const handleRevertConfirm = async () => {
    if (!revertReason.trim()) {
      alert('Vui lòng nhập lý do hoàn tác');
      return;
    }
    setReverting(true);
    setShowRevertDialog(false);
    try {
      await revertAccessRequest(id, revertReason.trim());
      await getAccessRequestDetail(id).then(setRequest);
      setError('');
      setRevertReason('');
    } catch (e) {
      setError(e.message || 'Hoàn tác yêu cầu thất bại');
    } finally {
      setReverting(false);
    }
  };

  const handleRevertCancel = () => {
    setShowRevertDialog(false);
    setRevertReason('');
  };

  const handleDispute = () => {
    setDisputeReason('');
    setShowDisputeDialog(true);
  };

  const handleDisputeConfirm = async () => {
    if (!disputeReason.trim()) {
      alert('Vui lòng nhập lý do khiếu nại');
      return;
    }
    setDisputing(true);
    setShowDisputeDialog(false);
    try {
      await disputeMyRequest(id, disputeReason.trim());
      await getMyRequestDetail(id).then(setRequest);
      setError('');
      setDisputeReason('');
    } catch (e) {
      setError(e.message || 'Khiếu nại yêu cầu thất bại');
    } finally {
      setDisputing(false);
    }
  };

  const handleDisputeCancel = () => {
    setShowDisputeDialog(false);
    setDisputeReason('');
  };

  const backHref = role === 'requester' ? '/request_list' : '/dashboard';
  const canCancel = role === 'requester' && request && ['pending_admin', 'pending_owner'].includes(request.status);
  const canRevert = (role === 'admin' || role === 'sub-admin') && request && ['pending_owner', 'rejected_by_admin'].includes(request.status);
  const canDispute = role === 'requester' && request && request.status === 'rejected_by_admin';

  const { label, cls } = getStatusInfo(request?.status);

  if (!ready) return null;
  return (
    <div className={`${shared.container} ${isDark ? '' : shared.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push(backHref)} title="Quay lại">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.navBrand}>Chi tiết yêu cầu</span>
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
          ) : !request ? (
            !error && <div className={styles.emptyState}>Không có dữ liệu yêu cầu.</div>
          ) : (
            <>
              {/* Title + status */}
              <div className={styles.card}>
                <div className={styles.titleRow}>
                  <div className={styles.titleLeft}>
                    <h1 className={styles.title}>Yêu cầu #{request.id}</h1>
                    {request.is_urgent && <span className={styles.urgentChip}>⚡ Gấp</span>}
                  </div>
                  <div className={styles.titleRight}>
                    <span className={`${styles.statusBadge} ${styles[cls]}`}>{label}</span>
                    {canCancel && (
                      <button
                        onClick={handleCancel}
                        disabled={canceling}
                        className={styles.cancelBtn}
                        title="Hủy yêu cầu"
                      >
                        {canceling ? 'Đang hủy...' : 'Hủy yêu cầu'}
                      </button>
                    )}
                    {canDispute && (
                      <button
                        onClick={handleDispute}
                        disabled={disputing}
                        className={styles.disputeBtn}
                        title="Khiếu nại yêu cầu"
                      >
                        {disputing ? 'Đang khiếu nại...' : 'Khiếu nại'}
                      </button>
                    )}
                    {canRevert && (
                      <button
                        onClick={handleRevert}
                        disabled={reverting}
                        className={styles.revertBtn}
                        title="Hoàn tác yêu cầu"
                      >
                        {reverting ? 'Đang hoàn tác...' : 'Hoàn tác'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* General info */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Thông tin chung</div>
                <div className={styles.infoGrid}>
                  {role !== 'requester' && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Người yêu cầu</span>
                      <span className={styles.infoValue}>
                        {request.requester_detail?.first_name || request.requester_detail?.last_name
                          ? `${request.requester_detail.first_name ?? ''} ${request.requester_detail.last_name ?? ''}`.trim()
                          : request.requester_detail?.email || request.requester || '—'}
                      </span>
                      {request.requester_detail?.email && (
                        <span className={styles.infoValueSub}>{request.requester_detail.email}</span>
                      )}
                    </div>
                  )}
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>PNL</span>
                    <span className={styles.infoValue}>{request.department_name ?? '—'}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Domain</span>
                    <span className={styles.infoValue}>{request.domain_name ?? '—'}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Hạn xử lý</span>
                    <span className={styles.infoValue}>{fmtDate(request.deadline)}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Ngày tạo</span>
                    <span className={styles.infoValue}>{fmtDateTime(request.created_at)}</span>
                  </div>
                  {request.reviewed_by_email && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Người duyệt</span>
                      <span className={styles.infoValue}>{request.reviewed_by_email}</span>
                    </div>
                  )}
                  {request.reviewed_at && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Ngày duyệt</span>
                      <span className={styles.infoValue}>{fmtDateTime(request.reviewed_at)}</span>
                    </div>
                  )}
                  {request.review_note && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Ghi chú admin</span>
                      <span className={styles.infoValue}>{request.review_note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              {request.reason && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>Lý do yêu cầu</div>
                  <p className={styles.reasonText}>{request.reason}</p>
                </div>
              )}

              {/* Review note */}
              {request.review_note && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>Ghi chú của người duyệt</div>
                  <p className={styles.reasonText}>{request.review_note}</p>
                </div>
              )}

              {/* Items */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Danh sách ứng dụng ({request.items?.length ?? 0})</div>
                {(request.items?.length ?? 0) === 0 ? (
                  <div className={styles.emptyState}>Không có ứng dụng nào.</div>
                ) : (
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Ứng dụng</th>
                        <th>Owner</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.items.map(item => {
                        const itemStatus = request.status === 'rejected_by_admin' ? 'rejected_by_admin' : item.status;
                        return (
                          <tr key={item.id}>
                            <td>
                              {item.application_name}
                              {item.application_code && <div className={styles.appCode}>{item.application_code}</div>}
                            </td>
                            <td>{item.owner_email ?? '—'}</td>
                            <td>{getStatusInfo(itemStatus).label}</td>
                            <td>{item.owner_note ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Dispute info */}
              {request.dispute_reason && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>Tranh chấp</div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Lý do tranh chấp</span>
                      <p className={styles.reasonText}>{request.dispute_reason}</p>
                    </div>
                    {request.disputed_at && (
                      <div className={styles.infoBlock}>
                        <span className={styles.infoLabel}>Ngày tranh chấp</span>
                        <span className={styles.infoValue}>{fmtDateTime(request.disputed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Revert reason dialog */}
      {showRevertDialog && (
        <>
          <div className={styles.dialogBackdrop} onClick={handleRevertCancel} />
          <div className={styles.dialogBox}>
            <h3 className={styles.dialogTitle}>Lý do hoàn tác</h3>
            <textarea
              className={styles.dialogInput}
              placeholder="Nhập lý do hoàn tác yêu cầu..."
              value={revertReason}
              onChange={e => setRevertReason(e.target.value)}
              rows={4}
            />
            <div className={styles.dialogActions}>
              <button
                className={styles.dialogBtnCancel}
                onClick={handleRevertCancel}
                disabled={reverting}
              >
                Hủy
              </button>
              <button
                className={styles.dialogBtnConfirm}
                onClick={handleRevertConfirm}
                disabled={reverting || !revertReason.trim()}
              >
                {reverting ? 'Đang hoàn tác...' : 'Hoàn tác'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dispute reason dialog */}
      {showDisputeDialog && (
        <>
          <div className={styles.dialogBackdrop} onClick={handleDisputeCancel} />
          <div className={styles.dialogBox}>
            <h3 className={styles.dialogTitle}>Lý do khiếu nại</h3>
            <textarea
              className={styles.dialogInput}
              placeholder="Nhập lý do khiếu nại yêu cầu..."
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              rows={4}
            />
            <div className={styles.dialogActions}>
              <button
                className={styles.dialogBtnCancel}
                onClick={handleDisputeCancel}
                disabled={disputing}
              >
                Hủy
              </button>
              <button
                className={styles.dialogBtnConfirm}
                onClick={handleDisputeConfirm}
                disabled={disputing || !disputeReason.trim()}
              >
                {disputing ? 'Đang khiếu nại...' : 'Khiếu nại'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RequestDetailsPage() {
  return (
    <Suspense fallback={<div />}>
      <RequestDetailsContent />
    </Suspense>
  );
}