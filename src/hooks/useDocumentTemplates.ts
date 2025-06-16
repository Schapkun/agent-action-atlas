import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  description: string | null;
  html_content: string;
  organization_id: string | null;
  workspace_id: string | null;
  created_by: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  placeholder_values?: Record<string, string> | null;
}

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Test database connectivity
  const testDatabaseConnection = async () => {
    try {
      console.log('[useDocumentTemplates] Testing database connection...');
      const { data, error } = await supabase.from('document_templates').select('count').limit(1);
      if (error) {
        console.error('[useDocumentTemplates] Database connection test failed:', error);
        return false;
      }
      console.log('[useDocumentTemplates] Database connection test successful');
      return true;
    } catch (error) {
      console.error('[useDocumentTemplates] Database connection test error:', error);
      return false;
    }
  };

  // Enhanced authentication and membership check
  const checkUserAccess = async () => {
    try {
      console.log('[useDocumentTemplates] Checking user access...');
      
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[useDocumentTemplates] Auth error:', userError);
        throw new Error('Gebruiker niet ingelogd');
      }
      
      if (!user) {
        console.error('[useDocumentTemplates] No user found');
        throw new Error('Geen gebruiker gevonden');
      }

      console.log('[useDocumentTemplates] User authenticated:', user.id);

      // Check organization context
      if (!selectedOrganization) {
        console.error('[useDocumentTemplates] No organization selected');
        throw new Error('Geen organisatie geselecteerd. Selecteer eerst een organisatie.');
      }

      console.log('[useDocumentTemplates] Organization selected:', selectedOrganization.id);

      // Check if user is member of the selected organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', selectedOrganization.id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        console.error('[useDocumentTemplates] Membership check failed:', membershipError);
        
        // Try to add user as member if they're not already
        console.log('[useDocumentTemplates] Attempting to add user as organization member...');
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: selectedOrganization.id,
            user_id: user.id,
            role: 'member'
          });

        if (insertError) {
          console.error('[useDocumentTemplates] Failed to add as member:', insertError);
          throw new Error('Geen toegang tot deze organisatie. Neem contact op met een beheerder.');
        }
        
        console.log('[useDocumentTemplates] Successfully added user as organization member');
      } else {
        console.log('[useDocumentTemplates] User is organization member with role:', membership.role);
      }

      return { user, organization: selectedOrganization };
    } catch (error) {
      console.error('[useDocumentTemplates] Access check failed:', error);
      throw error;
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('[useDocumentTemplates] Fetching templates...');
      
      // Check access first
      const { organization } = await checkUserAccess();
      
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('[useDocumentTemplates] Database error:', error);
        throw error;
      }
      
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: item.placeholder_values ? 
          (typeof item.placeholder_values === 'object' && item.placeholder_values !== null ? 
            item.placeholder_values as Record<string, string> : null) : null
      }));
      
      console.log('[useDocumentTemplates] Templates fetched successfully:', transformedData.length);
      console.log('[useDocumentTemplates] Templates data:', transformedData);
      setTemplates(transformedData);
    } catch (error) {
      console.error('[useDocumentTemplates] Error fetching templates:', error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Kon templates niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<DocumentTemplate>) => {
    try {
      console.log('[useDocumentTemplates] Creating new template:', templateData.name);
      console.log('[useDocumentTemplates] Template data received:', templateData);
      
      // Test database connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error('Database verbinding mislukt');
      }
      
      // Check access and get user/organization info
      const { user, organization } = await checkUserAccess();
      
      console.log('[useDocumentTemplates] User info for template creation:', {
        userId: user.id,
        organizationId: organization.id,
        workspaceId: selectedWorkspace?.id
      });
      
      // Prepare insert data with all required fields
      const insertData = {
        name: templateData.name || '',
        type: templateData.type || 'custom',
        description: templateData.description || null,
        html_content: templateData.html_content || '',
        organization_id: organization.id,
        workspace_id: selectedWorkspace?.id || null,
        created_by: user.id,
        is_default: templateData.is_default || false,
        is_active: templateData.is_active !== false,
        placeholder_values: templateData.placeholder_values || null,
      };

      console.log('[useDocumentTemplates] Final insert data:', {
        ...insertData,
        html_content: `${insertData.html_content.substring(0, 100)}...`,
        organization_id: insertData.organization_id,
        workspace_id: insertData.workspace_id,
        created_by: insertData.created_by
      });

      // Validate required fields
      if (!insertData.name.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      if (!insertData.html_content.trim()) {
        throw new Error('HTML content is verplicht');
      }

      if (!insertData.organization_id) {
        throw new Error('Organisatie ID is verplicht');
      }

      if (!insertData.created_by) {
        throw new Error('Gebruiker ID is verplicht');
      }

      console.log('[useDocumentTemplates] Starting database insert...');

      const { data, error } = await supabase
        .from('document_templates')
        .insert(insertData)
        .select()
        .single();

      console.log('[useDocumentTemplates] Database insert response:', { data, error });

      if (error) {
        console.error('[useDocumentTemplates] Database insert error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Enhanced error handling with specific messages
        if (error.code === '23502') {
          const missingColumn = error.message.includes('organization_id') ? 'organization_id' : 
                               error.message.includes('created_by') ? 'created_by' : 
                               error.message.includes('name') ? 'name' :
                               error.message.includes('html_content') ? 'html_content' : 'onbekend veld';
          throw new Error(`Verplicht veld ontbreekt: ${missingColumn}. Error: ${error.message}`);
        } else if (error.code === '23505') {
          throw new Error('Een template met deze naam bestaat al');
        } else if (error.code === '42501') {
          throw new Error('Geen toegang om templates aan te maken. Controleer je rechten.');
        } else if (error.message.includes('row-level security')) {
          throw new Error(`RLS Policy fout: ${error.message}. Gebruiker: ${user.id}, Organisatie: ${organization.id}`);
        } else if (error.code === 'PGRST116') {
          throw new Error('RLS Policy blokkeert de operatie. Controleer je toegangsrechten.');
        } else {
          throw new Error(`Database fout (${error.code}): ${error.message}`);
        }
      }

      if (!data) {
        throw new Error('Geen data ontvangen van database - operatie mogelijk mislukt');
      }

      console.log('[useDocumentTemplates] Template successfully created:', data);

      const newTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      
      console.log('[useDocumentTemplates] Template created successfully and added to state');
      
      toast({
        title: "Succes",
        description: `Template "${newTemplate.name}" is succesvol aangemaakt`,
      });
      
      return newTemplate;
    } catch (error) {
      console.error('[useDocumentTemplates] Create template error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout",
        description: `Kon template niet aanmaken: ${errorMessage}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      console.log('[useDocumentTemplates] Updating template:', id);
      
      // Check access and get user/organization info
      const { user, organization } = await checkUserAccess();

      // Validate required fields
      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      if (updates.html_content !== undefined && !updates.html_content.trim()) {
        throw new Error('HTML content is verplicht');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        placeholder_values: updates.placeholder_values || null,
      };

      console.log('[useDocumentTemplates] Update data:', {
        ...updateData,
        html_content: updateData.html_content ? updateData.html_content.substring(0, 100) + '...' : undefined
      });

      const { data, error } = await supabase
        .from('document_templates')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', organization.id) // Security check
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplates] Database update error:', error);
        
        if (error.code === '23502') {
          throw new Error('Verplichte velden ontbreken');
        } else if (error.code === '23505') {
          throw new Error('Een template met deze naam bestaat al');
        } else if (error.code === '42501') {
          throw new Error('Geen toegang om deze template bij te werken');
        } else if (error.message.includes('row-level security')) {
          throw new Error('Geen toegang tot deze template. Controleer je rechten.');
        } else {
          throw new Error(`Database fout: ${error.message}`);
        }
      }

      if (!data) {
        throw new Error('Template niet gevonden of geen toegang');
      }

      const updatedTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      
      console.log('[useDocumentTemplates] Template updated successfully');
      
      return updatedTemplate;
    } catch (error) {
      console.error('[useDocumentTemplates] Update template error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout",
        description: `Kon template niet bijwerken: ${errorMessage}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      console.log('[useDocumentTemplates] Deleting template:', id);
      
      // Check access
      const { organization } = await checkUserAccess();
      
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('organization_id', organization.id); // Security check

      if (error) {
        console.error('[useDocumentTemplates] Delete error:', error);
        if (error.message.includes('row-level security')) {
          throw new Error('Geen toegang tot deze template');
        }
        throw new Error(`Database fout: ${error.message}`);
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Succes",
        description: "Template succesvol verwijderd"
      });
    } catch (error) {
      console.error('[useDocumentTemplates] Delete template error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout",
        description: `Kon template niet verwijderen: ${errorMessage}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      console.log('[useDocumentTemplates] Organization changed, fetching templates');
      fetchTemplates();
    } else {
      console.log('[useDocumentTemplates] No organization selected, clearing templates');
      setTemplates([]);
      setLoading(false);
    }
  }, [selectedOrganization, selectedWorkspace]);

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
