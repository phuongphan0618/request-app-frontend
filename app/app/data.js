export const MOCK_USER = { name: 'Nguyễn Văn A', email: 'vana@company.com', initials: 'VA' };

export const MOCK_CATALOG = {
  Engineering: {
    Cloud:    ['AWS Console', 'GCP Console', 'Azure Portal'],
    Platform: ['GitHub Enterprise', 'Jira', 'Confluence'],
    DevOps:   ['Datadog', 'Grafana', 'Jenkins', 'ArgoCD'],
  },
  Data: {
    Analytics: ['BigQuery', 'Looker', 'Metabase'],
    'ML/AI':   ['Vertex AI', 'SageMaker', 'MLflow'],
  },
  Security: {
    Infra:  ['Vault', 'CyberArk', 'Okta'],
    AppSec: ['SonarQube', 'Snyk', 'Burp Suite'],
  },
  Product: {
    Management: ['Jira', 'Notion', 'Linear'],
    UX:         ['Figma', 'Miro', 'Zeplin'],
  },
};

export const MOCK_APP_OWNERS = {
  'AWS Console':       { owner_name: 'Minh Tú',   owner_email: 'minthu@co.com' },
  'GCP Console':       { owner_name: 'Lan Anh',   owner_email: 'lananh@co.com' },
  'Azure Portal':      { owner_name: 'Quốc Huy',  owner_email: 'quochuy@co.com' },
  'GitHub Enterprise': { owner_name: 'Quốc Huy',  owner_email: 'quochuy@co.com' },
  'Jira':              { owner_name: 'Minh Tú',   owner_email: 'minthu@co.com' },
  'Confluence':        { owner_name: 'Minh Tú',   owner_email: 'minthu@co.com' },
  'Datadog':           { owner_name: 'Lan Anh',   owner_email: 'lananh@co.com' },
  'Grafana':           { owner_name: 'Lan Anh',   owner_email: 'lananh@co.com' },
  'Jenkins':           { owner_name: 'Bảo Châu',  owner_email: 'baochau@co.com' },
  'ArgoCD':            { owner_name: 'Bảo Châu',  owner_email: 'baochau@co.com' },
  'BigQuery':          { owner_name: 'Thu Hằng',  owner_email: 'thuhang@co.com' },
  'Looker':            { owner_name: 'Thu Hằng',  owner_email: 'thuhang@co.com' },
  'Metabase':          { owner_name: 'Thu Hằng',  owner_email: 'thuhang@co.com' },
  'Vertex AI':         { owner_name: 'Đình Khoa', owner_email: 'dinhkhoa@co.com' },
  'SageMaker':         { owner_name: 'Đình Khoa', owner_email: 'dinhkhoa@co.com' },
  'MLflow':            { owner_name: 'Đình Khoa', owner_email: 'dinhkhoa@co.com' },
  'Vault':             { owner_name: 'Quốc Huy',  owner_email: 'quochuy@co.com' },
  'CyberArk':          { owner_name: 'Quốc Huy',  owner_email: 'quochuy@co.com' },
  'Okta':              { owner_name: 'Bảo Châu',  owner_email: 'baochau@co.com' },
  'SonarQube':         { owner_name: 'Bảo Châu',  owner_email: 'baochau@co.com' },
  'Snyk':              { owner_name: 'Bảo Châu',  owner_email: 'baochau@co.com' },
  'Burp Suite':        { owner_name: 'Quốc Huy',  owner_email: 'quochuy@co.com' },
  'Notion':            { owner_name: 'Minh Tú',   owner_email: 'minthu@co.com' },
  'Linear':            { owner_name: 'Minh Tú',   owner_email: 'minthu@co.com' },
  'Figma':             { owner_name: 'Thu Hằng',  owner_email: 'thuhang@co.com' },
  'Miro':              { owner_name: 'Thu Hằng',  owner_email: 'thuhang@co.com' },
  'Zeplin':            { owner_name: 'Thu Hằng',  owner_email: 'thuhang@co.com' },
};

