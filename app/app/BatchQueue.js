'use client';

import React, { useState } from 'react';
import styles from './App.module.css';
import { groupByOwner } from './helpers';

export function BatchQueue({ queue, onRemoveItem, onSendSelected }) {
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(new Set());

  const groups      = groupByOwner(queue);
  const totalItems  = queue.length;
  const activeEmails = new Set(groups.map(g => g.owner_email));
  const cleanSelected = new Set([...selected].filter(e => activeEmails.has(e)));

  function toggleExpand(ownerEmail, e) {
    e.stopPropagation();
    setExpanded(p => ({ ...p, [ownerEmail]: !p[ownerEmail] }));
  }

  function toggleSelect(ownerEmail) {
    setSelected(p => {
      const next = new Set(p);
      if (next.has(ownerEmail)) next.delete(ownerEmail);
      else next.add(ownerEmail);
      return next;
    });
  }

  const selectedGroups = groups.filter(g => cleanSelected.has(g.owner_email));

  return (
    <>
      <div className={styles.rightHeader}>
        <div>
          <p className={styles.rightTitle}>Hàng đợi batch</p>
          <p className={styles.rightSub}>
            {groups.length > 0
              ? `${groups.length} owner · ${totalItems} item`
              : 'Chưa có yêu cầu nào được duyệt'}
          </p>
        </div>
        {groups.length > 0 && (
          <span className={styles.queueCount}>{groups.length} batch</span>
        )}
      </div>

      {groups.length === 0 ? (
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
          {groups.map((group, gi) => {
            const isOpen     = expanded[group.owner_email] === true;
            const hasUrgent  = group.entries.some(e => e.request.is_urgent);
            const isSelected = cleanSelected.has(group.owner_email);
            return (
              <div
                key={group.owner_email}
                className={`${styles.queueGroup} ${isSelected ? styles.queueGroupSelected : ''}`}
                onClick={() => toggleSelect(group.owner_email)}
              >
                <div className={styles.queueGroupHeader}>
                  <div className={styles.queueGroupLeft}>
                    <button
                      className={`${styles.batchLabel} ${isSelected ? styles.batchLabelSelected : ''}`}
                      onClick={e => toggleExpand(group.owner_email, e)}
                      title="Mở / đóng"
                    >
                      Batch {gi + 1}
                    </button>
                    <div>
                      <div className={styles.queueOwnerName}>
                        {group.owner_name}
                        {hasUrgent && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            style={{ color: 'var(--color-red)', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', marginLeft: 4, marginBottom: 1 }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                        )}
                      </div>
                      <div className={styles.queueOwnerEmail}>{group.owner_email}</div>
                    </div>
                  </div>
                  <div className={styles.queueGroupRight}>
                    <span className={styles.itemCountBadge}>{group.entries.length}</span>
                    <button className={styles.expandChevron} onClick={e => toggleExpand(group.owner_email, e)} title="Mở / đóng">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.queueGroupItems} onClick={e => e.stopPropagation()}>
                    {group.entries.map(({ item, request }) => (
                      <div key={`${request.id}-${item.id}`} className={styles.queueEntry}>
                        <div className={styles.queueEntryMain}>
                          <span className={styles.appTag}>{item.application_name}</span>
                          <button className={styles.queueItemRemove} onClick={() => onRemoveItem(request.id, item.id)} title="Xoá khỏi batch">✕</button>
                        </div>
                        <div className={styles.queueEntryMeta}>{request.id} · {request.requester_name}</div>
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
          disabled={selectedGroups.length === 0}
          onClick={() => { onSendSelected(selectedGroups); setSelected(new Set()); }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          {selectedGroups.length > 0 ? `Gửi ${selectedGroups.length} batch` : 'Chọn batch để gửi'}
        </button>
        {groups.length > 0 && (
          <p className={styles.sendBatchNote}>Ấn vào thanh batch để chọn, ấn "Batch N" hoặc mũi tên để xem chi tiết</p>
        )}
      </div>
    </>
  );
}
