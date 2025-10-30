import { Blog } from '@/types/blog';

const API_URL = import.meta.env.VITE_API_URL;

import { supabase } from '@/integrations/supabase/client';

export const generateBlog = async (summary: string, mood: string, userId: string, blogId?: string | null): Promise<{ title: string; tags: string[]; content: string }> => {
  const { data, error } = await supabase.functions.invoke('fill', {
    body: { summary, mood, user_id: userId, blog_id: blogId },
  });

  if (error) {
    console.error('Error generating blog:', error);
    throw new Error('Failed to generate blog');
  }

  return data;
};

export const updateBlog = async (blog: Blog): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('update-blog', {
    body: {
      id: blog.id,
      title: blog.title,
      raw: blog.raw,
      tags: blog.tags,
      content: blog.content,
    },
  });

  if (error) {
    console.error('Error updating blog:', error);
    throw new Error('Failed to update blog');
  }
};

export const addBlog = async (blog: Partial<Blog>): Promise<Blog> => {
  const { data, error } = await supabase.functions.invoke('add-blog', {
    body: {
      title: blog.title,
      raw: blog.raw,
      tags: blog.tags,
      content: blog.content,
    },
  });

  if (error) {
    console.error('Error adding blog:', error);
    throw new Error('Failed to add blog');
  }

  return data.blog as Blog;
};

export const getTotalCost = async (): Promise<{ totalCost: number; totalInputTokens: number; totalOutputTokens: number }> => {
  const { data, error } = await supabase.functions.invoke('get-total-cost');

  if (error) {
    console.error('Error fetching total cost:', error);
    return { totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0 };
  }

  return data;
};

export const updateGenerationBlogId = async (generationId: string, blogId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('update-generation-blog-id', {
    body: { generation_id: generationId, blog_id: blogId },
  });

  if (error) {
    console.error('Error updating generation blog ID:', error);
    throw new Error('Failed to update generation blog ID');
  }
};

export const getTagsFromMarkdown = async (markdownContent: string, userId: string, blogId?: string): Promise<string[]> => {
  const { data, error } = await supabase.functions.invoke('tags', {
    body: { markdown: markdownContent, user_id: userId, blog_id: blogId },
  });

  if (error) {
    console.error('Error fetching tags from markdown:', error);
    return [];
  }

  return data.tags;
};

export const updateUserBlogTitle = async (title: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('update-user-blog-title', {
    body: { title },
  });

  if (error) {
    console.error('Error updating user blog title:', error);
    throw new Error('Failed to update user blog title');
  }
};
