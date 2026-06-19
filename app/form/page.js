'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getDepartments, getDomains, getApplications, createMyRequest, clearTokens } from '../../lib/api';
import LoginBackground from '../../components/login/LoginBackground';
import shared from '../../components/requester/Requester.module.css';
import styles from './Form.module.css';

function norm(data) {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function FormPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const ready = useAuthGuard('requester');

  const [departments, setDepartments] = useState([]);
  const [domains,     setDomains]     = useState([]);
  const [apps,        setApps]        = useState([]);
  const [selDept,     setSelDept]     = useState('');
  const [selDomain,   setSelDomain]   = useState('');
  const [selApps,     setSelApps]     = useState([]);
  const [reason,      setReason]      = useState('');
  const [deadline,    setDeadline]    = useState('');
  const [formError,   setFormError]   = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState('');

  useEffect(() => {
    getDepartments().then(d => setDepartments(norm(d))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selDept) { setDomains([]); setSelDomain(''); setApps([]); setSelApps([]); return; }
    getDomains(selDept)
      .then(d => { setDomains(norm(d)); setSelDomain(''); setApps([]); setSelApps([]); })
      .catch(() => {});
  }, [selDept]);

  useEffect(() => {
    if (!selDomain) { setApps([]); setSelApps([]); return; }
    getApplications({ domainId: selDomain })
      .then(d => { setApps(norm(d)); setSelApps([]); })
      .catch(() => {});
  }, [selDomain]);

  function toggleApp(id) {
    setSelApps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handlePreview(e) {
    e.preventDefault();
    if (!selDept || !selDomain || selApps.length === 0) {
      setFormError('Vui lòng chọn PNL, domain và ít nhất một ứng dụng.');
      return;
    }
    setFormError('');
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await createMyRequest({
        reason,
        deadline: deadline ? deadline + 'T00:00:00' : null,
        application_ids: selApps,
      });
      setShowConfirm(false);
      setSelDept(''); setSelDomain(''); setSelApps([]); setReason(''); setDeadline('');
      setSuccessMsg('Yêu cầu đã được gửi thành công!');
      setTimeout(() => { setSuccessMsg(''); router.push('/request_list'); }, 1800);
    } catch (err) {
      setFormError(err.message);
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  const deptName   = departments.find(d => String(d.id) === selDept)?.name ?? '';
  const domainName = domains.find(d => String(d.id) === selDomain)?.name ?? '';
  const selAppObjs = apps.filter(a => selApps.includes(a.id));

  if (!ready) return null;
  return (
    <div className={`${shared.container} ${isDark ? '' : shared.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <nav className={shared.navbar}>
        <div className={shared.navLeft}>
          <span className={shared.navBrand}>Access Request System</span>
        </div>

        <div className={shared.navCenter}>
          <button type="button" className={`${shared.navTab} ${shared.navTabActive}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Yêu cầu mới
          </button>
          <button type="button" className={shared.navTab} onClick={() => router.push('/request_list')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Yêu cầu của tôi
          </button>
        </div>

        <div className={shared.navRight}>
          <button type="button" className={shared.navIconBtn} onClick={toggleTheme} title="Đổi giao diện">
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
          <button type="button" className={shared.navIconBtn} onClick={() => { clearTokens(); router.push('/login'); }} title="Đăng xuất">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Form ── */}
      <div className={styles.content}>
        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Yêu cầu quyền truy cập</h2>
            <p className={styles.formSubtitle}>Chọn PNL → Domain → Ứng dụng cần cấp quyền.</p>
          </div>

          {successMsg && <div className={shared.successBanner}>{successMsg}</div>}
          {formError  && <div className={shared.errorBanner}>{formError}</div>}

          <form onSubmit={handlePreview} className={styles.form}>

            <div className={styles.formRow}>
              {/* PNL */}
              <div className={styles.formGroup}>
                <label className={styles.label}>PNL <span className={styles.required}>*</span></label>
                <select className={styles.select} value={selDept} onChange={e => setSelDept(e.target.value)}>
                  <option value="">— Chọn PNL —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              {/* Domain */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Domain <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={selDomain}
                  onChange={e => setSelDomain(e.target.value)}
                  disabled={!selDept || domains.length === 0}
                >
                  <option value="">— Chọn Domain —</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Apps */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Ứng dụng <span className={styles.required}>*</span>
                {selApps.length > 0 && <span className={styles.selCount}>{selApps.length} đã chọn</span>}
              </label>
              {!selDomain ? (
                <div className={styles.appsPlaceholder}>Chọn Domain để xem danh sách ứng dụng</div>
              ) : apps.length === 0 ? (
                <div className={styles.appsPlaceholder}>Domain này chưa có ứng dụng nào</div>
              ) : (
                <div className={styles.appsGrid}>
                  {apps.map(app => (
                    <label
                      key={app.id}
                      className={`${styles.appItem} ${selApps.includes(app.id) ? styles.appItemChecked : ''}`}
                    >
                      <input
                        type="checkbox"
                        className={styles.appCheckbox}
                        checked={selApps.includes(app.id)}
                        onChange={() => toggleApp(app.id)}
                      />
                      <div className={styles.appItemInfo}>
                        <span className={styles.appItemName}>{app.name}</span>
                        {app.code && <span className={styles.appItemCode}>{app.code}</span>}
                      </div>
                      {selApps.includes(app.id) && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--color-red)', flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              {/* Reason */}
              <div className={`${styles.formGroup} ${styles.grow}`}>
                <label className={styles.label}>Lý do yêu cầu</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Mô tả ngắn gọn lý do cần được cấp quyền..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              {/* Deadline */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Thời hạn xử lý</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <button type="submit" className={styles.submitBtn}>
                Xem lại & Gửi yêu cầu
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirm && (
        <div className={shared.modalBackdrop} onClick={() => !submitting && setShowConfirm(false)}>
          <div className={shared.modal} onClick={e => e.stopPropagation()}>
            <div>
              <h3 className={shared.modalTitle}>Xác nhận yêu cầu</h3>
              <p className={shared.modalSub}>Kiểm tra lại thông tin trước khi gửi.</p>
            </div>

            <div className={shared.confirmRows}>
              <div className={shared.confirmRow}>
                <span className={shared.confirmLabel}>PNL</span>
                <span className={shared.confirmValue}>{deptName}</span>
              </div>
              <div className={shared.confirmRow}>
                <span className={shared.confirmLabel}>Domain</span>
                <span className={shared.confirmValue}>{domainName}</span>
              </div>
              <div className={shared.confirmRow}>
                <span className={shared.confirmLabel}>Ứng dụng</span>
                <div className={shared.confirmAppList}>
                  {selAppObjs.map(a => (
                    <span key={a.id} className={shared.confirmAppChip}>{a.name}</span>
                  ))}
                </div>
              </div>
              {reason && (
                <div className={shared.confirmRow}>
                  <span className={shared.confirmLabel}>Lý do</span>
                  <span className={shared.confirmValue}>{reason}</span>
                </div>
              )}
              {deadline && (
                <div className={shared.confirmRow}>
                  <span className={shared.confirmLabel}>Thời hạn</span>
                  <span className={shared.confirmValue}>{fmtDate(deadline)}</span>
                </div>
              )}
            </div>

            <div className={shared.modalActions}>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowConfirm(false)} disabled={submitting}>
                Quay lại chỉnh sửa
              </button>
              <button type="button" className={shared.btnPrimary} onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Xác nhận & Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
