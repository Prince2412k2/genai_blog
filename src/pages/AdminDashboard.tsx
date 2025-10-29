import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Blog } from '@/types/blog';
import * as api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PenSquare, Trash2, Plus, LogOut, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalGenerationCost, setTotalGenerationCost] = useState(0);
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadBlogs();
      loadTotalCost();
    }
  }, [user, loading, navigate]);

  const loadBlogs = async () => {
    try {
      const data = await api.getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blogs',
        variant: 'destructive',
      });
    }
  };

  const loadTotalCost = async () => {
    try {
      const { totalCost, totalInputTokens, totalOutputTokens } = await api.getTotalCost();
      setTotalGenerationCost(totalCost);
      setTotalInputTokens(totalInputTokens);
      setTotalOutputTokens(totalOutputTokens);
    } catch (error) {
      console.error('Failed to load total cost:', error);
      toast({
        title: 'Error',
        description: 'Failed to load total cost',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await api.deleteBlog(id, user?.id);
      toast({
        title: 'Success!',
        description: 'Blog deleted successfully',
      });
      loadBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Eye className="mr-2 h-4 w-4" />
                View Site
              </Button>
              <Button onClick={() => navigate('/admin/editor')}>
                <Plus className="mr-2 h-4 w-4" />
                New Blog
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total Blogs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{blogs.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total Generation Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalGenerationCost)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total Input Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{totalInputTokens.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total Output Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{totalOutputTokens.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Logged in as</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </CardContent>
            </Card>
          </div>
        </header>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle>All Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No blogs yet</p>
                <Button onClick={() => navigate('/admin/editor')}>
                  Create your first blog
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="font-medium">{blog.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {blog.tags?.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {tag}
                              </Badge>
                            ))}
                            {(blog.tags?.length || 0) > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(blog.tags?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(blog.cost || 0)}</TableCell>
                        <TableCell>
                          {new Date(blog.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/editor/${blog.id}`)}
                            >
                              <PenSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(blog.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
