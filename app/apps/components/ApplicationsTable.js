'use client';

import React from 'react';
import styles from '../Admin.module.css';

export default function ApplicationsTable({
  displayApps,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã App</th>
            <th>Tên Ứng Dụng</th>
            <th>Domain trực thuộc</th>
            <th>Phòng ban (PNL)</th>
            <th>Owner phụ trách</th>
            <th>Trạng thái hoạt động</th>
            <th style={{ width: '100px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {displayApps.length > 0 ? (
            displayApps.map((app) => (
              <tr key={app.id}>
                <td><strong>{app.code}</strong></td>
                <td>{app.name}</td>
                <td>{app.domain_code || app.domain_name}</td>
                <td>{app.department_name}</td>
                <td>
                  {app.owner_detail ? (
                    <div className={styles.ownerTag}>
                      <span>{app.owner_detail.last_name} {app.owner_detail.first_name}</span>
                      <span className={styles.ownerEmail}>{app.owner_detail.email}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      Chưa phân quyền Owner
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => onToggleActive(app)}
                    className={`${styles.badge} ${app.is_active ? styles.badgeActive : styles.badgeInactive}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    title="Click để thay đổi trạng thái"
                  >
                    {app.is_active ? '● Đang hoạt động' : '○ Tạm dừng'}
                  </button>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                      title="Chỉnh sửa thông tin app"
                      onClick={() => onEdit(app)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                      title="Xóa ứng dụng"
                      onClick={() => onDelete(app.id)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className={styles.emptyState}>
                Không tìm thấy ứng dụng nào phù hợp với bộ lọc hiện tại.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
