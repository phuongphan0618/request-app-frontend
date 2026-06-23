'use client';

import React, { useState } from 'react';
import styles from './App.module.css';
import { MOCK_CATALOG, MOCK_APP_OWNERS, MOCK_USER, genId } from './data';
import { fmtDate } from './helpers';

// ── Progress stepper ──────────────────────────────────────────

const STEPS = [
  { label: 'Tạo yêu cầu' },
  { label: 'Admin duyệt' },
  { label: 'Gửi owner' },
  { label: 'Hoàn thành' },
];

function getProgress(status) {
  switch (status) {
    case 'pending_admin':     return { activeStep: 1, failed: false };
    case 'pending_owner':     return { activeStep: 2, failed: false };
    case 'completed':         return { activeStep: 4, failed: false };
    case 'rejected_by_admin': return { activeStep: 1, failed: true };
    case 'rejected_by_owner': return { activeStep: 2, failed: true };
    default:                  return { activeStep: 1, failed: false };
  }
}

function stepState(idx, activeStep, failed) {
  if (idx < activeStep)  return 'done';
  if (idx === activeStep) return failed ? 'failed' : 'active';
  return 'pending';
}

const DOT_SM = { done: styles.dotSmDone, active: styles.dotSmActive, failed: styles.dotSmFailed, pending: styles.dotSmPending };
const DOT    = { done: styles.dotDone,   active: styles.dotActive,   failed: styles.dotFailed,   pending: styles.dotPending };
const LBL    = { done: styles.lblDone,   active: styles.lblActive,   failed: styles.lblFailed,   pending: styles.lblPending };

