import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Image, Link as LinkIcon } from 'lucide-react';
import { SocialMediaShare } from '@/components/SocialMediaShare';

// Import the rich text editor
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: '',
    status: 'draft'
  });

  useEffect(() => {
    // Check admin authentication
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    // If editing, fetch post data
    if (isEditing) {
      // TODO: Fetch post data
    }
  }, [isEditing, id, navigate]);

  const [showSocialShare, setShowSocialShare] = useState(false);
  const [publishedPostUrl, setPublishedPostUrl] = useState('');

  const handleSave = async (status: 'draft' | 'published') => {
    try {
      // TODO: Implement actual save functionality
      // Generate the post URL (you'll need to adjust this based on your blog URL structure)
      const postSlug = post.title.toLowerCase().replace(/[^\w]+/g, '-');
      const postUrl = `https://tradeencore.com/thetradeventure/${postSlug}`;
      
      if (status === 'published') {
        setPublishedPostUrl(postUrl);
        setShowSocialShare(true);
        toast({
          title: "Post Published!",
          description: "Now let's share it on social media",
        });
      } else {
        toast({
          title: "Success",
          description: "Post saved as draft",
        });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleSave('draft')}>
                Save Draft
              </Button>
              <Button onClick={() => handleSave('published')}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={post.featuredImage}
                    onChange={(e) => setPost({ ...post, featuredImage: e.target.value })}
                    placeholder="Image URL"
                  />
                  <Button variant="outline">
                    <Image className="w-4 h-4 mr-2" /> Browse
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={post.tags}
                  onChange={(e) => setPost({ ...post, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactQuill
                theme="snow"
                value={post.content}
                onChange={(content) => setPost({ ...post, content })}
                modules={modules}
                className="min-h-[400px]"
              />
            </CardContent>
          </Card>
        </div>

        {showSocialShare && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Post Published Successfully!</h2>
                <SocialMediaShare
                  postTitle={post.title}
                  postExcerpt={post.excerpt}
                  postUrl={publishedPostUrl}
                />
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => {
                    setShowSocialShare(false);
                    navigate('/admin/dashboard');
                  }}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
