
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
  const { selectedOrganization } = useOrganization();
  const { session, refreshSession } = useAuth();

  const ensureAuth = async () => {
    if (!session) {
      console.log('[useDocumentTypes] No session found, attempting to refresh...');
      await refreshSession();
    }
  };

  const fetchDocumentTypes = useCallback(async () => {
    if (!selectedOrganization?.id) {
      console.log('[useDocumentTypes] No organization selected, clearing document types');
      setDocumentTypes([]);
      setLoading(false);
      return;
    }

    await ensureAuth();

    try {
      console.log('[useDocumentTypes] Fetching document types for organization:', selectedOrganization.id);
      console.log('[useDocumentTypes] Current session exists:', !!session);
      
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
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id, session]);

  const createDocumentType = async (name: string, label: string) => {
    if (!selectedOrganization?.id) {
      console.error('[useDocumentTypes] Cannot create document type: no organization selected');
      return false;
    }

    await ensureAuth();

    try {
      console.log('[useDocumentTypes] Creating document type:', { name, label, organization_id: selectedOrganization.id });
      console.log('[useDocumentTypes] Current session exists:', !!session);
      
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

      console.log('[useDocumentTypes] Document type created successfully:', data);
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Error creating document type:', error);
      return false;
    }
  };

  const updateDocumentType = async (id: string, name: string, label: string) => {
    await ensureAuth();

    try {
      console.log('[useDocumentTypes] Updating document type:', { id, name, label });
      console.log('[useDocumentTypes] Current session exists:', !!session);
      
      const { data, error } = await supabase
        .from('document_types')
        .update({ name, label })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTypes] Update error:', error);
        throw error;
      }

      console.log('[useDocumentTypes] Document type updated successfully:', data);
      await fetchDocumentTypes();
      return true;
    } catch (error) {
      console.error('[useDocumentTypes] Error updating document type:', error);
      return false;
    }
  };

  const deleteDocumentType = async (id: string) => {
    await ensureAuth();

    try {
      console.log('[useDocumentTypes] Deleting document type:', id);
      console.log('[useDocumentTypes] Current session exists:', !!session);
      
      // First try soft delete (set is_active to false)
      const { data, error } = await supabase
        .from('document_types')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTypes] Soft delete error:', error);
        console.log('[useDocumentTypes] Trying hard delete instead...');
        
        // If soft delete fails, try hard delete
        const { error: deleteError } = await supabase
          .from('document_types')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('[useDocumentTypes] Hard delete error:', deleteError);
          throw deleteError;
        }
        
        console.log('[useDocumentTypes] Document type hard deleted successfully');
      } else {
        console.log('[useDocumentTypes] Document type soft deleted successfully:', data);
      }

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
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    refetch: fetchDocumentTypes
  };
};
