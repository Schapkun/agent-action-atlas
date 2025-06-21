import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, session } = useAuth();

  const fetchDocumentTypes = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setDocumentTypes([]);
      setLoading(false);
      return;
    }

    console.log('useDocumentTypes - Auth Debug:');
    console.log('User:', user);
    console.log('Session:', session);
    console.log('User ID:', user?.id);
    console.log('Session User ID:', session?.user?.id);

    // Additional debug: Check current auth status directly
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    console.log('Direct supabase.auth.getUser():', currentUser);
    console.log('Auth error:', userError);

    // Check session directly
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    console.log('Direct supabase.auth.getSession():', currentSession);
    console.log('Session error:', sessionError);

    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching document types:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setDocumentTypes([]);
      } else {
        setDocumentTypes(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching document types:', error);
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id, user, session]);

  const createDocumentType = async (name: string, label: string): Promise<boolean> => {
    if (!selectedOrganization?.id) return false;

    console.log('Creating document type - Auth Debug:');
    console.log('User:', user);
    console.log('Session:', session);
    console.log('Organization ID:', selectedOrganization.id);

    // CRITICAL: Check auth.uid() right before the query
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    console.log('PRE-INSERT auth check:', {
      authUser: authUser?.id,
      authError,
      sessionExists: !!session,
      userExists: !!user
    });

    try {
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
        console.error('Error creating document type:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return false;
      }

      if (data) {
        setDocumentTypes(prev => [...prev, data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unexpected error creating document type:', error);
      return false;
    }
  };

  const updateDocumentType = async (id: string, name: string, label: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .update({ name, label, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document type:', error);
        return false;
      }

      if (data) {
        setDocumentTypes(prev => prev.map(dt => dt.id === id ? data : dt));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unexpected error updating document type:', error);
      return false;
    }
  };

  const deleteDocumentType = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('document_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document type:', error);
        return false;
      }

      setDocumentTypes(prev => prev.filter(dt => dt.id !== id));
      return true;
    } catch (error) {
      console.error('Unexpected error deleting document type:', error);
      return false;
    }
  };

  const refetch = useCallback(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  return {
    documentTypes,
    loading,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    refetch
  };
};
