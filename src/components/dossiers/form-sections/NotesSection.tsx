
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';
import { SectionEditorDialog } from './SectionEditorDialog';

interface NotesSectionProps {
  formData: {
    intake_notes?: string;
  };
  updateFormData: (updates: any) => void;
}

export const NotesSection = ({ formData, updateFormData }: NotesSectionProps) => {
  const [customFields, setCustomFields] = useState([
    { id: 'intake_notes', name: 'Intake Notities', type: 'textarea' as const }
  ]);

  const handleFieldsUpdate = (fields: any[]) => {
    setCustomFields(fields);
  };

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Notities</h3>
        </div>
        
        <SectionEditorDialog
          sectionName="Notities"
          fields={customFields}
          onFieldsUpdate={handleFieldsUpdate}
        >
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </SectionEditorDialog>
      </div>
      
      <div>
        <Label htmlFor="intake_notes" className="text-sm font-medium text-slate-700 mb-2 block">
          Intake Notities
        </Label>
        <Textarea
          id="intake_notes"
          value={formData.intake_notes || ''}
          onChange={(e) => updateFormData({ intake_notes: e.target.value })}
          placeholder="Notities tijdens intake gesprek..."
          className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 min-h-[120px]"
          rows={5}
        />
      </div>
    </div>
  );
};
