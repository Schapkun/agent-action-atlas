
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Edit } from 'lucide-react';
import { MultipleDeadlinesDialog } from './MultipleDeadlinesDialog';
import { SectionEditorDialog, renderDynamicField } from './SectionEditorDialog';

interface PlanningSectionProps {
  formData: {
    start_date?: string;
    end_date?: string;
    deadline_date?: string;
    deadline_description?: string;
    [key: string]: any; // Voor dynamische velden
  };
  updateFormData: (updates: any) => void;
}

export const PlanningSection = ({ formData, updateFormData }: PlanningSectionProps) => {
  const [customFields, setCustomFields] = useState([
    { id: 'start_date', name: 'Startdatum', type: 'date' as const, order: 0 },
    { id: 'end_date', name: 'Einddatum', type: 'date' as const, order: 1 },
    { id: 'deadline_date', name: 'Deadline Datum', type: 'date' as const, order: 2 },
    { id: 'deadline_description', name: 'Deadline Beschrijving', type: 'textarea' as const, order: 3 }
  ]);

  const handleDeadlinesAdd = (deadlines: any[]) => {
    console.log('📅 Multiple deadlines added:', deadlines);
    if (deadlines.length > 0) {
      const firstDeadline = deadlines[0];
      updateFormData({ 
        deadline_date: firstDeadline.due_date,
        deadline_description: firstDeadline.title + (firstDeadline.description ? ': ' + firstDeadline.description : '')
      });
    }
  };

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
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Planning & Termijnen</h3>
        </div>
        
        <SectionEditorDialog
          sectionName="Planning & Termijnen"
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
              {field.name}
            </Label>
            {field.id === 'start_date' || field.id === 'end_date' || field.id === 'deadline_date' ? (
              <Input
                id={field.id}
                type="date"
                value={formData[field.id] || ''}
                onChange={(e) => updateFormData({ [field.id]: e.target.value })}
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

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-700">Deadlines</h4>
            <MultipleDeadlinesDialog onDeadlinesAdd={handleDeadlinesAdd}>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Meerdere Deadlines
              </Button>
            </MultipleDeadlinesDialog>
          </div>
        </div>
      </div>
    </div>
  );
};
