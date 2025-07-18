
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Edit } from 'lucide-react';
import { SectionEditorDialog, renderDynamicField } from './SectionEditorDialog';
import { useSectionConfig } from '@/hooks/useSectionConfig';

interface ProcedureSectionProps {
  formData: {
    procedure_type?: string;
    [key: string]: any; // Voor dynamische velden
  };
  updateFormData: (updates: any) => void;
}

export const ProcedureSection = ({ formData, updateFormData }: ProcedureSectionProps) => {
  const { getSectionConfig, updateSectionFields, updateSectionName } = useSectionConfig();
  const sectionConfig = getSectionConfig('procedure');

  const handleFieldsUpdate = (fields: any[]) => {
    updateSectionFields('procedure', fields);
  };

  const handleSectionNameUpdate = (name: string) => {
    updateSectionName('procedure', name);
  };

  // Sorteer velden op order
  const sortedFields = [...sectionConfig.fields].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Settings className="h-4 w-4 text-white" />
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
            {field.id === 'procedure_type' ? (
              <Select 
                value={formData[field.id] || ''} 
                onValueChange={(value) => updateFormData({ [field.id]: value })}
              >
                <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                  <SelectValue placeholder="Selecteer procedure type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dagvaarding">Dagvaarding</SelectItem>
                  <SelectItem value="kort_geding">Kort Geding</SelectItem>
                  <SelectItem value="arbitrage">Arbitrage</SelectItem>
                  <SelectItem value="mediation">Mediation</SelectItem>
                  <SelectItem value="onderhandeling">Onderhandeling</SelectItem>
                  <SelectItem value="advies">Juridisch Advies</SelectItem>
                  <SelectItem value="hoger_beroep">Hoger Beroep</SelectItem>
                  <SelectItem value="cassatie">Cassatie</SelectItem>
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
