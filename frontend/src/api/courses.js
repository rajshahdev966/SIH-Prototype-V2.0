import { apiClient } from './client';

export const coursesApi = {
  getAll: (adminToken) => apiClient(adminToken ? '/api/courses?admin=true' : '/api/courses', { token: adminToken }),
  getById: (courseId, adminToken) => apiClient('/api/courses/' + courseId, { token: adminToken }),
  submitQuiz: (courseId, payload) => apiClient('/api/courses/' + courseId + '/submit', {
    method: 'POST',
    body: payload
  }),
  getSubmissions: (courseId) => apiClient(courseId ? ('/api/courses/' + courseId + '/submissions') : '/api/courses/all/submissions')
};

export const caseStudiesApi = {
  getAll: (adminToken) => apiClient('/api/case-studies', { token: adminToken }),
  getById: (id) => apiClient('/api/case-studies/' + id),
  create: (payload, adminToken) => apiClient('/api/admin/case-studies', {
    method: 'POST',
    body: payload,
    token: adminToken
  }),
  update: (id, payload, adminToken) => apiClient('/api/admin/case-studies/' + id, {
    method: 'PUT',
    body: payload,
    token: adminToken
  }),
  delete: (id, adminToken) => apiClient('/api/admin/case-studies/' + id, {
    method: 'DELETE',
    token: adminToken
  })
};

