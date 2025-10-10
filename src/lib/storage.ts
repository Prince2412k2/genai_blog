import { Blog } from '@/types/blog';

const BLOGS_KEY = 'cms_blogs';
const ADMIN_KEY = 'cms_admin';

export const storage = {
  getBlogs: (): Blog[] => {
    const data = localStorage.getItem(BLOGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveBlog: (blog: Blog) => {
    const blogs = storage.getBlogs();
    const index = blogs.findIndex(b => b.id === blog.id);
    if (index >= 0) {
      blogs[index] = blog;
    } else {
      blogs.unshift(blog);
    }
    localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
  },

  deleteBlog: (id: string) => {
    const blogs = storage.getBlogs().filter(b => b.id !== id);
    localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
  },

  getBlog: (id: string): Blog | undefined => {
    return storage.getBlogs().find(b => b.id === id);
  },

  incrementViews: (id: string) => {
    const blog = storage.getBlog(id);
    if (blog) {
      blog.views++;
      storage.saveBlog(blog);
    }
  },

  incrementLikes: (id: string) => {
    const blog = storage.getBlog(id);
    if (blog) {
      blog.likes++;
      storage.saveBlog(blog);
    }
  },

  isAdmin: (): boolean => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  },

  setAdmin: (isAdmin: boolean) => {
    if (isAdmin) {
      localStorage.setItem(ADMIN_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
  }
};
