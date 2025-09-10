import React, { useState, useCallback } from 'react';
import { MultiStepForm, StepProps } from '@/components/MultiStepForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedImageUpload } from '@/components/EnhancedImageUpload';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuth } from '@/contexts/AuthContext';
import { countWords, validateWordLimit } from '@/lib/textUtils';

interface RecommendationFormData {
  title: string;
  short_description: string;
  long_description: string;
  image_url: string;
  target_url: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  position: number;
}

interface RecommendationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecommendationFormData) => void;
  categories: Category[];
  initialData?: Partial<RecommendationFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function RecommendationForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  initialData,
  isEditing = false,
  isLoading = false
}: RecommendationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<RecommendationFormData>({
    title: initialData?.title || '',
    short_description: initialData?.short_description || '',
    long_description: initialData?.long_description || '',
    image_url: initialData?.image_url || '',
    target_url: initialData?.target_url || '',
    category_id: initialData?.category_id || ''
  });

  const [currentStep, setCurrentStep] = useState(0);

  // Auto-save functionality
  const { clearSaved } = useAutoSave({
    data: formData,
    onSave: (data) => {
      console.log('Auto-saving recommendation draft:', data);
    },
    delay: 2000,
    enabled: open && !isEditing,
    key: user ? `recommendationDraft:${user.id}` : undefined
  });

  const updateField = useCallback((field: keyof RecommendationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    onSubmit(formData);
    clearSaved();
    setFormData({
      title: '',
      short_description: '',
      long_description: '',
      image_url: '',
      target_url: '',
      category_id: ''
    });
    setCurrentStep(0);
  };

  const handleCancel = () => {
    if (!isEditing) {
      setFormData({
        title: '',
        short_description: '',
        long_description: '',
        image_url: '',
        target_url: '',
        category_id: ''
      });
    }
    setCurrentStep(0);
    onOpenChange(false);
  };

  // Validation functions
  const isStep1Valid = formData.title.trim().length > 0 && formData.image_url.trim().length > 0;
  const isStep2Valid = formData.short_description.trim().length > 0 && 
                      validateWordLimit(formData.short_description, 25);
  const isStep3Valid = !formData.long_description.trim() || 
                      validateWordLimit(formData.long_description, 100);

  const steps: StepProps[] = [
    {
      title: "Basic Information",
      description: "Add the essential details for your recommendation",
      isValid: isStep1Valid,
      children: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select 
              value={formData.category_id || 'none'} 
              onValueChange={(value) => updateField('category_id', value === 'none' ? '' : value)}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              inputMode="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter recommendation title"
              className="h-12 text-base"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Image *</Label>
            <EnhancedImageUpload
              onImageUploaded={(url) => updateField('image_url', url)}
              currentImageUrl={formData.image_url}
              onRemoveImage={() => updateField('image_url', '')}
              maxWidth={800}
              maxHeight={600}
            />
          </div>
        </div>
      )
    },
    {
      title: "Descriptions",
      description: "Write compelling descriptions for your recommendation",
      isValid: isStep2Valid,
      children: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="short_description">
              Short Description * 
              <span className="text-xs text-muted-foreground ml-2">
                ({countWords(formData.short_description)}/25 words)
              </span>
            </Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => updateField('short_description', e.target.value)}
              placeholder="Brief description that appears on your recommendation cards"
              className="min-h-[100px] text-base"
              required
            />
            {!validateWordLimit(formData.short_description, 25) && (
              <p className="text-sm text-destructive">
                Short description must be 25 words or less
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">
              Detailed Description (Optional)
              <span className="text-xs text-muted-foreground ml-2">
                ({countWords(formData.long_description)}/100 words)
              </span>
            </Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => updateField('long_description', e.target.value)}
              placeholder="Detailed description that appears in the recommendation modal"
              className="min-h-[120px] text-base"
            />
            {formData.long_description && !validateWordLimit(formData.long_description, 100) && (
              <p className="text-sm text-destructive">
                Detailed description must be 100 words or less
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Link & Final Details",
      description: "Add the target link and review your recommendation",
      isValid: isStep3Valid,
      children: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target_url">Target URL (Optional)</Label>
            <Input
              id="target_url"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={formData.target_url}
              onChange={(e) => updateField('target_url', e.target.value)}
              placeholder="https://example.com"
              className="h-12 text-base"
            />
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold text-base mb-2">{formData.title || 'Your Title'}</h4>
              <p className="text-sm text-muted-foreground">
                {formData.short_description || 'Your short description will appear here...'}
              </p>
              {formData.image_url && (
                <div className="mt-3">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <MultiStepForm
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Recommendation" : "Add New Recommendation"}
      steps={steps}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={isEditing ? "Update" : "Create"}
      isLoading={isLoading}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
    />
  );
}