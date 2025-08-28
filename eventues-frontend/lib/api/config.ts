import { envConfig } from '../config/environment';

// Centralized API configuration
export const API_CONFIG = {
  baseUrl: envConfig.getBackendUrl(),
  endpoints: {
    // User endpoints
    users: '/users',
    userProfile: '/users/profile',
    
    // Event endpoints
    events: '/events',
    publicEvents: '/public/events',
    
    // Payment endpoints
    payments: '/payments',
    orders: '/orders',
    
    // Coupon endpoints
    coupons: '/coupons',
  },
  
  // Request headers
  getHeaders: (token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },
  
  // Build full URL
  buildUrl: (endpoint: string) => {
    return `${API_CONFIG.baseUrl}${endpoint}`;
  }
};

// Helper function for API calls
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
) => {
  const url = API_CONFIG.buildUrl(endpoint);
  const headers = API_CONFIG.getHeaders(token);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
