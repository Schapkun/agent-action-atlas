
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultipleDeadlinesDialog } from './MultipleDeadlinesDialog';

interface PlanningSectionProps {
  formData: {
    start_date?: string;
    end_date?: string;
    deadline_date?: string;
    deadline_description?: string;
  };
  updateFormData: (updates: any) => void;
}

export const PlanningSection = ({ formData, updateFormData }: PlanningSectionProps) => {
  const handleDeadlinesAdd = (deadlines: any[]) => {
    console.log('📅 Multiple deadlines added:', deadlines);
    // For now, we'll just take the first deadline and use it in the form
    // In a full implementation, these would be saved separately
    if (deadlines.length > 0) {
      const firstDeadline = deadlines[0];
      updateFormData({ 
        deadline_date: firstDeadline.due_date,
        deadline_description: firstDeadline.title + (firstDeadline.description ? ': ' + firstDeadline.description : '')
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Planning & Termijnen</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date" className="text-sm font-medium text-slate-700 mb-2 block">
              Startdatum
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date || ''}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
              className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
          
          <div>
            <Label htmlFor="end_date" className="text-sm font-medium text-slate-700 mb-2 block">
              Einddatum
            </Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
              className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>

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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline_date" className="text-sm font-medium text-slate-700 mb-2 block">
                Deadline Datum
              </Label>
              <Input
                id="deadline_date"
                type="date"
                value={formData.deadline_date || ''}
                onChange={(e) => updateFormData({ deadline_date: e.target.value })}
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            
            <div>
              <Label htmlFor="deadline_description" className="text-sm font-medium text-slate-700 mb-2 block">
                Deadline Beschrijving
              </Label>
              <Textarea
                id="deadline_description"
                value={formData.deadline_description || ''}
                onChange={(e) => updateFormData({ deadline_description: e.target.value })}
                placeholder="Beschrijving van de deadline..."
                className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 min-h-[80px]"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
