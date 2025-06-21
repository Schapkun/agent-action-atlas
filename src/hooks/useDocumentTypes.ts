
import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentType {
  id: string;
  name: string;
  label: string;
  organization_id: string;
  workspace_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedOrganization } = useOrganization();
  const { user } = useAuth();

  const fetchDocumentTypes = useCallback(async () => {
    console.log('[useDocumentTypes] Fetch called - org:', !!selectedOrganization?.id, 'user:', !!user?.id);
    
    if (!selectedOrganization?.id || !user?.id) {
      console.log('[useDocumentTypes] Missing requirements, setting empty data');
      setDocumentTypes([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[useDocumentTypes] Fetching for org:', selectedOrganization.id);
      
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useDocumentTypes] Fetch error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Fetched:', data?.length || 0, 'items');
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('[useDocumentTypes] Error:', error);
      setError(error instanceof Error ? error.message : 'Onbekende fout');
      setDocumentTypes([]);
    } finally {
      console.log('[useDocumentTypes] Setting loading to false');
      setLoading(false);
    }
  }, [selectedOrganization?.id, user?.id]);

  useEffect(() => {
    console.log('[useDocumentTypes] Effect triggered');
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  const createDocumentType = async (name: string, label: string) => {
    if (!selectedOrganization?.id || !user?.id) {
      console.error('[useDocumentTypes] Cannot create: missing requirements');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Creating:', { name, label });
      
      const { data, error } = await supabase
        .from('document_types')
        .insert({
          name,
          label,
          organization_id: selectedOrganization.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTypes] Create error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Created successfully');
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Create failed:', error);
      return false;
    }
  };

  const updateDocumentType = async (id: string, name: string, label: string) => {
    if (!user?.id) {
      console.error('[useDocumentTypes] Cannot update: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Updating:', { id, name, label });
      
      const { error } = await supabase
        .from('document_types')
        .update({ name, label })
        .eq('id', id);

      if (error) {
        console.error('[useDocumentTypes] Update error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Updated successfully');
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Update failed:', error);
      return false;
    }
  };

  const deleteDocumentType = async (id: string) => {
    if (!user?.id) {
      console.error('[useDocumentTypes] Cannot delete: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Deleting:', id);
      
      const { error } = await supabase
        .from('document_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('[useDocumentTypes] Delete error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Deleted successfully');
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Delete failed:', error);
      return false;
    }
  };

  return {
    documentTypes,
    loading,
    error,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    refetch: fetchDocumentTypes
  };
};
