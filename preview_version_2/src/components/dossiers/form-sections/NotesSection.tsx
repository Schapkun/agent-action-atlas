
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';
import { SectionEditorDialog, renderDynamicField } from './SectionEditorDialog';
import { useSectionConfig } from '@/hooks/useSectionConfig';

interface NotesSectionProps {
  formData: {
    intake_notes?: string;
    [key: string]: any; // Voor dynamische velden
  };
  updateFormData: (updates: any) => void;
}

export const NotesSection = ({ formData, updateFormData }: NotesSectionProps) => {
  const { getSectionConfig, updateSectionFields, updateSectionName } = useSectionConfig();
  const sectionConfig = getSectionConfig('notes');

  const handleFieldsUpdate = (fields: any[]) => {
    updateSectionFields('notes', fields);
  };

  const handleSectionNameUpdate = (name: string) => {
    updateSectionName('notes', name);
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
              {field.name}
            </Label>
            {field.id === 'intake_notes' ? (
              <Textarea
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                placeholder="Notities tijdens intake gesprek..."
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 min-h-[120px]"
                rows={5}
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
