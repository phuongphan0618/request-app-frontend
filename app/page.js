'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../lib/useTheme';
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => router.push('/app'), 700);
    }, 550);
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
              type="password"
              className={styles.input}
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <label className={styles.label}>Mật khẩu</label>
          </div>

          <button type="submit" className={styles.button} disabled={loading || success}>
            {loading ? 'Đang xử lý…' : success ? 'Thành công!' : 'Đăng Nhập'}
          </button>
        </form>

        <p className={styles.hint}>Demo UI — nhập bất kỳ thông tin nào để tiếp tục</p>
      </div>
    </div>
  );
}
