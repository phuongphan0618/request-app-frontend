'use client';

import React, { useState } from 'react';
import styles from './App.module.css';
import { fmtDate, fmtDateTime, calcWait, StatusBadge } from './helpers';

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

function RequestCard({ req, isQueued, isSelected, isDimmed, onClick, onApprove, onReject, isPending }) {
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
        <div className={styles.reqCardIdWrap}>
          <span className={styles.reqCardId}>{req.id}</span>
        </div>
        <div className={styles.reqCardTopRight}>
          {req.is_urgent && <ClockIcon />}
          <span className={styles.reqCardDate}>{fmtDate(req.created_at)}</span>
        </div>
      </div>

      <div className={styles.reqCardBody}>
        <div className={styles.reqCardRow}>
          <div className={styles.reqCardPerson}>
            <span className={styles.reqCardName}>{req.requester_name}</span>
            <span className={styles.reqCardEmail}>{req.requester_email}</span>
          </div>
          <div className={styles.reqCardDeadline}>
            Deadline:
            <span className={styles.reqCardDeadlineVal}>{fmtDate(req.deadline)}</span>
          </div>
        </div>
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
      ) : (
        <div className={styles.reqCardFooter} style={{ justifyContent: 'center' }}>
          <StatusBadge status={req.status} />
        </div>
      )}
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────

function DetailPanel({ req, isQueued, onClose, onApprove, onReject }) {
  const isPending = req.status === 'pending_admin';

  return (
    <div className={styles.detailPanel}>
      {/* Header */}
      <div className={styles.dpHeader}>
        <div className={styles.dpHeaderLeft}>
          <span className={styles.dpId}>{req.id}</span>
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
      </div>

      {/* Scrollable body */}
      <div className={styles.dpBody}>

        {/* Thông tin chung */}
        <div className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>Thông tin chung</div>
          <div className={styles.dpInfoGrid}>
            <div className={styles.dpInfoBlock}>
              <span className={styles.dpInfoLabel}>Người yêu cầu</span>
              <span className={styles.dpInfoValue}>{req.requester_name}</span>
              <span className={styles.dpInfoSub}>{req.requester_email}</span>
            </div>
            <div className={styles.dpInfoBlock}>
              <span className={styles.dpInfoLabel}>PNL</span>
              <span className={styles.dpInfoValue}>{req.department_name}</span>
            </div>
            <div className={styles.dpInfoBlock}>
              <span className={styles.dpInfoLabel}>Domain</span>
              <span className={styles.dpInfoValue}>{req.domain_name}</span>
            </div>
            <div className={styles.dpInfoBlock}>
              <span className={styles.dpInfoLabel}>Hạn xử lý</span>
              <span className={styles.dpInfoValue}>{fmtDate(req.deadline)}</span>
            </div>
            <div className={styles.dpInfoBlock}>
              <span className={styles.dpInfoLabel}>Ngày tạo</span>
              <span className={styles.dpInfoValue}>{fmtDateTime(req.created_at)}</span>
            </div>
            <div className={styles.dpInfoBlock}>
              <span className={styles.dpInfoLabel}>Thời gian chờ</span>
              <span className={styles.dpInfoValue}>{calcWait(req.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Lý do yêu cầu */}
        {req.reason && (
          <div className={styles.dpSection}>
            <div className={styles.dpSectionTitle}>Lý do yêu cầu</div>
            <p className={styles.dpReasonText}>{req.reason}</p>
          </div>
        )}

        {/* Ghi chú từ chối */}
        {req.reject_note && (
          <div className={styles.dpSection}>
            <div className={styles.dpSectionTitle}>Ghi chú từ chối</div>
            <p className={styles.dpRejectNote}>{req.reject_note}</p>
          </div>
        )}

        {/* Danh sách ứng dụng */}
        <div className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>Danh sách ứng dụng ({req.items.length})</div>
          <div className={styles.dpItemList}>
            {req.items.map(item => (
              <div key={item.id} className={styles.dpItem}>
                <span className={styles.dpItemApp}>{item.application_name}</span>
                <div className={styles.dpItemOwner}>
                  <span>{item.owner_name}</span>
                  <span className={styles.dpItemOwnerEmail}>{item.owner_email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

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

export function TabAdmin({ requests, queue, onApprove, onReject }) {
  const [sub, setSub]           = useState('pending');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  const queuedIds = new Set(queue.map(e => e.request.id));
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

  return (
    <div>
      <div className={styles.adminTop}>
        <div className={styles.panelHeader} style={{ marginBottom: 0 }}>
          <div>
            <h2 className={styles.panelTitle}>Quản lý yêu cầu</h2>
            <p className={styles.panelDesc}>Duyệt yêu cầu → hệ thống gộp theo owner → gửi batch</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div className={styles.subTabs} style={{ marginBottom: 0 }}>
            {SUB_TABS.map(t => (
              <button key={t.key}
                className={`${styles.subTab} ${sub === t.key ? styles.subTabActive : ''}`}
                onClick={() => { setSub(t.key); setSelected(null); }}
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
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}><div className={styles.emptyIcon}>✅</div>Không có yêu cầu nào.</div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              isQueued={queuedIds.has(req.id)}
              isSelected={selected?.id === req.id}
              isDimmed={!!selected && selected.id !== req.id}
              isPending={sub === 'pending'}
              onClick={() => handleSelectCard(req)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {selected && (
        <DetailPanel
          req={selected}
          isQueued={queuedIds.has(selected.id)}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
