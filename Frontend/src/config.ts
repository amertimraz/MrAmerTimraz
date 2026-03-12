export const BACKEND_URL = (import.meta.env.VITE_API_URL as string || 'http://localhost:5001/api')
  .replace('/api', '');

export const resolveFileUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  return `${BACKEND_URL}${url}`;
};
