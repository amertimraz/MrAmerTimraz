export const getMediaUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  // Remove /api or /api/ from the end to get the server root for static files
  const serverRoot = apiBase.replace(/\/api\/?$/, '');
  
  return `${serverRoot}${path.startsWith('/') ? '' : '/'}${path}`;
};
