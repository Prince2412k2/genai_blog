import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";


const BlogView = () => {
  const { id } = useParams<{ id: string }>();
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const editor = useCreateBlockNote();
  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase.from('blog').select('content').eq('id', id).single();
        if (error) throw error;

        editor.replaceBlocks(editor.document, data.content);
      } catch (err) {
        console.error("Failed to load blog:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id, navigate, editor]);
  if (loading || !editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>

        <article className="bg-card/50 backdrop-blur-sm rounded-lg shadow-2xl border border-primary/10 p-8 md:p-12">
          <header className="mb-8 border-b border-border pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             {title}
            </h1>
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
