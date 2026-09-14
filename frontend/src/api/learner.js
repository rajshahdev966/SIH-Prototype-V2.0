import { apiClient } from './client';

export const learnerApi = {
  login: (phone, name, email) => apiClient('/api/auth/login', {
    method: 'POST',
    body: { phone, name, email }
  }),
  getProfile: (phone) => apiClient('/api/user/' + encodeURIComponent(phone) + '/profile'),
  generateCumulativeAnalysis: (phone) => apiClient('/api/user/' + encodeURIComponent(phone) + '/cumulative-analysis', {
    method: 'POST'
  })
};
