import React, { useState, useCallback } from 'react';
import { MobileFriendlyForm } from '@/components/MobileFriendlyForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedImageUpload } from '@/components/EnhancedImageUpload';
import { ColorPicker } from '@/components/ColorPicker';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuth } from '@/contexts/AuthContext';
import { useUsernameCheck } from '@/hooks/useUsernameCheck';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileFormData {
  username: string;
  display_name: string;
  page_title: string;
  page_description: string;
  avatar_url: string;
  public_profile: boolean;
  use_avatar_background: boolean;
  display_name_color: string;
  username_color: string;
  page_title_color: string;
  page_description_color: string;
  youtube_url: string;
  twitter_url: string;
  linkedin_url: string;
  tiktok_url: string;
  instagram_url: string;
  threads_url: string;
  snapchat_url: string;
}

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProfileFormData) => void;
  initialData: ProfileFormData;
  isLoading?: boolean;
  cooldownInfo?: {
    canChange: boolean;
    daysRemaining: number;
    nextChangeDate: Date | null;
  };
}

export function ProfileForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
  cooldownInfo
}: ProfileFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  
  const usernameCheck = useUsernameCheck(formData.username);

  // Auto-save functionality
  const { clearSaved } = useAutoSave({
    data: formData,
    onSave: (data) => {
      console.log('Auto-saving profile draft:', data);
    },
    delay: 2000,
    enabled: open,
    key: user ? `profileDraft:${user.id}` : undefined
  });

  const updateField = useCallback((field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    onSubmit(formData);
    clearSaved();
  };

  const handleCancel = () => {
    setFormData(initialData);
    onOpenChange(false);
  };

  // Validation
  const usernameChanged = formData.username !== initialData.username;
  const canSubmit = !usernameChanged || 
    (cooldownInfo?.canChange && usernameCheck.available && !usernameCheck.isChecking);

  const getUsernameStatus = () => {
    if (!usernameChanged) return null;
    
    if (!cooldownInfo?.canChange) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Username can be changed in {cooldownInfo?.daysRemaining} days
          </AlertDescription>
        </Alert>
      );
    }

    if (usernameCheck.isChecking) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking availability...
        </div>
      );
    }

    if (usernameCheck.available) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          Username is available
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="w-4 h-4" />
        {usernameCheck.message || 'Username not available'}
      </div>
    );
  };

  return (
    <MobileFriendlyForm
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Profile"
      description="Customize your profile and page appearance"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Update Profile"
      isLoading={isLoading}
      disabled={!canSubmit}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              inputMode="text"
              autoComplete="username"
              value={formData.username}
              onChange={(e) => updateField('username', e.target.value.toLowerCase())}
              placeholder="your-username"
              className="h-12 text-base font-mono"
              disabled={!cooldownInfo?.canChange}
            />
            {getUsernameStatus()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              type="text"
              inputMode="text"
              value={formData.display_name}
              onChange={(e) => updateField('display_name', e.target.value)}
              placeholder="Your Display Name"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <EnhancedImageUpload
              onImageUploaded={(url) => updateField('avatar_url', url)}
              currentImageUrl={formData.avatar_url}
              onRemoveImage={() => updateField('avatar_url', '')}
              aspectRatio={1}
              maxWidth={400}
              maxHeight={400}
            />
          </div>
        </div>

        {/* Page Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Page Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="page_title">Page Title</Label>
            <Input
              id="page_title"
              type="text"
              inputMode="text"
              value={formData.page_title}
              onChange={(e) => updateField('page_title', e.target.value)}
              placeholder="My Recommendations"
              className="h-12 text-base"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_description">Page Description</Label>
            <Textarea
              id="page_description"
              value={formData.page_description}
              onChange={(e) => updateField('page_description', e.target.value)}
              placeholder="Describe what visitors will find on your page"
              className="min-h-[100px] text-base"
              maxLength={1000}
            />
          </div>

          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="public_profile"
                checked={formData.public_profile}
                onChange={(e) => updateField('public_profile', e.target.checked)}
                className="mt-1 w-4 h-4 rounded border border-input"
              />
              <div className="flex-1">
                <Label htmlFor="public_profile" className="text-sm font-medium cursor-pointer">
                  Make my page publicly visible
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, your page will be visible to everyone at your public URL
                </p>
              </div>
            </div>

            {formData.avatar_url && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="use_avatar_background"
                  checked={formData.use_avatar_background}
                  onChange={(e) => updateField('use_avatar_background', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border border-input"
                />
                <div className="flex-1">
                  <Label htmlFor="use_avatar_background" className="text-sm font-medium cursor-pointer">
                    Use profile picture as background
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Display your profile picture as a hero background section
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Color Customization */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Color Customization</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker
              label="Display Name Color"
              value={formData.display_name_color}
              onChange={(color) => updateField('display_name_color', color)}
            />
            <ColorPicker
              label="Username Color"
              value={formData.username_color}
              onChange={(color) => updateField('username_color', color)}
            />
            <ColorPicker
              label="Page Title Color"
              value={formData.page_title_color}
              onChange={(color) => updateField('page_title_color', color)}
            />
            <ColorPicker
              label="Page Description Color"
              value={formData.page_description_color}
              onChange={(color) => updateField('page_description_color', color)}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Links</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@username' },
              { key: 'twitter_url', label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
              { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/username' },
              { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
              { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
              { key: 'threads_url', label: 'Threads', placeholder: 'https://threads.net/@username' },
              { key: 'snapchat_url', label: 'Snapchat', placeholder: 'https://snapchat.com/add/username' }
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={formData[key as keyof ProfileFormData] as string}
                  onChange={(e) => updateField(key as keyof ProfileFormData, e.target.value)}
                  placeholder={placeholder}
                  className="h-12 text-base"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileFriendlyForm>
  );
}