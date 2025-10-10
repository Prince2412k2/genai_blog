import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Blog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateBlog} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Blog'}
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{id ? 'Edit Blog' : 'Create New Blog'}</CardTitle>
              <CardDescription>Write your content in Markdown format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Blog Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write your blog content in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono"
                />
              </div>
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
