
import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';

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

  const fetchDocumentTypes = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setDocumentTypes([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_types?organization_id=eq.${selectedOrganization.id}&is_active=eq.true&select=*&order=created_at.desc`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA'
        }
      });

      const data = await response.json();
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('Error fetching document types:', error);
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id]);

  const createDocumentType = async (name: string, label: string) => {
    if (!selectedOrganization?.id) return;

    try {
      const response = await fetch('https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_types', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          label,
          organization_id: selectedOrganization.id,
          is_active: true
        })
      });

      if (response.ok) {
        await fetchDocumentTypes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating document type:', error);
      return false;
    }
  };

  const updateDocumentType = async (id: string, name: string, label: string) => {
    try {
      const response = await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_types?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, label })
      });

      if (response.ok) {
        await fetchDocumentTypes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating document type:', error);
      return false;
    }
  };

  const deleteDocumentType = async (id: string) => {
    try {
      const response = await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_types?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: false })
      });

      if (response.ok) {
        await fetchDocumentTypes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting document type:', error);
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
