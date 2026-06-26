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

function extractFieldErrors(error) {
  if (!error || typeof error !== 'object') return null;
  const parts = Object.entries(error).map(([field, msgs]) => {
    const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
    return field === 'non_field_errors' ? text : `${field}: ${text}`;
  });
  return parts.length ? parts.join(' | ') : null;
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
        const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
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
    throw new Error(error.detail || error.message || extractFieldErrors(error) || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
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

export async function getMyRequest(id) {
  return apiFetch(`/my-requests/${id}/`);
}

export async function cancelRequest(id, reason) {
  return apiFetch(`/my-requests/${id}/cancel/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function disputeRequest(id, reason) {
  return apiFetch(`/my-requests/${id}/dispute/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function remindRequest(id) {
  return apiFetch(`/my-requests/${id}/remind/`, { method: 'POST' });
}

export async function getAccessRequests() {
  return apiFetch('/access-requests/');
}

export async function getAccessRequest(id) {
  return apiFetch(`/access-requests/${id}/`);
}

export async function approveAccessRequest(id) {
  return apiFetch(`/access-requests/${id}/approve/`, { method: 'PATCH' });
}

export async function rejectAccessRequest(id, reviewNote) {
  return apiFetch(`/access-requests/${id}/reject/`, {
    method: 'PATCH',
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

export async function revertAccessRequest(id, revertNote) {
  return apiFetch(`/access-requests/${id}/revert/`, {
    method: 'PATCH',
    body: JSON.stringify({ revert_note: revertNote }),
  });
}

export async function getBatches() {
  return apiFetch('/batches/');
}

export async function getBatch(id) {
  return apiFetch(`/batches/${id}/`);
}

export async function getOwnerBatches() {
  return apiFetch('/owner-batches/');
}

export async function getOwnerBatch(id) {
  return apiFetch(`/owner-batches/${id}/`);
}

export async function approveOwnerItem(batchId, itemId) {
  return apiFetch(`/owner-batches/${batchId}/approve_item/`, {
    method: 'PATCH',
    body: JSON.stringify({ item_id: itemId }),
  });
}

export async function rejectOwnerItem(batchId, itemId, ownerNote) {
  return apiFetch(`/owner-batches/${batchId}/reject_item/`, {
    method: 'PATCH',
    body: JSON.stringify({ item_id: itemId, owner_note: ownerNote }),
  });
}

export async function revertOwnerItem(batchId, itemId, ownerNote) {
  return apiFetch(`/owner-batches/${batchId}/revert_item/`, {
    method: 'PATCH',
    body: JSON.stringify({ item_id: itemId, owner_note: ownerNote }),
  });
}

export async function sendBatch(id) {
  return apiFetch(`/batches/${id}/send/`, { method: 'POST' });
}

export async function createApplication(data) {
  return apiFetch('/applications/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createUser(data) {
  return apiFetch('/auth/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getUsers() {
  return apiFetch('/auth/users/');
}

export async function getUser(id) {
  return apiFetch(`/auth/users/${id}/`);
}

export async function updateUser(id, data) {
  return apiFetch(`/auth/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return apiFetch(`/auth/users/${id}/`, {
    method: 'DELETE',
  });
}

export async function createDomain(data) {
  return apiFetch('/domains/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDomain(id, data) {
  return apiFetch(`/domains/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDomain(id) {
  return apiFetch(`/domains/${id}/`, {
    method: 'DELETE',
  });
}

export async function getSubadmins() {
  return apiFetch('/auth/users/subadmins/');
}

export async function getOwners() {
  return apiFetch('/auth/users/owners/');
}

export async function updateApplication(id, data) {
  return apiFetch(`/applications/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(id) {
  return apiFetch(`/applications/${id}/`, {
    method: 'DELETE',
  });
}

export async function updateProfile(data) {
  const result = await apiFetch('/auth/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (result?.first_name !== undefined) localStorage.setItem('first_name', result.first_name);
  if (result?.last_name  !== undefined) localStorage.setItem('last_name',  result.last_name);
  return result;
}

export async function changePassword(oldPassword, newPassword) {
  return apiFetch('/auth/users/change-password/', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}
