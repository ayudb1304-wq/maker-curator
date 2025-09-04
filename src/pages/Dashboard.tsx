import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Copy, ExternalLink, Palette, LogOut, Settings, FolderPlus, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface Item {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  position: number;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  position: number;
}

interface Profile {
  username: string;
  page_title: string;
  page_description: string;
  public_profile: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile>({
    username: '',
    page_title: '',
    page_description: '',
    public_profile: false
  });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    target_url: '',
    category_id: ''
  });

  const [categoryData, setCategoryData] = useState({
    name: '',
    description: ''
  });

  const [profileData, setProfileData] = useState<Profile>({
    username: '',
    page_title: '',
    page_description: '',
    public_profile: false
  });


  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCategories();
      fetchRecommendations();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, page_title, page_description, public_profile')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        const profileData = {
          username: data.username || '',
          page_title: data.page_title || '',
          page_description: data.page_description || '',
          public_profile: data.public_profile || false
        };
        setProfile(profileData);
        setProfileData(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({ description: 'Failed to load profile', variant: 'destructive' });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({ description: 'Failed to load categories', variant: 'destructive' });
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

  const handleAddCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          user_id: user.id,
          position: categories.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCategories([...categories, data]);
      setCategoryData({ name: '', description: '' });
      setIsAddingCategory(false);
      toast({ description: 'Category added successfully!' });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ description: 'Failed to add category', variant: 'destructive' });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id)
        .select()
        .single();

      if (error) throw error;

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data : cat
      ));
      setCategoryData({ name: '', description: '' });
      setEditingCategory(null);
      toast({ description: 'Category updated successfully!' });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({ description: 'Failed to update category', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== id));
      toast({ description: 'Category deleted successfully!' });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  const handleAddItem = async () => {
    try {
      const itemData = {
        ...formData,
        user_id: user.id,
        position: items.filter(item => item.category_id === formData.category_id).length,
        category_id: formData.category_id || null
      };

      const { data, error } = await supabase
        .from('recommendations')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      
      setItems([...items, data]);
      setFormData({ title: '', description: '', image_url: '', target_url: '', category_id: '' });
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
      setFormData({ title: '', description: '', image_url: '', target_url: '', category_id: '' });
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
      target_url: item.target_url,
      category_id: item.category_id || ''
    });
  };

  const openCategoryEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryData({
      name: category.name,
      description: category.description
    });
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const username = profile.username || user?.email?.split('@')[0] || 'user';
  
  const copyPublicUrl = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    toast({ description: 'Public URL copied to clipboard!' });
  };

  const publicUrl = `${window.location.origin}/${username}`;

  const getItemsByCategory = (categoryId: string | null) => {
    return items.filter(item => item.category_id === categoryId);
  };

  const uncategorizedItems = getItemsByCategory(null);

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
              <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email || username}
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
        {/* Email Verification Alert */}
        {user && !user.email_confirmed_at && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Mail className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="font-medium mb-1">Please verify your email address</div>
              <div className="text-sm">
                We've sent a verification email to <strong>{user.email}</strong>. 
                Please check your inbox and click the verification link to access all features of your dashboard.
              </div>
            </AlertDescription>
          </Alert>
        )}
        {/* Page Title & Description Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{profile.page_title || 'My Recommendations'}</CardTitle>
                <CardDescription className="mt-2">
                  {profile.page_description || 'A curated list of my favorite products and tools.'}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Page Info
              </Button>
            </div>
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

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-6">
            {/* Items Management */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Recommendations</h2>
              <Button onClick={() => setIsAddingItem(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Categories with Items */}
            {categories.length === 0 && items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your curated list by adding categories and recommendations
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsAddingCategory(true)} variant="outline">
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Add Category
                      </Button>
                      <Button onClick={() => setIsAddingItem(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Categorized Items */}
                {categories.map((category) => {
                  const categoryItems = getItemsByCategory(category.id);
                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{category.name}</h3>
                          {category.description && (
                            <p className="text-muted-foreground text-sm">{category.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {categoryItems.length === 0 ? (
                        <Card>
                          <CardContent className="flex items-center justify-center py-8">
                            <p className="text-muted-foreground text-sm">No items in this category yet</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                              <div className="aspect-video w-full overflow-hidden">
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-2">{item.title}</h4>
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
                    </div>
                  );
                })}

                {/* Uncategorized Items */}
                {uncategorizedItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Uncategorized</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorizedItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="aspect-video w-full overflow-hidden">
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">{item.title}</h4>
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
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            {/* Categories Management */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Button onClick={() => setIsAddingCategory(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {categories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create categories to organize your recommendations
                    </p>
                    <Button onClick={() => setIsAddingCategory(true)}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Add Your First Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {category.name}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCategoryEditDialog(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                      {category.description && (
                        <CardDescription>{category.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {getItemsByCategory(category.id).length} items
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Recommendation</DialogTitle>
              <DialogDescription>
                Add a new item to your recommendation list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={formData.category_id || 'none'} onValueChange={(value) => setFormData({ ...formData, category_id: value === 'none' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.filter((c) => !!c && !!c.id).map((category) => (
                      <SelectItem key={category.id} value={category.id as string}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

        {/* Add Category Dialog */}
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a category to organize your recommendations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  placeholder="e.g., Tech, Fitness, Books"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
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
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category_id || 'none'} onValueChange={(value) => setFormData({ ...formData, category_id: value === 'none' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.filter((c) => !!c && !!c.id).map((category) => (
                      <SelectItem key={category.id} value={category.id as string}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category-description">Description</Label>
                <Textarea
                  id="edit-category-description"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleEditCategory} className="w-full">
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profile Settings Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Page Settings</DialogTitle>
              <DialogDescription>
                Customize your public page title, description, and URL
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="public_profile"
                    checked={profileData.public_profile}
                    onChange={(e) => setProfileData({ ...profileData, public_profile: e.target.checked })}
                    className="rounded border border-input"
                  />
                  <Label htmlFor="public_profile" className="text-sm font-medium">
                    Make my page publicly visible
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, your recommendations page will be visible to everyone at the public URL above.
                  When disabled, only you can access your recommendations.
                </p>
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Update Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;