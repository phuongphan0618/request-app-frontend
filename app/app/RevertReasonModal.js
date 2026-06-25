'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './App.module.css';

export function RevertReasonModal({ req, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError]   = useState('');
  const textareaRef         = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hoàn tác.');
      return;
    }
    onConfirm(req, reason.trim());
  }

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Hoàn tác yêu cầu</h3>
            <p className={styles.modalSub}>{req.id} · {req.requester_name || req.requester_detail?.first_name} {req.requester_detail?.last_name}</p>
          </div>
          <button className={styles.modalClose} onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.modalError}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Lý do hoàn tác <span className={styles.required}>*</span>
            </label>
            <textarea
              ref={textareaRef}
              className={styles.formTextarea}
              rows={4}
              placeholder="Nhập lý do hoàn tác yêu cầu…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onCancel}>Hủy</button>
            <button type="submit" className={styles.btnSecondary} style={{ background: 'rgba(160,154,185,0.15)', color: 'var(--text-primary)' }}>Xác nhận hoàn tác</button>
          </div>
        </form>
      </div>
    </div>
  );
}
