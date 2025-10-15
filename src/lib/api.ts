import { Blog } from '@/types/blog';

const BASE_URL = 'https://hovwddwgujmqxhjhoqqy.supabase.co/functions/v1';
const BUCKET_URL = 'https://hovwddwgujmqxhjhoqqy.storage.supabase.co/storage/v1/object/public/blog';

export const api = {
  getBlogs: async (): Promise<Blog[]> => {
    const response = await fetch(`${BASE_URL}/get-blogs`);
    if (!response.ok) throw new Error('Failed to fetch blogs');
    return response.json();
  },

  getBlog: async (id: string): Promise<Blog | undefined> => {
    const blogs = await api.getBlogs();
    return blogs.find(b => b.id === id);
  },

  getBlogContent: async (id: string): Promise<any> => {
    const response = await fetch(`${BUCKET_URL}/${id}.json`);
    if (!response.ok) throw new Error('Failed to fetch blog content');
    return response.json();
  },

  addBlog: async (blog: Partial<Blog>, content: any, token?: string) => {
    const response = await fetch(`${BASE_URL}/add-blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ blog, content }),
    });
    if (!response.ok) throw new Error('Failed to add blog');
    return response.json();
  },

  updateBlog: async (blog: Blog, content: any, token?: string) => {
    const response = await fetch(`${BASE_URL}/update-blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ blog, content }),
    });
    if (!response.ok) throw new Error('Failed to update blog');
    return response.json();
  },

  deleteBlog: async (blogId: string, token?: string) => {
    const response = await fetch(`${BASE_URL}/delete-blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ blog_id: blogId }),
    });
    if (!response.ok) throw new Error('Failed to delete blog');
    return response.json();
  },

  generateTags: async (content: string, token?: string) => {
    const response = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to generate tags');
    return response.json();
  },

  generateBlog: async (summary: string, token?: string) => {
    const response = await fetch(`${BASE_URL}/fill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ summary }),
    });
      console.log(response.text)
    if (!response.ok) throw new Error('Failed to generate blog');

    return response.json();
  },

  getScore: async (): Promise<{ total: number; blogIds: string[] }> => {
    const response = await fetch(`${BUCKET_URL}/score.json`);
    if (!response.ok) throw new Error('Failed to fetch score');
    return response.json();
  },
};
