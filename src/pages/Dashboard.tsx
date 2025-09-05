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
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Copy, ExternalLink, Palette, LogOut, Settings, FolderPlus, Mail, CheckCircle, XCircle, Loader2, User, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUsernameCheck } from '@/hooks/useUsernameCheck';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { isValidUrl, isValidLength, sanitizeText, safeOpenUrl } from '@/lib/security';
import { ImageUpload } from '@/components/ImageUpload';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  display_name: string;
  page_title: string;
  page_description: string;
  avatar_url: string;
  public_profile: boolean;
  username_changed_at?: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile>({
    username: '',
    display_name: '',
    page_title: '',
    page_description: '',
    avatar_url: '',
    public_profile: false,
    username_changed_at: undefined
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
    display_name: '',
    page_title: '',
    page_description: '',
    avatar_url: '',
    public_profile: false,
    username_changed_at: undefined
  });
  
  const usernameCheck = useUsernameCheck(profileData.username);
  
  // Calculate username cooldown info
  const getUsernameCooldownInfo = () => {
    if (!profile.username_changed_at) return { canChange: true, daysRemaining: 0, nextChangeDate: null };
    
    const lastChanged = new Date(profile.username_changed_at);
    const thirtyDaysLater = new Date(lastChanged.getTime() + (30 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const canChange = now >= thirtyDaysLater;
    const daysRemaining = canChange ? 0 : Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      canChange,
      daysRemaining,
      nextChangeDate: thirtyDaysLater
    };
  };
  
  const cooldownInfo = getUsernameCooldownInfo();


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
        .select('username, display_name, page_title, page_description, avatar_url, public_profile, username_changed_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        const profileData = {
          username: data.username || '',
          display_name: data.display_name || '',
          page_title: data.page_title || '',
          page_description: data.page_description || '',
          avatar_url: data.avatar_url || '',
          public_profile: data.public_profile || false,
          username_changed_at: data.username_changed_at
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
    // Validate input data
    if (!isValidLength(categoryData.name, 100)) {
      toast({ description: 'Category name is too long (max 100 characters)', variant: 'destructive' });
      return;
    }
    
    if (!isValidLength(categoryData.description, 500)) {
      toast({ description: 'Description is too long (max 500 characters)', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: sanitizeText(categoryData.name),
          description: sanitizeText(categoryData.description),
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
    // Validate mandatory fields
    if (!formData.title.trim()) {
      toast({ description: 'Title is required', variant: 'destructive' });
      return;
    }
    
    if (!formData.image_url.trim()) {
      toast({ description: 'Image is required', variant: 'destructive' });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({ description: 'Description is required', variant: 'destructive' });
      return;
    }
    
    // Validate field lengths
    if (!isValidLength(formData.title, 200)) {
      toast({ description: 'Title is too long (max 200 characters)', variant: 'destructive' });
      return;
    }
    
    if (!isValidLength(formData.description, 1000)) {
      toast({ description: 'Description is too long (max 1000 characters)', variant: 'destructive' });
      return;
    }
    
    
    if (formData.target_url.trim() && !isValidUrl(formData.target_url)) {
      toast({ description: 'Invalid target URL', variant: 'destructive' });
      return;
    }
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      toast({ description: 'Invalid image URL', variant: 'destructive' });
      return;
    }

    try {
      const itemData = {
        title: sanitizeText(formData.title),
        description: sanitizeText(formData.description),
        image_url: formData.image_url,
        target_url: formData.target_url,
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
    // Validate input data
    if (!isValidLength(profileData.page_title, 200)) {
      toast({ description: 'Page title is too long (max 200 characters)', variant: 'destructive' });
      return;
    }
    
    if (!isValidLength(profileData.page_description, 1000)) {
      toast({ description: 'Page description is too long (max 1000 characters)', variant: 'destructive' });
      return;
    }

    try {
      // Check if username has changed and handle it separately
      if (profileData.username !== profile.username) {
        const { data, error } = await supabase.rpc('update_username', {
          user_id_param: user.id,
          new_username: profileData.username
        });

        if (error) throw error;

        const result = data as { success: boolean; message: string; error?: string };

        if (!result.success) {
          toast({ 
            description: result.message, 
            variant: 'destructive' 
          });
          return;
        }

        toast({ description: result.message });
      }

      // Update other profile fields
      const updateData = {
        display_name: sanitizeText(profileData.display_name),
        page_title: sanitizeText(profileData.page_title),
        page_description: sanitizeText(profileData.page_description),
        avatar_url: profileData.avatar_url,
        public_profile: profileData.public_profile
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Fetch fresh profile data
      await fetchProfile();
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
  const displayName = profile.display_name || user?.email?.split('@')[0] || 'User';
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">{/* Header */}
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md shadow-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <img 
                src="/lovable-uploads/61b68216-f035-4896-8f00-3825ff39d04e.png" 
                alt="Curately Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Curately
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Welcome, {username}
              </span>
              <span className="text-xs text-muted-foreground block sm:hidden truncate max-w-20">
                {username}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="hover:shadow-card transition-shadow duration-200 flex-shrink-0">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
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
        {/* Profile Header Section */}
        <Card className="mb-8 relative overflow-hidden border-border/50 shadow-elegant backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0 bg-gradient-hero opacity-30"></div>
          <CardContent className="relative pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border shadow-elegant hover-scale">
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-lg sm:text-xl font-semibold bg-gradient-primary text-primary-foreground">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background border-border shadow-lg hover-scale"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Profile Info & Actions */}
              <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">{displayName}</h1>
                  <p className="text-muted-foreground font-mono text-sm">@{username}</p>
                  <h2 className="text-lg sm:text-xl font-semibold mt-2 mb-1">{profile.page_title || 'My Recommendations'}</h2>
                  <p className="text-muted-foreground text-sm">
                    {profile.page_description || 'A curated list of my favorite products and tools.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2 flex-1">
                    <Button variant="outline" onClick={copyPublicUrl} className="hover:shadow-elegant transition-all duration-300 hover-scale flex-1 sm:flex-initial">
                      <Copy className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Copy URL</span>
                      <span className="sm:hidden">Copy</span>
                    </Button>
                    <Button variant="outline" asChild className="hover:shadow-elegant transition-all duration-300 hover-scale flex-1 sm:flex-initial">
                      <a href={`/${username}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">View Page</span>
                        <span className="sm:hidden">View</span>
                      </a>
                    </Button>
                  </div>
                  <Button onClick={() => setIsEditingProfile(true)} className="bg-gradient-primary hover:opacity-90 hover-scale transition-all duration-300 w-full sm:w-auto">
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                </div>

                {/* Public URL Display */}
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Your public page:</p>
                  <Input 
                    value={publicUrl} 
                    readOnly 
                    className="font-mono text-xs bg-muted/50 border-border/50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Separator */}
        <div className="mb-8">
          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/50 to-muted/80 border border-border/50">
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Categories</TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-6 animate-fade-in">
            {/* Categories Management */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Organize Your Content</h2>
              {categories.length > 0 && (
                <Button onClick={() => setIsAddingCategory(true)} className="bg-gradient-primary hover:opacity-90 hover-scale transition-all duration-300 w-full sm:w-auto">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>

            {categories.length === 0 ? (
              <Card className="border-border/50 bg-gradient-card shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Start with Categories</h3>
                    <p className="text-muted-foreground mb-4">
                      Categories help organize your recommendations into meaningful groups like "Tools", "Books", or "Apps"
                    </p>
                    <Button onClick={() => setIsAddingCategory(true)} className="bg-gradient-primary hover:opacity-90">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Your First Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border-border/50 bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openCategoryEditDialog(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {category.description && (
                        <CardDescription className="text-sm">{category.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {getItemsByCategory(category.id).length} recommendations
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6 animate-fade-in">
            {/* Items Management */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Your Recommendations</h2>
              {categories.length > 0 && (
                <Button onClick={() => setIsAddingItem(true)} className="bg-gradient-primary hover:opacity-90 hover-scale transition-all duration-300 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recommendation
                </Button>
              )}
            </div>

            {/* Empty State Logic */}
            {categories.length === 0 && items.length === 0 ? (
              <Card className="border-border/50 bg-gradient-card shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium">No recommendations yet</h3>
                    <p className="text-muted-foreground">
                      Start by creating categories first to organize your recommendations
                    </p>
                    <Button onClick={() => setIsAddingCategory(true)} className="bg-gradient-primary hover:opacity-90">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Your First Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : categories.length === 0 ? (
              <Card className="border-border/50 bg-gradient-card shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium">Create categories first</h3>
                    <p className="text-muted-foreground">
                      You have recommendations but no categories. Organize them by creating categories first.
                    </p>
                    <Button onClick={() => setIsAddingCategory(true)} className="bg-gradient-primary hover:opacity-90">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
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
                        <Card className="border-border/50 bg-gradient-card shadow-card">
                          <CardContent className="flex items-center justify-center py-8">
                            <p className="text-muted-foreground text-sm">No items in this category yet</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden border-border/50 bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300">
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
                                    className="hover:shadow-card transition-shadow duration-200"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-destructive hover:text-destructive hover:shadow-card transition-all duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {item.target_url && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      asChild
                                      className="hover:shadow-card transition-shadow duration-200"
                                    >
                                      <a href={item.target_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </Button>
                                  )}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">Uncategorized</h3>
                        <p className="text-muted-foreground text-sm">Items without a category</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorizedItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-border/50 bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300">
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
                                className="hover:shadow-card transition-shadow duration-200"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-destructive hover:text-destructive hover:shadow-card transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {item.target_url && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild
                                  className="hover:shadow-card transition-shadow duration-200"
                                >
                                  <a href={item.target_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
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
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogContent className="mx-2 sm:mx-4 max-w-lg max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product or service name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image *</Label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  currentImageUrl={formData.image_url}
                  onRemoveImage={() => setFormData({ ...formData, image_url: '' })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Why do you recommend this?"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="target_url">Affiliate Link (Optional)</Label>
                <Input
                  id="target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://your-affiliate-link.com"
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
          <DialogContent className="mx-2 sm:mx-4 max-w-lg">
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
        <Dialog open={!!editingItem} onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setFormData({ title: '', description: '', image_url: '', target_url: '', category_id: '' });
          }
        }}>
          <DialogContent className="mx-2 sm:mx-4 max-w-lg max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-image_url">Image *</Label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  currentImageUrl={formData.image_url}
                  onRemoveImage={() => setFormData({ ...formData, image_url: '' })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-target_url">Affiliate Link (Optional)</Label>
                <Input
                  id="edit-target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://your-affiliate-link.com"
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
          <DialogContent className="mx-2 sm:mx-4 max-w-lg">
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
          <DialogContent className="mx-2 sm:mx-4 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Customize your profile picture, display name, page content, and URL
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="profile-avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-border">
                    <AvatarImage src={profileData.avatar_url} alt={profileData.display_name} />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-primary text-primary-foreground">
                      {getInitials(profileData.display_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <ImageUpload
                    onImageUploaded={(url) => setProfileData({ ...profileData, avatar_url: url })}
                    currentImageUrl={profileData.avatar_url}
                    onRemoveImage={() => setProfileData({ ...profileData, avatar_url: '' })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-display-name">Display Name</Label>
                <Input
                  id="profile-display-name"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                  placeholder="Your Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-title">Page Title</Label>
                <Input
                  id="profile-title"
                  value={profileData.page_title}
                  onChange={(e) => setProfileData({ ...profileData, page_title: e.target.value })}
                  placeholder="My Favorite Tech Gear"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-description">Page Description</Label>
                <Textarea
                  id="profile-description"
                  value={profileData.page_description}
                  onChange={(e) => setProfileData({ ...profileData, page_description: e.target.value })}
                  placeholder="A curated list of tools I use every day..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-username">Username (URL)</Label>
                
                {/* Subtle warning about 30-day restriction */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Username Change Policy:</span> You can only change your username once every 30 days. Choose carefully!
                  </p>
                </div>
                
                {/* Username Cooldown Warning */}
                {!cooldownInfo.canChange && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertDescription className="text-amber-800">
                      <div className="font-medium mb-1">Username Change Restriction</div>
                      <div className="text-sm">
                        You can change your username again in <strong>{cooldownInfo.daysRemaining} days</strong> ({cooldownInfo.nextChangeDate?.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}).
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="relative">
                  <Input
                    id="profile-username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase() })}
                    placeholder="your-username"
                    disabled={!cooldownInfo.canChange}
                    className={cn(
                      "pr-8",
                      profileData.username.length >= 3 && profileData.username !== profile.username && !usernameCheck.isChecking && 
                      (usernameCheck.available ? "border-green-500" : "border-red-500")
                    )}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {profileData.username.length >= 3 && profileData.username !== profile.username && cooldownInfo.canChange && (
                      <>
                        {usernameCheck.isChecking && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                        {!usernameCheck.isChecking && usernameCheck.available && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {!usernameCheck.isChecking && !usernameCheck.available && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
                {profileData.username.length >= 3 && profileData.username !== profile.username && usernameCheck.message && cooldownInfo.canChange && (
                  <p className={cn(
                    "text-sm mt-1",
                    usernameCheck.available ? "text-green-600" : "text-red-600"
                  )}>
                    {usernameCheck.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Your page will be available at: thecurately.com/{profileData.username}
                </p>
              </div>
              <div className="grid gap-2">
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
                <Button 
                onClick={handleUpdateProfile} 
                className="w-full"
                disabled={
                  (profileData.username !== profile.username && !cooldownInfo.canChange) ||
                  (profileData.username !== profile.username && 
                  (!usernameCheck.available || usernameCheck.isChecking || profileData.username.length < 3))
                }
              >
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