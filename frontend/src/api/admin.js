import { apiClient } from './client';

export const adminApi = {
  login: (username, password) => apiClient('/api/admin/login', {
    method: 'POST',
    body: { username, password }
  }),
  verifySession: (token) => apiClient('/api/admin/verify', { token }),
  logout: (token) => apiClient('/api/admin/logout', {
    method: 'POST',
    token
  }),
  ingestCourse: (courseId, customTitle, token) => apiClient('/api/courses/ingest', {
    method: 'POST',
    token,
    body: { courseId, customTitle }
  }),
  updateCourse: (courseId, data, token) => apiClient('/api/admin/courses/' + courseId, {
    method: 'PUT',
    token,
    body: data
  }),
  deleteCourse: (courseId, token) => apiClient('/api/courses/' + courseId, {
    method: 'DELETE',
    token
  }),
  getStats: (token) => apiClient('/api/admin/stats', { token }),
  listAdmins: (token) => apiClient('/api/admin/list', { token }),
  createAdmin: (data, token) => apiClient('/api/admin/create-admin', {
    method: 'POST',
    token,
    body: data
  }),
  updateProfile: (data, token) => apiClient('/api/admin/profile', {
    method: 'PUT',
    token,
    body: data
  })
};