let _idCounter = 100;
export function genId() { return `REQ-${++_idCounter}`; }

export const INITIAL_ALL_REQUESTS = [
  {
    id: 'REQ-001', created_at: '2026-06-10T08:00:00Z', deadline: '2026-06-30',
    status: 'pending_admin', is_urgent: true,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Engineering', domain_name: 'Platform',
    reason: 'Cần quyền truy cập Jira và Confluence để quản lý sprint Q3 của team. Dự án sẽ bắt đầu từ 01/07.',
    items: [
      { id: 1, application_name: 'Jira',      ...MOCK_APP_OWNERS['Jira'] },
      { id: 2, application_name: 'Confluence', ...MOCK_APP_OWNERS['Confluence'] },
    ],
  },
  {
    id: 'REQ-002', created_at: '2026-06-12T09:30:00Z', deadline: '2026-07-15',
    status: 'pending_owner', is_urgent: false,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Product', domain_name: 'UX',
    items: [
      { id: 3, application_name: 'Figma', ...MOCK_APP_OWNERS['Figma'] },
    ],
  },
  {
    id: 'REQ-003', created_at: '2026-05-20T07:00:00Z', deadline: '2026-06-01',
    status: 'completed', is_urgent: false,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Engineering', domain_name: 'DevOps',
    items: [
      { id: 4, application_name: 'Datadog', ...MOCK_APP_OWNERS['Datadog'] },
      { id: 5, application_name: 'Grafana', ...MOCK_APP_OWNERS['Grafana'] },
    ],
  },
  {
    id: 'REQ-010', created_at: '2026-06-19T06:00:00Z', deadline: '2026-06-25',
    status: 'pending_admin', is_urgent: true,
    requester_name: 'Trần Thị B', requester_email: 'huonph.19t.a@company.com',
    department_name: 'Engineering', domain_name: 'Cloud',
    reason: 'Cần gấp để setup môi trường staging cho release v2.4 vào cuối tháng.',
    items: [
      { id: 11, application_name: 'AWS Console', ...MOCK_APP_OWNERS['AWS Console'] },
      { id: 12, application_name: 'Datadog',     ...MOCK_APP_OWNERS['Datadog'] },
    ],
  },
  {
    id: 'REQ-011', created_at: '2026-06-20T10:00:00Z', deadline: '2026-07-01',
    status: 'pending_admin', is_urgent: false,
    requester_name: 'Lê Văn C', requester_email: 'vanc@company.com',
    department_name: 'Data', domain_name: 'Analytics',
    items: [
      { id: 13, application_name: 'BigQuery', ...MOCK_APP_OWNERS['BigQuery'] },
    ],
  },
  {
    id: 'REQ-012', created_at: '2026-06-15T08:00:00Z', deadline: '2026-06-22',
    status: 'pending_admin', is_urgent: false,
    requester_name: 'Phạm Thị D', requester_email: 'thid@company.com',
    department_name: 'Engineering', domain_name: 'Platform',
    items: [
      { id: 14, application_name: 'GitHub Enterprise', ...MOCK_APP_OWNERS['GitHub Enterprise'] },
    ],
  },
  {
    id: 'REQ-013', created_at: '2026-06-20T14:00:00Z', deadline: '2026-07-10',
    status: 'pending_admin', is_urgent: false,
    requester_name: 'Hoàng Văn E', requester_email: 'vane@company.com',
    department_name: 'Security', domain_name: 'Infra',
    items: [
      { id: 15, application_name: 'AWS Console', ...MOCK_APP_OWNERS['AWS Console'] },
      { id: 16, application_name: 'Vault',       ...MOCK_APP_OWNERS['Vault'] },
    ],
  },
  {
    id: 'REQ-014', created_at: '2026-06-01T09:00:00Z', deadline: '2026-06-10',
    status: 'completed', is_urgent: false,
    requester_name: 'Ngô Thị F', requester_email: 'thif@company.com',
    department_name: 'Product', domain_name: 'Management',
    items: [
      { id: 17, application_name: 'Jira', ...MOCK_APP_OWNERS['Jira'] },
    ],
  },

  // ── Thêm cho admin pagination (trang 2) ──
  {
    id: 'REQ-015', created_at: '2026-06-21T08:00:00Z', deadline: '2026-07-05',
    status: 'pending_admin', is_urgent: false,
    requester_name: 'Đinh Thị G', requester_email: 'thig@company.com',
    department_name: 'Data', domain_name: 'ML/AI',
    reason: 'Cần Vertex AI để training model dự báo doanh thu Q3.',
    items: [
      { id: 31, application_name: 'Vertex AI', ...MOCK_APP_OWNERS['Vertex AI'] },
      { id: 32, application_name: 'MLflow',    ...MOCK_APP_OWNERS['MLflow'] },
    ],
  },
  {
    id: 'REQ-016', created_at: '2026-06-22T10:30:00Z', deadline: '2026-07-15',
    status: 'pending_admin', is_urgent: true,
    requester_name: 'Bùi Văn H', requester_email: 'vanh@company.com',
    department_name: 'Security', domain_name: 'AppSec',
    reason: 'Audit security trước release v3.0 vào cuối tháng 7.',
    items: [
      { id: 33, application_name: 'SonarQube', ...MOCK_APP_OWNERS['SonarQube'] },
      { id: 34, application_name: 'Snyk',      ...MOCK_APP_OWNERS['Snyk'] },
      { id: 35, application_name: 'Burp Suite',...MOCK_APP_OWNERS['Burp Suite'] },
    ],
  },
  {
    id: 'REQ-017', created_at: '2026-06-22T14:00:00Z', deadline: '2026-07-01',
    status: 'pending_admin', is_urgent: false,
    requester_name: 'Trịnh Thị I', requester_email: 'thii@company.com',
    department_name: 'Product', domain_name: 'UX',
    items: [
      { id: 36, application_name: 'Figma', ...MOCK_APP_OWNERS['Figma'] },
      { id: 37, application_name: 'Miro',  ...MOCK_APP_OWNERS['Miro'] },
    ],
  },
  {
    id: 'REQ-018', created_at: '2026-06-23T09:00:00Z', deadline: '2026-07-20',
    status: 'pending_admin', is_urgent: false,
    requester_name: 'Vũ Văn K', requester_email: 'vank@company.com',
    department_name: 'Engineering', domain_name: 'DevOps',
    reason: 'Cần CI/CD pipeline cho project mới của team backend.',
    items: [
      { id: 38, application_name: 'Jenkins', ...MOCK_APP_OWNERS['Jenkins'] },
      { id: 39, application_name: 'ArgoCD',  ...MOCK_APP_OWNERS['ArgoCD'] },
    ],
  },
  {
    id: 'REQ-019', created_at: '2026-06-23T11:00:00Z', deadline: '2026-07-10',
    status: 'rejected_by_admin', is_urgent: false,
    reject_note: 'Tài khoản chưa qua onboarding security. Vui lòng hoàn thành training trước.',
    requester_name: 'Lý Thị L', requester_email: 'thil@company.com',
    department_name: 'Security', domain_name: 'Infra',
    items: [
      { id: 40, application_name: 'CyberArk', ...MOCK_APP_OWNERS['CyberArk'] },
      { id: 41, application_name: 'Vault',    ...MOCK_APP_OWNERS['Vault'] },
    ],
  },
  {
    id: 'REQ-020', created_at: '2026-06-10T08:00:00Z', deadline: '2026-06-20',
    status: 'completed', is_urgent: false,
    requester_name: 'Đặng Văn M', requester_email: 'vanm@company.com',
    department_name: 'Data', domain_name: 'Analytics',
    items: [
      { id: 42, application_name: 'Looker',   ...MOCK_APP_OWNERS['Looker'] },
      { id: 43, application_name: 'Metabase', ...MOCK_APP_OWNERS['Metabase'] },
    ],
  },

  // ── Thêm cho requester pagination (MOCK_USER) ──
  {
    id: 'REQ-004', created_at: '2026-06-05T10:00:00Z', deadline: '2026-06-28',
    status: 'pending_admin', is_urgent: false,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Data', domain_name: 'Analytics',
    reason: 'Cần phân tích dữ liệu người dùng cho báo cáo tháng 6.',
    items: [
      { id: 51, application_name: 'BigQuery', ...MOCK_APP_OWNERS['BigQuery'] },
      { id: 52, application_name: 'Looker',   ...MOCK_APP_OWNERS['Looker'] },
    ],
  },
  {
    id: 'REQ-005', created_at: '2026-06-08T08:30:00Z', deadline: null,
    status: 'pending_owner', is_urgent: false,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Engineering', domain_name: 'Cloud',
    items: [
      { id: 53, application_name: 'GCP Console', ...MOCK_APP_OWNERS['GCP Console'] },
    ],
  },
  {
    id: 'REQ-006', created_at: '2026-05-15T09:00:00Z', deadline: '2026-05-30',
    status: 'rejected_by_admin', is_urgent: false,
    reject_note: 'Chưa có approval từ team lead. Vui lòng bổ sung và gửi lại.',
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Security', domain_name: 'AppSec',
    items: [
      { id: 54, application_name: 'Snyk', ...MOCK_APP_OWNERS['Snyk'] },
    ],
  },
  {
    id: 'REQ-007', created_at: '2026-04-20T07:00:00Z', deadline: '2026-05-01',
    status: 'completed', is_urgent: false,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Engineering', domain_name: 'Platform',
    items: [
      { id: 55, application_name: 'GitHub Enterprise', ...MOCK_APP_OWNERS['GitHub Enterprise'] },
    ],
  },
  {
    id: 'REQ-008', created_at: '2026-06-18T14:00:00Z', deadline: '2026-07-05',
    status: 'pending_admin', is_urgent: true,
    requester_name: MOCK_USER.name, requester_email: MOCK_USER.email,
    department_name: 'Engineering', domain_name: 'DevOps',
    reason: 'Gấp — cần monitoring cho hệ thống đang bị lỗi production.',
    items: [
      { id: 56, application_name: 'Datadog', ...MOCK_APP_OWNERS['Datadog'] },
      { id: 57, application_name: 'Grafana', ...MOCK_APP_OWNERS['Grafana'] },
    ],
  },
];

export const MOCK_OWNER_BATCHES = [
  {
    id: 'BATCH-01', sent_at: '2026-06-20T08:00:00Z', item_count: 3,
    items: [
      { id: 21, application_name: 'AWS Console', application_code: 'AWS', requester_name: 'Trần Thị B', status: 'pending_owner', owner_note: null },
      { id: 22, application_name: 'AWS Console', application_code: 'AWS', requester_name: 'Lê Văn C',   status: 'approved',      owner_note: 'OK' },
      { id: 23, application_name: 'Datadog',     application_code: 'DD',  requester_name: 'Phạm Thị D', status: 'pending_owner', owner_note: null },
    ],
  },
  {
    id: 'BATCH-02', sent_at: '2026-06-18T14:30:00Z', item_count: 2,
    items: [
      { id: 24, application_name: 'AWS Console', application_code: 'AWS', requester_name: 'Hoàng Văn E', status: 'approved',         owner_note: 'Approved' },
      { id: 25, application_name: 'Datadog',     application_code: 'DD',  requester_name: 'Ngô Thị F',   status: 'rejected_by_owner', owner_note: 'Chưa đủ điều kiện' },
    ],
  },
];
