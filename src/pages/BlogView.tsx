import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Blog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heart, Eye, Calendar, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BlogView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) {
      const foundBlog = storage.getBlog(id);
      if (foundBlog) {
        setBlog(foundBlog);
        storage.incrementViews(id);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const handleLike = () => {
    if (id && !liked) {
      storage.incrementLikes(id);
      setBlog(storage.getBlog(id) || null);
      setLiked(true);
    }
  };

  if (!blog) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <article>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {blog.views} views
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <Card className="p-8 mb-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleLike}
              variant={liked ? "default" : "outline"}
              className="gap-2"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {blog.likes} Likes
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogView;
