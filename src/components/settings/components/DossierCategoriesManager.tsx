
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useDossierCategories } from '@/hooks/useDossierCategories';

export const DossierCategoriesManager = () => {
  const { categories, loading } = useDossierCategories();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Dossier Categorieën</h3>
          <p className="text-sm text-slate-600">Beheer de beschikbare categorieën voor dossiers</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Categorie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <h4 className="font-medium text-slate-900">{category.name}</h4>
              </div>
              
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {category.description && (
              <p className="text-sm text-slate-600">{category.description}</p>
            )}
            
            <Badge variant={category.is_active ? "default" : "secondary"}>
              {category.is_active ? 'Actief' : 'Inactief'}
            </Badge>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-slate-500">Geen categorieën gevonden.</p>
        </div>
      )}
    </div>
  );
};
