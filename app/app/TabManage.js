'use client';

import React, { useState } from 'react';
import styles from './App.module.css';

const INIT_APPS = [
  { id: 1,  code: 'VPN',       name: 'VPN Nội bộ',             domain: 'INFRA',   dept: 'Hạ tầng',      owner: 'Nguyễn Văn An',  owner_email: 'an.nv@company.com',   active: true  },
  { id: 2,  code: 'JIRA',      name: 'Jira Quản lý dự án',     domain: 'DEV',     dept: 'Công nghệ',    owner: 'Trần Thị Bích',  owner_email: 'bich.tt@company.com', active: true  },
  { id: 3,  code: 'GITLAB',    name: 'GitLab Source Control',   domain: 'DEV',     dept: 'Công nghệ',    owner: null,             owner_email: null,                  active: false },
  { id: 4,  code: 'CONFLUENCE',name: 'Confluence Tài liệu',    domain: 'OPS',     dept: 'Vận hành',     owner: 'Lê Minh Tú',     owner_email: 'tu.lm@company.com',   active: true  },
  { id: 5,  code: 'SLACK',     name: 'Slack Workspace',         domain: 'COMM',    dept: 'Truyền thông', owner: 'Phạm Hoàng Nam', owner_email: 'nam.ph@company.com',  active: true  },
  { id: 6,  code: 'FIGMA',     name: 'Figma Thiết kế',          domain: 'DESIGN',  dept: 'Thiết kế',     owner: null,             owner_email: null,                  active: true  },
  { id: 7,  code: 'AWS',       name: 'AWS Console',             domain: 'INFRA',   dept: 'Hạ tầng',      owner: 'Nguyễn Văn An',  owner_email: 'an.nv@company.com',   active: true  },
  { id: 8,  code: 'K8S',       name: 'Kubernetes Dashboard',    domain: 'INFRA',   dept: 'Hạ tầng',      owner: null,             owner_email: null,                  active: false },
  { id: 9,  code: 'SENTRY',    name: 'Sentry Error Tracking',   domain: 'DEV',     dept: 'Công nghệ',    owner: 'Trần Thị Bích',  owner_email: 'bich.tt@company.com', active: true  },
  { id: 10, code: 'GRAFANA',   name: 'Grafana Monitoring',      domain: 'OPS',     dept: 'Vận hành',     owner: 'Lê Minh Tú',     owner_email: 'tu.lm@company.com',   active: true  },
];

const INIT_DOMAINS = [
  { id: 1, code: 'INFRA',  name: 'Hạ tầng',      description: '', admin: '' },
  { id: 2, code: 'DEV',    name: 'Công nghệ',     description: '', admin: '' },
  { id: 3, code: 'OPS',    name: 'Vận hành',      description: '', admin: '' },
  { id: 4, code: 'COMM',   name: 'Truyền thông',  description: '', admin: '' },
  { id: 5, code: 'DESIGN', name: 'Thiết kế',      description: '', admin: '' },
];

const INIT_USERS = [
  { id: 1, last_name: 'Nguyễn', first_name: 'Văn An',    email: 'an.nv@company.com',    roles: []            },
  { id: 2, last_name: 'Trần',   first_name: 'Thị Bích',  email: 'bich.tt@company.com',  roles: ['owner']     },
  { id: 3, last_name: 'Lê',     first_name: 'Minh Tú',   email: 'tu.lm@company.com',    roles: ['owner']     },
  { id: 4, last_name: 'Phạm',   first_name: 'Hoàng Nam', email: 'nam.ph@company.com',   roles: []            },
  { id: 5, last_name: 'Hoàng',  first_name: 'Thu Hà',    email: 'ha.ht@company.com',    roles: ['sub-admin'] },
  { id: 6, last_name: 'Đỗ',     first_name: 'Quốc Bảo',  email: 'bao.dq@company.com',   roles: []            },
  { id: 7, last_name: 'Vũ',     first_name: 'Thành Long', email: 'long.vt@company.com',  roles: []            },
  { id: 8, last_name: 'Bùi',    first_name: 'Lan Anh',   email: 'anh.bl@company.com',   roles: ['owner']     },
];

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

