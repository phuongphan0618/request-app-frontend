'use client';

import React, { useState } from 'react';
import styles from './App.module.css';
import { MOCK_CATALOG, MOCK_APP_OWNERS, MOCK_USER, genId } from './data';
import { fmtDate, fmtDateTime, StatusBadge } from './helpers';
import { ClockIcon } from './TabAdmin';

// ── Progress logic ────────────────────────────────────────────

const STEPS = [
  { label: 'Tạo yêu cầu' },
  { label: 'Admin duyệt' },
  { label: 'Gửi owner' },
  { label: 'Hoàn thành' },
];

function stepState(idx, activeStep, failed) {
  if (idx < activeStep)   return 'done';
  if (idx === activeStep) return failed ? 'failed' : 'active';
  return 'pending';
}


function getItemProgress(reqStatus, itemStatus) {
  if (reqStatus === 'pending_admin')     return { activeStep: 1, failed: false };
  if (reqStatus === 'rejected_by_admin') return { activeStep: 1, failed: true };
  if (reqStatus === 'completed')         return { activeStep: 4, failed: false };
  if (itemStatus === 'approved')         return { activeStep: 4, failed: false };
  if (itemStatus === 'rejected_by_owner') return { activeStep: 2, failed: true };
  return { activeStep: 2, failed: false };
}

const DOT = { done: styles.dotDone, active: styles.dotActive, failed: styles.dotFailed, pending: styles.dotPending };
const LBL = { done: styles.lblDone, active: styles.lblActive, failed: styles.lblFailed, pending: styles.lblPending };


