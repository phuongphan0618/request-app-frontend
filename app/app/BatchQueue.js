'use client';

import React, { useState } from 'react';
import styles from './App.module.css';
import { getBatch } from '../../lib/api';

export function BatchQueue({ batches, onSendSelected }) {
  const [expanded, setExpanded]   = useState({});
  const [details, setDetails]     = useState({}); // batchId -> items[]
  const [loadingId, setLoadingId] = useState(null);
  const [selected, setSelected]   = useState(new Set());

  const waiting       = batches.filter(b => b.status === 'waiting');
  const totalItems     = waiting.reduce((sum, b) => sum + (Number(b.item_count) || 0), 0);
  const activeIds       = new Set(waiting.map(b => b.id));
  const cleanSelected   = new Set([...selected].filter(id => activeIds.has(id)));
  const selectedBatches = waiting.filter(b => cleanSelected.has(b.id));

  async function toggleExpand(batch, e) {
    e.stopPropagation();
    const isOpen = expanded[batch.id] === true;
    setExpanded(p => ({ ...p, [batch.id]: !isOpen }));
    if (!isOpen && !details[batch.id]) {
      try {
        setLoadingId(batch.id);
        const detail = await getBatch(batch.id);
        setDetails(p => ({ ...p, [batch.id]: detail.items || [] }));
      } catch (err) {
        console.error('Lỗi tải chi tiết batch:', err);
      } finally {
        setLoadingId(null);
      }
    }
  }

  function toggleSelect(batchId) {
    setSelected(p => {
      const next = new Set(p);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  }

  return (
    <>
      <div className={styles.rightHeader}>
        <div>
          <p className={styles.rightTitle}>Hàng đợi batch</p>
          <p className={styles.rightSub}>
            {waiting.length > 0
              ? `${waiting.length} owner · ${totalItems} item`
              : 'Chưa có yêu cầu nào được duyệt'}
          </p>
        </div>
        {waiting.length > 0 && (
          <span className={styles.queueCount}>{waiting.length} batch</span>
        )}
      </div>

      {waiting.length === 0 ? (
        <div className={styles.queueEmpty}>
          <div className={styles.queueEmptyIcon}>📋</div>
          Hàng đợi trống
          <p style={{ fontSize: '0.68rem', lineHeight: 1.5, margin: 0, opacity: 0.8 }}>
            Ấn <strong>✓</strong> trên một yêu cầu.<br />
            Hệ thống tự gộp item theo owner và tạo batch riêng cho mỗi người.
          </p>
        </div>
      ) : (
        <div className={styles.queueList}>
          {waiting.map((batch, gi) => {
            const isOpen     = expanded[batch.id] === true;
            const isSelected = cleanSelected.has(batch.id);
            const items      = details[batch.id];
            return (
              <div
                key={batch.id}
                className={`${styles.queueGroup} ${isSelected ? styles.queueGroupSelected : ''}`}
                onClick={() => toggleSelect(batch.id)}
              >
                <div className={styles.queueGroupHeader}>
                  <div className={styles.queueGroupLeft}>
                    <button
                      className={`${styles.batchLabel} ${isSelected ? styles.batchLabelSelected : ''}`}
                      onClick={e => toggleExpand(batch, e)}
                      title="Mở / đóng"
                    >
                      Batch {gi + 1}
                    </button>
                    <div>
                      <div className={styles.queueOwnerName}>{batch.owner_name}</div>
                      <div className={styles.queueOwnerEmail}>{batch.owner_email}</div>
                    </div>
                  </div>
                  <div className={styles.queueGroupRight}>
                    <span className={styles.itemCountBadge}>{batch.item_count}</span>
                    <button className={styles.expandChevron} onClick={e => toggleExpand(batch, e)} title="Mở / đóng">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.queueGroupItems} onClick={e => e.stopPropagation()}>
                    {loadingId === batch.id && (
                      <div style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Đang tải…</div>
                    )}
                    {items?.map(item => (
                      <div key={item.id} className={styles.queueEntry}>
                        <div className={styles.queueEntryMain}>
                          <span className={styles.appTag}>{item.application_name}</span>
                        </div>
                        <div className={styles.queueEntryMeta}>{item.application_code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.rightFooter}>
        <button
          className={styles.sendBatchBtn}
          disabled={selectedBatches.length === 0}
          onClick={() => { onSendSelected(selectedBatches); setSelected(new Set()); }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          {selectedBatches.length > 0 ? `Gửi ${selectedBatches.length} batch` : 'Chọn batch để gửi'}
        </button>
        {waiting.length > 0 && (
          <p className={styles.sendBatchNote}>Ấn vào thanh batch để chọn, ấn "Batch N" hoặc mũi tên để xem chi tiết</p>
        )}
      </div>
    </>
  );
}
