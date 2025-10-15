export interface Blog {
  id: string;
  created_at: string;
  title: string;
  raw: string;
  user: string;
  cost: number;
  tags?: string[];
}

export interface Analytics {
  totalLikes: number;
  totalViews: number;
  totalGenerationCost: number;
  blogsCount: number;
}
