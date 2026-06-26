'use client';

import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import { MOCK_USER, genId } from './data';
import { fmtDate, fmtDateTime, StatusBadge, useToasts, ToastStack, shortId } from './helpers';
import { ClockIcon } from './TabAdmin';
import { getDepartments, getDomains, getApplications, createRequest, getMyRequest, cancelRequest, disputeRequest, remindRequest } from '../../lib/api';

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
  if (reqStatus === 'cancelled')         return { activeStep: 1, failed: true };
  if (reqStatus === 'completed')         return { activeStep: 4, failed: false };
  if (itemStatus === 'approved')         return { activeStep: 4, failed: false };
  if (itemStatus === 'rejected_by_owner') return { activeStep: 2, failed: true };
  return { activeStep: 2, failed: false };
}

const DOT = { done: styles.dotDone, active: styles.dotActive, failed: styles.dotFailed, pending: styles.dotPending };
const LBL = { done: styles.lblDone, active: styles.lblActive, failed: styles.lblFailed, pending: styles.lblPending };

function ProgressStepperCore({ activeStep, failed, failLabel, showLabels = true }) {
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
                {!showLabels && <span className={styles.progressTooltip}>{label}</span>}
              </div>
              {showLabels && (
                <span className={`${styles.progressLabel} ${LBL[state]}`}>{label}</span>
              )}
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
  const failLabel = reqStatus === 'cancelled'
    ? 'Đã hủy'
    : reqStatus === 'rejected_by_admin' ? 'Bị từ chối' : 'Owner từ chối';
  return <ProgressStepperCore activeStep={activeStep} failed={failed} failLabel={failLabel} />;
}

// Map status → activeStep for the mini card stepper
function statusToStep(status) {
  if (status === 'pending_admin')     return { activeStep: 1, failed: false };
  if (status === 'pending_owner')     return { activeStep: 2, failed: false };
  if (status === 'completed')         return { activeStep: 4, failed: false };
  if (status === 'rejected_by_admin') return { activeStep: 1, failed: true  };
  if (status === 'cancelled')         return { activeStep: 1, failed: true  };
  return { activeStep: 1, failed: false };
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

// ── Cancel modal ─────────────────────────────────────────────

function CancelModal({ req, reasonRequired, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(reason);
  }
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Hủy yêu cầu {shortId(req.id)}</h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Lý do hủy&nbsp;
              {reasonRequired
                ? <span className={styles.required}>*</span>
                : <span style={{ opacity: 0.45, fontWeight: 400, fontSize: '0.75rem' }}>(tuỳ chọn)</span>
              }
            </label>
            <textarea className={styles.formInput} rows={3} required={reasonRequired}
              placeholder="Cho chúng tôi biết lý do bạn muốn hủy…"
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ resize: 'none' }} />
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.btnPrimary}>Xác nhận hủy</button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Giữ lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Dispute modal ─────────────────────────────────────────────

function DisputeModal({ req, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Khiếu nại yêu cầu {shortId(req.id)}</h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Lý do khiếu nại&nbsp;
              <span style={{ opacity: 0.45, fontWeight: 400, fontSize: '0.75rem' }}>(tuỳ chọn)</span>
            </label>
            <textarea className={styles.formInput} rows={3}
              placeholder="Mô tả vấn đề bạn gặp phải…"
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ resize: 'none' }} />
          </div>
          <div style={{
            marginBottom: 16, padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(222,26,26,0.07)',
            border: '1px solid rgba(222,26,26,0.18)',
            fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.65,
          }}>
            <span style={{ color: '#ff6b6b', fontWeight: 600 }}>Lưu ý: </span>
            Hãy chắc chắn rằng bạn có căn cứ thực sự trước khi gửi khiếu nại. Khiếu nại thiếu cơ sở có thể ảnh hưởng đến mức độ ưu tiên xét duyệt của bạn trong các yêu cầu tương lai.
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnPrimary} onClick={() => onConfirm(reason)}>
              Gửi khiếu nại
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Left card ─────────────────────────────────────────────────

