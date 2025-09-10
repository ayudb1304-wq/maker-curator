import React, { useState, useCallback } from 'react';
import { MobileFriendlyForm } from '@/components/MobileFriendlyForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuth } from '@/contexts/AuthContext';
import { countWords, validateWordLimit } from '@/lib/textUtils';

interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Partial<CategoryFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false
}: CategoryFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  // Auto-save functionality
  const { clearSaved } = useAutoSave({
    data: formData,
    onSave: (data) => {
      console.log('Auto-saving category draft:', data);
    },
    delay: 2000,
    enabled: open && !isEditing,
    key: user ? `categoryDraft:${user.id}` : undefined
  });

  const updateField = useCallback((field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    onSubmit(formData);
    clearSaved();
    setFormData({ name: '', description: '' });
  };

  const handleCancel = () => {
    if (!isEditing) {
      setFormData({ name: '', description: '' });
    }
    onOpenChange(false);
  };

  // Validation
  const isValid = formData.name.trim().length > 0 && 
                 (!formData.description.trim() || validateWordLimit(formData.description, 30));

  return (
    <MobileFriendlyForm
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Category" : "Add New Category"}
      description="Organize your recommendations with categories"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={isEditing ? "Update" : "Create"}
      isLoading={isLoading}
      disabled={!isValid}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            type="text"
            inputMode="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., Tech Gadgets, Books, Health & Fitness"
            className="h-12 text-base"
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description (Optional)
            <span className="text-xs text-muted-foreground ml-2">
              ({countWords(formData.description)}/30 words)
            </span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Brief description of what this category contains"
            className="min-h-[100px] text-base"
          />
          {formData.description && !validateWordLimit(formData.description, 30) && (
            <p className="text-sm text-destructive">
              Description must be 30 words or less
            </p>
          )}
        </div>

        {/* Preview */}
        {formData.name && (
          <div className="space-y-3">
            <Label>Preview</Label>
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold text-base mb-2">{formData.name}</h4>
              {formData.description && (
                <p className="text-sm text-muted-foreground">
                  {formData.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </MobileFriendlyForm>
  );
}