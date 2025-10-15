import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Blog } from '@/types/blog';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

const BlogView = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const editor = useCreateBlockNote({
    initialContent: content || [],
  });

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const [blogData, contentData] = await Promise.all([
          api.getBlog(id),
          api.getBlogContent(id)
        ]);

        if (!blogData) {
          navigate('/');
          return;
        }

        setBlog(blogData);
        setContent(contentData);
      } catch (error) {
        console.error('Failed to load blog:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id, navigate]);

  useEffect(() => {
    if (content && editor) {
      editor.replaceBlocks(editor.document, content);
    }
  }, [content, editor]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>

        <article className="bg-card/50 backdrop-blur-sm rounded-lg shadow-2xl border border-primary/10 p-8 md:p-12">
          <header className="mb-8 border-b border-border pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{formatDate(blog.created_at)}</span>
              {blog.cost && (
                <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                  Cost: ${blog.cost.toFixed(4)}
                </span>
              )}
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <BlockNoteView editor={editor} editable={false} theme="light" />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogView;
