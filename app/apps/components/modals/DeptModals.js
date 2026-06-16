'use client';

import React from 'react';
import styles from '../../Admin.module.css';

export default function DeptModals({
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

  // Shared state
  loading,
  errorMsg,
}) {
  return (
    <>
      {/* Modal: Create Department */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Tạo Phòng Ban Mới</h2>
              <button className={styles.modalClose} onClick={onCreateClose}>&times;</button>
            </div>
            {errorMsg && <div style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={onCreateSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tên Phòng Ban</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khối Công nghệ thông tin"
                  value={createForm.name}
                  onChange={(e) => onCreateFormChange({ ...createForm, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã Phòng Ban (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: IT"
                  value={createForm.code}
                  onChange={(e) => onCreateFormChange({ ...createForm, code: e.target.value.toUpperCase() })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả về chức năng của phòng ban..."
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

      {/* Modal: Edit Department */}
      {isEditOpen && editingItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sửa Phòng Ban: {editingItem.code}</h2>
              <button className={styles.modalClose} onClick={onEditClose}>&times;</button>
            </div>
            {errorMsg && <div style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={onEditSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tên Phòng Ban</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã Phòng Ban (Code)</label>
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
