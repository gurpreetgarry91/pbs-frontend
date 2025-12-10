// Central API configuration
//export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.pbsdigitalmedia.com';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/dashboard/login`,
  USERS: `${API_BASE_URL}/dashboard/users`,
  SUBSCRIPTIONS: `${API_BASE_URL}/dashboard/subscriptions`,
  MEDIA: `${API_BASE_URL}/dashboard/media`,
  ADVERTISEMENTS: `${API_BASE_URL}/dashboard/advertisements`,
};

export default ENDPOINTS;
