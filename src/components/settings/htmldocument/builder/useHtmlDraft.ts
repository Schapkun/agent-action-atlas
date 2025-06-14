
import { useCallback } from 'react';

export function useHtmlDraft() {
  // Draft opslaan
  const saveDraft = useCallback((key: string, content: string) => {
    if (key) {
      localStorage.setItem(key, content);
    }
  }, []);

  // Draft ophalen
  const getDraft = useCallback((key: string): string | null => {
    return key ? localStorage.getItem(key) : null;
  }, []);

  // Draft wissen
  const clearDraft = useCallback((key: string) => {
    if (key) {
      localStorage.removeItem(key);
    }
  }, []);

  return { saveDraft, getDraft, clearDraft };
}
