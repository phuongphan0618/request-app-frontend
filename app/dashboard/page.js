'use client';

import React, { useState } from 'react';
import { useTheme } from '../../lib/useTheme';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

const TABS = [
  { key: 'pending', label: 'Chưa xử lý' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'done', label: 'Đã xử lý' },
];

const MOCK = {
  pending: [
    { id: 'REQ-001', name: 'Nguyễn Văn An', email: 'nvan@company.com', pnl: 'PNL-IT', domain: 'Hạ tầng mạng', apps: ['VPN', 'JIRA'], deadline: '20/06/2026', waitTime: '2 ngày' },
    { id: 'REQ-002', name: 'Trần Thị Bình', email: 'ttbinh@company.com', pnl: 'PNL-HR', domain: 'Nhân sự', apps: ['SAP HR'], deadline: '22/06/2026', waitTime: '4 ngày' },
    { id: 'REQ-003', name: 'Lê Minh Châu', email: 'lmchau@company.com', pnl: 'PNL-FIN', domain: 'Tài chính', apps: ['Oracle', 'Tableau'], deadline: '18/06/2026', waitTime: '6 ngày' },
    { id: 'REQ-007', name: 'Ngô Thị Dung', email: 'ntdung@company.com', pnl: 'PNL-OPS', domain: 'Vận hành', apps: ['Monitoring'], deadline: '25/06/2026', waitTime: '1 ngày' },
  ],
  processing: [
    { id: 'REQ-004', name: 'Phạm Quốc Dũng', email: 'pqdung@company.com', pnl: 'PNL-IT', domain: 'Bảo mật', apps: ['CyberArk'], deadline: '19/06/2026', waitTime: '1 ngày' },
    { id: 'REQ-008', name: 'Đinh Văn Hải', email: 'dvhai@company.com', pnl: 'PNL-IT', domain: 'Hạ tầng mạng', apps: ['VPN', 'Cisco ISE'], deadline: '21/06/2026', waitTime: '3 ngày' },
  ],
  done: [
    { id: 'REQ-005', name: 'Hoàng Thị Em', email: 'htem@company.com', pnl: 'PNL-OPS', domain: 'Vận hành', apps: ['Monitoring', 'Grafana'], deadline: '15/06/2026', waitTime: '3 ngày' },
    { id: 'REQ-006', name: 'Vũ Đức Phong', email: 'vdphong@company.com', pnl: 'PNL-IT', domain: 'Hạ tầng mạng', apps: ['VPN'], deadline: '14/06/2026', waitTime: '5 ngày' },
    { id: 'REQ-009', name: 'Bùi Thị Giang', email: 'btgiang@company.com', pnl: 'PNL-FIN', domain: 'Tài chính', apps: ['Oracle'], deadline: '12/06/2026', waitTime: '7 ngày' },
  ],
};

const TOTAL = Object.values(MOCK).reduce((sum, arr) => sum + arr.length, 0);

const RATIO = [
  { label: 'Chưa xử lý', count: MOCK.pending.length, color: '#DE1A1A' },
  { label: 'Đang xử lý', count: MOCK.processing.length, color: '#8B85C1' },
  { label: 'Đã xử lý',   count: MOCK.done.length, color: '#2ecc71' },
];

