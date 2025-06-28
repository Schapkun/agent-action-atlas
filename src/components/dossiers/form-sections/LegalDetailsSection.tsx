
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Scale, Edit } from 'lucide-react';
import { SectionEditorDialog, renderDynamicField } from './SectionEditorDialog';
import { useSectionConfig } from '@/hooks/useSectionConfig';

interface LegalDetailsSectionProps {
  formData: {
    case_type?: string;
    court_instance?: string;
    legal_status?: string;
    estimated_hours?: string;
    hourly_rate?: string;
    [key: string]: any; // Voor dynamische velden
  };
  updateFormData: (updates: any) => void;
}

export const LegalDetailsSection = ({ formData, updateFormData }: LegalDetailsSectionProps) => {
  const { getSectionConfig, updateSectionFields, updateSectionName } = useSectionConfig();
  const sectionConfig = getSectionConfig('legal');

  const handleFieldsUpdate = (fields: any[]) => {
    updateSectionFields('legal', fields);
  };

  const handleSectionNameUpdate = (name: string) => {
    updateSectionName('legal', name);
  };

  // Sorteer velden op order
  const sortedFields = [...sectionConfig.fields].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Scale className="h-4 w-4 text-white" />
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
              {field.name}
            </Label>
            {field.id === 'case_type' ? (
              <Select 
                value={formData[field.id] || ''} 
                onValueChange={(value) => updateFormData({ [field.id]: value })}
              >
                <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                  <SelectValue placeholder="Selecteer zaaktype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civiel">Civiele Zaak</SelectItem>
                  <SelectItem value="straf">Strafzaak</SelectItem>
                  <SelectItem value="bestuurs">Bestuurszaak</SelectItem>
                  <SelectItem value="arbeids">Arbeidszaak</SelectItem>
                  <SelectItem value="familie">Familiezaak</SelectItem>
                  <SelectItem value="ondernemings">Ondernemingszaak</SelectItem>
                  <SelectItem value="fiscaal">Fiscale Zaak</SelectItem>
                  <SelectItem value="intellectueel">Intellectueel Eigendom</SelectItem>
                </SelectContent>
              </Select>
            ) : field.id === 'court_instance' ? (
              <Input
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                placeholder="bijv. Rechtbank Amsterdam"
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
            ) : field.id === 'legal_status' ? (
              <Select 
                value={formData[field.id] || ''} 
                onValueChange={(value) => updateFormData({ [field.id]: value })}
              >
                <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="onderzoek">Onderzoek</SelectItem>
                  <SelectItem value="dagvaarding">Dagvaarding Ingediend</SelectItem>
                  <SelectItem value="verweer">Verweer Ingediend</SelectItem>
                  <SelectItem value="comparitie">Comparitie</SelectItem>
                  <SelectItem value="vonnis">Vonnis</SelectItem>
                  <SelectItem value="hoger_beroep">Hoger Beroep</SelectItem>
                  <SelectItem value="executie">Executie</SelectItem>
                  <SelectItem value="afgerond">Afgerond</SelectItem>
                </SelectContent>
              </Select>
            ) : field.id === 'estimated_hours' ? (
              <Input
                id={field.id}
                type="number"
                step="0.5"
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                placeholder="0"
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
            ) : field.id === 'hourly_rate' ? (
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                placeholder="0.00"
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
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
