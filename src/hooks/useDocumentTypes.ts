
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
    if (!selectedOrganization?.id || !user?.id) {
      console.log('[useDocumentTypes] Missing requirements - org:', !!selectedOrganization?.id, 'user:', !!user?.id);
      setDocumentTypes([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[useDocumentTypes] Fetching document types for organization:', selectedOrganization.id);
      
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

      console.log('[useDocumentTypes] Fetched document types:', data?.length || 0);
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('[useDocumentTypes] Error fetching document types:', error);
      setError(error instanceof Error ? error.message : 'Onbekende fout');
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id, user?.id]);

  const createDocumentType = async (name: string, label: string) => {
    if (!selectedOrganization?.id || !user?.id) {
      console.error('[useDocumentTypes] Cannot create document type: missing requirements');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Creating document type:', { name, label });
      
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

      console.log('[useDocumentTypes] Document type created successfully');
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Error creating document type:', error);
      return false;
    }
  };

  const updateDocumentType = async (id: string, name: string, label: string) => {
    if (!user?.id) {
      console.error('[useDocumentTypes] Cannot update document type: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Updating document type:', { id, name, label });
      
      const { error } = await supabase
        .from('document_types')
        .update({ name, label })
        .eq('id', id);

      if (error) {
        console.error('[useDocumentTypes] Update error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Document type updated successfully');
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Error updating document type:', error);
      return false;
    }
  };

  const deleteDocumentType = async (id: string) => {
    if (!user?.id) {
      console.error('[useDocumentTypes] Cannot delete document type: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Deleting document type:', id);
      
      const { error } = await supabase
        .from('document_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('[useDocumentTypes] Delete error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Document type deleted successfully');
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Error deleting document type:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

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
