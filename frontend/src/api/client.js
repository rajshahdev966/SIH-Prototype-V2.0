import { API_BASE_URL } from '../config';

/**
 * Universal API Client with automatic JSON parsing, Bearer token injection, and descriptive error handling.
 */
export async function apiClient(endpoint, options = {}) {
  const { body, headers = {}, token, ...customConfig } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };

  const config = {
    method: body ? 'POST' : 'GET',
    headers: {
      ...defaultHeaders,
      ...headers
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...customConfig
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const response = await fetch(API_BASE_URL + cleanEndpoint, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Backend service endpoint not found (404). Please ensure the backend is running and deployed.');
      }
      throw new Error(`Request failed with status ${response.status} (${response.statusText || 'Server Error'})`);
    }
    data = { success: true };
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.error || ('Request failed with status ' + response.status));
  }

  return data;
}
