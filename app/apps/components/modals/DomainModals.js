'use client';

import React from 'react';
import styles from '../../Admin.module.css';

export default function DomainModals({
  // Create modal
  isCreateOpen,
  onCreateClose,
  createForm,
  onCreateFormChange,
  onCreateSubmit,

  // Edit modal
  isEditOpen,
  onEditClose,
  editingItem,
  editForm,
  onEditFormChange,
  onEditSubmit,

  // Data
  departments,

  // Shared state
  loading,
  errorMsg,
}) {
  return (
    <>
      {/* Modal: Create Domain */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Tạo Domain Mới</h2>
              <button className={styles.modalClose} onClick={onCreateClose}>&times;</button>
            </div>
            {errorMsg && <div style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={onCreateSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Phòng Ban Trực Thuộc (Restraint)</label>
                <select
                  required
                  value={createForm.department}
                  onChange={(e) => onCreateFormChange({ ...createForm, department: e.target.value })}
                  className={styles.select}
                >
                  <option value="">-- Chọn Phòng Ban --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tên Domain</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hạ tầng mạng"
                  value={createForm.name}
                  onChange={(e) => onCreateFormChange({ ...createForm, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã Domain (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: NET"
                  value={createForm.code}
                  onChange={(e) => onCreateFormChange({ ...createForm, code: e.target.value.toUpperCase() })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả về chức năng của Domain..."
                  value={createForm.description}
                  onChange={(e) => onCreateFormChange({ ...createForm, description: e.target.value })}
                  className={styles.input}
                  style={{ height: '80px', resize: 'none' }}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCreateClose}>Hủy</button>
                <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
                  {loading ? 'Đang tạo...' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Domain */}
      {isEditOpen && editingItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sửa Domain: {editingItem.code}</h2>
              <button className={styles.modalClose} onClick={onEditClose}>&times;</button>
            </div>
            {errorMsg && <div style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={onEditSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tên Domain</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã Domain (Code)</label>
                <input
                  type="text"
                  required
                  value={editForm.code}
                  onChange={(e) => onEditFormChange({ ...editForm, code: e.target.value.toUpperCase() })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả ngắn</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => onEditFormChange({ ...editForm, description: e.target.value })}
                  className={styles.input}
                  style={{ height: '80px', resize: 'none' }}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onEditClose}>Hủy</button>
                <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
                  {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
