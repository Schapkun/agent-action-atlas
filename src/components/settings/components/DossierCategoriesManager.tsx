
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useDossierCategories } from '@/hooks/useDossierCategories';

export const DossierCategoriesManager = () => {
  const { categories, createCategory, loading } = useDossierCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createCategory(formData);
    if (success) {
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setIsDialogOpen(false);
    }
  };

  const colorOptions = [
    { value: '#3B82F6', label: 'Blauw' },
    { value: '#10B981', label: 'Groen' },
    { value: '#F59E0B', label: 'Oranje' },
    { value: '#EF4444', label: 'Rood' },
    { value: '#8B5CF6', label: 'Paars' },
    { value: '#06B6D4', label: 'Cyaan' },
    { value: '#6B7280', label: 'Grijs' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Dossier Categorieën</h3>
          <p className="text-sm text-slate-600">Beheer de beschikbare categorieën voor dossiers</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Categorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Categorie Toevoegen</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Categorie naam"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optionele beschrijving"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="color">Kleur</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value ? 'border-slate-400' : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Bezig...' : 'Toevoegen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <p className="text-slate-500">Geen categorieën gevonden. Voeg er een toe om te beginnen.</p>
        </div>
      )}
    </div>
  );
};
