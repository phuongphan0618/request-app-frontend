'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './App.module.css';
import { fmtDate, shortId } from './helpers';
import { getOwnerBatches, getOwnerBatch, approveOwnerItem, rejectOwnerItem, revertOwnerItem } from '../../lib/api';

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
            style={{
              minWidth: 88,
              ...(isReject ? {} : { background: '#22c55e', borderColor: '#22c55e' }),
            }}
          >
            Xác nhận
          </button>
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
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hoàn tác.');
      return;
    }
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

export function TabOwner({ pushToast }) {
  const [batches, setBatches]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState('pending');
  const [search, setSearch]             = useState('');
  const [sortAsc, setSortAsc]           = useState(true);
  const [userExpanded, setUserExpanded] = useState(new Set());
  const [userCollapsed, setUserCollapsed] = useState(new Set());
  const [modal, setModal]               = useState(null);

  const inFlightRef  = useRef(false);
  const overridesRef = useRef(new Map()); // `${batchId}:${itemId}` -> { fields, expiresAt }

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
      const list = await getOwnerBatches();
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
      const d = new Date(a.sent_at) - new Date(b.sent_at);
      return sortAsc ? d : -d;
    }),
    [batches, sortAsc]
  );

  function isBatchDone(batch) {
    return (batch.items || []).every(i => i.status !== 'pending_owner');
  }

  const pendingBatches = sorted.filter(b => !isBatchDone(b));
  const doneBatches    = sorted.filter(b => isBatchDone(b));
  const tabBatches     = tab === 'pending' ? pendingBatches : doneBatches;

  const filtered = search.trim()
    ? tabBatches.filter(b => b.id.toLowerCase().includes(search.trim().toLowerCase()))
    : tabBatches;

  const firstNonDoneId = pendingBatches[0]?.id;

  function isExpanded(batch) {
    if (userCollapsed.has(batch.id)) return false;
    if (batch.id === firstNonDoneId) return true;
    return userExpanded.has(batch.id);
  }

  function toggleExpand(id) {
    const batch = filtered.find(b => b.id === id);
    const currently = isExpanded(batch);
    if (currently) {
      setUserCollapsed(p => new Set([...p, id]));
      setUserExpanded(p => { const n = new Set(p); n.delete(id); return n; });
    } else {
      setUserExpanded(p => new Set([...p, id]));
      setUserCollapsed(p => { const n = new Set(p); n.delete(id); return n; });
    }
  }

  async function approveItem(batchId, itemId) {
    try {
      await approveOwnerItem(batchId, itemId);
      setItemOverride(batchId, itemId, { status: 'approved', owner_note: 'Đã duyệt' });
    } catch (err) {
      console.error('Lỗi duyệt item:', err);
      pushToast?.(err.message || 'Không thể duyệt item', 'error', '✕');
    }
  }

  async function handleRevertConfirm(reason) {
    const { batchId } = modal;
    setModal(null);
    try {
      const response = await revertOwnerItem(batchId, modal.itemId, reason);
      // Nếu response không kèm đủ items (không khớp shape kỳ vọng), fetch lại chi tiết batch
      // để đảm bảo state luôn có items hợp lệ — tránh crash khi response thiếu field.
      const updatedBatch = Array.isArray(response?.items) ? response : await getOwnerBatch(batchId);
      setBatches(p => p.map(b => b.id === batchId ? updatedBatch : b));
      pushToast?.('Đã hoàn tác item', 'info', '↩');
    } catch (err) {
      console.error('Lỗi hoàn tác item:', err);
      pushToast?.(err.message || 'Không thể hoàn tác item', 'error', '✕');
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
        const batch = batches.find(b => b.id === batchId);
        const pendingItems = (batch.items || []).filter(i => i.status === 'pending_owner');
        await Promise.all(pendingItems.map(i => approveOwnerItem(batchId, i.id)));
        pendingItems.forEach(i => setItemOverride(batchId, i.id, { status: 'approved', owner_note: 'Đã duyệt' }));
      } else if (type === 'reject-all') {
        const batch = batches.find(b => b.id === batchId);
        const pendingItems = (batch.items || []).filter(i => i.status === 'pending_owner');
        await Promise.all(pendingItems.map(i => rejectOwnerItem(batchId, i.id, reason)));
        pendingItems.forEach(i => setItemOverride(batchId, i.id, { status: 'rejected_by_owner', owner_note: reason || 'Từ chối' }));
      }
    } catch (err) {
      console.error('Lỗi xử lý batch:', err);
      pushToast?.(err.message || 'Không thể xử lý batch', 'error', '✕');
    }
  }

  const isReject = modal?.type === 'reject-item' || modal?.type === 'reject-all';

  const modalMessage = !modal ? '' :
    modal.type === 'approve-all' ? `Duyệt tất cả ${modal.pendingCount} item đang chờ trong ${shortId(modal.batchId)}?` :
    modal.type === 'reject-all'  ? `Từ chối tất cả ${modal.pendingCount} item đang chờ trong ${shortId(modal.batchId)}?` :
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
        <RevertReasonModal
          label={modal.label}
          onConfirm={handleRevertConfirm}
          onCancel={() => setModal(null)}
        />
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

      <div className={styles.subTabs}>
        {[
          { key: 'pending', label: 'Chưa xử lý', count: pendingBatches.length },
          { key: 'done',    label: 'Đã xử lý',   count: doneBatches.length    },
        ].map(t => (
          <button key={t.key}
            className={`${styles.subTab} ${tab === t.key ? styles.subTabActive : ''}`}
            onClick={() => { setTab(t.key); setSearch(''); }}
          >
            {t.label}<span className={styles.subTabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar: search + sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.mgmtSearch}
            placeholder="Tìm batch ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <button
          className={styles.btnSecondary}
          onClick={() => setSortAsc(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', padding: '6px 12px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: sortAsc ? 'none' : 'scaleY(-1)' }}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
          </svg>
          {sortAsc ? 'Lâu nhất → Sớm nhất' : 'Sớm nhất → Lâu nhất'}
        </button>
      </div>

      {/* Accordion table */}
      <div className={styles.mgmtTableWrap}>
        <table className={styles.mgmtTable}>
          <colgroup>
            <col style={{ width: '35%' }} />     {/* col 1: Batch ID / App */}
            <col style={{ width: '25%' }} />     {/* col 2: # items / App info */}
            <col style={{ width: 110 }} />       {/* col 3: Date */}
            <col style={{ width: 40 }} />        {/* col 4: Toggle */}
            <col style={{ width: 116 }} />       {/* col 5: Approve */}
            <col style={{ width: 116 }} />       {/* col 6: Reject */}
          </colgroup>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th></th>
              <th>Ngày gửi</th>
              <th></th>
              <th colSpan={2} style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className={styles.mgmtEmpty}>Không tìm thấy batch nào.</td></tr>
            ) : filtered.map(batch => {
              const expanded     = isExpanded(batch);
              const items        = batch.items || [];
              const pendingCount = items.filter(i => i.status === 'pending_owner').length;

              return (
                <React.Fragment key={batch.id}>
                  {/* ── Batch header row ── */}
                  <tr className={styles.ownerBatchRow}>
                    <td>
                      <strong style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.82rem' }}>
                        {shortId(batch.id)}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {items.length} item
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {fmtDate(batch.sent_at)}
                    </td>
                    <td style={{ padding: '0.3rem 0.4rem' }}>
                      <button
                        onClick={() => toggleExpand(batch.id)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'var(--text-secondary)', padding: '3px 5px',
                          display: 'flex', alignItems: 'center', borderRadius: 4,
                        }}
                        title={expanded ? 'Thu gọn' : 'Mở rộng'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.4rem 0.5rem' }}>
                      {pendingCount > 0 && (
                        <button
                          className={styles.ownerApproveBtn}
                          style={{ width: '100%' }}
                          onClick={() => setModal({ type: 'approve-all', batchId: batch.id, pendingCount })}
                        >
                          Approve all
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.4rem 0.5rem' }}>
                      {pendingCount > 0 && (
                        <button
                          className={styles.ownerRejectBtn}
                          style={{ width: '100%' }}
                          onClick={() => setModal({ type: 'reject-all', batchId: batch.id, pendingCount })}
                        >
                          Reject all
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* ── Item rows (when expanded) ── */}
                  {expanded && items.map(item => {
                    const isPending = item.status === 'pending_owner';
                    return (
                      <tr key={item.id} className={styles.ownerItemRow}>
                        {/* Col 1: Application code / request id */}
                        <td style={{ paddingLeft: 24 }}>
                          <div style={{ lineHeight: 1.3 }}>
                            <div style={{ fontSize: '0.83rem', fontWeight: 500 }}>{item.application_code}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Yêu cầu {shortId(item.access_request_id)}</div>
                          </div>
                        </td>
                        {/* Col 2: App name + status badge */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontWeight: 500, fontSize: '0.84rem' }}>{item.application_name}</span>
                            {!isPending && (
                              <span className={`${styles.ownerStatusBadge} ${item.status === 'approved' ? styles.ownerStatusApproved : styles.ownerStatusRejected}`}>
                                {item.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Col 3: date — empty */}
                        <td></td>
                        {/* Col 4: toggle — empty */}
                        <td></td>
                        {/* Col 5: Approve item button — centered */}
                        <td style={{ textAlign: 'center', padding: '0.4rem 0.5rem' }}>
                          {isPending ? (
                            <button
                              className={styles.ownerItemApproveBtn}
                              onClick={() => approveItem(batch.id, item.id)}
                              title="Duyệt"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </button>
                          ) : (
                            <button
                              className={styles.btnSecondary}
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                              onClick={() => setModal({ type: 'revert-item', batchId: batch.id, itemId: item.id, label: item.application_name })}
                              title="Hoàn tác — đảo trạng thái duyệt/từ chối"
                            >
                              Hoàn tác
                            </button>
                          )}
                        </td>
                        {/* Col 6: Reject item button — centered */}
                        <td style={{ textAlign: 'center', padding: '0.4rem 0.5rem' }}>
                          {isPending && (
                            <button
                              className={styles.ownerItemRejectBtn}
                              onClick={() => setModal({ type: 'reject-item', batchId: batch.id, itemId: item.id, label: item.application_name })}
                              title="Từ chối"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