function ProgressStepperCore({ activeStep, failed, failLabel }) {
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

function ItemProgressStepper({ reqStatus, itemStatus }) {
  const { activeStep, failed } = getItemProgress(reqStatus, itemStatus ?? 'pending_owner');
  const failLabel = reqStatus === 'rejected_by_admin' ? 'Bị từ chối' : 'Owner từ chối';
  return <ProgressStepperCore activeStep={activeStep} failed={failed} failLabel={failLabel} />;
}

// ── Pagination ───────────────────────────────────────────────

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

// ── Left card ─────────────────────────────────────────────────

function ReqCard({ req, isSelected, onClick }) {
  return (
    <div
      className={`${styles.reqSplitCard} ${isSelected ? styles.reqSplitCardSel : ''}`}
      onClick={onClick}
    >
      <div className={styles.reqSplitCardTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className={styles.reqSplitCardId}>{req.id}</span>
          {req.is_urgent && <ClockIcon />}
        </div>
        <StatusBadge status={req.status} />
      </div>
      <div className={styles.reqSplitCardMeta}>
        <span className={styles.reqSplitCardMetaLabel}>Domain</span>
        <span className={styles.reqSplitCardMetaVal}>{req.domain_name}</span>
      </div>
      <div className={styles.appTags} style={{ marginTop: 10 }}>
        {req.items.slice(0, 2).map(i => <span key={i.id} className={styles.appTag}>{i.application_name}</span>)}
        {req.items.length > 2 && <span className={styles.appTag}>+{req.items.length - 2}</span>}
      </div>
      <div className={styles.reqSplitCardDeadlineRow}>
        <span className={styles.reqSplitCardDeadlineLabel}>Deadline</span>
        <span className={styles.reqSplitCardDeadlineVal}>{fmtDate(req.deadline) || '—'}</span>
      </div>
    </div>
  );
}

// ── Right detail pane ─────────────────────────────────────────

function ReqDetail({ req }) {
  const canCancel = ['pending_admin', 'pending_owner'].includes(req.status);

  return (
    <div className={styles.reqDetailPane}>
      {/* Header */}
      <div className={styles.rdHeader}>
        <div className={styles.rdHeaderLeft}>
          <span className={styles.rdId}>{req.id}</span>
          {req.is_urgent && <ClockIcon />}
          <StatusBadge status={req.status} />
        </div>
        {canCancel && (
          <button className={styles.rdCancelBtn}>Hủy yêu cầu</button>
        )}
      </div>

      {/* Scrollable body */}
      <div className={styles.rdBody}>

        {/* Thông tin chung + Lý do — cùng hàng */}
        <div className={`${styles.rdSection} ${styles.rdSectionRow}`}>
          <div className={styles.rdSectionCol}>
            <div className={styles.rdSectionTitle}>Thông tin chung</div>
            <div className={styles.rdInfoGrid}>
              <div className={styles.rdInfoBlock}>
                <span className={styles.rdInfoLabel}>PNL</span>
                <span className={styles.rdInfoValue}>{req.department_name}</span>
              </div>
              <div className={styles.rdInfoBlock}>
                <span className={styles.rdInfoLabel}>Domain</span>
                <span className={styles.rdInfoValue}>{req.domain_name}</span>
              </div>
              <div className={styles.rdInfoBlock}>
                <span className={styles.rdInfoLabel}>Hạn xử lý</span>
                <span className={styles.rdInfoValue}>{fmtDate(req.deadline) || '—'}</span>
              </div>
              <div className={styles.rdInfoBlock}>
                <span className={styles.rdInfoLabel}>Ngày tạo</span>
                <span className={styles.rdInfoValue}>{fmtDateTime(req.created_at)}</span>
              </div>
            </div>
          </div>

          {req.reason && (
            <div className={`${styles.rdSectionCol} ${styles.rdSectionColDivider}`}>
              <div className={styles.rdSectionTitle}>Lý do yêu cầu</div>
              <p className={styles.rdReasonText}>{req.reason}</p>
            </div>
          )}
        </div>

        {/* Ghi chú từ chối */}
        {req.reject_note && (
          <div className={styles.rdSection}>
            <div className={styles.rdSectionTitle}>Ghi chú từ chối</div>
            <p className={styles.rdRejectNote}>{req.reject_note}</p>
          </div>
        )}

        {/* Danh sách ứng dụng với progress từng item */}
        <div className={styles.rdSection}>
          <div className={styles.rdSectionTitle}>Danh sách ứng dụng ({req.items.length})</div>
          <div className={styles.rdItemList}>
            {req.items.map(item => (
              <div key={item.id} className={styles.rdItem}>
                <div className={styles.rdItemHeader}>
                  <span className={styles.rdItemApp}>{item.application_name}</span>
                  <div className={styles.rdItemOwnerWrap}>
                    <span className={styles.rdItemOwner}>{item.owner_name}</span>
                    <span className={styles.rdItemOwnerEmail}>{item.owner_email}</span>
                  </div>
                </div>
                <ItemProgressStepper reqStatus={req.status} itemStatus={item.status} />
              </div>
            ))}
          </div>
        </div>

      </div>
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
                  <ClockIcon />
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

const PAGE_SIZE = 3;

export function TabRequester({ myRequests, onCreate }) {
  const [sub, setSub]             = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [page, setPage]           = useState(1);

  const active = myRequests.filter(r => r.status === 'pending_admin' || r.status === 'pending_owner');
  const done   = myRequests.filter(r => r.status === 'completed' || r.status === 'rejected_by_admin');
  const rows   = sub === 'active' ? active : done;
  const paged  = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTabChange(key) { setSub(key); setSelected(null); setPage(1); }

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
          { key: 'done',   label: 'Đã xử lý',  count: done.length },
        ].map(t => (
          <button key={t.key}
            className={`${styles.subTab} ${sub === t.key ? styles.subTabActive : ''}`}
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}<span className={styles.subTabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.reqSplitPane}>
        {/* Left: card list + pagination */}
        <div className={styles.reqCardList}>
          {rows.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '2rem 1rem' }}>
              <div className={styles.emptyIcon}>📭</div>
              Không có yêu cầu nào.
            </div>
          ) : (
            <>
              {paged.map(req => (
                <ReqCard
                  key={req.id}
                  req={req}
                  isSelected={selected?.id === req.id}
                  onClick={() => setSelected(p => p?.id === req.id ? null : req)}
                />
              ))}
              <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </div>

        {/* Right: detail or placeholder */}
        {selected ? (
          <ReqDetail key={selected.id} req={selected} />
        ) : (
          <div className={styles.reqDetailEmpty}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Chọn một yêu cầu để xem chi tiết</span>
          </div>
        )}
      </div>
    </div>
  );
}
