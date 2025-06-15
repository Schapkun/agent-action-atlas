
import { useState } from 'react';
import { DEFAULT_PLACEHOLDERS, TEMPLATES } from './documentConstants';

export interface SimpleDocumentState {
  id?: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  htmlContent: string;
  placeholderValues: Record<string, string>;
  layoutId: string;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
}

export const useDocumentState = () => {
  const [state, setState] = useState<SimpleDocumentState>({
    name: 'Nieuw Document',
    type: 'factuur',
    htmlContent: TEMPLATES.factuur,
    placeholderValues: { ...DEFAULT_PLACEHOLDERS },
    layoutId: 'modern-blue',
    isLoading: false,
    isSaving: false,
    hasChanges: false,
    error: null
  });

  return { state, setState };
};
