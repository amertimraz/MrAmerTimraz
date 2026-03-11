import client from './client';

export const aiApi = {
  describe: (title: string, context: string) =>
    client.post<{ description: string }>('/ai/describe', { title, context }).then(r => r.data),
};
