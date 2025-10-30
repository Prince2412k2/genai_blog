import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/types/blog';

import * as api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, Sparkles, X } from 'lucide-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [mood, setMood] = useState('formal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const editor = useCreateBlockNote();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (id) {
      loadBlog();
    }
  }, [id, user, navigate, loading]);

  const loadBlog = async () => {
    try {
      const blogData = await api.getBlog(id!)

      if (blogData) {
        setTitle(blogData.title);
        setTags(blogData.tags || []);
        if (blogData.raw && editor) {
          const blocks = editor.tryParseMarkdownToBlocks(blogData.raw);
          editor.replaceBlocks(editor.document, blocks);
        }
      }
    } catch (error) {
      console.error('Failed to load blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog',
        variant: 'destructive',
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateTags = async () => {
    if (!editor) return;

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to generate tags',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const markdownContent = editor.blocksToMarkdownLossy(editor.document);

      if (!markdownContent.trim()) {
        toast({
          title: 'Error',
          description: 'Cannot generate tags from empty content',
          variant: 'destructive',
        });
        return;
      }

      const tags = await api.getTagsFromMarkdown(markdownContent, user!.id, id); 
      setTags(tags || []);
      
      toast({
        title: 'Tags generated!',
        description: 'Tags generated from markdown content.',
      });
    } catch (error) {
      console.error("Failed to generate tags:", error);
      toast({
        title: 'Error',
        description: 'Failed to generate tags',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!summary.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a summary',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setDialogOpen(false);

    try {
      const result = await api.generateBlog(summary, mood, user!.id, id);
      
      setTitle(result.title);
      setTags(result.tags || []);
      
      // Convert markdown to BlockNote blocks (simple paragraph blocks)
      if (editor) {
        const blocks=editor.tryParseMarkdownToBlocks(result.content)
        editor.replaceBlocks(editor.document, blocks);
      }

      toast({
        title: 'Blog generated!',
        description: 'Review and edit as needed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate blog',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setSummary('');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    if (!editor) {
      toast({
        title: 'Error',
        description: 'Editor not ready',
        variant: 'destructive',
      });
      return;
    }

    try {
      const raw = editor.blocksToMarkdownLossy(editor.document);
      
      const blogData: Partial<Blog> = {
        title,
        raw: raw,
        tags,
      };

      if (id) {
        await api.updateBlog({ ...blogData, id } as Blog);
        toast({
          title: 'Success!',
          description: 'Blog updated successfully',
        });
      } else {
        const newBlog = await api.addBlog(blogData);
        toast({
          title: 'Success!',
          description: 'Blog created successfully',
        });
        if(newBlog && newBlog.id) {
          navigate(`/admin/editor/${newBlog.id}`);
        }
        else {
          navigate('/admin');
        }
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save blog',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Sparkles className="h-16 w-16 text-primary animate-pulse" />
            <p className="text-white mt-4">Generating content...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Blog with AI</DialogTitle>
                    <DialogDescription>
                      Enter a brief summary of what you want to write about
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="E.g., A guide to modern web development best practices..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={5}
                    />
                    <Label>Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateBlog} className="w-full">
                      Generate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          <Card className="mb-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Blog Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-primary/20"
              />

              <div>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="border-primary/20"
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                  <Button onClick={handleGenerateTags} variant="outline" disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tags
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="pt-6">
              <BlockNoteView editor={editor} theme="light" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BlogEditor;