'use client';

import React, { useState, useEffect } from 'react';
import LoginBackground from '../../components/login/LoginBackground';
import {
  checkBackendConnection,
  getDepartments, createDepartment, deleteDepartment, updateDepartment,
  getDomains, createDomain, deleteDomain, updateDomain,
  getApplications, createApplication, deleteApplication, updateApplication,
  getUsers
} from '../../lib/api';
import styles from './Admin.module.css';
import ToolbarFilters from './components/ToolbarFilters';
import ApplicationsTable from './components/ApplicationsTable';
import DeptModals from './components/modals/DeptModals';
import DomainModals from './components/modals/DomainModals';
import AppModals from './components/modals/AppModals';

export default function AdminPage() {
  const [isDark, setIsDark] = useState(true);
  const [connMode, setConnMode] = useState({ connected: false, mode: 'Checking...' });

  // Data States
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [applications, setApplications] = useState([]);
  const [owners, setOwners] = useState([]);

  // Filter States
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Department Modal States
  const [deptModals, setDeptModals] = useState({ create: false, edit: false });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [editingDept, setEditingDept] = useState(null);

  // Domain Modal States
  const [domainModals, setDomainModals] = useState({ create: false, edit: false });
  const [domainForm, setDomainForm] = useState({ name: '', code: '', description: '', department: '' });
  const [editingDomain, setEditingDomain] = useState(null);

  // App Modal States
  const [appModals, setAppModals] = useState({ create: false, edit: false });
  const [appForm, setAppForm] = useState({ name: '', code: '', description: '', domain: '', owner: '', is_active: true });
  const [editingApp, setEditingApp] = useState(null);

  // 1. Initial Load & Backend Ping
  useEffect(() => {
    async function init() {
      const conn = await checkBackendConnection();
      setConnMode(conn);
      
      try {
        const [depts, allDomains, allApps, allUsers] = await Promise.all([
          getDepartments(),
          getDomains(),
          getApplications(),
          getUsers()
        ]);
        setDepartments(depts);
        setDomains(allDomains);
        setApplications(allApps);
        setOwners(allUsers);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu ban đầu:", err);
      }
    }
    init();
  }, []);

  // 2. Cascade Dropdown Filtering logic
  // Lấy các domain thuộc department được chọn
  const filteredDomainsList = selectedDeptId 
    ? domains.filter(d => d.department === Number(selectedDeptId))
    : domains;

  // Lọc danh sách app hiển thị trên bảng
  const displayApps = applications.filter(app => {
    // Lọc theo department (thông qua domain)
    if (selectedDeptId && !selectedDomainId) {
      const domainIdsInDept = domains
        .filter(d => d.department === Number(selectedDeptId))
        .map(d => d.id);
      if (!domainIdsInDept.includes(app.domain)) return false;
    }
    // Lọc theo domain
    if (selectedDomainId && app.domain !== Number(selectedDomainId)) {
      return false;
    }
    // Lọc theo query search (tên app hoặc mã)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = app.name.toLowerCase().includes(q);
      const matchCode = app.code.toLowerCase().includes(q);
      const matchOwner = app.owner_detail ? (app.owner_detail.first_name + ' ' + app.owner_detail.last_name).toLowerCase().includes(q) : false;
      if (!matchName && !matchCode && !matchOwner) return false;
    }
    return true;
  });

  // Reset Domain Filter when Dept changes
  const handleDeptFilterChange = (e) => {
    setSelectedDeptId(e.target.value);
    setSelectedDomainId(''); // Reset domain selector
  };

  // ═══════════════════════════════════════════════
  // DEPARTMENT HANDLERS
  // ═══════════════════════════════════════════════
  const handleCreateDept = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await createDepartment(deptForm);
      setDepartments(prev => [...prev, res]);
      setDeptForm({ name: '', code: '', description: '' });
      setDeptModals({ create: false, edit: false });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await updateDepartment(editingDept.id, deptForm);
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? res : d));
      setDeptModals({ create: false, edit: false });
      setEditingDept(null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  // DOMAIN HANDLERS
  // ═══════════════════════════════════════════════
  const handleCreateDomain = async (e) => {
    e.preventDefault();
    if (!domainForm.department) {
      setErrorMsg('Vui lòng chọn Phòng ban trực thuộc!');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await createDomain(domainForm);
      setDomains(prev => [...prev, res]);
      setDepartments(prev => prev.map(d => d.id === Number(domainForm.department) ? { ...d, domain_count: (d.domain_count || 0) + 1 } : d));
      setDomainForm({ name: '', code: '', description: '', department: '' });
      setDomainModals({ create: false, edit: false });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDomain = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await updateDomain(editingDomain.id, domainForm);
      setDomains(prev => prev.map(d => d.id === editingDomain.id ? res : d));
      setDomainModals({ create: false, edit: false });
      setEditingDomain(null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  // APPLICATION HANDLERS
  // ═══════════════════════════════════════════════
  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!appForm.domain) {
      setErrorMsg('Vui lòng chọn Domain trực thuộc!');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await createApplication(appForm);
      setApplications(prev => [...prev, res]);
      setDomains(prev => prev.map(dm => dm.id === Number(appForm.domain) ? { ...dm, application_count: (dm.application_count || 0) + 1 } : dm));
      setAppForm({ name: '', code: '', description: '', domain: '', owner: '', is_active: true });
      setAppModals({ create: false, edit: false });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await updateApplication(editingApp.id, editingApp);
      setApplications(prev => prev.map(a => a.id === editingApp.id ? res : a));
      setAppModals({ create: false, edit: false });
      setEditingApp(null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  // DELETE & TOGGLE HANDLERS
  // ═══════════════════════════════════════════════
  const handleDeleteApp = async (appId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Ứng dụng này không?')) return;
    try {
      await deleteApplication(appId);
      const app = applications.find(a => a.id === appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      if (app) {
        setDomains(prev => prev.map(dm => dm.id === app.domain ? { ...dm, application_count: Math.max(0, (dm.application_count || 1) - 1) } : dm));
      }
    } catch (err) {
      alert('Lỗi xóa App: ' + err.message);
    }
  };

  const handleToggleActive = async (app) => {
    try {
      const updated = await updateApplication(app.id, { is_active: !app.is_active });
      setApplications(prev => prev.map(a => a.id === app.id ? updated : a));
    } catch (err) {
      alert('Không thể cập nhật trạng thái hoạt động: ' + err.message);
    }
  };

  const handleDeleteDept = async (deptId) => {
    try {
      await deleteDepartment(deptId);
      setDepartments(prev => prev.filter(d => d.id !== deptId));
      const domainsInDept = domains.filter(dm => dm.department === deptId).map(dm => dm.id);
      setDomains(prev => prev.filter(d => d.department !== deptId));
      setApplications(prev => prev.filter(app => !domainsInDept.includes(app.domain)));
      setSelectedDeptId('');
      setSelectedDomainId('');
    } catch (err) {
      alert('Lỗi xóa PNL: ' + err.message);
    }
  };

  const handleDeleteDomain = async (domainId) => {
    try {
      await deleteDomain(domainId);
      setDomains(prev => prev.filter(d => d.id !== domainId));
      const deptId = domains.find(d => d.id === domainId)?.department;
      setApplications(prev => prev.filter(app => app.domain !== domainId));
      if (deptId) {
        setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, domain_count: Math.max(0, (d.domain_count || 1) - 1) } : d));
      }
      setSelectedDomainId('');
    } catch (err) {
      alert('Lỗi xóa Domain: ' + err.message);
    }
  };

  return (
    <main className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />

      <div className={styles.panel}>
        
        {/* Header Section */}
        <div className={styles.headerBar}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Danh Sách</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Connection badge */}
            <div className={styles.connBadge}>
              <span className={`${styles.connDot} ${connMode.connected ? styles.connConnected : styles.connMock}`} />
              <span>{connMode.mode}</span>
            </div>

            {/* Light/Dark Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={styles.themeToggle}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                /* Sun Icon */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar Section (Cascade Filters) */}
        <ToolbarFilters
          selectedDeptId={selectedDeptId}
          departments={departments}
          onDeptChange={handleDeptFilterChange}
          onDeptAdd={() => {
            setDeptForm({ name: '', code: '', description: '' });
            setDeptModals({ create: true, edit: false });
          }}
          onDeptEdit={() => {
            if (selectedDeptId) {
              const dept = departments.find(d => d.id === Number(selectedDeptId));
              if (dept) {
                setEditingDept(dept);
                setDeptForm(dept);
                setDeptModals({ create: false, edit: true });
              }
            }
          }}
          onDeptDelete={() => {
            if (selectedDeptId && confirm('Xóa PNL này sẽ xóa tất cả Domain và Ứng dụng bên trong. Tiếp tục?')) {
              handleDeleteDept(Number(selectedDeptId));
            }
          }}

          selectedDomainId={selectedDomainId}
          filteredDomainsList={filteredDomainsList}
          onDomainChange={(e) => setSelectedDomainId(e.target.value)}
          onDomainAdd={() => {
            setDomainForm({ name: '', code: '', description: '', department: selectedDeptId });
            setDomainModals({ create: true, edit: false });
          }}
          onDomainEdit={() => {
            if (selectedDomainId) {
              const domain = domains.find(d => d.id === Number(selectedDomainId));
              if (domain) {
                setEditingDomain(domain);
                setDomainForm(domain);
                setDomainModals({ create: false, edit: true });
              }
            }
          }}
          onDomainDelete={() => {
            if (selectedDomainId && confirm('Xóa Domain này sẽ xóa tất cả Ứng dụng bên trong. Tiếp tục?')) {
              handleDeleteDomain(Number(selectedDomainId));
            }
          }}

          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}

          onAppAdd={() => {
            setAppForm({ name: '', code: '', description: '', domain: selectedDomainId, owner: '', is_active: true });
            setAppModals({ create: true, edit: false });
          }}
        />

        {/* Main Applications Table */}
        <ApplicationsTable
          displayApps={displayApps}
          onEdit={(app) => {
            setEditingApp({ ...app });
            setAppModals({ create: false, edit: true });
          }}
          onDelete={handleDeleteApp}
          onToggleActive={handleToggleActive}
        />

      </div>

      {/* ═══════════════════════════════════════════════
          MODALS ZONE - Extracted Components
      ═══════════════════════════════════════════════ */}

      <DeptModals
        isCreateOpen={deptModals.create}
        onCreateClose={() => setDeptModals({ create: false, edit: false })}
        createForm={deptForm}
        onCreateFormChange={setDeptForm}
        onCreateSubmit={handleCreateDept}

        isEditOpen={deptModals.edit}
        onEditClose={() => setDeptModals({ create: false, edit: false })}
        editingItem={editingDept}
        editForm={deptForm}
        onEditFormChange={setDeptForm}
        onEditSubmit={handleUpdateDept}

        loading={loading}
        errorMsg={errorMsg}
      />

      <DomainModals
        isCreateOpen={domainModals.create}
        onCreateClose={() => setDomainModals({ create: false, edit: false })}
        createForm={domainForm}
        onCreateFormChange={setDomainForm}
        onCreateSubmit={handleCreateDomain}

        isEditOpen={domainModals.edit}
        onEditClose={() => setDomainModals({ create: false, edit: false })}
        editingItem={editingDomain}
        editForm={domainForm}
        onEditFormChange={setDomainForm}
        onEditSubmit={handleUpdateDomain}

        departments={departments}
        loading={loading}
        errorMsg={errorMsg}
      />

      <AppModals
        isCreateOpen={appModals.create}
        onCreateClose={() => setAppModals({ create: false, edit: false })}
        createForm={appForm}
        onCreateFormChange={setAppForm}
        onCreateSubmit={handleCreateApp}

        isEditOpen={appModals.edit}
        onEditClose={() => setAppModals({ create: false, edit: false })}
        editingItem={editingApp}
        onEditingItemChange={setEditingApp}
        onEditSubmit={handleUpdateApp}

        domains={domains}
        owners={owners}
        loading={loading}
        errorMsg={errorMsg}
      />

    </main>
  );
}
