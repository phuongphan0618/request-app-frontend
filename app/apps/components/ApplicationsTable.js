'use client';

import React, { useState, useEffect } from 'react';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 7;

export default function ApplicationsTable({
  displayApps,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [displayApps]);

  const totalPages = Math.ceil(displayApps.length / ITEMS_PER_PAGE);
  const pagedApps = displayApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const near = new Set([1, 2, currentPage - 1, currentPage, currentPage + 1, totalPages - 1, totalPages]);
    return [...near].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã App</th>
            <th>Tên Ứng Dụng</th>
            <th>Domain</th>
            <th>Phòng ban</th>
            <th>Owner phụ trách</th>
            <th>Trạng thái</th>
            <th style={{ width: '80px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pagedApps.length > 0 ? (
            pagedApps.map((app) => (
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
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                      Chưa phân quyền
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
                    {app.is_active ? '● Hoạt động' : '○ Tạm dừng'}
                  </button>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                      title="Chỉnh sửa"
                      onClick={() => onEdit(app)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                      title="Xóa"
                      onClick={() => onDelete(app.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span>
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, displayApps.length)} / {displayApps.length} ứng dụng
          </span>
          <div className={styles.paginationPages}>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {pageNumbers.map((page, idx) => {
              const prev = pageNumbers[idx - 1];
              const showEllipsis = prev && page - prev > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className={styles.pageBtn} style={{ cursor: 'default', border: 'none' }}>…</span>
                  )}
                  <button
                    className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
