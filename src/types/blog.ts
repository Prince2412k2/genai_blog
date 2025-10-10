export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  views: number;
  generationCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalLikes: number;
  totalViews: number;
  totalGenerationCost: number;
  blogsCount: number;
}
