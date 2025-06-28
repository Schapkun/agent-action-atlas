
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';
import { SectionEditorDialog, renderDynamicField } from './SectionEditorDialog';

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
  const [customFields, setCustomFields] = useState([
    { id: 'name', name: 'Dossiernaam', type: 'text' as const, required: true, order: 0 },
    { id: 'description', name: 'Beschrijving', type: 'textarea' as const, order: 1 },
    { id: 'category', name: 'Categorie', type: 'select' as const, options: ['algemeen', 'familierecht', 'arbeidsrecht', 'strafrecht', 'ondernemingsrecht'], order: 2 },
    { id: 'priority', name: 'Prioriteit', type: 'select' as const, options: ['low', 'medium', 'high', 'urgent'], order: 3 }
  ]);

  const handleFieldsUpdate = (fields: any[]) => {
    setCustomFields(fields);
  };

  // Sorteer velden op order
  const sortedFields = [...customFields].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Basisinformatie</h3>
        </div>
        
        <SectionEditorDialog
          sectionName="Basisinformatie"
          fields={customFields}
          onFieldsUpdate={handleFieldsUpdate}
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
                  <SelectValue placeholder={field.placeholder} />
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
                  <SelectValue placeholder={field.placeholder} />
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
