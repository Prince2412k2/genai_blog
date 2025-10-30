import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Blog } from '@/types/blog';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { capitalizeFirstLetter } from '@/lib/utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const BlogView = () => {
  const { id, title } = useParams<{ id: string; title: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const editor = useCreateBlockNote({
    editable: false,
    domAttributes: {
      block: {
        class: "blog-editor-block",
      },
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (id && editor) {
      loadBlog();
    }
  }, [id, editor]);

  const loadBlog = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/blogs/${id}.json`);
      if (res.ok) {
        const data = await res.json();
        setBlog(data); 
        if (data) {
          editor.replaceBlocks(editor.document, data);
        }
      }
    } catch (error) {
      console.error('Failed to load blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6 px-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={toggleTheme} variant="outline">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

        <header className="mb-6 border-b border-border pb-6 px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
           {capitalizeFirstLetter(decodeURIComponent(title || ''))}
          </h1>
        </header>

        <div className="prose max-w-none dark:prose-invert px-4 sm:px-6">
          <BlockNoteView editor={editor} editable={false} theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default BlogView;