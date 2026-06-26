'use client';

import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import { fmtDate, fmtDateTime, calcWait, StatusBadge, shortId } from './helpers';
import { getAccessRequest } from '../../lib/api';

// ── Shared icons ─────────────────────────────────────────────

export function ClockIcon() {
  return (
    <span className={styles.urgentClock} title="Gấp">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </span>
  );
}

// ── Request Card ─────────────────────────────────────────────

function RequestCard({ req, isQueued, isSelected, isDimmed, onClick, onApprove, onReject, onRevert, isPending, canRevert }) {
  return (
    <div
      className={[
        styles.reqCard,
        isSelected ? styles.reqCardSelected : '',
        isQueued   ? styles.reqCardQueued   : '',
        isDimmed   ? styles.reqCardDimmed   : '',
      ].join(' ')}
      onClick={onClick}
    >
      <div className={styles.reqCardTop}>
        <span className={styles.reqCardId}>{shortId(req.id)}</span>
        <span className={styles.reqCardDate}>{fmtDate(req.created_at)}</span>
      </div>

      <div className={styles.reqCardBody}>
        <span className={styles.reqCardName}>{req.requester_name}</span>
        <span className={styles.reqCardEmail}>{req.requester_email}</span>

        <div className={styles.reqCardSections}>
          <div className={styles.reqCardSection}>
            <span className={styles.reqCardLabel}>Domain</span>
            <div className={styles.appTags}>
              <span className={styles.appTag}>{req.domain_name}</span>
            </div>
          </div>
          <div className={styles.reqCardSection}>
            <span className={styles.reqCardLabel}>App</span>
            <div className={styles.appTags}>
              {req.items.slice(0, 2).map(i => <span key={i.id} className={styles.appTag}>{i.application_name}</span>)}
              {req.items.length > 2 && <span className={styles.appTag}>+{req.items.length - 2}</span>}
            </div>
          </div>
        </div>

        <div className={`${styles.reqCardDeadlineRow} ${req.is_urgent ? styles.reqCardDeadlineUrgent : ''}`}>
          <span className={styles.reqCardDeadlineLabel}>
            {req.is_urgent && <ClockIcon />}
            Deadline
          </span>
          <span className={styles.reqCardDeadlineVal}>{fmtDate(req.deadline)}</span>
        </div>
      </div>

      {isPending ? (
        <div className={styles.reqCardFooter}>
          <button
            className={`${styles.reqCardBtn} ${styles.reqCardBtnApprove}`}
            title="Duyệt — thêm vào batch"
            disabled={isQueued}
            onClick={e => { e.stopPropagation(); onApprove(req); }}
          >✓</button>
          <button
            className={`${styles.reqCardBtn} ${styles.reqCardBtnReject}`}
            title="Từ chối"
            onClick={e => { e.stopPropagation(); onReject(req); }}
          >✗</button>
        </div>
      ) : canRevert ? (
        <div className={styles.reqCardFooter}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px dashed var(--input-border)' }}>
            <StatusBadge status={req.status} />
          </div>
          <button
            className={`${styles.reqCardBtn} ${styles.reqCardBtnRevert}`}
            style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}
            title="Hoàn tác về chờ admin"
            onClick={e => { e.stopPropagation(); onRevert(req); }}
          >Hoàn tác</button>
        </div>
      ) : (
        <div className={styles.reqCardFooter} style={{ justifyContent: 'center' }}>
          <StatusBadge status={req.status} />
        </div>
      )}
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────

function DetailPanel({ req, isQueued, onClose, onApprove, onReject, onRevert, canRevert }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAccessRequest(req.id);
        setDetail(data);
      } catch (err) {
        console.error('Lỗi tải chi tiết request:', err);
        setError(err.message || 'Không thể tải chi tiết');
        setDetail(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [req.id]);

  const displayReq = detail || req;
  const isPending = displayReq.status === 'pending_admin';

  return (
    <div className={styles.detailPanel}>
      {/* Header */}
      <div className={styles.dpHeader}>
        <div className={styles.dpHeaderLeft}>
          <span className={styles.dpId}>{shortId(req.id)}</span>
          {req.is_urgent && <ClockIcon />}
        </div>
        <button className={styles.dpClose} onClick={onClose}>✕</button>
      </div>

      {/* Status + quick actions */}
      <div className={styles.dpStatusRow}>
        <StatusBadge status={req.status} />
        {isPending && (
          <div className={styles.dpActions}>
            <button
              className={`${styles.dpBtn} ${styles.dpBtnApprove}`}
              disabled={isQueued}
              title={isQueued ? 'Đã trong batch' : 'Duyệt & thêm vào batch'}
              onClick={() => { onApprove(req); onClose(); }}
            >✓ Duyệt</button>
            <button
              className={`${styles.dpBtn} ${styles.dpBtnReject}`}
              onClick={() => { onReject(req); onClose(); }}
            >✗ Từ chối</button>
          </div>
        )}
        {canRevert && (
          <div className={styles.dpActions}>
            <button
              className={styles.dpBtn}
              onClick={() => { onRevert(req); onClose(); }}
            >Hoàn tác</button>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className={styles.dpBody}>

        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Đang tải chi tiết...
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(255,107,107,0.1)', borderRadius: '0.375rem', color: '#ff6b6b', fontSize: '0.875rem', margin: '1rem' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Thông tin chung */}
            <div className={styles.dpSection}>
              <div className={styles.dpSectionTitle}>Thông tin chung</div>
              <div className={styles.dpInfoGrid}>
                <div className={styles.dpInfoBlock}>
                  <span className={styles.dpInfoLabel}>Người yêu cầu</span>
                  <span className={styles.dpInfoValue}>{displayReq.requester_detail?.first_name} {displayReq.requester_detail?.last_name}</span>
                  <span className={styles.dpInfoSub}>{displayReq.requester_detail?.email}</span>
                </div>
                <div className={styles.dpInfoBlock}>
                  <span className={styles.dpInfoLabel}>PNL</span>
                  <span className={styles.dpInfoValue}>{displayReq.department_name}</span>
                </div>
                <div className={styles.dpInfoBlock}>
                  <span className={styles.dpInfoLabel}>Domain</span>
                  <span className={styles.dpInfoValue}>{displayReq.domain_name}</span>
                </div>
                <div className={styles.dpInfoBlock}>
                  <span className={styles.dpInfoLabel}>Hạn xử lý</span>
                  <span className={styles.dpInfoValue}>{fmtDate(displayReq.deadline)}</span>
                </div>
                <div className={styles.dpInfoBlock}>
                  <span className={styles.dpInfoLabel}>Ngày tạo</span>
                  <span className={styles.dpInfoValue}>{fmtDateTime(displayReq.created_at)}</span>
                </div>
                <div className={styles.dpInfoBlock}>
                  <span className={styles.dpInfoLabel}>Thời gian chờ</span>
                  <span className={styles.dpInfoValue}>{calcWait(displayReq.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Lý do yêu cầu */}
            {displayReq.reason && (
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>Lý do yêu cầu</div>
                <p className={styles.dpReasonText}>{displayReq.reason}</p>
              </div>
            )}

            {/* Ghi chú từ chối */}
            {displayReq.review_note && (
              <div className={styles.dpSection}>
                <div className={styles.dpSectionTitle}>Ghi chú từ chối</div>
                <p className={styles.dpRejectNote}>{displayReq.review_note}</p>
              </div>
            )}

            {/* Danh sách ứng dụng */}
            <div className={styles.dpSection}>
              <div className={styles.dpSectionTitle}>Danh sách ứng dụng ({displayReq.items.length})</div>
              <div className={styles.dpItemList}>
                {displayReq.items.map(item => (
                  <div key={item.id} className={styles.dpItem}>
                    <span className={styles.dpItemApp}>{item.application_name}</span>
                    <div className={styles.dpItemOwner}>
                      <span>{item.owner_email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ── Tab Admin ─────────────────────────────────────────────────

const SUB_TABS = [
  { key: 'pending',    label: 'Chưa xử lý', filter: r => r.status === 'pending_admin' },
  { key: 'processing', label: 'Đang xử lý', filter: r => r.status === 'pending_owner' },
  { key: 'done',       label: 'Đã xử lý',   filter: r => r.status === 'completed' || r.status === 'rejected_by_admin' },
];

const PAGE_SIZE = 8;

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      <span className={styles.pageInfo}>{page} / {totalPages}</span>
      <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

function canRevertStatus(status) {
  return status === 'pending_owner' || status === 'completed' || status === 'rejected_by_admin';
}

export function TabAdmin({ requests, approvingIds, onApprove, onReject, onRevert, onManage }) {
  const [sub, setSub]           = useState('pending');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);

  const byTab     = Object.fromEntries(SUB_TABS.map(t => [t.key, requests.filter(t.filter)]));

  const searchLow = search.toLowerCase().trim();
  const filtered  = searchLow
    ? byTab[sub].filter(r =>
        r.requester_name.toLowerCase().includes(searchLow) ||
        r.requester_email.toLowerCase().includes(searchLow) ||
        r.id.toLowerCase().includes(searchLow) ||
        r.items.some(i => i.application_name.toLowerCase().includes(searchLow))
      )
    : byTab[sub];

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSelectCard(req) {
    setSelected(p => p?.id === req.id ? null : req);
  }

  function handleApprove(req) {
    onApprove(req);
    if (selected?.id === req.id) setSelected(null);
  }

  function handleReject(req) {
    onReject(req);
    setSelected(null);
  }

  function handleRevert(req) {
    onRevert(req);
    setSelected(null);
  }

  return (
    <div>
      <div className={styles.adminTop}>
        <div className={styles.panelHeader} style={{ marginBottom: 0 }}>
          <div>
            <h2 className={styles.panelTitle}>Quản lý yêu cầu</h2>
            <p className={styles.panelDesc}>Duyệt yêu cầu → hệ thống gộp theo owner → gửi batch</p>
          </div>
          <button className={styles.adminManageBtn} onClick={onManage}>
            Quản lý
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div className={styles.subTabs} style={{ marginBottom: 0 }}>
            {SUB_TABS.map(t => (
              <button key={t.key}
                className={`${styles.subTab} ${sub === t.key ? styles.subTabActive : ''}`}
                onClick={() => { setSub(t.key); setSelected(null); setPage(1); }}
              >
                {t.label}<span className={styles.subTabCount}>{byTab[t.key].length}</span>
              </button>
            ))}
          </div>

          <div className={styles.searchBox} style={{ maxWidth: 260 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Tìm tên, email, app…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}><div className={styles.emptyIcon}>✅</div>Không có yêu cầu nào.</div>
      ) : (
        <>
          <div className={styles.cardGrid}>
            {paged.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                isQueued={approvingIds.has(req.id)}
                isSelected={selected?.id === req.id}
                isDimmed={!!selected && selected.id !== req.id}
                isPending={sub === 'pending'}
                canRevert={canRevertStatus(req.status)}
                onClick={() => handleSelectCard(req)}
                onApprove={handleApprove}
                onReject={handleReject}
                onRevert={handleRevert}
              />
            ))}
          </div>
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      {selected && (
        <>
          <div className={styles.dpOverlay} onClick={() => setSelected(null)} />
          <DetailPanel
            req={selected}
            isQueued={approvingIds.has(selected.id)}
            canRevert={canRevertStatus(selected.status)}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onRevert={handleRevert}
          />
        </>
      )}
    </div>
  );
}
