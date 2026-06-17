'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginInput from './LoginInput';
import LoginButton from './LoginButton';
import styles from './Login.module.css';
import { login } from '../../lib/api';

export default function LoginCard({ isDark, onToggleTheme }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const data = await login(email, password);
      setSuccess(true);
      if (data.role === 'sub-admin') {
        router.push('/dashboard');
      } else if (data.role === 'owner') {
        router.push('/owner');
      } else if (data.role === 'requester') {
        router.push('/form');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đăng Nhập</h2>
        <button
          type="button"
          onClick={onToggleTheme}
          className={styles.themeToggle}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            /* Sun Icon SVG */
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon Icon SVG */
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      
      {success && (
        <div style={{
          padding: '0.8rem 1rem',
          borderRadius: '8px',
          background: 'rgba(46, 204, 113, 0.1)',
          borderLeft: '4px solid #2ecc71',
          color: '#2ecc71',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Đăng nhập thành công! Đang chuyển hướng...
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <LoginInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <LoginInput
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <LoginButton
          label="Đăng Nhập"
          loading={loading}
          disabled={success}
        />
      </form>
    </div>
  );
}
