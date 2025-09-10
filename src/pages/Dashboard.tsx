import React, { useState, useEffect, useRef } from 'react';
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
import { Plus, Edit, Trash2, Copy, ExternalLink, Palette, LogOut, Settings, FolderPlus, Mail, CheckCircle, XCircle, Loader2, User, Camera, Grid, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUsernameCheck } from '@/hooks/useUsernameCheck';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { isValidUrl, isValidLength, sanitizeText, safeOpenUrl } from '@/lib/security';
import { ImageUpload } from '@/components/ImageUpload';
import { countWords, validateWordLimit, getWordCountText, getWordCountColor } from '@/lib/textUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { stripEmojiSpans } from '@/lib/emoji';

interface Item {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  long_description?: string;
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
  use_avatar_background: boolean;
  username_changed_at?: string;
  display_name_color?: string;
  username_color?: string;
  page_title_color?: string;
  page_description_color?: string;
  youtube_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  threads_url?: string;
  snapchat_url?: string;
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
    use_avatar_background: false,
    username_changed_at: undefined,
    display_name_color: '#ffffff',
    username_color: '#a1a1aa',
    page_title_color: '#ffffff',
    page_description_color: '#a1a1aa',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
    instagram_url: '',
    threads_url: '',
    snapchat_url: ''
  });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<Record<string, number>>({});
  const [showMoreClicked, setShowMoreClicked] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'recommendations' | 'categories' | 'profile'>('profile');
  
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLElement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    long_description: '',
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
    use_avatar_background: false,
    username_changed_at: undefined,
    display_name_color: '#ffffff',
    username_color: '#a1a1aa',
    page_title_color: '#ffffff',
    page_description_color: '#a1a1aa',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
    instagram_url: '',
    threads_url: '',
    snapchat_url: ''
  });
  
  const draftKey = user ? `profileDraft:${user.id}` : null;

  // Restore unsaved profile draft when reopening the dialog
  useEffect(() => {
    if (!isEditingProfile || !draftKey) return;
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        setProfileData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load profile draft', e);
    }
  }, [isEditingProfile, draftKey]);

  // Autosave profile edits while the dialog is open
  useEffect(() => {
    if (!isEditingProfile || !draftKey) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(profileData));
    } catch {
      // ignore write errors
    }
  }, [profileData, isEditingProfile, draftKey]);
  
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

  useEffect(() => {
    // Initialize visible items count for each category
    const initialVisibleItems: Record<string, number> = {};
    const initialShowMore: Record<string, boolean> = {};
    
    categories.forEach(category => {
      const categoryItems = getItemsByCategory(category.id);
      initialVisibleItems[category.id] = Math.min(12, categoryItems.length);
      initialShowMore[category.id] = false;
    });
    
    // Handle uncategorized items
    const uncategorizedItems = getItemsByCategory(null);
    if (uncategorizedItems.length > 0) {
      initialVisibleItems['uncategorized'] = Math.min(12, uncategorizedItems.length);
      initialShowMore['uncategorized'] = false;
    }
    
    setVisibleItems(initialVisibleItems);
    setShowMoreClicked(initialShowMore);
  }, [categories, items]);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      
      const navRect = navRef.current.getBoundingClientRect();
      const isSticky = navRect.top <= 0;
      
      if (isSticky) {
        navRef.current.classList.add('sticky-nav');
      } else {
        navRef.current.classList.remove('sticky-nav');
      }
      
      // Determine active category based on scroll position
      let currentActive: string | null = null;
      const scrollPosition = window.scrollY + 200;
      
      Object.entries(categoryRefs.current).forEach(([categoryId, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;
          const elementBottom = elementTop + element.offsetHeight;
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            currentActive = categoryId;
          }
        }
      });
      
      if (currentActive) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);


  const fetchProfile = async () => {
    try {
      // Try to get existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, page_title, page_description, avatar_url, public_profile, use_avatar_background, username_changed_at, display_name_color, username_color, page_title_color, page_description_color, youtube_url, twitter_url, linkedin_url, tiktok_url, instagram_url, threads_url, snapchat_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      let profileRow = data;
      // If no profile, create one using user metadata
      if (!profileRow) {
        const username = (user.user_metadata as any)?.username || user.email?.split('@')[0] || '';
        const display_name = (user.user_metadata as any)?.display_name || username;
        const occupation = (user.user_metadata as any)?.occupation;
        const gender = (user.user_metadata as any)?.gender;
        const bio = occupation && gender ? `${occupation} • ${gender}` : occupation || gender || null;

        const insertData = {
          user_id: user.id,
          username: username.toLowerCase().trim(),
          display_name,
          bio,
        } as const;

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert([insertData])
          .select('username, display_name, page_title, page_description, avatar_url, public_profile, use_avatar_background, username_changed_at, display_name_color, username_color, page_title_color, page_description_color, youtube_url, twitter_url, linkedin_url, tiktok_url, instagram_url, threads_url, snapchat_url')
          .single();

        if (insertError) throw insertError;
        profileRow = created;
        toast({ description: 'Profile created successfully!' });
      }

      if (profileRow) {
        const profileData = {
          username: profileRow.username || '',
          display_name: stripEmojiSpans(profileRow.display_name || ''),
          page_title: stripEmojiSpans(profileRow.page_title || ''),
          page_description: stripEmojiSpans(profileRow.page_description || ''),
          avatar_url: profileRow.avatar_url || '',
          public_profile: profileRow.public_profile || false,
          use_avatar_background: profileRow.use_avatar_background || false,
          username_changed_at: profileRow.username_changed_at,
          display_name_color: profileRow.display_name_color || '#ffffff',
          username_color: profileRow.username_color || '#a1a1aa',
          page_title_color: profileRow.page_title_color || '#ffffff',
          page_description_color: profileRow.page_description_color || '#a1a1aa',
          youtube_url: profileRow.youtube_url || '',
          twitter_url: profileRow.twitter_url || '',
          linkedin_url: profileRow.linkedin_url || '',
          tiktok_url: profileRow.tiktok_url || '',
          instagram_url: profileRow.instagram_url || '',
          threads_url: profileRow.threads_url || '',
          snapchat_url: profileRow.snapchat_url || ''
        };
        // Merge with any unsaved draft from localStorage to prevent losing edits after tab switch/reload
        let merged = profileData;
        try {
          const draft = localStorage.getItem(`profileDraft:${user.id}`);
          if (draft) {
            merged = { ...merged, ...JSON.parse(draft) };
          }
        } catch {}
        setProfile(merged);
        setProfileData(merged);
        
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
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
    
    if (categoryData.description.trim() && !validateWordLimit(categoryData.description, 30)) {
      toast({ description: 'Category description must be 30 words or less', variant: 'destructive' });
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
    
    if (!formData.short_description.trim()) {
      toast({ description: 'Short description is required', variant: 'destructive' });
      return;
    }
    
    if (!validateWordLimit(formData.short_description, 25)) {
      toast({ description: 'Short description must be 25 words or less', variant: 'destructive' });
      return;
    }
    
    // Validate field lengths
    if (!isValidLength(formData.title, 200)) {
      toast({ description: 'Title is too long (max 200 characters)', variant: 'destructive' });
      return;
    }
    
    if (formData.long_description.trim() && !validateWordLimit(formData.long_description, 100)) {
      toast({ description: 'Long description must be 100 words or less', variant: 'destructive' });
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
        description: formData.description, // Keep old field for backward compatibility
        short_description: sanitizeText(formData.short_description),
        long_description: formData.long_description ? sanitizeText(formData.long_description) : null,
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
      setFormData({ title: '', description: '', short_description: '', long_description: '', image_url: '', target_url: '', category_id: '' });
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
      setFormData({ title: '', description: '', short_description: '', long_description: '', image_url: '', target_url: '', category_id: '' });
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
        public_profile: profileData.public_profile,
        use_avatar_background: profileData.use_avatar_background,
        display_name_color: profileData.display_name_color,
        username_color: profileData.username_color,
        page_title_color: profileData.page_title_color,
        page_description_color: profileData.page_description_color,
        youtube_url: profileData.youtube_url || null,
        twitter_url: profileData.twitter_url || null,
        linkedin_url: profileData.linkedin_url || null,
        tiktok_url: profileData.tiktok_url || null,
        instagram_url: profileData.instagram_url || null,
        threads_url: profileData.threads_url || null,
        snapchat_url: profileData.snapchat_url || null
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Fetch fresh profile data
      await fetchProfile();
      // Clear draft after successful save
      if (draftKey) { try { localStorage.removeItem(draftKey); } catch {} }
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
      short_description: item.short_description || '',
      long_description: item.long_description || '',
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

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      setActiveCategory(categoryId); // Set active immediately when clicked
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShowMore = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? getItemsByCategory(null) 
      : getItemsByCategory(categoryId);
    
    setVisibleItems(prev => ({
      ...prev,
      [categoryId]: categoryItems.length
    }));
    
    setShowMoreClicked(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  const shouldShowMoreButton = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? getItemsByCategory(null) 
      : getItemsByCategory(categoryId);
    
    return categoryItems.length > 10 && !showMoreClicked[categoryId];
  };

  const getVisibleItems = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? getItemsByCategory(null) 
      : getItemsByCategory(categoryId);
    
    const visibleCount = visibleItems[categoryId] || 12;
    return categoryItems.slice(0, visibleCount);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 sm:pb-0">{/* Header */}
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md shadow-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <img 
                src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
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
        {/* Profile Header Section - Hidden when profile tab is active */}
        {activeTab !== 'profile' && (
          <Card className="mb-8 relative overflow-hidden border-border/50 shadow-elegant backdrop-blur-sm animate-fade-in">
            <div className="hidden" />
            <CardContent className="relative pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-border shadow-elegant hover-scale">
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
                     <h1 className="text-lg sm:text-2xl font-bold mb-1">{displayName}</h1>
                     <p className="text-muted-foreground font-mono text-xs">@{username}</p>
                     <h2 className="hidden sm:block text-lg font-semibold mt-2 mb-1">{profile.page_title || 'My Recommendations'}</h2>
                     <p className="hidden sm:block text-muted-foreground text-sm">
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
                    <Button onClick={() => setIsEditingProfile(true)} size="sm" variant="outline" className="w-full sm:w-auto">
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </div>

                  {/* Public URL Display */}
                   <div className="pt-2 border-t border-border/50">
                     <p className="text-xs text-muted-foreground mb-2">Your public page:</p>
                     <div className="font-mono text-xs bg-muted/50 border border-border/50 rounded-md p-2 break-all select-text">
                       {publicUrl}
                     </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Separator */}
        <div className="mb-8">
          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          {/* Desktop tabs - hidden on mobile */}
          <TabsList className="hidden sm:grid w-full grid-cols-3 bg-gradient-to-r from-muted/50 to-muted/80 border border-border/50 mb-6">
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Recommendations</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Categories</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Profile</TabsTrigger>
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
            {/* Sticky Category Navigation */}
            {categories.length > 0 && (
              <nav 
                ref={navRef}
                className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-4 mb-8 transition-all duration-300 z-50"
                style={{ position: 'sticky', top: '1rem' }}
              >
                <div className="flex flex-wrap gap-4 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => scrollToCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeCategory === category.id
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                  {getItemsByCategory(null).length > 0 && (
                    <button
                      onClick={() => scrollToCategory('uncategorized')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeCategory === 'uncategorized'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      Uncategorized
                    </button>
                  )}
                </div>
              </nav>
            )}

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
                  const visibleCategoryItems = getVisibleItems(category.id);
                  return (
                    <div 
                      key={category.id} 
                      ref={el => categoryRefs.current[category.id] = el}
                      className="space-y-4"
                    >
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
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {visibleCategoryItems.map((item) => (
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
                                {(item.short_description || item.description) && (
                                  <p className="text-sm text-muted-foreground mb-4">{item.short_description || item.description}</p>
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
                          
                          {/* Show More Button */}
                          {shouldShowMoreButton(category.id) && (
                            <div className="text-center pt-6">
                              <Button
                                variant="outline"
                                onClick={() => handleShowMore(category.id)}
                                className="px-8 py-2"
                              >
                                Show More ({categoryItems.length - (visibleItems[category.id] || 12)} more items)
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Uncategorized Items */}
                {uncategorizedItems.length > 0 && (
                  <div 
                    ref={el => categoryRefs.current['uncategorized'] = el}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">Uncategorized</h3>
                        <p className="text-muted-foreground text-sm">Items without a category</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {getVisibleItems('uncategorized').map((item) => (
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
                            {(item.short_description || item.description) && (
                              <p className="text-sm text-muted-foreground mb-4">{item.short_description || item.description}</p>
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
                    
                    {/* Show More Button for Uncategorized */}
                    {shouldShowMoreButton('uncategorized') && (
                      <div className="text-center pt-6">
                        <Button
                          variant="outline"
                          onClick={() => handleShowMore('uncategorized')}
                          className="px-8 py-2"
                        >
                          Show More ({uncategorizedItems.length - (visibleItems['uncategorized'] || 12)} more items)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab Content - Enhanced Dashboard Home */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/20 shadow-elegant">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
                  <AvatarFallback className="text-lg font-bold bg-gradient-primary text-primary-foreground">
                    {getInitials(profile.display_name || profile.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-1">
                    Welcome back, {profile.display_name || profile.username}!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your recommendations and grow your audience
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => window.open(`/${profile.username}`, '_blank', 'noopener,noreferrer')}
                  className="h-10 sm:h-12 text-xs sm:text-sm bg-background/50 border-border/50 hover:bg-background hover:shadow-md transition-all"
                >
                  <ExternalLink className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">View Page</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyPublicUrl}
                  className="h-10 sm:h-12 text-xs sm:text-sm bg-background/50 border-border/50 hover:bg-background hover:shadow-md transition-all"
                >
                  <Copy className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Copy URL</span>
                  <span className="sm:hidden">Copy</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  className="h-10 sm:h-12 text-xs sm:text-sm bg-background/50 border-border/50 hover:bg-background hover:shadow-md transition-all col-span-2 sm:col-span-1"
                >
                  <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>
            </div>

            {/* Profile Overview */}
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Username</p>
                    <p className="font-mono text-sm sm:text-base font-medium">@{profile.username}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profile.public_profile ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <p className="text-sm sm:text-base font-medium">
                        {profile.public_profile ? "Public" : "Private"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {(profile.page_title || profile.page_description) && (
                  <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Page Info</p>
                    {profile.page_title && (
                      <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                        {profile.page_title}
                      </h4>
                    )}
                    {profile.page_description && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {profile.page_description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{categories.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Categories</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{items.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Recommendations</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                    {items.filter(item => item.target_url).length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">With Links</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                    {items.filter(item => !item.category_id).length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Uncategorized</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Card */}
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Get started with common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('recommendations')}
                    className="h-12 sm:h-14 justify-start text-left p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Grid className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base">Add Recommendation</p>
                        <p className="text-xs text-muted-foreground">Share your favorite products</p>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('categories')}
                    className="h-12 sm:h-14 justify-start text-left p-4 bg-gradient-to-r from-accent/5 to-transparent border-accent/20 hover:border-accent/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Folder className="w-5 h-5 text-accent flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base">Organize Categories</p>
                        <p className="text-xs text-muted-foreground">Group your recommendations</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recommendation</DialogTitle>
              <DialogDescription>
                Add a new item to your recommendation list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="category" className="text-sm sm:text-base">Category (Optional)</Label>
                <Select value={formData.category_id || 'none'} onValueChange={(value) => setFormData({ ...formData, category_id: value === 'none' ? '' : value })}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product or service name"
                  required
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="image_url" className="text-sm sm:text-base">Image *</Label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  currentImageUrl={formData.image_url}
                  onRemoveImage={() => setFormData({ ...formData, image_url: '' })}
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="short_description" className="text-sm sm:text-base">Short Description *</Label>
                <div className="relative">
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief description for the grid view (max 25 words)"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base pr-20"
                  />
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${getWordCountColor(formData.short_description, 25)}`}>
                    {getWordCountText(formData.short_description, 25)}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="long_description" className="text-sm sm:text-base">Long Description (Optional)</Label>
                <div className="relative">
                  <Textarea
                    id="long_description"
                    value={formData.long_description}
                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                    placeholder="Detailed description for the modal view (max 100 words)"
                    rows={3}
                    className="text-sm sm:text-base min-h-[80px] sm:min-h-[120px] resize-none pr-20"
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${getWordCountColor(formData.long_description, 100)}`}>
                    {getWordCountText(formData.long_description, 100)}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="target_url" className="text-sm sm:text-base">Affiliate Link (Optional)</Label>
                <Input
                  id="target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://your-affiliate-link.com"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <Button onClick={handleAddItem} className="w-full h-10 sm:h-12 text-sm sm:text-base mt-4 sm:mt-6">
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
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="category-name" className="text-sm sm:text-base">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  placeholder="e.g., Tech, Fitness, Books"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="category-description" className="text-sm sm:text-base">Description (Optional)</Label>
                <div className="relative">
                  <Textarea
                    id="category-description"
                    value={categoryData.description}
                    onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                    placeholder="Brief description of this category (max 30 words)"
                    rows={3}
                    className="text-sm sm:text-base min-h-[80px] sm:min-h-[120px] resize-none pr-20"
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${getWordCountColor(categoryData.description, 30)}`}>
                    {getWordCountText(categoryData.description, 30)}
                  </span>
                </div>
              </div>
              <Button onClick={handleAddCategory} className="w-full h-10 sm:h-12 text-sm sm:text-base mt-4 sm:mt-6">
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setFormData({ title: '', description: '', short_description: '', long_description: '', image_url: '', target_url: '', category_id: '' });
          }
        }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Recommendation</DialogTitle>
              <DialogDescription>
                Update your recommendation details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-category" className="text-sm sm:text-base">Category</Label>
                <Select value={formData.category_id || 'none'} onValueChange={(value) => setFormData({ ...formData, category_id: value === 'none' ? '' : value })}>
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-title" className="text-sm sm:text-base">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-image_url" className="text-sm sm:text-base">Image *</Label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  currentImageUrl={formData.image_url}
                  onRemoveImage={() => setFormData({ ...formData, image_url: '' })}
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-short_description" className="text-sm sm:text-base">Short Description *</Label>
                <div className="relative">
                  <Input
                    id="edit-short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief description for the grid view (max 25 words)"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base pr-20"
                  />
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${getWordCountColor(formData.short_description, 25)}`}>
                    {getWordCountText(formData.short_description, 25)}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-long_description" className="text-sm sm:text-base">Long Description (Optional)</Label>
                <div className="relative">
                  <Textarea
                    id="edit-long_description"
                    value={formData.long_description}
                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                    placeholder="Detailed description for the modal view (max 100 words)"
                    rows={3}
                    className="text-sm sm:text-base min-h-[80px] sm:min-h-[120px] resize-none pr-20"
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${getWordCountColor(formData.long_description, 100)}`}>
                    {getWordCountText(formData.long_description, 100)}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-target_url" className="text-sm sm:text-base">Affiliate Link (Optional)</Label>
                <Input
                  id="edit-target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://your-affiliate-link.com"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <Button onClick={handleEditItem} className="w-full h-10 sm:h-12 text-sm sm:text-base mt-4 sm:mt-6">
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
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-category-name" className="text-sm sm:text-base">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="edit-category-description" className="text-sm sm:text-base">Description</Label>
                <div className="relative">
                  <Textarea
                    id="edit-category-description"
                    value={categoryData.description}
                    onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                    placeholder="Brief description of this category (max 30 words)"
                    rows={3}
                    className="text-sm sm:text-base min-h-[80px] sm:min-h-[120px] resize-none pr-20"
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${getWordCountColor(categoryData.description, 30)}`}>
                    {getWordCountText(categoryData.description, 30)}
                  </span>
                </div>
              </div>
              <Button onClick={handleEditCategory} className="w-full h-10 sm:h-12 text-sm sm:text-base mt-4 sm:mt-6">
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profile Settings Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Customize your profile picture, display name, page content, and URL
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="profile-avatar" className="text-sm sm:text-base">Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-border">
                    <AvatarImage src={profileData.avatar_url} alt={profileData.display_name} />
                    <AvatarFallback className="text-sm sm:text-lg font-semibold bg-gradient-primary text-primary-foreground">
                      {getInitials(profileData.display_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <ImageUpload
                      onImageUploaded={(url) => setProfileData({ ...profileData, avatar_url: url })}
                      currentImageUrl={profileData.avatar_url}
                      onRemoveImage={() => setProfileData({ ...profileData, avatar_url: '' })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="profile-display-name" className="text-sm sm:text-base">Display Name</Label>
                <Input
                  id="profile-display-name"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                  placeholder="Your Name"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="profile-title" className="text-sm sm:text-base">Page Title</Label>
                <Input
                  id="profile-title"
                  value={profileData.page_title}
                  onChange={(e) => setProfileData({ ...profileData, page_title: e.target.value })}
                  placeholder="My Favorite Tech Gear"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="profile-description" className="text-sm sm:text-base">Page Description</Label>
                <Textarea
                  id="profile-description"
                  value={profileData.page_description}
                  onChange={(e) => setProfileData({ ...profileData, page_description: e.target.value })}
                  placeholder="A curated list of tools I use every day..."
                  rows={3}
                  className="text-sm sm:text-base min-h-[80px] sm:min-h-[120px] resize-none"
                />
              </div>
              
              {/* Social Links */}
              <div className="space-y-2 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Social Links</Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="youtube_url" className="text-xs">YouTube</Label>
                    <Input id="youtube_url" placeholder="https://youtube.com/@username" value={profileData.youtube_url || ''} onChange={(e) => setProfileData({ ...profileData, youtube_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="twitter_url" className="text-xs">X (Twitter)</Label>
                    <Input id="twitter_url" placeholder="https://x.com/username" value={profileData.twitter_url || ''} onChange={(e) => setProfileData({ ...profileData, twitter_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="linkedin_url" className="text-xs">LinkedIn</Label>
                    <Input id="linkedin_url" placeholder="https://linkedin.com/in/username" value={profileData.linkedin_url || ''} onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="instagram_url" className="text-xs">Instagram</Label>
                    <Input id="instagram_url" placeholder="https://instagram.com/username" value={profileData.instagram_url || ''} onChange={(e) => setProfileData({ ...profileData, instagram_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="tiktok_url" className="text-xs">TikTok</Label>
                    <Input id="tiktok_url" placeholder="https://tiktok.com/@username" value={profileData.tiktok_url || ''} onChange={(e) => setProfileData({ ...profileData, tiktok_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="threads_url" className="text-xs">Threads</Label>
                    <Input id="threads_url" placeholder="https://www.threads.net/@username" value={profileData.threads_url || ''} onChange={(e) => setProfileData({ ...profileData, threads_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="snapchat_url" className="text-xs">Snapchat</Label>
                    <Input id="snapchat_url" placeholder="https://snapchat.com/add/username" value={profileData.snapchat_url || ''} onChange={(e) => setProfileData({ ...profileData, snapchat_url: e.target.value })} className="h-10 text-sm" />
                  </div>
                </div>
              </div>
              
              {/* Text Color Customization */}
              <div className="space-y-4 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <Label className="text-sm sm:text-base font-medium">Text Colors</Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name-color" className="text-xs sm:text-sm">Display Name Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="display-name-color"
                        value={profileData.display_name_color}
                        onChange={(e) => setProfileData({ ...profileData, display_name_color: e.target.value })}
                        className="w-10 h-8 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={profileData.display_name_color}
                        onChange={(e) => setProfileData({ ...profileData, display_name_color: e.target.value })}
                        placeholder="#ffffff"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username-color" className="text-xs sm:text-sm">Username Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="username-color"
                        value={profileData.username_color}
                        onChange={(e) => setProfileData({ ...profileData, username_color: e.target.value })}
                        className="w-10 h-8 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={profileData.username_color}
                        onChange={(e) => setProfileData({ ...profileData, username_color: e.target.value })}
                        placeholder="#a1a1aa"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="page-title-color" className="text-xs sm:text-sm">Page Title Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="page-title-color"
                        value={profileData.page_title_color}
                        onChange={(e) => setProfileData({ ...profileData, page_title_color: e.target.value })}
                        className="w-10 h-8 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={profileData.page_title_color}
                        onChange={(e) => setProfileData({ ...profileData, page_title_color: e.target.value })}
                        placeholder="#ffffff"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="page-description-color" className="text-xs sm:text-sm">Description Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="page-description-color"
                        value={profileData.page_description_color}
                        onChange={(e) => setProfileData({ ...profileData, page_description_color: e.target.value })}
                        className="w-10 h-8 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={profileData.page_description_color}
                        onChange={(e) => setProfileData({ ...profileData, page_description_color: e.target.value })}
                        placeholder="#a1a1aa"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="profile-username" className="text-sm sm:text-base">Username (URL)</Label>
                
                {/* Subtle warning about 30-day restriction */}
                <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs sm:text-sm text-blue-800">
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
                      "h-10 sm:h-12 text-sm sm:text-base pr-8 sm:pr-10",
                      profileData.username.length >= 3 && profileData.username !== profile.username && !usernameCheck.isChecking && 
                      (usernameCheck.available ? "border-green-500" : "border-red-500")
                    )}
                  />
                  <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                    {profileData.username.length >= 3 && profileData.username !== profile.username && cooldownInfo.canChange && (
                      <>
                        {usernameCheck.isChecking && (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-muted-foreground" />
                        )}
                        {!usernameCheck.isChecking && usernameCheck.available && (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        )}
                        {!usernameCheck.isChecking && !usernameCheck.available && (
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
                {profileData.username.length >= 3 && profileData.username !== profile.username && usernameCheck.message && cooldownInfo.canChange && (
                  <p className={cn(
                    "text-xs sm:text-sm px-1 py-1",
                    usernameCheck.available ? "text-green-600" : "text-red-600"
                  )}>
                    {usernameCheck.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground px-1">
                  Your page will be available at: thecurately.com/{profileData.username}
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border border-border rounded-lg">
                  <input
                    type="checkbox"
                    id="public_profile"
                    checked={profileData.public_profile}
                    onChange={(e) => setProfileData({ ...profileData, public_profile: e.target.checked })}
                    className="mt-0.5 sm:mt-1 w-4 h-4 rounded border border-input"
                  />
                  <div className="flex-1">
                    <Label htmlFor="public_profile" className="text-xs sm:text-sm font-medium cursor-pointer">
                      Make my page publicly visible
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      When enabled, your recommendations page will be visible to everyone at the public URL above.
                      When disabled, only you can access your recommendations.
                    </p>
                  </div>
                </div>
                
                {profileData.avatar_url && (
                  <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border border-border rounded-lg">
                    <input
                      type="checkbox"
                      id="use_avatar_background"
                      checked={profileData.use_avatar_background}
                      onChange={(e) => setProfileData({ ...profileData, use_avatar_background: e.target.checked })}
                      className="mt-0.5 sm:mt-1 w-4 h-4 rounded border border-input"
                    />
                    <div className="flex-1">
                      <Label htmlFor="use_avatar_background" className="text-xs sm:text-sm font-medium cursor-pointer">
                        Use Profile Picture as Background?
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        When enabled, your profile picture will be displayed as a beautiful background hero section on your public page.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                size="mobile"
                className="w-full h-14 text-base mt-4 sm:mt-6 sm:h-12 sm:text-sm min-h-[56px]"
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

      {/* Mobile Bottom Navigation - Enhanced Touch Targets */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-lg border-t border-border/50 z-50 sm:hidden shadow-2xl">
        <div className="flex items-center justify-around py-4 px-4 max-w-sm mx-auto">
          <Button 
            variant="ghost"
            size="icon" 
            onClick={() => setActiveTab('recommendations')}
            className={cn(
              "flex flex-col items-center gap-2 min-h-[72px] min-w-[72px] px-3 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95",
              activeTab === 'recommendations' 
                ? "bg-gradient-primary text-primary-foreground shadow-lg scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Grid className={cn("w-6 h-6 transition-all duration-300", activeTab === 'recommendations' ? "scale-110" : "")} />
            <span className="text-xs font-medium">Items</span>
          </Button>
          <Button 
            variant="ghost"
            size="icon" 
            onClick={() => setActiveTab('categories')}
            className={cn(
              "flex flex-col items-center gap-2 min-h-[72px] min-w-[72px] px-3 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95",
              activeTab === 'categories' 
                ? "bg-gradient-primary text-primary-foreground shadow-lg scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Folder className={cn("w-6 h-6 transition-all duration-300", activeTab === 'categories' ? "scale-110" : "")} />
            <span className="text-xs font-medium">Categories</span>
          </Button>
          <Button 
            variant="ghost"
            size="icon" 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex flex-col items-center gap-2 min-h-[72px] min-w-[72px] px-3 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95",
              activeTab === 'profile' 
                ? "bg-gradient-primary text-primary-foreground shadow-lg scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <User className={cn("w-6 h-6 transition-all duration-300", activeTab === 'profile' ? "scale-110" : "")} />
            <span className="text-xs font-medium">Profile</span>
          </Button>
        </div>
        {/* Bottom safe area for devices with home indicator */}
        <div className="h-[env(safe-area-inset-bottom,16px)]" />
      </div>
    </div>
  );
};

export default Dashboard;