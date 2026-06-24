const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  return {
    email: localStorage.getItem('email'),
    first_name: localStorage.getItem('first_name'),
    last_name: localStorage.getItem('last_name'),
  };
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Đăng nhập thất bại');
  }

  const data = await response.json();

  if (data.access) {
    localStorage.setItem('access_token', data.access);
  }
  if (data.refresh) {
    localStorage.setItem('refresh_token', data.refresh);
  }
  if (data.email) {
    localStorage.setItem('email', data.email);
  }
  if (data.first_name) {
    localStorage.setItem('first_name', data.first_name);
  }
  if (data.last_name) {
    localStorage.setItem('last_name', data.last_name);
  }
  if (data.roles) {
    localStorage.setItem('roles', JSON.stringify(data.roles));
  }

  return data;
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.access_token) {
            localStorage.setItem('access_token', refreshData.access_token);
            headers.Authorization = `Bearer ${refreshData.access_token}`;
            response = await fetch(url, { ...options, headers });
          }
        } else {
          throw new Error('Token refresh failed');
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/';
        }
        throw new Error('Authentication failed');
      }
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('Not authenticated');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'API request failed');
  }

  return response.json();
}

export async function getDepartments() {
  return apiFetch('/departments/');
}

export async function getDomains() {
  return apiFetch('/domains/');
}

export async function getApplications() {
  return apiFetch('/applications/');
}

export async function createRequest(data) {
  return apiFetch('/my-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyRequests() {
  return apiFetch('/my-requests/');
}

export async function getAccessRequests() {
  return apiFetch('/access-requests/');
}