function ProgressCompact({ status }) {
  const { activeStep, failed } = getProgress(status);
  return (
    <div className={styles.progressCompact}>
      {STEPS.map((_, i) => (
        <React.Fragment key={i}>
          <span className={`${styles.progressDotSm} ${DOT_SM[stepState(i, activeStep, failed)]}`} />
          {i < STEPS.length - 1 && (
            <span className={`${styles.progressLineSm} ${i < activeStep ? styles.progressLineSmDone : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ProgressStepper({ status }) {
  const { activeStep, failed } = getProgress(status);
  const failLabel = status === 'rejected_by_admin' ? 'Bị từ chối' : status === 'rejected_by_owner' ? 'Owner từ chối' : null;

  return (
    <div className={styles.progressStepper}>
      {STEPS.map((step, i) => {
        const state  = stepState(i, activeStep, failed);
        const isLast = i === STEPS.length - 1;
        const label  = state === 'failed' && failLabel ? failLabel : step.label;
        return (
          <React.Fragment key={i}>
            <div className={styles.progressStep}>
              <div className={`${styles.progressDot} ${DOT[state]}`}>
                {state === 'done' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {state === 'failed' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                )}
                {state === 'active' && <span className={styles.dotPulse} />}
              </div>
              <span className={`${styles.progressLabel} ${LBL[state]}`}>{label}</span>
            </div>
            {!isLast && (
              <div className={`${styles.progressLine} ${i < activeStep ? styles.progressLineDone : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Create Request Modal ──────────────────────────────────────

function CreateRequestModal({ onClose, onCreate }) {
  const [step, setStep]           = useState('form');
  const [selDept, setSelDept]     = useState('');
  const [selDomain, setSelDomain] = useState('');
  const [selApps, setSelApps]     = useState([]);
  const [reason, setReason]       = useState('');
  const [deadline, setDeadline]   = useState('');
  const [isUrgent, setIsUrgent]   = useState(false);
  const [error, setError]         = useState('');

  const depts   = Object.keys(MOCK_CATALOG);
  const domains = selDept ? Object.keys(MOCK_CATALOG[selDept] ?? {}) : [];
  const apps    = (selDept && selDomain) ? (MOCK_CATALOG[selDept]?.[selDomain] ?? []) : [];

  function handleChangeDept(val)   { setSelDept(val); setSelDomain(''); setSelApps([]); }
  function handleChangeDomain(val) { setSelDomain(val); setSelApps([]); }
  function toggleApp(name)         { setSelApps(p => p.includes(name) ? p.filter(a => a !== name) : [...p, name]); }

  function handleNext(e) {
    e.preventDefault();
    if (!selDept || !selDomain || selApps.length === 0) {
      setError('Vui lòng chọn PNL, Domain và ít nhất một ứng dụng.');
      return;
    }
    setError(''); setStep('confirm');
  }

  function handleConfirm() {
    const base = Date.now();
    onCreate({
      id: genId(),
      created_at: new Date().toISOString(),
      deadline: deadline || null,
      status: 'pending_admin',
      is_urgent: isUrgent,
      requester_name: MOCK_USER.name,
      requester_email: MOCK_USER.email,
      department_name: selDept,
      domain_name: selDomain,
      reason,
      items: selApps.map((name, i) => ({
        id: base + i,
        application_name: name,
        ...(MOCK_APP_OWNERS[name] ?? { owner_name: 'Chưa phân công', owner_email: 'none@co.com' }),
      })),
    });
    onClose();
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {step === 'form' ? 'Yêu cầu quyền truy cập' : 'Xác nhận yêu cầu'}
            </h3>
            <p className={styles.modalSub}>
              {step === 'form' ? 'Chọn PNL → Domain → Ứng dụng cần cấp quyền' : 'Kiểm tra lại trước khi gửi'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleNext} className={styles.modalForm}>
            {error && <div className={styles.modalError}>{error}</div>}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PNL <span className={styles.required}>*</span></label>
                <select className={styles.formSelect} value={selDept} onChange={e => handleChangeDept(e.target.value)}>
                  <option value="">— Chọn PNL —</option>
                  {depts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Domain <span className={styles.required}>*</span></label>
                <select className={styles.formSelect} value={selDomain} onChange={e => handleChangeDomain(e.target.value)} disabled={!selDept}>
                  <option value="">— Chọn Domain —</option>
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Ứng dụng <span className={styles.required}>*</span>
                {selApps.length > 0 && <span className={styles.selCount}>{selApps.length} đã chọn</span>}
              </label>
              {!selDomain ? (
                <div className={styles.appsPlaceholder}>Chọn Domain để xem danh sách ứng dụng</div>
              ) : (
                <div className={styles.appsGrid}>
                  {apps.map(name => (
                    <label key={name} className={`${styles.appItem} ${selApps.includes(name) ? styles.appItemChecked : ''}`}>
                      <input type="checkbox" className={styles.appCheckbox} checked={selApps.includes(name)} onChange={() => toggleApp(name)} />
                      <span className={styles.appItemName}>{name}</span>
                      {selApps.includes(name) && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--color-red)', flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.formGroupGrow}`}>
                <label className={styles.formLabel}>Lý do yêu cầu</label>
                <textarea className={styles.formTextarea} rows={3} placeholder="Mô tả ngắn gọn lý do cần được cấp quyền…" value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Thời hạn xử lý</label>
                <input type="date" className={styles.formDate} value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                <label className={styles.urgentCheck}>
                  <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
                  <span>Yêu cầu gấp</span>
                </label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={onClose}>Hủy</button>
              <button type="submit" className={styles.btnPrimary}>Xem lại →</button>
            </div>
          </form>
        ) : (
          <div className={styles.confirmBody}>
            <div className={styles.confirmRows}>
              <div className={styles.confirmRow}><span className={styles.confirmLabel}>PNL</span><span className={styles.confirmValue}>{selDept}</span></div>
              <div className={styles.confirmRow}><span className={styles.confirmLabel}>Domain</span><span className={styles.confirmValue}>{selDomain}</span></div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Ứng dụng</span>
                <div className={styles.confirmChips}>{selApps.map(a => <span key={a} className={styles.confirmChip}>{a}</span>)}</div>
              </div>
              {reason   && <div className={styles.confirmRow}><span className={styles.confirmLabel}>Lý do</span><span className={styles.confirmValue}>{reason}</span></div>}
              {deadline && <div className={styles.confirmRow}><span className={styles.confirmLabel}>Thời hạn</span><span className={styles.confirmValue}>{fmtDate(deadline)}</span></div>}
              {isUrgent && (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Mức độ</span>
                  <span style={{ color: 'var(--color-red)', fontWeight: 700, fontSize: '0.8rem' }}>⚡ Gấp</span>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setStep('form')}>← Sửa lại</button>
              <button type="button" className={styles.btnPrimary} onClick={handleConfirm}>Xác nhận & Gửi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab Requester ─────────────────────────────────────────────

export function TabRequester({ myRequests, onCreate }) {
  const [sub, setSub]               = useState('active');
  const [showModal, setShowModal]   = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const active = myRequests.filter(r => r.status === 'pending_admin' || r.status === 'pending_owner');
  const done   = myRequests.filter(r => r.status === 'completed' || r.status === 'rejected_by_admin');
  const rows   = sub === 'active' ? active : done;

  function toggleRow(id) {
    setExpandedRows(p => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {showModal && <CreateRequestModal onClose={() => setShowModal(false)} onCreate={onCreate} />}

      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Yêu cầu của tôi</h2>
          <p className={styles.panelDesc}>Theo dõi trạng thái các yêu cầu cấp quyền bạn đã gửi</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowModal(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tạo yêu cầu mới
        </button>
      </div>

      <div className={styles.subTabs}>
        {[
          { key: 'active', label: 'Đang chờ',  count: active.length },
          { key: 'done',   label: 'Đã xử lý', count: done.length },
        ].map(t => (
          <button key={t.key} className={`${styles.subTab} ${sub === t.key ? styles.subTabActive : ''}`}
            onClick={() => { setSub(t.key); setExpandedRows(new Set()); }}>
            {t.label}<span className={styles.subTabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Ứng dụng</th>
                <th>PNL / Domain</th>
                <th>Deadline</th>
                <th>Tiến độ</th>
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>📭</div>Không có yêu cầu nào.</div></td></tr>
              ) : rows.map(r => {
                const isOpen = expandedRows.has(r.id);
                return (
                  <React.Fragment key={r.id}>
                    <tr className={styles.tableRow} onClick={() => toggleRow(r.id)}>
                      <td>
                        <strong>{r.id}</strong>
                        {r.is_urgent && <span className={styles.urgentChip}>⚡ Gấp</span>}
                      </td>
                      <td>
                        <div className={styles.appTags}>
                          {r.items.slice(0, 3).map(i => <span key={i.id} className={styles.appTag}>{i.application_name}</span>)}
                          {r.items.length > 3 && <span className={styles.appTag}>+{r.items.length - 3}</span>}
                        </div>
                      </td>
                      <td><span>{r.department_name}</span><span className={styles.subText}>{r.domain_name}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.deadline)}</td>
                      <td><ProgressCompact status={r.status} /></td>
                      <td>
                        <button
                          className={styles.rowToggle}
                          onClick={e => { e.stopPropagation(); toggleRow(r.id); }}
                          aria-label="Xem tiến độ"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={6}>
                          <div className={styles.expandedContent}>
                            <ProgressStepper status={r.status} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
