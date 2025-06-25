
import { supabase } from '@/integrations/supabase/client';

export const createExampleDossiers = async (organizationId: string, workspaceId?: string) => {
  try {
    // First get existing clients
    let clientQuery = supabase
      .from('clients')
      .select('id, name')
      .eq('organization_id', organizationId);

    if (workspaceId) {
      clientQuery = clientQuery.eq('workspace_id', workspaceId);
    }

    const { data: clients, error: clientsError } = await clientQuery;

    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      console.log('No clients found to create dossiers for');
      return;
    }

    const exampleDossiers = [];

    // Create example dossiers for the first few clients
    for (let i = 0; i < Math.min(clients.length, 10); i++) {
      const client = clients[i];
      
      // Create 1-3 dossiers per client
      const dossierCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < dossierCount; j++) {
        const dossierTypes = [
          'Adviestraject', 'Implementatie', 'Support', 'Consultancy', 
          'Audit', 'Training', 'Project', 'Onderhoud'
        ];
        
        const categories = ['algemeen', 'it', 'juridisch', 'financieel', 'hr'];
        
        exampleDossiers.push({
          name: `${dossierTypes[Math.floor(Math.random() * dossierTypes.length)]} - ${client.name}`,
          client_id: client.id,
          category: categories[Math.floor(Math.random() * categories.length)],
          status: 'active',
          description: `Actief dossier voor ${client.name}`,
          organization_id: organizationId,
          workspace_id: workspaceId
        });
      }
    }

    const { data, error } = await supabase
      .from('dossiers')
      .insert(exampleDossiers)
      .select();

    if (error) throw error;
    
    console.log('✅ Example dossiers created:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Error creating example dossiers:', error);
    throw error;
  }
};
