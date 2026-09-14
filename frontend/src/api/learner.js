import { apiClient } from './client';

export const learnerApi = {
  login: (email, password) => apiClient('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  }),
  register: ({ email, password, name }) => apiClient('/api/auth/register', {
    method: 'POST',
    body: { email, password, name }
  }),
  getProfile: (phoneOrEmail) => apiClient('/api/user/' + encodeURIComponent(phoneOrEmail) + '/profile'),
  generateCumulativeAnalysis: (phoneOrEmail) => apiClient('/api/user/' + encodeURIComponent(phoneOrEmail) + '/cumulative-analysis', {
    method: 'POST'
  })
};
