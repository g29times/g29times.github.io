import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash, Save, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import postsData from '@/data/posts.json';
import { BlogPost } from '@/types/blog';

const Admin = () => {
  const [posts, setPosts] = useState<BlogPost[]>(postsData as BlogPost[]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/posts', {
          headers: { accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as BlogPost[];
        if (!cancelled && Array.isArray(data)) setPosts(data);
      } catch {
        // ignore and fallback to bundled posts.json
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    const newPost: BlogPost = {
      slug: '',
      title: '',
      titleZh: '',
      excerpt: '',
      excerptZh: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      category: '',
      categoryZh: '',
      readTime: '5 min read',
      content: '',
      contentZh: ''
    };
    setEditingPost(newPost);
    setIsAdding(true);
  };

  const handleDelete = (slug: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const updatedPosts = posts.filter(p => p.slug !== slug);
      setPosts(updatedPosts);
      toast.success('Post removed from view (Local only).');
    }
  };

  const handleSave = async () => {
    if (!editingPost) return;
    if (!editingPost.slug) {
      toast.error('Slug is required');
      return;
    }

    let updatedPosts;
    if (isAdding) {
      updatedPosts = [...posts, editingPost];
    } else {
      updatedPosts = posts.map(p => p.slug === editingPost.slug ? editingPost : p);
    }

    setPosts(updatedPosts);
    setEditingPost(null);
    setIsAdding(false);

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updatedPosts),
      });

      if (!res.ok) {
        const msg = await res.text();
        toast.error(`Save failed: ${msg}`);
        return;
      }

      toast.success('Saved.');
    } catch {
      toast.error('Save failed.');
    }
  };

  const renderEditor = () => {
    if (!editingPost) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setEditingPost(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} className="gap-2">
              <Eye className="w-4 h-4" /> {previewMode ? 'Back to Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Post
            </Button>
          </div>
        </div>

        {previewMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">English Preview</h2>
              <div className="prose dark:prose-invert max-w-none">
                <h1>{editingPost.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: editingPost.content.replace(/\n/g, '<br/>') }} />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">中文预览</h2>
              <div className="prose dark:prose-invert max-w-none">
                <h1>{editingPost.titleZh}</h1>
                <div dangerouslySetInnerHTML={{ __html: editingPost.contentZh.replace(/\n/g, '<br/>') }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug (URL path)</label>
                  <Input 
                    value={editingPost.slug} 
                    onChange={e => setEditingPost({...editingPost, slug: e.target.value})} 
                    placeholder="context-problem"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input 
                      value={editingPost.date} 
                      onChange={e => setEditingPost({...editingPost, date: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Read Time</label>
                    <Input 
                      value={editingPost.readTime} 
                      onChange={e => setEditingPost({...editingPost, readTime: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category (EN)</label>
                  <Input 
                    value={editingPost.category} 
                    onChange={e => setEditingPost({...editingPost, category: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category (ZH)</label>
                  <Input 
                    value={editingPost.categoryZh} 
                    onChange={e => setEditingPost({...editingPost, categoryZh: e.target.value})} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="en">
                  <TabsList className="mb-4">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="zh">中文</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        value={editingPost.title} 
                        onChange={e => setEditingPost({...editingPost, title: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Excerpt</label>
                      <Textarea 
                        value={editingPost.excerpt} 
                        onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Body (Markdown support in renderer)</label>
                      <Textarea 
                        className="min-h-[400px] font-mono"
                        value={editingPost.content} 
                        onChange={e => setEditingPost({...editingPost, content: e.target.value})} 
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="zh" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">标题</label>
                      <Input 
                        value={editingPost.titleZh} 
                        onChange={e => setEditingPost({...editingPost, titleZh: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">摘要</label>
                      <Textarea 
                        value={editingPost.excerptZh} 
                        onChange={e => setEditingPost({...editingPost, excerptZh: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">正文</label>
                      <Textarea 
                        className="min-h-[400px] font-mono"
                        value={editingPost.contentZh} 
                        onChange={e => setEditingPost({...editingPost, contentZh: e.target.value})} 
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderList = () => {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blog Posts</CardTitle>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" /> Add Post
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell className="font-medium">
                    {post.titleZh}
                    <div className="text-xs text-muted-foreground">{post.title}</div>
                  </TableCell>
                  <TableCell>{post.categoryZh}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.slug)} className="text-destructive">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="font-serif text-4xl font-semibold text-foreground mb-4">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              <a href="/Cloudflarer2management" target="_blank" rel="noopener noreferrer">
                Resource management
              </a>
            </p>
          </div>

          {editingPost ? renderEditor() : renderList()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
