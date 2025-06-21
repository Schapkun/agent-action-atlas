
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
  const { session, user } = useAuth();

  const fetchDocumentTypes = useCallback(async () => {
    if (!selectedOrganization?.id) {
      console.log('[useDocumentTypes] No organization selected, clearing document types');
      setDocumentTypes([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!user) {
      console.log('[useDocumentTypes] No user found, cannot fetch document types');
      setLoading(false);
      setError('Geen gebruiker gevonden');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[useDocumentTypes] Fetching document types for organization:', selectedOrganization.id);
      console.log('[useDocumentTypes] Current session exists:', !!session);
      console.log('[useDocumentTypes] Current user ID:', user.id);
      
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
  }, [selectedOrganization?.id, session, user]);

  const createDocumentType = async (name: string, label: string) => {
    if (!selectedOrganization?.id) {
      console.error('[useDocumentTypes] Cannot create document type: no organization selected');
      return false;
    }

    if (!user) {
      console.error('[useDocumentTypes] Cannot create document type: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Creating document type:', { name, label, organization_id: selectedOrganization.id });
      
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
    if (!user) {
      console.error('[useDocumentTypes] Cannot update document type: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Updating document type:', { id, name, label });
      
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
    if (!user) {
      console.error('[useDocumentTypes] Cannot delete document type: no user');
      return false;
    }

    try {
      console.log('[useDocumentTypes] Deleting document type:', id);
      
      // Try soft delete first
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

  // Only fetch when we have both organization and user
  useEffect(() => {
    if (selectedOrganization?.id && user) {
      fetchDocumentTypes();
    } else if (!selectedOrganization?.id) {
      setDocumentTypes([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedOrganization?.id, user?.id]); // Simplified dependencies

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