function AppTable({ apps, setApps, domains }) {
  const [search, setSearch]           = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [page, setPage]               = useState(1);
  const [modal, setModal]             = useState(null); // null | 'addApp' | 'editApp'
  const [editAppTarget, setEditAppTarget] = useState(null);
  const [appForm, setAppForm]         = useState({ name: '', code: '', domain: '', ownerId: '', active: true });
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { id, label }

  let filtered = filterDomain ? apps.filter(a => a.domain === filterDomain) : apps;
  filtered = search
    ? filtered.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        a.domain.toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAddApp() {
    setAppForm({ name: '', code: '', domain: domains[0]?.code ?? '', ownerId: '', active: true });
    setModal('addApp');
  }

  function openEditApp(app) {
    setEditAppTarget(app);
    const matched = INIT_USERS.find(u => u.email === app.owner_email);
    setAppForm({ name: app.name, code: app.code, domain: app.domain, ownerId: matched ? String(matched.id) : '', active: app.active });
    setModal('editApp');
  }

  function resolveOwner(ownerId) {
    const u = INIT_USERS.find(u => String(u.id) === ownerId);
    return u ? { owner: `${u.last_name} ${u.first_name}`, owner_email: u.email } : { owner: null, owner_email: null };
  }

  function handleAddApp(e) {
    e.preventDefault();
    const { owner, owner_email } = resolveOwner(appForm.ownerId);
    setApps(p => [{
      id: Date.now(), code: appForm.code.toUpperCase(), name: appForm.name,
      domain: appForm.domain, dept: '—', owner, owner_email, active: appForm.active,
    }, ...p]);
    setModal(null); setPage(1);
  }

  function handleEditApp(e) {
    e.preventDefault();
    const { owner, owner_email } = resolveOwner(appForm.ownerId);
    setApps(p => p.map(a => a.id === editAppTarget.id
      ? { ...a, name: appForm.name, code: appForm.code.toUpperCase(), domain: appForm.domain, owner, owner_email, active: appForm.active }
      : a
    ));
    setModal(null);
  }

  function AppFormFields({ showActive }) {
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tên ứng dụng <span className={styles.required}>*</span></label>
          <input className={styles.formInput} type="text" placeholder="VD: Hệ thống VPN nội bộ" required autoFocus
            value={appForm.name} onChange={e => setAppForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Mã app <span className={styles.required}>*</span></label>
          <input className={styles.formInput} type="text" placeholder="VD: VPN" required
            value={appForm.code} onChange={e => setAppForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Domain</label>
          <select className={styles.formSelect} value={appForm.domain} onChange={e => setAppForm(p => ({ ...p, domain: e.target.value }))}>
            {domains.map(d => <option key={d.id} value={d.code}>{d.code}{d.name ? ` — ${d.name}` : ''}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Owner quản lý <OptLabel /></label>
          <select className={styles.formSelect} value={appForm.ownerId} onChange={e => setAppForm(p => ({ ...p, ownerId: e.target.value }))}>
            <option value="">— Chưa phân quyền —</option>
            {INIT_USERS.map(u => (
              <option key={u.id} value={String(u.id)}>{u.last_name} {u.first_name} ({u.email})</option>
            ))}
          </select>
        </div>
        {showActive && (
          <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="chkActive" checked={appForm.active}
              onChange={e => setAppForm(p => ({ ...p, active: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-red)' }} />
            <label htmlFor="chkActive" className={styles.formLabel} style={{ cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
              Đang hoạt động
            </label>
          </div>
        )}
      </>
    );
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
            {domains.map(d => <option key={d.id} value={d.code}>{d.code}{d.name ? ` — ${d.name}` : ''}</option>)}
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
            {paged.length > 0 ? paged.map(app => (
              <tr key={app.id} className={styles.mgmtRow}>
                <td><strong style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.8rem' }}>{app.code}</strong></td>
                <td>{app.name}</td>
                <td><span className={styles.mgmtDomainTag}>{app.domain}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{app.dept}</td>
                <td>
                  {app.owner
                    ? <div><div style={{ fontSize: '0.84rem' }}>{app.owner}</div><div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{app.owner_email}</div></div>
                    : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>Chưa phân quyền</span>
                  }
                </td>
                <td>
                  <span className={styles.mgmtBadge} style={app.active
                    ? { background: 'rgba(46,204,113,0.12)', color: '#2ecc71' }
                    : { background: 'rgba(160,154,185,0.1)', color: 'var(--text-secondary)' }
                  }>{app.active ? '● Hoạt động' : '○ Tạm dừng'}</span>
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
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleAddApp}>
              <AppFormFields showActive={false} />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Thêm</button>
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
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditApp}>
              <AppFormFields showActive={true} />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { setApps(p => p.filter(a => a.id !== confirmDelete.id)); setConfirmDelete(null); }}
        />
      )}
    </div>
  );
}

// ── Domain management ────────────────────────────────────────────

function DomainTable({ domains, setDomains, apps, setApps }) {
  const [search, setSearch]                     = useState('');
  const [modal, setModal]                       = useState(null); // null | 'addDomain' | 'editDomain'
  const [editDomainTarget, setEditDomainTarget] = useState(null);
  const [domainForm, setDomainForm]             = useState({ code: '', name: '', description: '', admin: '' });
  const [confirmDelete, setConfirmDelete]       = useState(null);

  const filtered = search
    ? domains.filter(d =>
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.name.toLowerCase().includes(search.toLowerCase())
      )
    : domains;

  function openAddDomain() {
    setDomainForm({ code: '', name: '', description: '', admin: '' });
    setModal('addDomain');
  }

  function openEditDomain(d) {
    setEditDomainTarget(d);
    setDomainForm({ code: d.code, name: d.name, description: d.description || '', admin: d.admin || '' });
    setModal('editDomain');
  }

  function handleAddDomain(e) {
    e.preventDefault();
    const code = domainForm.code.trim().toUpperCase();
    if (!code || domains.find(d => d.code === code)) return;
    setDomains(p => [...p, { id: Date.now(), code, name: domainForm.name, description: domainForm.description, admin: domainForm.admin }]);
    setModal(null);
  }

  function handleEditDomain(e) {
    e.preventDefault();
    const newCode = domainForm.code.trim().toUpperCase();
    const oldCode = editDomainTarget.code;
    setDomains(p => p.map(d => d.id === editDomainTarget.id
      ? { ...d, code: newCode, name: domainForm.name, description: domainForm.description, admin: domainForm.admin }
      : d
    ));
    if (newCode !== oldCode) {
      setApps(p => p.map(a => a.domain === oldCode ? { ...a, domain: newCode } : a));
    }
    setModal(null);
  }

  function DomainFormFields() {
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Mã Domain <span className={styles.required}>*</span></label>
          <input className={styles.formInput} type="text" placeholder="VD: INFRA" required autoFocus
            value={domainForm.code} onChange={e => setDomainForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tên Domain</label>
          <input className={styles.formInput} type="text" placeholder="VD: Hạ tầng mạng"
            value={domainForm.name} onChange={e => setDomainForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Mô tả ngắn</label>
          <textarea className={styles.formInput} placeholder="Mô tả về chức năng của Domain..."
            value={domainForm.description} onChange={e => setDomainForm(p => ({ ...p, description: e.target.value }))}
            style={{ height: 68, resize: 'none' }} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Admin quản lý <OptLabel /></label>
          <input className={styles.formInput} type="text" placeholder="VD: admin@company.com"
            value={domainForm.admin} onChange={e => setDomainForm(p => ({ ...p, admin: e.target.value }))} />
        </div>
      </>
    );
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
              <th>Mã Domain</th><th>Tên</th><th>Mô tả</th><th>Admin quản lý</th>
              <th>Số app</th><th style={{ width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(d => (
              <tr key={d.id} className={styles.mgmtRow}>
                <td><span className={styles.mgmtDomainTag} style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{d.code}</span></td>
                <td style={{ fontSize: '0.88rem' }}>{d.name || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 220 }}>{d.description || <span style={{ fontStyle: 'italic' }}>—</span>}</td>
                <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{d.admin || <span style={{ fontStyle: 'italic' }}>Chưa phân quyền</span>}</td>
                <td>
                  <span className={styles.mgmtBadge} style={{ background: 'rgba(139,133,193,0.13)', color: '#a09ab9' }}>
                    {apps.filter(a => a.domain === d.code).length} app
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
              <tr><td colSpan={6} className={styles.mgmtEmpty}>Không tìm thấy domain nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal === 'addDomain' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo Domain mới</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleAddDomain}>
              <DomainFormFields />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Tạo mới</button>
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
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditDomain}>
              <DomainFormFields />
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { setDomains(p => p.filter(d => d.id !== confirmDelete.id)); setConfirmDelete(null); }}
        />
      )}
    </div>
  );
}

// ── User management ──────────────────────────────────────────────

const EMPTY_USER_FORM = { last_name: '', first_name: '', email: '', password: '', roles: [] };

function UserTable({ users, setUsers }) {
  const [search, setSearch]               = useState('');
  const [modal, setModal]                 = useState(null); // null | 'addUser' | 'editUser'
  const [userForm, setUserForm]           = useState(EMPTY_USER_FORM);
  const [editUserTarget, setEditUserTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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
    setUserForm({ last_name: u.last_name, first_name: u.first_name, email: u.email, password: '', roles: u.roles });
    setModal('editUser');
  }

  function handleAddUser(e) {
    e.preventDefault();
    setUsers(p => [...p, {
      id: Date.now(),
      last_name: userForm.last_name,
      first_name: userForm.first_name,
      email: userForm.email,
      roles: userForm.roles,
    }]);
    setUserForm(EMPTY_USER_FORM);
    setModal(null);
  }

  function handleEditUser(e) {
    e.preventDefault();
    setUsers(p => p.map(u => u.id === editUserTarget.id
      ? { ...u, last_name: userForm.last_name, first_name: userForm.first_name, email: userForm.email, roles: userForm.roles }
      : u
    ));
    setModal(null);
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
              <th style={{ width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
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
                    {u.roles.includes('sub-admin') && (
                      <span className={styles.mgmtBadge} style={{ background: 'rgba(222,26,26,0.11)', color: '#ff6b6b' }}>Admin</span>
                    )}
                    {u.roles.includes('owner') && (
                      <span className={styles.mgmtBadge} style={{ background: 'rgba(46,204,113,0.12)', color: '#2ecc71' }}>Owner</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <IconBtn title="Sửa" onClick={() => openEditUser(u)}><EditIcon /></IconBtn>
                    <IconBtn title="Xóa" danger onClick={() => setConfirmDelete({ id: u.id, label: `${u.last_name} ${u.first_name}` })}><DeleteIcon /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { setUsers(p => p.filter(u => u.id !== confirmDelete.id)); setConfirmDelete(null); }}
        />
      )}

      {/* Modal: Tạo user */}
      {modal === 'addUser' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo Tài Khoản</h3>
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleAddUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Họ <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" placeholder="Nguyễn" required autoFocus
                    value={userForm.last_name} onChange={e => setUserForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Tên <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" placeholder="Văn A" required
                    value={userForm.first_name} onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" placeholder="user@company.com" required
                  value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" placeholder="Tối thiểu 8 ký tự" required
                  value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
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
                        style={{ width: 15, height: 15, accentColor: 'var(--color-red)', cursor: 'pointer' }} />
                      {r.label}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Không chọn = mặc định Requester (không hiển thị vai trò)
                </p>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Tạo tài khoản</button>
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
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Họ <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" required autoFocus
                    value={userForm.last_name} onChange={e => setUserForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>Tên <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} type="text" required
                    value={userForm.first_name} onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" required
                  value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
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
                        style={{ width: 15, height: 15, accentColor: 'var(--color-red)', cursor: 'pointer' }} />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Lưu thay đổi</button>
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
  const [tab, setTab]         = useState('app');
  const [apps, setApps]       = useState(INIT_APPS);
  const [domains, setDomains] = useState(INIT_DOMAINS);
  const [users, setUsers]     = useState(INIT_USERS);

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

      {tab === 'app'    && <AppTable    apps={apps}       setApps={setApps}       domains={domains} />}
      {tab === 'domain' && <DomainTable domains={domains} setDomains={setDomains} apps={apps} setApps={setApps} />}
      {tab === 'user'   && <UserTable   users={users}     setUsers={setUsers} />}
    </div>
  );
}
