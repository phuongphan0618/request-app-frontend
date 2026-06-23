'use client';

import React, { useState } from 'react';
import styles from './App.module.css';
import { MOCK_OWNER_BATCHES } from './data';
import { fmtDateTime, StatusBadge } from './helpers';

export function TabOwner() {
  const [openBatch, setOpenBatch] = useState(null);
  const [batches, setBatches]     = useState(MOCK_OWNER_BATCHES);

  function updateItem(batchId, itemId, patch) {
    setBatches(p => p.map(b =>
      b.id !== batchId ? b : { ...b, items: b.items.map(i => i.id !== itemId ? i : { ...i, ...patch }) }
    ));
  }

  if (openBatch) {
    const batch = batches.find(b => b.id === openBatch);
    return (
      <div>
        <div className={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setOpenBatch(null)} style={{
              background: 'transparent', border: '1px solid var(--input-border)',
              color: 'var(--text-secondary)', borderRadius: '50%',
              width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div>
              <h2 className={styles.panelTitle}>{batch.id}</h2>
              <p className={styles.panelDesc}>Gửi lúc {fmtDateTime(batch.sent_at)}</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Ứng dụng</th><th>Người yêu cầu</th><th>Trạng thái</th><th>Ghi chú</th><th style={{ width: 110 }}>Thao tác</th></tr>
              </thead>
              <tbody>
                {batch.items.map(item => {
                  const isPending = item.status === 'pending_owner';
                  const isDone    = item.status === 'approved' || item.status === 'rejected_by_owner';
                  return (
                    <tr key={item.id}>
                      <td><span>{item.application_name}</span><span className={styles.subText}>{item.application_code}</span></td>
                      <td>{item.requester_name}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>{item.owner_note || '—'}</td>
                      <td>
                        {isPending && (
                          <div className={styles.actionBtns}>
                            <button className={`${styles.actionBtn} ${styles.approveBtn}`}
                              onClick={() => updateItem(batch.id, item.id, { status: 'approved', owner_note: 'Đã duyệt' })}>✓</button>
                            <button className={`${styles.actionBtn} ${styles.rejectBtn}`}
                              onClick={() => updateItem(batch.id, item.id, { status: 'rejected_by_owner', owner_note: 'Từ chối' })}>✗</button>
                          </div>
                        )}
                        {isDone && (
                          <button className={styles.revertBtn}
                            onClick={() => updateItem(batch.id, item.id, { status: 'pending_owner', owner_note: null })}>Hoàn tác</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Batch cần xử lý</h2>
          <p className={styles.panelDesc}>Các ứng dụng bạn sở hữu đang chờ phê duyệt</p>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Batch ID</th><th>Số item</th><th>Ngày gửi</th></tr></thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id} className={styles.tableRow} onClick={() => setOpenBatch(b.id)}>
                  <td><strong>{b.id}</strong></td>
                  <td>{b.item_count}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(b.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
