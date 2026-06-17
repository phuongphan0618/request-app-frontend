const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAccessToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('access_token');
  return null;
}

function getRefreshToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('refresh_token');
  return null;
}

function saveTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_email');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    saveTokens(data.access, null);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options;
  const token = getAccessToken();

  const fetchHeaders = { 'Content-Type': 'application/json', ...headers };
  if (token) fetchHeaders['Authorization'] = `Bearer ${token}`;

  const fetchOptions = { method, headers: fetchHeaders };
  if (body && method !== 'GET') fetchOptions.body = JSON.stringify(body);

  let res = await fetch(`${API_BASE}${endpoint}`, fetchOptions);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      fetchHeaders['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers: fetchHeaders });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }

  if (res.status === 204) return null;

  const isJson = res.headers.get('content-type')?.includes('application/json');

  if (!isJson) {
    if (res.ok) return null;
    throw new Error(`Lỗi server (${res.status}) — backend không trả về JSON.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

// Auth
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Đăng nhập thất bại');
  saveTokens(data.access, data.refresh);
  localStorage.setItem('user_email', data.email || email);
  localStorage.setItem('user_role', data.role || '');
  return data;
}

// Departments
export const getDepartments = (search = '') =>
  apiFetch(`/departments/${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const createDepartment = (data) =>
  apiFetch('/departments/', { method: 'POST', body: data });

export const updateDepartment = (id, data) =>
  apiFetch(`/departments/${id}/`, { method: 'PATCH', body: data });

export const deleteDepartment = (id) =>
  apiFetch(`/departments/${id}/`, { method: 'DELETE' });

// Domains
export const getDomains = (departmentId = null) =>
  apiFetch(`/domains/${departmentId ? `?department_id=${departmentId}` : ''}`);

export const createDomain = (data) =>
  apiFetch('/domains/', { method: 'POST', body: data });

export const updateDomain = (id, data) =>
  apiFetch(`/domains/${id}/`, { method: 'PATCH', body: data });

export const deleteDomain = (id) =>
  apiFetch(`/domains/${id}/`, { method: 'DELETE' });

// Applications
export function getApplications({ domainId, ownerId, isActive } = {}) {
  const params = new URLSearchParams();
  if (domainId) params.set('domain_id', domainId);
  if (ownerId) params.set('owner_id', ownerId);
  if (isActive !== undefined) params.set('is_active', isActive);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/applications/${query}`);
}

export const createApplication = (data) =>
  apiFetch('/applications/', { method: 'POST', body: data });

export const updateApplication = (id, data) =>
  apiFetch(`/applications/${id}/`, { method: 'PATCH', body: data });

export const deleteApplication = (id) =>
  apiFetch(`/applications/${id}/`, { method: 'DELETE' });

export const assignOwner = (appId, ownerId) =>
  apiFetch(`/applications/${appId}/assign-owner/`, { method: 'PATCH', body: { owner_id: ownerId } });

export const removeOwner = (appId) =>
  apiFetch(`/applications/${appId}/remove-owner/`, { method: 'PATCH' });

// Trả về tất cả user (requester + owner) — dùng cho user-list page
export const getUsers = () => apiFetch('/auth/users/');

// Requester: danh sách request của chính mình
export const getMyRequests = () => apiFetch('/my-requests/');

// Requester: tạo mới access request
export const createMyRequest = (data) =>
  apiFetch('/my-requests/', { method: 'POST', body: data });

// Trả về chỉ owner — dùng cho dropdown gán owner trong quản lý app
export const getOwners = () => apiFetch('/auth/owners/');

export const createUser = (data) =>
  apiFetch('/auth/users/', { method: 'POST', body: data });

// Giữ để admin page không bị lỗi import
export const checkBackendConnection = () =>
  Promise.resolve({ connected: true, mode: 'Backend API' });
