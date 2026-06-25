'use client';

import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import {
  getDomains, getDepartments, createDomain, updateDomain, deleteDomain, getSubadmins,
  getUsers, createUser, updateUser, deleteUser,
  getApplications, createApplication, updateApplication, deleteApplication, getOwners,
} from '../../lib/api';
import { useToasts } from './helpers';

const PAGE_SIZE = 8;

// ── Shared icons ─────────────────────────────────────────────────

function IconBtn({ title, onClick, danger, children }) {
  return (
    <button
      className={danger ? `${styles.mgmtIconBtn} ${styles.mgmtIconBtnDanger}` : styles.mgmtIconBtn}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function OptLabel() {
  return <span style={{ opacity: 0.45, fontWeight: 400, fontSize: '0.75rem' }}>(tuỳ chọn)</span>;
}

// ── Confirm delete modal ─────────────────────────────────────────

function ConfirmModal({ label, onCancel, onConfirm }) {
  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}
        style={{ maxWidth: 320, textAlign: 'center', padding: '2rem 1.75rem 1.5rem', position: 'relative' }}
      >
        <button className={styles.modalClose} onClick={onCancel}
          style={{ position: 'absolute', top: 12, right: 12 }}>✕</button>

        {/* Warning icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(222,26,26,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
          Xác nhận xóa
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          Bạn có chắc muốn xóa{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{label}</strong>?
          <br />Thao tác này không thể hoàn tác.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button type="button" className={styles.btnPrimary} onClick={onConfirm}
            style={{ minWidth: 88 }}>Xóa</button>
          <button type="button" className={styles.btnSecondary} onClick={onCancel}
            style={{ minWidth: 88 }}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

// ── App management ───────────────────────────────────────────────

const EMPTY_APP_FORM = { name: '', code: '', domain: '', ownerId: '', is_active: true };

function AppFormFields({ appForm, setAppForm, domains, owners, isSubmitting, showActive }) {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tên ứng dụng <span className={styles.required}>*</span></label>
        <input className={styles.formInput} type="text" placeholder="VD: Hệ thống VPN nội bộ" required autoFocus
          value={appForm.name} onChange={e => setAppForm(p => ({ ...p, name: e.target.value }))} disabled={isSubmitting} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Mã app <span className={styles.required}>*</span></label>
        <input className={styles.formInput} type="text" placeholder="VD: VPN" required
          value={appForm.code} onChange={e => setAppForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} disabled={isSubmitting} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Domain</label>
        <select className={styles.formSelect} value={appForm.domain} onChange={e => setAppForm(p => ({ ...p, domain: e.target.value }))} disabled={isSubmitting} required>
          <option value="">— Chọn domain —</option>
          {domains.map(d => <option key={d.id} value={String(d.id)}>{d.code}{d.name ? ` — ${d.name}` : ''}</option>)}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Owner quản lý <OptLabel /></label>
        <select className={styles.formSelect} value={appForm.ownerId} onChange={e => setAppForm(p => ({ ...p, ownerId: e.target.value }))} disabled={isSubmitting}>
          <option value="">— Chưa phân quyền —</option>
          {owners.map(u => (
            <option key={u.id} value={String(u.id)}>{u.last_name} {u.first_name} ({u.email})</option>
          ))}
        </select>
      </div>
      {showActive && (
        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="chkActive" checked={appForm.is_active}
            onChange={e => setAppForm(p => ({ ...p, is_active: e.target.checked }))}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-red)' }} disabled={isSubmitting} />
          <label htmlFor="chkActive" className={styles.formLabel} style={{ cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
            Đang hoạt động
          </label>
        </div>
      )}
    </>
  );
}

function AppTable() {
  const { push: pushToast } = useToasts();
  const [apps, setApps]               = useState([]);
  const [domains, setDomains]         = useState([]);
  const [owners, setOwners]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch]           = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [page, setPage]               = useState(1);
  const [modal, setModal]             = useState(null); // null | 'addApp' | 'editApp'
  const [editAppTarget, setEditAppTarget] = useState(null);
  const [appForm, setAppForm]         = useState(EMPTY_APP_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { id, label }

  async function loadApps() {
    try {
      setLoading(true);
      const data = await getApplications();
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải app:', err);
      pushToast(err.message || 'Không thể tải danh sách app', 'error', '✕');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
    async function fetchDomains() {
      try {
        const data = await getDomains();
        setDomains(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Lỗi tải domain:', err);
      }
    }
    fetchDomains();
  }, []);

  useEffect(() => {
    if (modal === 'addApp' || modal === 'editApp') {
      async function fetchOwners() {
        try {
          const data = await getOwners();
          setOwners(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Lỗi tải owner:', err);
        }
      }
      fetchOwners();
    }
  }, [modal]);

  let filtered = filterDomain ? apps.filter(a => String(a.domain) === filterDomain) : apps;
  filtered = search
    ? filtered.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        (a.domain_code || '').toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAddApp() {
    setAppForm({ name: '', code: '', domain: '', ownerId: '', is_active: true });
    setModal('addApp');
  }

  function openEditApp(app) {
    setEditAppTarget(app);
    setAppForm({
      name: app.name,
      code: app.code,
      domain: app.domain ? String(app.domain) : '',
      ownerId: app.owner ? String(app.owner) : '',
      is_active: app.is_active,
    });
    setModal('editApp');
  }

  function buildPayload() {
    const domainObj = domains.find(d => String(d.id) === appForm.domain);
    const ownerObj = appForm.ownerId ? owners.find(u => String(u.id) === appForm.ownerId) : null;
    return {
      name: appForm.name,
      code: appForm.code.toUpperCase(),
      description: '',
      domain: domainObj ? domainObj.id : null,
      owner: ownerObj ? ownerObj.id : null,
      is_active: appForm.is_active,
    };
  }

  async function handleAddApp(e) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createApplication(buildPayload());
      pushToast(`Đã tạo app ${appForm.code.toUpperCase()} thành công`, 'success', '✓');
      await loadApps();
      setModal(null); setPage(1);
    } catch (err) {
      console.error('Lỗi tạo app:', err);
      pushToast(err.message || 'Không thể tạo app', 'error', '✕');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditApp(e) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateApplication(editAppTarget.id, buildPayload());
      pushToast(`Đã cập nhật app ${appForm.code.toUpperCase()} thành công`, 'success', '✓');
      await loadApps();
      setModal(null);
    } catch (err) {
      console.error('Lỗi sửa app:', err);
      pushToast(err.message || 'Không thể cập nhật app', 'error', '✕');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteApp(id) {
    try {
      await deleteApplication(id);
      pushToast('Đã xóa app thành công', 'success', '✓');
      setApps(p => p.filter(a => a.id !== id));
    } catch (err) {
      console.error('Lỗi xóa app:', err);
      pushToast(err.message || 'Không thể xóa app', 'error', '✕');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className={styles.mgmtToolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={styles.searchBox} style={{ maxWidth: 240 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className={styles.searchInput} placeholder="Tìm app, mã, domain…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select
            className={styles.filterSelect}
            value={filterDomain}
            onChange={e => { setFilterDomain(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả domain</option>
            {domains.map(d => <option key={d.id} value={String(d.id)}>{d.code}{d.name ? ` — ${d.name}` : ''}</option>)}
          </select>
        </div>
        <button className={styles.mgmtAddBtn} onClick={openAddApp}>+ Thêm app</button>
      </div>

      <div className={styles.mgmtTableWrap}>
        <table className={styles.mgmtTable}>
          <thead>
            <tr>
              <th>Mã App</th><th>Tên ứng dụng</th><th>Domain</th><th>Phòng ban</th>
              <th>Owner</th><th>Trạng thái</th><th style={{ width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.mgmtEmpty}>Đang tải...</td></tr>
            ) : paged.length > 0 ? paged.map(app => (
              <tr key={app.id} className={styles.mgmtRow}>
                <td><strong style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.8rem' }}>{app.code}</strong></td>
                <td>{app.name}</td>
                <td><span className={styles.mgmtDomainTag}>{app.domain_code}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{app.department_name || '—'}</td>
                <td>
                  {app.owner_detail
                    ? <div><div style={{ fontSize: '0.84rem' }}>{app.owner_detail.last_name} {app.owner_detail.first_name}</div><div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{app.owner_detail.email}</div></div>
                    : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>Chưa phân quyền</span>
                  }
                </td>
                <td>
                  <span className={styles.mgmtBadge} style={app.is_active
                    ? { background: 'rgba(46,204,113,0.12)', color: '#2ecc71' }
                    : { background: 'rgba(160,154,185,0.1)', color: 'var(--text-secondary)' }
                  }>{app.is_active ? '● Hoạt động' : '○ Tạm dừng'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <IconBtn title="Sửa" onClick={() => openEditApp(app)}><EditIcon /></IconBtn>
                    <IconBtn title="Xóa" danger onClick={() => setConfirmDelete({ id: app.id, label: app.code })}><DeleteIcon /></IconBtn>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className={styles.mgmtEmpty}>Không tìm thấy ứng dụng nào.</td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.mgmtPagination}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={styles.mgmtPageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`${styles.mgmtPageBtn} ${p === page ? styles.mgmtPageBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className={styles.mgmtPageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {modal === 'addApp' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Thêm ứng dụng</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)} disabled={isSubmitting}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleAddApp}>
              <AppFormFields appForm={appForm} setAppForm={setAppForm} domains={domains} owners={owners} isSubmitting={isSubmitting} showActive={false} />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Đang tạo...' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'editApp' && editAppTarget && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Sửa: {editAppTarget.code}</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)} disabled={isSubmitting}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditApp}>
              <AppFormFields appForm={appForm} setAppForm={setAppForm} domains={domains} owners={owners} isSubmitting={isSubmitting} showActive={true} />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteApp(confirmDelete.id)}
        />
      )}
    </div>
  );
}

// ── Domain management ────────────────────────────────────────────

function DomainFormFields({ domainForm, setDomainForm, departments, subadmins, isSubmitting }) {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>PNL <span className={styles.required}>*</span></label>
        <select className={styles.formSelect} value={domainForm.department} onChange={e => setDomainForm(p => ({ ...p, department: e.target.value }))} required disabled={isSubmitting} autoFocus>
          <option value="">-- Chọn PNL --</option>
          {departments.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tên Domain</label>
        <input className={styles.formInput} type="text" placeholder="VD: Hạ tầng mạng"
          value={domainForm.name} onChange={e => setDomainForm(p => ({ ...p, name: e.target.value }))} disabled={isSubmitting} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Mã Domain <span className={styles.required}>*</span></label>
        <input className={styles.formInput} type="text" placeholder="VD: INFRA" required
          value={domainForm.code} onChange={e => setDomainForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} disabled={isSubmitting} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Mô tả ngắn <OptLabel /></label>
        <textarea className={styles.formInput} placeholder="Mô tả về chức năng của Domain..."
          value={domainForm.description} onChange={e => setDomainForm(p => ({ ...p, description: e.target.value }))}
          style={{ height: 68, resize: 'none' }} disabled={isSubmitting} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Admin quản lý <OptLabel /></label>
        <select className={styles.formSelect} value={domainForm.managerId} onChange={e => setDomainForm(p => ({ ...p, managerId: e.target.value }))} disabled={isSubmitting}>
          <option value="">-- Chưa phân quyền --</option>
          {subadmins.map(a => (
            <option key={a.id} value={String(a.id)}>{a.last_name} {a.first_name} ({a.email})</option>
          ))}
        </select>
      </div>
    </>
  );
}

function DomainTable() {
  const { push: pushToast } = useToasts();
  const [domains, setDomains]                   = useState([]);
  const [departments, setDepartments]           = useState([]);
  const [subadmins, setSubadmins]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [search, setSearch]                     = useState('');
  const [modal, setModal]                       = useState(null); // null | 'addDomain' | 'editDomain'
  const [editDomainTarget, setEditDomainTarget] = useState(null);
  const [domainForm, setDomainForm]             = useState({ code: '', name: '', description: '', department: '', managerId: '' });
  const [confirmDelete, setConfirmDelete]       = useState(null);

  async function loadDomains() {
    try {
      setLoading(true);
      const data = await getDomains();
      setDomains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải domain:', err);
      pushToast(err.message || 'Không thể tải danh sách domain', 'error', '✕');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDomains();
  }, []);

  // Fetch departments & subadmins when modal opens
  useEffect(() => {
    if (modal === 'addDomain' || modal === 'editDomain') {
      async function fetchData() {
        try {
          const [depts, admins] = await Promise.all([getDepartments(), getSubadmins()]);
          setDepartments(Array.isArray(depts) ? depts : []);
          setSubadmins(Array.isArray(admins) ? admins : []);
        } catch (err) {
          console.error('Lỗi tải data:', err);
        }
      }
      fetchData();
    }
  }, [modal]);

  const filtered = search
    ? domains.filter(d =>
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.name.toLowerCase().includes(search.toLowerCase())
      )
    : domains;

  function openAddDomain() {
    setDomainForm({ code: '', name: '', description: '', department: '', managerId: '' });
    setModal('addDomain');
  }

  function openEditDomain(d) {
    setEditDomainTarget(d);
    setDomainForm({
      code: d.code,
      name: d.name,
      description: d.description || '',
      department: d.department ? String(d.department) : '',
      managerId: (d.managers && d.managers.length > 0) ? String(d.managers[0].id) : '',
    });
    setModal('editDomain');
  }

  async function handleAddDomain(e) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: domainForm.name,
        code: domainForm.code.trim().toUpperCase(),
        description: domainForm.description,
        department: domainForm.department,
        manager_ids: domainForm.managerId ? [parseInt(domainForm.managerId)] : [],
      };

      await createDomain(payload);
      pushToast(`Đã tạo domain ${payload.code} thành công`, 'success', '✓');
      await loadDomains();
      setModal(null);
    } catch (err) {
      console.error('Lỗi tạo domain:', err);
      pushToast(err.message || 'Không thể tạo domain', 'error', '✕');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditDomain(e) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: domainForm.name,
        code: domainForm.code.trim().toUpperCase(),
        description: domainForm.description,
        department: domainForm.department,
        manager_ids: domainForm.managerId ? [parseInt(domainForm.managerId)] : [],
      };

      await updateDomain(editDomainTarget.id, payload);
      pushToast(`Đã cập nhật domain ${payload.code} thành công`, 'success', '✓');
      await loadDomains();
      setModal(null);
    } catch (err) {
      console.error('Lỗi sửa domain:', err);
      pushToast(err.message || 'Không thể cập nhật domain', 'error', '✕');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteDomain(id) {
    try {
      await deleteDomain(id);
      pushToast('Đã xóa domain thành công', 'success', '✓');
      setDomains(p => p.filter(d => d.id !== id));
    } catch (err) {
      console.error('Lỗi xóa domain:', err);
      pushToast(err.message || 'Không thể xóa domain', 'error', '✕');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className={styles.mgmtToolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={styles.searchBox} style={{ maxWidth: 240 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className={styles.searchInput} placeholder="Tìm mã, tên domain…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className={styles.mgmtCount}>{filtered.length} domain</span>
        </div>
        <button className={styles.mgmtAddBtn} onClick={openAddDomain}>+ Thêm domain</button>
      </div>

      <div className={styles.mgmtTableWrap}>
        <table className={styles.mgmtTable}>
          <thead>
            <tr>
              <th>Mã Domain</th><th>Tên</th><th>PNL</th><th>Mô tả</th><th>Admin quản lý</th>
              <th>Số app</th><th style={{ width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.mgmtEmpty}>Đang tải...</td></tr>
            ) : filtered.length > 0 ? filtered.map(d => (
              <tr key={d.id} className={styles.mgmtRow}>
                <td><span className={styles.mgmtDomainTag} style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{d.code}</span></td>
                <td style={{ fontSize: '0.88rem' }}>{d.name || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>}</td>
                <td>
                  {d.department_name
                    ? <span className={styles.mgmtBadge} style={{ background: 'rgba(99,108,220,0.12)', color: '#6b74e0' }}>{d.department_name}</span>
                    : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>—</span>
                  }
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 180 }}>{d.description || <span style={{ fontStyle: 'italic' }}>—</span>}</td>
                <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  {d.managers && d.managers.length > 0
                    ? d.managers.map(m => `${m.last_name} ${m.first_name}`).join(', ')
                    : <span style={{ fontStyle: 'italic' }}>Chưa phân quyền</span>
                  }
                </td>
                <td>
                  <span className={styles.mgmtBadge} style={{ background: 'rgba(139,133,193,0.13)', color: '#a09ab9' }}>
                    {d.application_count ?? 0} app
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <IconBtn title="Sửa" onClick={() => openEditDomain(d)}><EditIcon /></IconBtn>
                    <IconBtn title="Xóa" danger onClick={() => setConfirmDelete({ id: d.id, label: d.code })}><DeleteIcon /></IconBtn>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className={styles.mgmtEmpty}>Không tìm thấy domain nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal === 'addDomain' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo Domain mới</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)} disabled={isSubmitting}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleAddDomain}>
              <DomainFormFields
                domainForm={domainForm} setDomainForm={setDomainForm}
                departments={departments} subadmins={subadmins}
                isSubmitting={isSubmitting}
              />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Đang tạo...' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'editDomain' && editDomainTarget && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Sửa Domain: {editDomainTarget.code}</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)} disabled={isSubmitting}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditDomain}>
              <DomainFormFields
                domainForm={domainForm} setDomainForm={setDomainForm}
                departments={departments} subadmins={subadmins}
                isSubmitting={isSubmitting}
              />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteDomain(confirmDelete.id)}
        />
      )}
    </div>
  );
}

// ── User management ──────────────────────────────────────────────

const EMPTY_USER_FORM = { last_name: '', first_name: '', email: '', password: '', is_active: true, roles: [] };

function rolesFromUser(u) {
  const roles = [];
  if (u.is_owner) roles.push('owner');
  if (u.is_subadmin) roles.push('sub-admin');
  return roles;
}

function UserTable() {
  const { push: pushToast } = useToasts();
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [search, setSearch]               = useState('');
  const [modal, setModal]                 = useState(null); // null | 'addUser' | 'editUser'
  const [userForm, setUserForm]           = useState(EMPTY_USER_FORM);
  const [editUserTarget, setEditUserTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải user:', err);
      pushToast(err.message || 'Không thể tải danh sách user', 'error', '✕');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = search
    ? users.filter(u =>
        `${u.last_name} ${u.first_name}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  function toggleRole(role) {
    setUserForm(p => ({
      ...p,
      roles: p.roles.includes(role) ? p.roles.filter(r => r !== role) : [...p.roles, role],
    }));
  }

  function openEditUser(u) {
    setEditUserTarget(u);
    setUserForm({ last_name: u.last_name, first_name: u.first_name, email: u.email, password: '', is_active: u.is_active, roles: rolesFromUser(u) });
    setModal('editUser');
  }

  async function handleAddUser(e) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createUser({
        email: userForm.email,
        password: userForm.password,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        is_subadmin: userForm.roles.includes('sub-admin'),
        is_owner: userForm.roles.includes('owner'),
      });
      pushToast(`Đã tạo user ${userForm.email} thành công`, 'success', '✓');
      await loadUsers();
      setUserForm(EMPTY_USER_FORM);
      setModal(null);
    } catch (err) {
      console.error('Lỗi tạo user:', err);
      pushToast(err.message || 'Không thể tạo user', 'error', '✕');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditUser(e) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateUser(editUserTarget.id, {
        email: userForm.email,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        is_active: userForm.is_active,
        is_subadmin: userForm.roles.includes('sub-admin'),
        is_owner: userForm.roles.includes('owner'),
      });
      pushToast(`Đã cập nhật user ${userForm.email} thành công`, 'success', '✓');
      await loadUsers();
      setModal(null);
    } catch (err) {
      console.error('Lỗi sửa user:', err);
      pushToast(err.message || 'Không thể cập nhật user', 'error', '✕');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser(id) {
    try {
      await deleteUser(id);
      pushToast('Đã xóa user thành công', 'success', '✓');
      setUsers(p => p.filter(u => u.id !== id));
    } catch (err) {
      console.error('Lỗi xóa user:', err);
      pushToast(err.message || 'Không thể xóa user', 'error', '✕');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className={styles.mgmtToolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={styles.searchBox} style={{ maxWidth: 280 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className={styles.searchInput} placeholder="Tìm tên, email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className={styles.mgmtCount}>{filtered.length} người dùng</span>
        </div>
        <button className={styles.mgmtAddBtn} onClick={() => { setUserForm(EMPTY_USER_FORM); setModal('addUser'); }}>
          + Tạo user
        </button>
      </div>

      <div className={styles.mgmtTableWrap}>
        <table className={styles.mgmtTable}>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th style={{ width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={styles.mgmtEmpty}>Đang tải...</td></tr>
            ) : filtered.length > 0 ? filtered.map(u => (
              <tr key={u.id} className={styles.mgmtRow}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className={styles.mgmtAvatar}>
                      {`${u.last_name.charAt(0)}${u.first_name.charAt(0)}`.toUpperCase()}
                    </div>
                    <span>{u.last_name} {u.first_name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {u.is_subadmin && (
                      <span className={styles.mgmtBadge} style={{ background: 'rgba(222,26,26,0.11)', color: '#ff6b6b' }}>Admin</span>
                    )}
                    {u.is_owner && (
                      <span className={styles.mgmtBadge} style={{ background: 'rgba(46,204,113,0.12)', color: '#2ecc71' }}>Owner</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={styles.mgmtBadge} style={u.is_active
                    ? { background: 'rgba(46,204,113,0.12)', color: '#2ecc71' }
                    : { background: 'rgba(160,154,185,0.1)', color: 'var(--text-secondary)' }
                  }>{u.is_active ? '● Hoạt động' : '○ Tạm dừng'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <IconBtn title="Sửa" onClick={() => openEditUser(u)}><EditIcon /></IconBtn>
                    <IconBtn title="Xóa" danger onClick={() => setConfirmDelete({ id: u.id, label: `${u.last_name} ${u.first_name}` })}><DeleteIcon /></IconBtn>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className={styles.mgmtEmpty}>Không tìm thấy user nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteUser(confirmDelete.id)}
        />
      )}

      {/* Modal: Tạo user */}
      {modal === 'addUser' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo Tài Khoản</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)} disabled={isSubmitting}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleAddUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Họ <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" placeholder="Nguyễn" required autoFocus
                    value={userForm.last_name} onChange={e => setUserForm(p => ({ ...p, last_name: e.target.value }))} disabled={isSubmitting} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Tên <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" placeholder="Văn A" required
                    value={userForm.first_name} onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))} disabled={isSubmitting} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" placeholder="user@company.com" required
                  value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" placeholder="Tối thiểu 8 ký tự" required
                  value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Vai trò <OptLabel /></label>
                <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                  {[
                    { key: 'owner',     label: 'Owner' },
                    { key: 'sub-admin', label: 'Admin' },
                  ].map(r => (
                    <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={userForm.roles.includes(r.key)} onChange={() => toggleRole(r.key)}
                        style={{ width: 15, height: 15, accentColor: 'var(--color-red)', cursor: 'pointer' }} disabled={isSubmitting} />
                      {r.label}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Không chọn = mặc định Requester (không hiển thị vai trò)
                </p>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sửa user */}
      {modal === 'editUser' && editUserTarget && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Sửa: {editUserTarget.last_name} {editUserTarget.first_name}</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)} disabled={isSubmitting}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Họ <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" required autoFocus
                    value={userForm.last_name} onChange={e => setUserForm(p => ({ ...p, last_name: e.target.value }))} disabled={isSubmitting} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Tên <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" required
                    value={userForm.first_name} onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))} disabled={isSubmitting} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" required
                  value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Vai trò <OptLabel /></label>
                <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                  {[
                    { key: 'owner',     label: 'Owner' },
                    { key: 'sub-admin', label: 'Admin' },
                  ].map(r => (
                    <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={userForm.roles.includes(r.key)} onChange={() => toggleRole(r.key)}
                        style={{ width: 15, height: 15, accentColor: 'var(--color-red)', cursor: 'pointer' }} disabled={isSubmitting} />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="chkUserActive" checked={userForm.is_active}
                  onChange={e => setUserForm(p => ({ ...p, is_active: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-red)' }} disabled={isSubmitting} />
                <label htmlFor="chkUserActive" className={styles.formLabel} style={{ cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
                  Đang hoạt động
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TabManage export ────────────────────────────────────────────

export function TabManage({ onBack }) {
  const [tab, setTab] = useState('app');

  return (
    <div>
      <div className={styles.adminTop}>
        <div className={styles.panelHeader} style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className={styles.mgmtBackBtn} onClick={onBack} title="Quay lại yêu cầu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <h2 className={styles.panelTitle}>Quản lý hệ thống</h2>
          </div>
        </div>

        <div className={styles.subTabs} style={{ marginBottom: 0 }}>
          {[
            { key: 'app',    label: 'Quản lý app'    },
            { key: 'domain', label: 'Quản lý domain' },
            { key: 'user',   label: 'Quản lý user'   },
          ].map(t => (
            <button key={t.key}
              className={`${styles.subTab} ${tab === t.key ? styles.subTabActive : ''}`}
              onClick={() => setTab(t.key)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {tab === 'app'    && <AppTable />}
      {tab === 'domain' && <DomainTable />}
      {tab === 'user'   && <UserTable />}
    </div>
  );
}
