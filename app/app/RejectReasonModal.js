'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './App.module.css';
import { shortId } from './helpers';

export function RejectReasonModal({ req, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError]   = useState('');
  const textareaRef         = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }
    onConfirm(req, reason.trim());
  }

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Từ chối yêu cầu</h3>
            <p className={styles.modalSub}>{shortId(req.id)} · {req.requester_name} · {req.requester_email}</p>
          </div>
          <button className={styles.modalClose} onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.modalError}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Lý do từ chối <span className={styles.required}>*</span>
            </label>
            <textarea
              ref={textareaRef}
              className={styles.formTextarea}
              rows={4}
              placeholder="Nhập lý do từ chối để thông báo lại cho người yêu cầu…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onCancel}>Hủy</button>
            <button type="submit" className={styles.btnReject}>Xác nhận từ chối</button>
          </div>
        </form>
      </div>
    </div>
  );
}
