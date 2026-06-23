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
    requester_name: 'Trần Thị B', requester_email: 'thib@company.com',
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
