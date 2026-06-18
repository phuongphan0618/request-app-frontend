'use client';

import React from 'react';
import styles from '../Admin.module.css';

export default function ToolbarFilters({
  // Department state & data
  selectedDeptId,
  departments,
  onDeptChange,
  onDeptAdd,
  onDeptEdit,
  onDeptDelete,

  // Domain state & data
  selectedDomainId,
  filteredDomainsList,
  onDomainChange,
  onDomainAdd,
  onDomainEdit,
  onDomainDelete,

  // Search
  searchQuery,
  onSearchChange,

  // App creation
  onAppAdd,
}) {
  return (
    <div className={styles.toolbar}>
      {/* Department (PNL) Selector */}
      <div className={styles.formGroup} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ margin: 0 }}>PNL</label>
          <button
            className={`${styles.iconBtn}`}
            onClick={onDeptAdd}
            title="Thêm PNL"
          >
            <span style={{ fontSize: '16px' }}>+</span>
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
            onClick={onDeptEdit}
            title="Sửa PNL"
            disabled={!selectedDeptId}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
            onClick={onDeptDelete}
            title="Xóa PNL"
            disabled={!selectedDeptId}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <select
          value={selectedDeptId}
          onChange={onDeptChange}
          className={styles.select}
        >
          <option value="">-- Tất cả PNL --</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
          ))}
        </select>
      </div>

      {/* Domain Selector */}
      <div className={styles.formGroup} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ margin: 0 }}>Domain</label>
          <button
            className={`${styles.iconBtn}`}
            onClick={onDomainAdd}
            title="Thêm Domain"
            /*disabled={!selectedDeptId} */
          >
            <span style={{ fontSize: '16px' }}>+</span>
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
            onClick={onDomainEdit}
            title="Sửa Domain"
            disabled={!selectedDomainId}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
            onClick={onDomainDelete}
            title="Xóa Domain"
            disabled={!selectedDomainId}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <select
          value={selectedDomainId}
          onChange={onDomainChange}
          className={styles.select}
        >
          <option value="">-- Tất cả Domain --</option>
          {filteredDomainsList.map(d => (
            <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <div className={styles.formGroup} style={{ flex: 1.5 }}>
        <label>Tìm kiếm Ứng dụng</label>
        <input
          type="text"
          placeholder="Nhập tên ứng dụng, mã app hoặc tên owner..."
          value={searchQuery}
          onChange={onSearchChange}
          className={styles.input}
        />
      </div>

      {/* Add Application Button */}
      <button
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={onAppAdd}
        style={{ marginTop: '20px', height: 'fit-content', padding: '0.5rem 1rem' }}
      >
        + Thêm Ứng dụng
      </button>
    </div>
  );
}
