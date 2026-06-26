'use client';

import React, { useState, useCallback } from 'react';
import styles from './App.module.css';

export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function shortId(id) {
  if (!id) return '—';
  return String(id).slice(0, 8);
}

export function calcWait(iso) {
  const h = Math.floor((Date.now() - new Date(iso)) / 3600000);
  if (h < 1) return 'Vừa gửi';
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)} ngày`;
}

export const STATUS_LABEL = {
  pending_admin:     { label: 'Chờ admin',     cls: 'badgePending' },
  pending_owner:     { label: 'Chờ owner',     cls: 'badgeProcessing' },
  completed:         { label: 'Hoàn thành',    cls: 'badgeApproved' },
  rejected_by_admin: { label: 'Bị từ chối',   cls: 'badgeRejected' },
  approved:          { label: 'Đã duyệt',      cls: 'badgeApproved' },
  rejected_by_owner: { label: 'Owner từ chối', cls: 'badgeRejected' },
  cancelled:         { label: 'Đã hủy',        cls: 'badgeRejected' },
};

export function StatusBadge({ status }) {
  const info = STATUS_LABEL[status] ?? { label: status, cls: 'badgePending' };
  return <span className={`${styles.badge} ${styles[info.cls]}`}>{info.label}</span>;
}


let _toastId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success', icon = '✓') => {
    const id = ++_toastId;
    setToasts(p => [...p, { id, message, type, icon }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

export function ToastStack({ toasts }) {
  return (
    <div className={styles.toastStack}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${t.type === 'success' ? styles.toastSuccess : styles.toastInfo}`}>
          <span className={styles.toastIcon}>{t.icon}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
