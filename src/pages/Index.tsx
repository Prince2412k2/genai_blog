import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Feather, LayoutDashboard, Share2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BrainCircuit className="h-12 w-12 text-primary" />,
      title: 'AI-Powered Content Generation',
      description: 'Generate blog posts from a simple summary. Let our AI be your creative partner.',
    },
    {
      icon: <Feather className="h-12 w-12 text-primary" />,
      title: 'Rich Text Editor',
      description: 'Enjoy a seamless writing experience with our intuitive and powerful BlockNote-based editor.',
    },
    {
      icon: <LayoutDashboard className="h-12 w-12 text-primary" />,
      title: 'Admin Dashboard',
      description: 'Manage your blogs, view analytics, and configure your site from a single, powerful dashboard.',
    },
    {
      icon: <Share2 className="h-12 w-12 text-primary" />,
      title: 'Customizable and Shareable',
      description: 'Create a public blog with a unique URL and customize its appearance to match your style.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Markdown Muse</h1>
        <Button onClick={() => navigate('/auth')}>Get Started</Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Unleash Your Creativity with AI-Powered Blogging
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Markdown Muse is a modern blog platform that helps you create, manage, and publish your content with the power of AI.
        </p>
        <Button size="lg" onClick={() => navigate('/auth')}>
          Start Writing for Free
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Or <a href="https://genai-blog-kappa.vercel.app/be50b075-2d73-429b-88cf-0a6279de8ca5" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">see an example site</a>
        </p>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-background/20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">Why Markdown Muse?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/10 text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">{feature.icon}</div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background/20">
        <div className="container mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Markdown Muse</h4>
              <p className="text-sm text-muted-foreground">
                A learning project to explore AI-powered blogging.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-sm text-muted-foreground">
                <a href="mailto:prince2412001@gmail.com" className="hover:text-primary">prince2412001@gmail.com</a>
              </p>
              <p className="text-sm text-muted-foreground">
                <a href="mailto:princempate.dev@gmail.com" className="hover:text-primary">princempate.dev@gmail.com</a>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Links</h4>
              <p className="text-sm text-muted-foreground">
                <a href="https://github.com/your_username/your_project_name" target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub Repository</a>
              </p>
              <p className="text-sm text-muted-foreground">
                <a href="https://prince2412k2.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Portfolio</a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary/10">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Markdown Muse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;