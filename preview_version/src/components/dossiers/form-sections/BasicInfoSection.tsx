
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';
import { SectionEditorDialog, renderDynamicField } from './SectionEditorDialog';
import { useSectionConfig } from '@/hooks/useSectionConfig';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    description: string;
    category: string;
    priority: string;
    [key: string]: any; // Voor dynamische velden
  };
  updateFormData: (updates: any) => void;
}

export const BasicInfoSection = ({ formData, updateFormData }: BasicInfoSectionProps) => {
  const { getSectionConfig, updateSectionFields, updateSectionName } = useSectionConfig();
  const sectionConfig = getSectionConfig('basic');

  const handleFieldsUpdate = (fields: any[]) => {
    updateSectionFields('basic', fields);
  };

  const handleSectionNameUpdate = (name: string) => {
    updateSectionName('basic', name);
  };

  // Sorteer velden op order
  const sortedFields = [...sectionConfig.fields].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{sectionConfig.name}</h3>
        </div>
        
        <SectionEditorDialog
          sectionName={sectionConfig.name}
          fields={sectionConfig.fields}
          onFieldsUpdate={handleFieldsUpdate}
          onSectionNameUpdate={handleSectionNameUpdate}
        >
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </SectionEditorDialog>
      </div>
      
      <div className="space-y-4">
        {sortedFields.map((field) => (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-sm font-medium text-slate-700 mb-2 block">
              {field.name} {field.required ? '*' : ''}
            </Label>
            {field.id === 'name' ? (
              <Input
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                placeholder={field.placeholder || "Geef het dossier een duidelijke naam"}
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                required={field.required}
              />
            ) : field.id === 'description' ? (
              <Textarea
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                placeholder={field.placeholder || "Korte beschrijving van het dossier..."}
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 min-h-[80px]"
                rows={3}
              />
            ) : field.id === 'category' ? (
              <Select value={formData[field.id] || ''} onValueChange={(value) => updateFormData({ [field.id]: value })}>
                <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                  <SelectValue placeholder={field.placeholder || "Selecteer categorie"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algemeen">Algemeen</SelectItem>
                  <SelectItem value="familierecht">Familierecht</SelectItem>
                  <SelectItem value="arbeidsrecht">Arbeidsrecht</SelectItem>
                  <SelectItem value="strafrecht">Strafrecht</SelectItem>
                  <SelectItem value="ondernemingsrecht">Ondernemingsrecht</SelectItem>
                </SelectContent>
              </Select>
            ) : field.id === 'priority' ? (
              <Select value={formData[field.id] || ''} onValueChange={(value) => updateFormData({ [field.id]: value })}>
                <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                  <SelectValue placeholder={field.placeholder || "Selecteer prioriteit"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Laag</SelectItem>
                  <SelectItem value="medium">Normaal</SelectItem>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              renderDynamicField(
                field,
                formData[field.id],
                (value) => updateFormData({ [field.id]: value })
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
