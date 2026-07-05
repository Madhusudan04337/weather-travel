// Re-export all API service modules.
// Example:
// export * from './weatherService';
// export * from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export { API_BASE_URL };
