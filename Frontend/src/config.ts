export const BACKEND_URL = (import.meta.env.VITE_API_URL as string || 'http://localhost:5001/api')
  .replace('/api', '');