function buildGradient() {
  let cum = 0;
  return RATIO.map(r => {
    const start = cum;
    cum += (r.count / TOTAL) * 100;
    return `${r.color} ${start.toFixed(1)}% ${cum.toFixed(1)}%`;
  }).join(', ');
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('pending');
  const [sortBy, setSortBy] = useState('waitTime');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const requests = MOCK[activeTab];
  const tabLabel = { pending: 'pending', processing: 'in-progress', done: 'completed' }[activeTab];

  return (
    <div className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <div className={styles.ambientBlob1} />
      <div className={styles.ambientBlob2} />


      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.navBrand} onClick={() => router.push('/dashboard')}>
            Access Request System
          </span>
          <div className={styles.navLinks}>
            <button className={`${styles.navLink} ${styles.navLinkActive}`}>Dashboard</button>
            <button className={styles.navLink}>Batch</button>
            <button className={styles.navLink}>Request Details</button>
          </div>
        </div>

        <div className={styles.navRight}>
          <div className={styles.searchBar}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Quick search..." className={styles.searchInput} />
          </div>

          <button className={styles.navIconBtn} title="Thông báo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          <button className={styles.navIconBtn} onClick={toggleTheme} title="Đổi giao diện">
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Settings icon → popover menu */}
          <div className={styles.settingsWrap}>
            {drawerOpen && <div className={styles.sideBackdrop} onClick={() => setDrawerOpen(false)} />}
            <button
              className={`${styles.navIconBtn} ${drawerOpen ? styles.navIconBtnActive : ''}`}
              onClick={() => setDrawerOpen(o => !o)}
              title="Menu quản trị"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {/* Dropdown menu */}
            <div className={`${styles.sideDrawer} ${drawerOpen ? styles.sideDrawerOpen : ''}`}>
              <button className={styles.sideItem} onClick={() => { router.push('/apps'); setDrawerOpen(false); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </span>
                Quản lý App
              </button>

              <button className={styles.sideItem} onClick={() => { router.push('/users'); setDrawerOpen(false); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </span>
                Tạo User
              </button>

              <button className={styles.sideItem} onClick={() => { router.push('/user-list'); setDrawerOpen(false); }}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                Danh sách User
              </button>

              <div className={styles.sideDivider} />

              <button className={styles.sideItem} onClick={() => router.push('/login')}>
                <span className={styles.sideIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                Đăng xuất
              </button>
            </div>
          </div>

          <button className={styles.navIconBtn} title="Tài khoản">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className={styles.content}>

        {/* Left panel — request table */}
        <div className={styles.leftPanel}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className={styles.tabBadge}>{MOCK[tab.key].length}</span>
              </button>
            ))}
          </div>

          <div className={styles.sortBar}>
            <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="waitTime">Sort: Wait Time</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="id">Sort: Request ID</option>
            </select>
            <span className={styles.countText}>
              Showing <strong>{requests.length}</strong> {tabLabel} requests
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Requester</th>
                  <th>PNL / Domain</th>
                  <th>Applications</th>
                  <th>Deadline</th>
                  <th>Wait Time</th>
                  {activeTab === 'pending' && <th style={{ width: '72px' }}>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="7" className={styles.emptyState}>Không có yêu cầu nào.</td></tr>
                ) : requests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td>
                      <div className={styles.requesterCell}>
                        <span>{req.name}</span>
                        <span className={styles.subText}>{req.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.pnlCell}>
                        <span>{req.pnl}</span>
                        <span className={styles.subText}>{req.domain}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.appTags}>
                        {req.apps.map(app => <span key={app} className={styles.appTag}>{app}</span>)}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{req.deadline}</td>
                    <td><span className={styles.waitBadge}>{req.waitTime}</span></td>
                    {activeTab === 'pending' && (
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.actionBtn} ${styles.approveBtn}`} title="Duyệt">✓</button>
                          <button className={`${styles.actionBtn} ${styles.rejectBtn}`} title="Từ chối">✗</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Request Ratio
            </div>
            <div className={styles.donutWrap}>
              <div className={styles.donut} style={{ background: `conic-gradient(${buildGradient()})` }} />
              <div className={styles.donutCenter}>
                <span className={styles.donutTotal}>{TOTAL}</span>
                <span className={styles.donutLabel}>Total</span>
              </div>
            </div>
            <div className={styles.legend}>
              {RATIO.map(r => (
                <div key={r.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: r.color }} />
                  <span className={styles.legendLabel}>{r.label}</span>
                  <span className={styles.legendCount}>{r.count}</span>
                  <span className={styles.legendPct}>{Math.round((r.count / TOTAL) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Thống kê nhanh
            </div>
            <div className={styles.quickStats}>
              {[
                { label: 'Cần xử lý', val: MOCK.pending.length, color: '#DE1A1A' },
                { label: 'Đang xử lý', val: MOCK.processing.length, color: '#8B85C1' },
                { label: 'Hoàn thành', val: MOCK.done.length, color: '#2ecc71' },
                { label: 'Tổng cộng', val: TOTAL, color: null },
              ].map(s => (
                <div key={s.label} className={styles.quickStat}>
                  <span className={styles.quickStatLabel}>{s.label}</span>
                  <span className={styles.quickStatNum} style={s.color ? { color: s.color } : {}}>
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
