import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Copy, ExternalLink, Palette, LogOut, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Item {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  position: number;
}

interface Profile {
  username: string;
  page_title: string;
  page_description: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    target_url: ''
  });

  const [profileData, setProfileData] = useState({
    username: '',
    page_title: '',
    page_description: ''
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecommendations();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, page_title, page_description')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({ description: 'Failed to load profile', variant: 'destructive' });
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({ description: 'Failed to load recommendations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert([{
          ...formData,
          user_id: user.id,
          position: items.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setItems([...items, data]);
      setFormData({ title: '', description: '', image_url: '', target_url: '' });
      setIsAddingItem(false);
      toast({ description: 'Item added successfully!' });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({ description: 'Failed to add item', variant: 'destructive' });
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;
    
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .update(formData)
        .eq('id', editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setItems(items.map(item => 
        item.id === editingItem.id ? data : item
      ));
      setFormData({ title: '', description: '', image_url: '', target_url: '' });
      setEditingItem(null);
      toast({ description: 'Item updated successfully!' });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({ description: 'Failed to update item', variant: 'destructive' });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      toast({ description: 'Item deleted successfully!' });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ description: 'Failed to delete item', variant: 'destructive' });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(profileData);
      setIsEditingProfile(false);
      toast({ description: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      target_url: item.target_url
    });
  };

  const openProfileDialog = () => {
    if (profile) {
      setProfileData({
        username: profile.username,
        page_title: profile.page_title,
        page_description: profile.page_description
      });
    }
    setIsEditingProfile(true);
  };

  const username = profile?.username || user.email?.split('@')[0] || 'user';
  
  const copyPublicUrl = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    toast({ description: 'Public URL copied to clipboard!' });
  };

  const publicUrl = `${window.location.origin}/${username}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Curately
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={openProfileDialog}>
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Public URL Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Public Page</CardTitle>
            <CardDescription>
              Share this URL to showcase your recommendations: {profile?.page_title || 'My Recommendations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input 
                value={publicUrl} 
                readOnly 
                className="flex-1 font-mono text-sm"
              />
              <Button variant="outline" onClick={copyPublicUrl}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" asChild>
                <a href={`/${username}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items Management */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Recommendations</h2>
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Recommendation</DialogTitle>
                <DialogDescription>
                  Add a new item to your recommendation list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Product or service name"
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="target_url">Target URL</Label>
                  <Input
                    id="target_url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    placeholder="https://your-affiliate-link.com"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Why do you recommend this?"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Add Recommendation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your curated list by adding your first recommendation
                </p>
                <Button onClick={() => setIsAddingItem(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Recommendation</DialogTitle>
              <DialogDescription>
                Update your recommendation details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-image_url">Image URL</Label>
                <Input
                  id="edit-image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-target_url">Target URL</Label>
                <Input
                  id="edit-target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleEditItem} className="w-full">
                Update Recommendation
              </Button>
            </div>
            </DialogContent>
          </Dialog>

          {/* Profile Settings Dialog */}
          <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Profile Settings</DialogTitle>
                <DialogDescription>
                  Customize your public page title, description, and URL
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profile-username">Username (URL)</Label>
                  <Input
                    id="profile-username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="your-username"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your page will be available at: thecurately.com/{profileData.username}
                  </p>
                </div>
                <div>
                  <Label htmlFor="profile-title">Page Title</Label>
                  <Input
                    id="profile-title"
                    value={profileData.page_title}
                    onChange={(e) => setProfileData({ ...profileData, page_title: e.target.value })}
                    placeholder="My Favorite Tech Gear"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-description">Page Description</Label>
                  <Textarea
                    id="profile-description"
                    value={profileData.page_description}
                    onChange={(e) => setProfileData({ ...profileData, page_description: e.target.value })}
                    placeholder="A curated list of tools I use every day..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpdateProfile} className="w-full">
                  Update Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

export default Dashboard;