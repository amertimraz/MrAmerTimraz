import client from './client';

const upload = (endpoint: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return client.post<{ url: string }>(endpoint, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.url);
};

export const uploadsApi = {
  image: (file: File) => upload('/uploads/image', file),
  pdf:   (file: File) => upload('/uploads/pdf',   file),
  video: (file: File) => upload('/uploads/video',  file),
  // Same endpoint as pdf — it also accepts .ppt/.pptx now — aliased for clarity at call sites.
  document: (file: File) => upload('/uploads/pdf', file),
};