function ReqCard({ req, isSelected, onClick, compact, onCancel, onNudge, onDispute }) {
  const isPending   = req.status === 'pending_admin';
  const isApproved  = req.status === 'pending_owner';
  const isRejected  = req.status === 'rejected_by_admin';
  const { activeStep, failed } = statusToStep(req.status);

  const domainBlock = (
    <span className={styles.cardDomainName}>{req.domain_name}</span>
  );

  const appChips = (
    <div className={styles.appTags}>
      {req.items.slice(0, 2).map(i => <span key={i.id} className={styles.appTag}>{i.application_name}</span>)}
      {req.items.length > 2 && <span className={styles.appTag}>+{req.items.length - 2}</span>}
    </div>
  );

  return (
    <div
      className={`${styles.reqSplitCard} ${isSelected ? styles.reqSplitCardSel : ''}`}
      onClick={onClick}
    >
      {/* Top row: ID | dates (overview) or badge (compact) */}
      <div className={styles.reqSplitCardTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className={styles.reqSplitCardId}>{shortId(req.id)}</span>
          {req.is_urgent && <ClockIcon />}
        </div>
        {compact ? (
          <StatusBadge status={req.status} />
        ) : (
          <div className={styles.cardDatesCorner}>
            <div className={styles.cardDateItem}>
              <span className={styles.cardDateLabel}>Deadline</span>
              <span className={styles.cardDateVal}>{fmtDate(req.deadline) || '—'}</span>
            </div>
            <span className={styles.cardDateDot}>·</span>
            <div className={styles.cardDateItem}>
              <span className={styles.cardDateLabel}>Tạo</span>
              <span className={styles.cardDateVal}>{fmtDate(req.created_at)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body: compact stacks vertically; overview always 3-col: 1/6 domain | 1/3 apps | 1/2 reason */}
      {compact ? (
        <>{domainBlock}{appChips}</>
      ) : (
        <div className={styles.cardBodySplit}>
          <div className={styles.cardBodyDomain}>{domainBlock}</div>
          <div className={styles.cardBodyApps}>{appChips}</div>
          <div className={styles.cardRejectSnippet}>
            {isRejected && (
              <>
                <span className={styles.cardRejectSnippetLabel}>Lý do từ chối:</span>
                <span className={styles.cardRejectSnippetText}>{req.review_note || req.reject_note || '—'}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Compact: deadline box */}
      {compact && (
        <div className={styles.reqSplitCardDeadlineRow}>
          <span className={styles.reqSplitCardDeadlineLabel}>Deadline</span>
          <span className={styles.reqSplitCardDeadlineVal}>{fmtDate(req.deadline) || '—'}</span>
        </div>
      )}

      {/* Overview footer: progress (left indent) | buttons (far right) */}
      {!compact && (
        <div className={styles.cardActionRow} onClick={e => e.stopPropagation()}>
          <div className={styles.cardProgressWrap}>
            <ProgressStepperCore activeStep={activeStep} failed={failed} failLabel={req.status === 'cancelled' ? 'Đã hủy' : 'Bị từ chối'} showLabels={false} />
          </div>
          <div className={styles.cardActionBtns}>
            {isPending && (
              <>
                <button className={styles.cardBtnCancel} onClick={() => onCancel(req)}>Hủy</button>
                <button className={styles.cardBtnNudge}  onClick={() => onNudge(req)}>Thúc!</button>
              </>
            )}
            {isApproved && (
              <button className={styles.cardBtnCancel} onClick={() => onCancel(req)}>Hủy</button>
            )}
            {isRejected && (
              <button className={styles.cardBtnDispute} onClick={() => onDispute(req)}>Khiếu nại</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Right detail pane ─────────────────────────────────────────

function ReqDetail({ req, onCancel, onDispute }) {
  const canCancel = ['pending_admin', 'pending_owner'].includes(req.status);
  const isRejected = req.status === 'rejected_by_admin';
  const rejectNote = req.review_note || req.reject_note;

  return (
    <div className={styles.reqDetailPane}>
      <div className={styles.rdHeader}>
        <div className={styles.rdHeaderLeft}>
          <span className={styles.rdId}>{shortId(req.id)}</span>
          {req.is_urgent && <ClockIcon />}
          <StatusBadge status={req.status} />
        </div>
        {canCancel && (
          <button className={styles.rdCancelBtn} onClick={() => onCancel(req)}>Hủy yêu cầu</button>
        )}
        {isRejected && (
          <button className={styles.cardBtnDispute} onClick={() => onDispute(req)}>Khiếu nại</button>
        )}
      </div>

      <div className={styles.rdBody}>
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

        {rejectNote && (
          <div className={styles.rdSection}>
            <div className={styles.rdSectionTitle}>Ghi chú từ chối</div>
            <p className={styles.rdRejectNote}>{rejectNote}</p>
          </div>
        )}

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
  const [selDeptId, setSelDeptId] = useState('');
  const [selDomainId, setSelDomainId] = useState('');
  const [selAppIds, setSelAppIds] = useState([]);
  const [reason, setReason]       = useState('');
  const [deadline, setDeadline]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [depts, doms, apps] = await Promise.all([
          getDepartments(),
          getDomains(),
          getApplications(),
        ]);
        setDepartments(depts || []);
        setDomains(doms || []);
        setApplications(apps || []);
      } catch (err) {
        setError('Không thể tải dữ liệu: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDomains = domains.filter(d => d.department === selDeptId);
  const filteredApps = applications.filter(a => a.domain === selDomainId);
  const selectedApps = applications.filter(a => selAppIds.includes(a.id));

  function handleChangeDept(val) { setSelDeptId(val); setSelDomainId(''); setSelAppIds([]); }
  function handleChangeDomain(val) { setSelDomainId(val); setSelAppIds([]); }
  function toggleApp(id) { setSelAppIds(p => p.includes(id) ? p.filter(a => a !== id) : [...p, id]); }

  function handleNext(e) {
    e.preventDefault();
    if (!selDeptId || !selDomainId || selAppIds.length === 0) {
      setError('Vui lòng chọn PNL, Domain và ít nhất một ứng dụng.');
      return;
    }
    setError(''); setStep('confirm');
  }

  async function handleConfirm() {
    try {
      setSubmitting(true);
      const selectedDept = departments.find(d => d.id === selDeptId);
      const selectedDomain = domains.find(d => d.id === selDomainId);

      await createRequest({
        reason,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        application_ids: selAppIds,
      });

      onCreate({
        id: genId(),
        created_at: new Date().toISOString(),
        deadline: deadline || null,
        status: 'pending_admin',
        is_urgent: false,
        requester_name: MOCK_USER.name,
        requester_email: MOCK_USER.email,
        department_name: selectedDept?.name || '',
        domain_name: selectedDomain?.name || '',
        reason,
        items: selectedApps.map((app, i) => ({
          id: Date.now() + i,
          application_name: app.name,
          owner_name: app.owner_detail?.first_name + ' ' + app.owner_detail?.last_name || 'Chưa phân công',
          owner_email: app.owner_detail?.email || 'none@co.com',
        })),
      });
      onClose();
    } catch (err) {
      setError('Không thể tạo yêu cầu: ' + err.message);
      setSubmitting(false);
    }
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
            {loading && <div className={styles.modalError} style={{ background: '#3a3a3a', color: '#fff' }}>Đang tải dữ liệu...</div>}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PNL <span className={styles.required}>*</span></label>
                <select className={styles.formSelect} value={selDeptId} onChange={e => handleChangeDept(e.target.value)} disabled={loading}>
                  <option value="">— Chọn PNL —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Domain <span className={styles.required}>*</span></label>
                <select className={styles.formSelect} value={selDomainId} onChange={e => handleChangeDomain(e.target.value)} disabled={!selDeptId}>
                  <option value="">— Chọn Domain —</option>
                  {filteredDomains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Ứng dụng <span className={styles.required}>*</span>
                {selAppIds.length > 0 && <span className={styles.selCount}>{selAppIds.length} đã chọn</span>}
              </label>
              {!selDomainId ? (
                <div className={styles.appsPlaceholder}>Chọn Domain để xem danh sách ứng dụng</div>
              ) : (
                <div className={styles.appsGrid}>
                  {filteredApps.map(app => (
                    <label key={app.id} className={`${styles.appItem} ${selAppIds.includes(app.id) ? styles.appItemChecked : ''}`}>
                      <input type="checkbox" className={styles.appCheckbox} checked={selAppIds.includes(app.id)} onChange={() => toggleApp(app.id)} />
                      <span className={styles.appItemName}>{app.name}</span>
                      {selAppIds.includes(app.id) && (
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
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={submitting}>Hủy</button>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>{submitting ? 'Đang gửi...' : 'Xem lại →'}</button>
            </div>
          </form>
        ) : (
          <div className={styles.confirmBody}>
            <div className={styles.confirmRows}>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>PNL</span>
                <span className={styles.confirmValue}>{departments.find(d => d.id === selDeptId)?.name}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Domain</span>
                <span className={styles.confirmValue}>{domains.find(d => d.id === selDomainId)?.name}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Ứng dụng</span>
                <div className={styles.confirmChips}>{selectedApps.map(a => <span key={a.id} className={styles.confirmChip}>{a.name}</span>)}</div>
              </div>
              {reason   && <div className={styles.confirmRow}><span className={styles.confirmLabel}>Lý do</span><span className={styles.confirmValue}>{reason}</span></div>}
              {deadline && <div className={styles.confirmRow}><span className={styles.confirmLabel}>Thời hạn</span><span className={styles.confirmValue}>{fmtDate(deadline)}</span></div>}
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setStep('form')} disabled={submitting}>← Sửa lại</button>
              <button type="button" className={styles.btnPrimary} onClick={handleConfirm} disabled={submitting}>{submitting ? 'Đang gửi...' : 'Xác nhận & Gửi'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab Requester ─────────────────────────────────────────────

const PAGE_SIZE = 3;

export function TabRequester({ myRequests, onCreate, onRefresh, onCancelSuccess }) {
  const { toasts, push }          = useToasts();
  const [sub, setSub]             = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [page, setPage]           = useState(1);

  // Action modals
  const [cancelTarget, setCancelTarget]   = useState(null); // { req, reasonRequired }
  const [disputeTarget, setDisputeTarget] = useState(null); // req

  const compact = !!selected; // cards are compact when detail pane is open

  const active = myRequests.filter(r => r.status === 'pending_admin' || r.status === 'pending_owner');
  const done   = myRequests.filter(r => r.status === 'completed' || r.status === 'rejected_by_admin' || r.status === 'cancelled');
  const rows   = sub === 'active' ? active : done;
  const paged  = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!selected) { setSelectedDetail(null); return; }
    let cancelled = false;
    async function loadDetail() {
      try {
        const data = await getMyRequest(selected.id);
        if (!cancelled) setSelectedDetail(data);
      } catch (err) {
        console.error('Lỗi tải chi tiết request:', err);
      }
    }
    loadDetail();
    return () => { cancelled = true; };
  }, [selected]);

  function handleTabChange(key) { setSub(key); setSelected(null); setPage(1); }

  async function handleNudge(req) {
    try {
      await remindRequest(req.id);
      push(`Đã gửi nhắc nhở đến admin cho yêu cầu ${shortId(req.id)}`, 'success', '🔔');
    } catch (err) {
      push(err.message || 'Không thể gửi nhắc nhở', 'error', '✕');
    }
  }

  async function handleCancelConfirm(reason) {
    const target = cancelTarget.req;
    try {
      const updated = await cancelRequest(target.id, reason);
      if (selected?.id === target.id) setSelected(null);
      push(`Đã hủy yêu cầu ${shortId(target.id)}`, 'info', '↩');
      // Gọi callback cha để cập nhật state với dữ liệu mới nhất từ backend
      onCancelSuccess?.(target.id, updated);
    } catch (err) {
      push(err.message || 'Không thể hủy yêu cầu', 'error', '✕');
    } finally {
      setCancelTarget(null);
    }
  }

  async function handleDisputeConfirm(reason) {
    try {
      await disputeRequest(disputeTarget.id, reason);
      push(`Đã gửi khiếu nại cho yêu cầu ${shortId(disputeTarget.id)}`, 'success', '📨');
      await onRefresh?.();
    } catch (err) {
      push(err.message || 'Không thể gửi khiếu nại', 'error', '✕');
    } finally {
      setDisputeTarget(null);
    }
  }

  return (
    <div>
      {showModal && <CreateRequestModal onClose={() => setShowModal(false)} onCreate={onCreate} />}

      {cancelTarget && (
        <CancelModal
          req={cancelTarget.req}
          reasonRequired={cancelTarget.reasonRequired}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {disputeTarget && (
        <DisputeModal
          req={disputeTarget}
          onConfirm={handleDisputeConfirm}
          onClose={() => setDisputeTarget(null)}
        />
      )}

      <ToastStack toasts={toasts} />

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
        {/* Left: framed panel containing the scrollable card list */}
        <div
          className={styles.cardListPanel}
          style={compact ? {} : { width: '100%' }}
        >
          {rows.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '2rem 1rem' }}>
              <div className={styles.emptyIcon}>📭</div>
              Không có yêu cầu nào.
            </div>
          ) : (
            <>
              <div className={styles.reqCardList}>
                {paged.map(req => (
                  <ReqCard
                    key={req.id}
                    req={req}
                    isSelected={selected?.id === req.id}
                    onClick={() => setSelected(p => p?.id === req.id ? null : req)}
                    compact={compact}
                    onCancel={r => setCancelTarget({
                      req: r,
                      reasonRequired: r.status === 'pending_owner',
                    })}
                    onNudge={handleNudge}
                    onDispute={r => setDisputeTarget(r)}
                  />
                ))}
              </div>
              <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </div>

        {/* Right: detail pane — only when a card is selected */}
        {selected && (
          <ReqDetail
            key={selected.id}
            req={selectedDetail || selected}
            onCancel={r => setCancelTarget({ req: r, reasonRequired: r.status === 'pending_owner' })}
            onDispute={r => setDisputeTarget(r)}
          />
        )}
      </div>
    </div>
  );
}
