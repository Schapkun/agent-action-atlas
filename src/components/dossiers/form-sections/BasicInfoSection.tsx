
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { useDossierCategories } from '@/hooks/useDossierCategories';
import { useDossierStatuses } from '@/hooks/useDossierStatuses';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    category: string;
    reference: string;
    priority: string;
  };
  updateFormData: (updates: any) => void;
}

export const BasicInfoSection = ({ formData, updateFormData }: BasicInfoSectionProps) => {
  const { categories, loading: categoriesLoading } = useDossierCategories();
  const { statuses, loading: statusesLoading } = useDossierStatuses();

  const priorityOptions = [
    { value: 'low', label: 'Laag' },
    { value: 'medium', label: 'Normaal' },
    { value: 'high', label: 'Hoog' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Basis Informatie</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-2 block">
            Dossiernaam *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Naam van het dossier"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-2 block">
            Categorie
          </Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => updateFormData({ category: value })}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder={categoriesLoading ? "Laden..." : "Selecteer categorie"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name.toLowerCase()}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reference" className="text-sm font-medium text-slate-700 mb-2 block">
            Referentie
          </Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => updateFormData({ reference: e.target.value })}
            placeholder="Externe referentie of zaaknummer"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="priority" className="text-sm font-medium text-slate-700 mb-2 block">
            Prioriteit
          </Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => updateFormData({ priority: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer prioriteit" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
