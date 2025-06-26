
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface DossierCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
}

export const useDossierCategories = () => {
  const [categories, setCategories] = useState<DossierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchCategories = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      let query = supabase
        .from('dossier_categories')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true)
        .order('name');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Fout",
        description: "Kon categorieën niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    if (!selectedOrganization) return null;

    try {
      const { data, error } = await supabase
        .from('dossier_categories')
        .insert({
          ...categoryData,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Categorie aangemaakt",
        description: `Categorie "${categoryData.name}" is succesvol aangemaakt`
      });

      fetchCategories();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Fout",
        description: "Kon categorie niet aanmaken",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    categories,
    loading,
    createCategory,
    refreshCategories: fetchCategories
  };
};
