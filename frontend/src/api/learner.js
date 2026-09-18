import { apiClient } from './client';

export const learnerApi = {
  login: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    
    return await apiClient('/api/auth/login', {
      method: 'POST',
      body: { 
        email: cleanEmail, 
        password: cleanPassword,
        phone: cleanEmail // Backwards compatibility for any backend version expecting phone
      }
    });
  },

  register: async ({ email, password, name }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    try {
      return await apiClient('/api/auth/register', {
        method: 'POST',
        body: { 
          email: cleanEmail, 
          password: cleanPassword, 
          name: cleanName,
          phone: cleanEmail
        }
      });
    } catch (err) {
      // If deployed backend is still propagating or returns 404 for /register, try /login dual-flow
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Not found'))) {
        return await apiClient('/api/auth/login', {
          method: 'POST',
          body: { 
            email: cleanEmail, 
            password: cleanPassword, 
            name: cleanName, 
            phone: cleanEmail 
          }
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
