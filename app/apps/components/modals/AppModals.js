'use client';

import React from 'react';
import styles from '../../Admin.module.css';

export default function AppModals({
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
  onEditingItemChange,
  onEditSubmit,

  // Data
  domains,
  owners,

  // Shared state
  loading,
  errorMsg,
}) {
  return (
    <>
      {/* Modal: Create Application */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Tạo Ứng Dụng Mới</h2>
              <button className={styles.modalClose} onClick={onCreateClose}>&times;</button>
            </div>
            {errorMsg && <div style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={onCreateSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Chọn Domain Trực Thuộc (Restraint)</label>
                <select
                  required
                  value={createForm.domain}
                  onChange={(e) => onCreateFormChange({ ...createForm, domain: e.target.value })}
                  className={styles.select}
                >
                  <option value="">-- Chọn Domain --</option>
                  {domains.map(dm => (
                    <option key={dm.id} value={dm.id}>{dm.department_code} / {dm.code} - {dm.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tên Ứng Dụng</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hệ thống VPN nội bộ"
                  value={createForm.name}
                  onChange={(e) => onCreateFormChange({ ...createForm, name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mã Ứng Dụng (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: VPN"
                  value={createForm.code}
                  onChange={(e) => onCreateFormChange({ ...createForm, code: e.target.value.toUpperCase() })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Giao Owner phụ trách (Optional)</label>
                <select
                  value={createForm.owner}
                  onChange={(e) => onCreateFormChange({ ...createForm, owner: e.target.value })}
                  className={styles.select}
                >
                  <option value="">-- Chưa giao Owner (Bỏ trống) --</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.last_name} {o.first_name} ({o.email})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả ứng dụng</label>
                <textarea
                  placeholder="Mô tả mục đích sử dụng, phạm vi quyền hạn..."
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

      {/* Modal: Edit Application */}
      {isEditOpen && editingItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sửa Ứng Dụng: {editingItem.code}</h2>
              <button className={styles.modalClose} onClick={onEditClose}>&times;</button>
            </div>
            {errorMsg && <div style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={onEditSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Domain Trực Thuộc</label>
                <select
                  required
                  value={editingItem.domain || ''}
                  onChange={(e) => onEditingItemChange({ ...editingItem, domain: e.target.value })}
                  className={styles.select}
                >
                  <option value="">-- Chọn Domain --</option>
                  {domains.map(dm => (
                    <option key={dm.id} value={dm.id}>{dm.department_code} / {dm.code} - {dm.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tên Ứng Dụng</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => onEditingItemChange({ ...editingItem, name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mã Ứng Dụng (Code)</label>
                <input
                  type="text"
                  required
                  value={editingItem.code}
                  onChange={(e) => onEditingItemChange({ ...editingItem, code: e.target.value.toUpperCase() })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Giao Owner phụ trách</label>
                <select
                  value={editingItem.owner || ''}
                  onChange={(e) => onEditingItemChange({ ...editingItem, owner: e.target.value || null })}
                  className={styles.select}
                >
                  <option value="">-- Chưa giao Owner --</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.last_name} {o.first_name} ({o.email})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => onEditingItemChange({ ...editingItem, description: e.target.value })}
                  className={styles.input}
                  style={{ height: '80px', resize: 'none' }}
                />
              </div>

              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingItem.is_active}
                  onChange={(e) => onEditingItemChange({ ...editingItem, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="editIsActive" style={{ cursor: 'pointer', userSelect: 'none' }}>Đang hoạt động</label>
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
