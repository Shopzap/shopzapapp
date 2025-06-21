
import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { persistenceUtils } from '@/utils/persistence';

interface UseProductFormPersistenceProps {
  formData: any;
  isFormDirty: boolean;
  storeId?: string;
  onRestoreDraft?: (draftData: any) => void;
}

export const useProductFormPersistence = ({
  formData,
  isFormDirty,
  storeId,
  onRestoreDraft
}: UseProductFormPersistenceProps) => {
  const { toast } = useToast();

  // Save draft when form data changes
  useEffect(() => {
    if (isFormDirty && formData) {
      const timeoutId = setTimeout(() => {
        persistenceUtils.saveProductFormDraft(formData, storeId);
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isFormDirty, storeId]);

  // Restore draft on component mount
  useEffect(() => {
    const draft = persistenceUtils.getProductFormDraft(storeId);
    if (draft && onRestoreDraft) {
      onRestoreDraft(draft.formData);
      toast({
        title: "Draft Restored",
        description: "Your previous unsaved changes have been restored.",
        duration: 3000,
      });
    }
  }, [storeId, onRestoreDraft, toast]);

  // Clear draft function
  const clearDraft = useCallback(() => {
    persistenceUtils.clearProductFormDraft();
  }, []);

  // Save draft manually
  const saveDraft = useCallback(() => {
    if (formData) {
      persistenceUtils.saveProductFormDraft(formData, storeId);
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved.",
        duration: 2000,
      });
    }
  }, [formData, storeId, toast]);

  return {
    clearDraft,
    saveDraft
  };
};
