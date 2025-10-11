import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Blog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Sparkles, X, Eye, Code, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, linkPlugin, linkDialogPlugin, imagePlugin, tablePlugin, codeBlockPlugin, codeMirrorPlugin, diffSourcePlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorMode, setEditorMode] = useState<'raw' | 'edit' | 'view'>('edit');

  useEffect(() => {
    if (!storage.isAdmin()) {
      navigate('/auth');
      return;
    }

    if (id) {
      const blog = storage.getBlog(id);
      if (blog) {
        setTitle(blog.title);
        setContent(blog.content);
        setTags(blog.tags);
      }
    }
  }, [id, navigate]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateTags = () => {
    const generatedTags = ['Technology', 'Tutorial', 'Web Development'];
    const newTags = generatedTags.filter(tag => !tags.includes(tag));
    setTags([...tags, ...newTags]);
    toast({
      title: "Tags generated",
      description: "AI-generated tags have been added",
    });
  };

  const handleGenerateBlog = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedContent = `# Introduction

This is a sample AI-generated blog post. In a production environment, this would integrate with an AI API.

## Key Points

- Point one about the topic
- Point two with more details
- Point three with insights

## Conclusion

This demonstrates the blog generation feature. Connect an AI service for real generation.`;
      
      setContent(generatedContent);
      setIsGenerating(false);
      toast({
        title: "Blog generated",
        description: "AI-generated content has been added. Edit as needed.",
      });
    }, 1500);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    const blog: Blog = {
      id: id || crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      tags,
      likes: id ? storage.getBlog(id)?.likes || 0 : 0,
      views: id ? storage.getBlog(id)?.views || 0 : 0,
      generationCost: isGenerating ? 0.05 : undefined,
      createdAt: id ? storage.getBlog(id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveBlog(blog);
    toast({
      title: id ? "Blog updated" : "Blog created",
      description: "Your changes have been saved",
    });
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerateBlog} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <Input
                placeholder="Untitled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
              />
            </CardHeader>
          </Card>

          <div className="flex items-center justify-end gap-1 px-1">
            <Button
              variant={editorMode === 'raw' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setEditorMode('raw')}
              className="h-8 w-8"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              variant={editorMode === 'edit' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setEditorMode('edit')}
              className="h-8 w-8"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant={editorMode === 'view' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setEditorMode('view')}
              className="h-8 w-8"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          <Card className="min-h-[600px] border-border/50">
            <CardContent className="p-8">
              {editorMode === 'raw' ? (
                <Textarea
                  placeholder="Write your blog content in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm resize-none border-0 focus-visible:ring-0 bg-transparent"
                />
              ) : editorMode === 'view' ? (
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-p:leading-7 prose-li:text-foreground prose-strong:text-foreground prose-strong:font-semibold prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <MDXEditor
                  markdown={content}
                  onChange={setContent}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                    codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', html: 'HTML', ts: 'TypeScript', tsx: 'TypeScript (React)' } }),
                    diffSourcePlugin({ viewMode: 'rich-text' })
                  ]}
                  contentEditableClassName="prose prose-lg max-w-none dark:prose-invert min-h-[600px]"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tags</CardTitle>
                <Button variant="outline" size="sm" onClick={handleGenerateTags}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Tags
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BlogEditor;
