'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../lib/useTheme';
import { login } from '../lib/api';
import styles from './Login.module.css';

function LimeBackground({ isDark }) {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
      color: Math.random() > 0.6 ? 'var(--color-purple-light)' : '#ffffff',
    }));
  }, []);

  return (
    <>
      <div className={styles.ambientBlob1} />
      <div className={styles.ambientBlob2} />
      <div className={styles.ambientBlob3} />
      {isDark && (
        <div className={styles.starsContainer}>
          {stars.map(s => (
            <div key={s.id} className={styles.star} style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              backgroundColor: s.color,
              animationDelay: s.delay, animationDuration: s.duration,
            }} />
          ))}
        </div>
      )}
    </>
  );
}

export default function LimeLoginPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => router.push('/app'), 700);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LimeBackground isDark={isDark} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoArea}>
            <div className={styles.logoDot} />
            <span className={styles.logoText}>Access Request System</span>
          </div>
          <h2 className={styles.title}>Đăng Nhập</h2>
          <button type="button" className={styles.themeToggle} onClick={toggleTheme} aria-label="Đổi giao diện">
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        {error   && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>Đăng nhập thành công! Đang chuyển hướng…</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              className={styles.input}
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <label className={styles.label}>Email</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: '2.8rem' }}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
            <label className={styles.label}>Mật khẩu</label>
          </div>

          <button type="submit" className={styles.button} disabled={loading || success}>
            {loading ? 'Đang xử lý…' : success ? 'Thành công!' : 'Đăng Nhập'}
          </button>
        </form>

      </div>
    </div>
  );
}
