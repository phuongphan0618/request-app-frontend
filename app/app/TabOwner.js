'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './App.module.css';
import { fmtDate, shortId } from './helpers';
import { ClockIcon } from './TabAdmin';
import { getOwnerBatches, getOwnerBatch, approveOwnerItem, rejectOwnerItem, revertOwnerItem } from '../../lib/api';

// ── Confirm modal ─────────────────────────────────────────────

function ActionModal({ title, message, isReject, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}
        style={{ maxWidth: 380, textAlign: 'center', padding: '2rem 1.75rem 1.5rem', position: 'relative' }}>
        <button className={styles.modalClose} onClick={onCancel}
          style={{ position: 'absolute', top: 12, right: 12 }}>✕</button>

        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: isReject ? 'rgba(222,26,26,0.1)' : 'rgba(34,197,94,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
        }}>
          {isReject ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
          {message}
        </p>

        {isReject && (
          <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Lý do từ chối&nbsp;
              <span style={{ opacity: 0.45, fontWeight: 400, fontSize: '0.75rem' }}>(tuỳ chọn)</span>
            </label>
            <textarea
              className={styles.formInput}
              rows={3}
              placeholder="Nhập lý do từ chối…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ resize: 'none', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => onConfirm(reason)}
            className={styles.btnPrimary}
            style={{ minWidth: 88, ...(isReject ? {} : { background: '#22c55e', borderColor: '#22c55e' }) }}
          >Xác nhận</button>
          <button className={styles.btnSecondary} onClick={onCancel} style={{ minWidth: 88 }}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

function RevertReasonModal({ label, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [error, setError]   = useState('');

  function submit() {
    if (!reason.trim()) { setError('Vui lòng nhập lý do hoàn tác.'); return; }
    onConfirm(reason.trim());
  }

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Hoàn tác "{label}"</h3>
          <button className={styles.modalClose} onClick={onCancel}>✕</button>
        </div>
        <div className={styles.modalForm}>
          {error && <div className={styles.modalError}>{error}</div>}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Lý do hoàn tác <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.formInput}
              rows={3}
              placeholder="Nhập lý do hoàn tác…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ resize: 'none', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnPrimary} onClick={submit}>Xác nhận hoàn tác</button>
            <button type="button" className={styles.btnSecondary} onClick={onCancel}>Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Batch Full Card ───────────────────────────────────────────

function BatchFullCard({ batch, setModal, onApproveItem }) {
  const items        = batch.items || [];
  const pendingCount = items.filter(i => i.status === 'pending_owner').length;
  const isUrgent     = batch.is_urgent || items.some(i => i.is_urgent);

  const nearestDeadline = useMemo(() => {
    const dates = items.map(i => i.deadline).filter(Boolean).map(d => new Date(d));
    return dates.length ? new Date(Math.min(...dates)) : null;
  }, [items]);

  return (
    <div className={styles.batchFullCard}>

      {/* ── Header ── */}
      <div className={styles.batchFullCardHeader}>
        <div className={styles.batchFullCardLeft}>
          <div className={styles.batchFullCardIdRow}>
            <span className={styles.batchFullCardId}>{shortId(batch.id)}</span>
            {isUrgent && <ClockIcon />}
          </div>
          <div className={styles.batchFullCardCountRow}>
            <span className={styles.batchFullCardCountNum}>{items.length}</span>
            <span className={styles.batchFullCardCountLabel}>ứng dụng</span>
          </div>
        </div>

        <div className={styles.batchFullCardRight}>
          <span className={styles.batchFullCardDate}>Gửi: {fmtDate(batch.sent_at)}</span>
          <div className={styles.batchFullCardBulkBtns}>
            {nearestDeadline && (
              <div className={`${styles.reqCardDeadlineRow} ${isUrgent ? styles.reqCardDeadlineUrgent : ''}`} style={{ width: 'fit-content', alignSelf: 'flex-end' }}>
                <span className={styles.reqCardDeadlineLabel}>Deadline</span>
                <span className={styles.reqCardDeadlineVal}>{fmtDate(nearestDeadline)}</span>
              </div>
            )}
            {pendingCount > 0 && (<>
              <button
                className={styles.ownerApproveBtn}
                onClick={() => setModal({ type: 'approve-all', batchId: batch.id, pendingCount })}
              >Chấp nhận tất cả</button>
              <button
                className={styles.ownerRejectBtn}
                onClick={() => setModal({ type: 'reject-all', batchId: batch.id, pendingCount })}
              >Từ chối tất cả</button>
            </>)}
          </div>
        </div>
      </div>

      {/* ── Items table ── */}
      <table className={styles.batchItemTable}>
        <colgroup>
          <col />
          <col style={{ width: 110 }} />
          <col style={{ width: 136 }} />
        </colgroup>
        <thead>
          <tr className={styles.batchItemThead}>
            <th>Ứng dụng</th>
            <th>Deadline</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isPending = item.status === 'pending_owner';
            return (
              <tr key={item.id} className={styles.batchItemRow}>
                {/* App name + requester */}
                <td className={styles.batchItemNameCell}>
                  <div className={styles.batchItemAppName}>{item.application_name}</div>
                  <div className={styles.batchItemRequester}>
                    {item.requester_name
                      ? <><span>{item.requester_name}</span><span>{item.requester_email || ''}</span></>
                      : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.69rem' }}>
                          #{shortId(item.access_request_id)}
                        </span>
                    }
                  </div>
                </td>

                {/* Deadline */}
                <td className={styles.batchItemDeadlineCell}>
                  {item.deadline ? fmtDate(item.deadline) : '—'}
                </td>

                {/* Action */}
                <td className={styles.batchItemActionCell}>
                  {isPending ? (
                    <div className={styles.batchItemBtns}>
                      <button
                        className={styles.ownerItemApproveBtn}
                        onClick={() => onApproveItem(batch.id, item.id)}
                        title="Duyệt"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                      <button
                        className={styles.ownerItemRejectBtn}
                        onClick={() => setModal({ type: 'reject-item', batchId: batch.id, itemId: item.id, label: item.application_name })}
                        title="Từ chối"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.batchItemBtns}>
                      <span className={`${styles.badge} ${item.status === 'approved' ? styles.badgeApproved : styles.badgeRejected}`}>
                        {item.status === 'approved' ? 'Chấp nhận' : 'Từ chối'}
                      </span>
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: '0.22rem 0.6rem', fontSize: '0.71rem' }}
                        onClick={() => setModal({ type: 'revert-item', batchId: batch.id, itemId: item.id, label: item.application_name })}
                      >Hoàn tác</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab Owner ─────────────────────────────────────────────────

const PAGE_SIZE = 2;

export function TabOwner({ pushToast }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('pending');
  const [search, setSearch]   = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [sortBy, setSortBy]   = useState('sent_at');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(null);

  const inFlightRef  = useRef(false);
  const overridesRef = useRef(new Map());

  function applyOverrides(list) {
    return list.map(b => ({
      ...b,
      items: (b.items || []).map(it => {
        const key = `${b.id}:${it.id}`;
        const ov  = overridesRef.current.get(key);
        if (!ov) return it;
        if (Date.now() > ov.expiresAt || it.status === ov.fields.status) {
          overridesRef.current.delete(key);
          return it;
        }
        return { ...it, ...ov.fields };
      }),
    }));
  }

  async function fetchBatches(isInitial) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      if (isInitial) setLoading(true);
      const list     = await getOwnerBatches();
      const detailed = await Promise.all((list || []).map(b => getOwnerBatch(b.id)));
      setBatches(applyOverrides(detailed));
    } catch (err) {
      console.error('Lỗi tải batch:', err);
      if (isInitial) pushToast?.('Không thể tải danh sách batch', 'error', '✕');
    } finally {
      if (isInitial) setLoading(false);
      inFlightRef.current = false;
    }
  }

  useEffect(() => {
    fetchBatches(true);
    const interval = setInterval(() => fetchBatches(false), 800);
    return () => clearInterval(interval);
  }, []);

  function setItemOverride(batchId, itemId, fields) {
    const key = `${batchId}:${itemId}`;
    overridesRef.current.set(key, { fields, expiresAt: Date.now() + 15000 });
    setBatches(p => p.map(b => b.id !== batchId ? b : {
      ...b, items: b.items.map(i => i.id !== itemId ? i : { ...i, ...fields }),
    }));
  }

  const sorted = useMemo(() =>
    [...batches].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'deadline') {
        const deadlines = batch => (batch.items || []).map(i => i.deadline).filter(Boolean);
        const dA = deadlines(a); const dB = deadlines(b);
        valA = dA.length ? Math.min(...dA.map(d => new Date(d))) : Infinity;
        valB = dB.length ? Math.min(...dB.map(d => new Date(d))) : Infinity;
      } else {
        valA = new Date(a.sent_at); valB = new Date(b.sent_at);
      }
      return sortAsc ? valA - valB : valB - valA;
    }),
    [batches, sortAsc, sortBy]
  );

  function isBatchDone(b) {
    return (b.items || []).every(i => i.status !== 'pending_owner');
  }

  const pendingBatches = sorted.filter(b => !isBatchDone(b));
  const doneBatches    = sorted.filter(b =>  isBatchDone(b));
  const tabBatches     = tab === 'pending' ? pendingBatches : doneBatches;

  const filtered = search.trim()
    ? tabBatches.filter(b => b.id.toLowerCase().includes(search.trim().toLowerCase()))
    : tabBatches;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function approveItem(batchId, itemId) {
    try {
      await approveOwnerItem(batchId, itemId);
      setItemOverride(batchId, itemId, { status: 'approved', owner_note: 'Chấp nhận' });
    } catch (err) {
      pushToast?.(err.message || 'Không thể duyệt ứng dụng', 'error', '✕');
    }
  }

  async function handleRevertConfirm(reason) {
    const { batchId } = modal;
    setModal(null);
    try {
      const response     = await revertOwnerItem(batchId, modal.itemId, reason);
      const updatedBatch = Array.isArray(response?.items) ? response : await getOwnerBatch(batchId);
      setBatches(p => p.map(b => b.id === batchId ? updatedBatch : b));
      pushToast?.('Đã hoàn tác ứng dụng', 'info', '↩');
    } catch (err) {
      pushToast?.(err.message || 'Không thể hoàn tác ứng dụng', 'error', '✕');
    }
  }

  async function handleConfirm(reason) {
    const { type, batchId, itemId } = modal;
    setModal(null);
    try {
      if (type === 'reject-item') {
        await rejectOwnerItem(batchId, itemId, reason);
        setItemOverride(batchId, itemId, { status: 'rejected_by_owner', owner_note: reason || 'Từ chối' });
      } else if (type === 'approve-all') {
        const batch        = batches.find(b => b.id === batchId);
        const pendingItems = (batch.items || []).filter(i => i.status === 'pending_owner');
        await Promise.all(pendingItems.map(i => approveOwnerItem(batchId, i.id)));
        pendingItems.forEach(i => setItemOverride(batchId, i.id, { status: 'approved', owner_note: 'Chấp nhận' }));
      } else if (type === 'reject-all') {
        const batch        = batches.find(b => b.id === batchId);
        const pendingItems = (batch.items || []).filter(i => i.status === 'pending_owner');
        await Promise.all(pendingItems.map(i => rejectOwnerItem(batchId, i.id, reason)));
        pendingItems.forEach(i => setItemOverride(batchId, i.id, { status: 'rejected_by_owner', owner_note: reason || 'Từ chối' }));
      }
    } catch (err) {
      pushToast?.(err.message || 'Không thể xử lý batch', 'error', '✕');
    }
  }

  const isReject = modal?.type === 'reject-item' || modal?.type === 'reject-all';
  const modalMessage = !modal ? '' :
    modal.type === 'approve-all' ? `Chấp nhận tất cả ${modal.pendingCount} ứng dụng đang chờ trong ${shortId(modal.batchId)}?` :
    modal.type === 'reject-all'  ? `Từ chối tất cả ${modal.pendingCount} ứng dụng đang chờ trong ${shortId(modal.batchId)}?` :
    `Từ chối quyền truy cập cho "${modal.label}"?`;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray)' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div>
      {modal && modal.type === 'revert-item' && (
        <RevertReasonModal label={modal.label} onConfirm={handleRevertConfirm} onCancel={() => setModal(null)} />
      )}
      {modal && modal.type !== 'revert-item' && (
        <ActionModal
          title={isReject ? 'Xác nhận từ chối' : 'Xác nhận duyệt'}
          message={modalMessage}
          isReject={isReject}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Batch cần xử lý</h2>
          <p className={styles.panelDesc}>Các ứng dụng bạn sở hữu đang chờ phê duyệt</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className={styles.subTabs}>
        {[
          { key: 'pending', label: 'Chưa xử lý', count: pendingBatches.length },
          { key: 'done',    label: 'Đã xử lý',   count: doneBatches.length    },
        ].map(t => (
          <button key={t.key}
            className={`${styles.subTab} ${tab === t.key ? styles.subTabActive : ''}`}
            onClick={() => { setTab(t.key); setSearch(''); setPage(1); }}
          >
            {t.label}<span className={styles.subTabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.mgmtSearch}
            placeholder="Tìm batch ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '3px 4px' }}>
          {[{ key: 'sent_at', label: 'Ngày gửi' }, { key: 'deadline', label: 'Deadline' }].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              style={{
                padding: '4px 10px', fontSize: '0.78rem', fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
                background: sortBy === opt.key ? 'var(--color-red)' : 'transparent',
                color: sortBy === opt.key ? '#fff' : 'var(--text-secondary)',
              }}
            >{opt.label}</button>
          ))}
        </div>
        <button
          className={styles.btnSecondary}
          onClick={() => setSortAsc(p => !p)}
          title={sortAsc ? 'Tăng dần' : 'Giảm dần'}
          style={{ display: 'flex', alignItems: 'center', padding: '6px 10px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
            style={{ transform: sortAsc ? 'none' : 'scaleY(-1)', transition: 'transform 0.15s' }}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Batch cards */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          Không tìm thấy batch nào.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            {paged.map(batch => (
              <BatchFullCard
                key={batch.id}
                batch={batch}
                setModal={setModal}
                onApproveItem={approveItem}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination} style={{ marginTop: 16 }}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >‹</button>
              <span className={styles.pageInfo}>{page} / {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
