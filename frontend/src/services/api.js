import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Get CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Avoid redirect loops on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/admin/auth/login/', { username, password }),
  logout: () => api.post('/admin/auth/logout/'),
  me: () => api.get('/admin/auth/me/'),
  createAdmin: (data) => api.post('/admin/auth/create-admin/', data),
}

export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/'),
}

export const chatLogsAPI = {
  getAll: (params) => api.get('/admin/chat-logs/', { params }),
  getDetail: (sessionId) => api.get(`/admin/chat-logs/${sessionId}/`),
}

export const leadsAPI = {
  getAll: (params) => api.get('/admin/leads/', { params }),
  getDetail: (leadId) => api.get(`/admin/leads/${leadId}/`),
  update: (leadId, data) => api.patch(`/admin/leads/${leadId}/`, data),
  addNote: (leadId, note) => api.post(`/admin/leads/${leadId}/notes/`, { note }),
}

export const knowledgeAPI = {
  getAll: (params) => api.get('/admin/knowledge/', { params }),
  create: (data) => api.post('/admin/knowledge/', data),
  update: (id, data) => api.patch(`/admin/knowledge/${id}/`, data),
  delete: (id) => api.delete(`/admin/knowledge/${id}/`),
}

export const settingsAPI = {
  get: () => api.get('/admin/settings/'),
  update: (data) => api.patch('/admin/settings/', data),
}

export default api
