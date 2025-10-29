export interface Blog {
  id: string;
  created_at: string;
  title: string;
  content: any;
  tags?: string[];
}

export interface Analytics {
  totalLikes: number;
  totalViews: number;
  totalGenerationCost: number;
  blogsCount: number;
}
