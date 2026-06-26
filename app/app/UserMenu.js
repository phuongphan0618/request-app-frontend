'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './App.module.css';
import { changePassword } from '../../lib/api';

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function UserMenu({ user, onLogout }) {
  const [open, setOpen]               = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [oldPw, setOldPw]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showOldPw, setShowOldPw]     = useState(false);
  const [showPw, setShowPw]           = useState(false);
  const [showCPw, setShowCPw]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function openSettings() {
    setOpen(false);
    setOldPw(''); setPassword(''); setConfirmPw('');
    setError(''); setSuccess('');
    setShowSettings(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    const wantsPwChange = password || oldPw || confirmPw;
    if (wantsPwChange) {
      if (!oldPw) { setError('Vui lòng nhập mật khẩu hiện tại.'); return; }
      if (!password) { setError('Vui lòng nhập mật khẩu mới.'); return; }
      if (password !== confirmPw) { setError('Mật khẩu xác nhận không khớp.'); return; }
    }

    setLoading(true);
    try {
      if (wantsPwChange) {
        await changePassword(oldPw, password);
      }

      setSuccess('Đã lưu thay đổi.');
      setOldPw(''); setPassword(''); setConfirmPw('');
      setTimeout(() => setShowSettings(false), 900);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  const initials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase();
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <>
      {/* ── User row + popover ── */}
      <div className={styles.userMenuWrap} ref={wrapRef}>
        <button
          type="button"
          className={styles.userMenuTrigger}
          onClick={() => setOpen(p => !p)}
          aria-expanded={open}
        >
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userEmail}>{user?.email || ''}</div>
          </div>
          <svg
            className={`${styles.userMenuChevron} ${open ? styles.userMenuChevronUp : ''}`}
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>

        {open && (
          <div className={styles.userMenuPopover}>
            <button type="button" className={styles.userMenuItem} onClick={openSettings}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>
            <div className={styles.userMenuDivider} />
            <button type="button" className={`${styles.userMenuItem} ${styles.userMenuItemDanger}`} onClick={onLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      {/* ── Settings modal ── */}
      {showSettings && (
        <div className={styles.settingsOverlay} onClick={e => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className={styles.settingsModal}>
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>Settings</span>
              <button type="button" className={styles.settingsClose} onClick={() => setShowSettings(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form className={styles.settingsForm} onSubmit={handleSave}>
              <div className={styles.settingsSection}>Đổi mật khẩu</div>

              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Mật khẩu hiện tại</label>
                <div className={styles.settingsInputWrap}>
                  <input className={styles.settingsInput} type={showOldPw ? 'text' : 'password'} value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Nhập mật khẩu hiện tại" style={{ paddingRight: '2.2rem' }} />
                  <button type="button" className={styles.settingsEye} onClick={() => setShowOldPw(p => !p)}><EyeIcon open={showOldPw} /></button>
                </div>
              </div>

              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Mật khẩu mới</label>
                <div className={styles.settingsInputWrap}>
                  <input className={styles.settingsInput} type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu mới" style={{ paddingRight: '2.2rem' }} />
                  <button type="button" className={styles.settingsEye} onClick={() => setShowPw(p => !p)}><EyeIcon open={showPw} /></button>
                </div>
              </div>

              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Xác nhận mật khẩu</label>
                <div className={styles.settingsInputWrap}>
                  <input className={styles.settingsInput} type={showCPw ? 'text' : 'password'} value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setError(''); }} placeholder="Nhập lại mật khẩu" style={{ paddingRight: '2.2rem' }} />
                  <button type="button" className={styles.settingsEye} onClick={() => setShowCPw(p => !p)}><EyeIcon open={showCPw} /></button>
                </div>
              </div>

              {error   && <div className={styles.settingsError}>{error}</div>}
              {success && <div className={styles.settingsSuccess}>{success}</div>}

              <div className={styles.settingsActions}>
                <button type="button" className={styles.settingsCancelBtn} onClick={() => setShowSettings(false)} disabled={loading}>Hủy</button>
                <button type="submit" className={styles.settingsSaveBtn} disabled={loading}>
                  {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
