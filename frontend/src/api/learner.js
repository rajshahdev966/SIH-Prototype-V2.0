import { apiClient } from './client';

export const learnerApi = {
  login: (email, password) => apiClient('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  }),
  register: async ({ email, password, name }) => {
    try {
      return await apiClient('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      });
    } catch (err) {
      // If deployed backend is still propagating or returns 404 for /register, try /login with name
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Not found'))) {
        return await apiClient('/api/auth/login', {
          method: 'POST',
          body: { email, password, name, phone: email }
        });
      }
      throw err;
    }
  },
  getProfile: (phoneOrEmail) => apiClient('/api/user/' + encodeURIComponent(phoneOrEmail) + '/profile'),
  generateCumulativeAnalysis: (phoneOrEmail) => apiClient('/api/user/' + encodeURIComponent(phoneOrEmail) + '/cumulative-analysis', {
    method: 'POST'
  })
};
