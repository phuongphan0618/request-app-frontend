'use client';

import React, { useState } from 'react';
import { useTheme } from '../../lib/useTheme';
import { useRouter } from 'next/navigation';
import LoginBackground from '../../components/login/LoginBackground';
import AdminNav from '../../components/AdminNav';
import { createUser } from '../../lib/api';
import styles from './Users.module.css';

const TABS = [
  {
    key: 'requester',
    label: 'Người yêu cầu',
    group_name: 'requester',
    desc: 'Người dùng yêu cầu quyền truy cập ứng dụng',
  },
  {
    key: 'owner',
    label: 'Chủ sở hữu',
    group_name: 'owner',
    desc: 'Người phụ trách quản lý truy cập ứng dụng',
  },
];

const EMPTY_FORM = { email: '', password: '', first_name: '', last_name: '' };

export default function CreateUserPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('requester');
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentTab = TABS.find(t => t.key === activeTab);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setError('');
    setSuccess('');
  };

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await createUser({ ...form, group_name: currentTab.group_name });
      setSuccess(`Tạo tài khoản ${currentTab.label} thành công! (${data.email})`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />
      <AdminNav current="/users" />

      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.headerBar}>
          <div className={styles.titleWrapper}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => router.push('/dashboard')}
              title="Quay lại"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className={styles.title}>Tạo Tài Khoản</h1>
          </div>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Tab Bar */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Họ <span className={styles.required}>*</span></label>
              <input
                className={styles.input}
                type="text"
                value={form.last_name}
                onChange={handleChange('last_name')}
                placeholder="Nguyễn"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tên <span className={styles.required}>*</span></label>
              <input
                className={styles.input}
                type="text"
                value={form.first_name}
                onChange={handleChange('first_name')}
                placeholder="Văn A"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email <span className={styles.required}>*</span></label>
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="user@company.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu <span className={styles.required}>*</span></label>
            <input
              className={styles.input}
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Tối thiểu 8 ký tự"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : `Tạo tài khoản`}
          </button>
        </form>
      </div>
    </main>
  );
}
