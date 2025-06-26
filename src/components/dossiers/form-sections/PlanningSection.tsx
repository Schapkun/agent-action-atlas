
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Euro } from 'lucide-react';

interface PlanningSectionProps {
  formData: {
    start_date?: string;
    end_date?: string;
    budget?: string;
    deadline_date?: string;
    deadline_description?: string;
  };
  updateFormData: (updates: any) => void;
}

export const PlanningSection = ({ formData, updateFormData }: PlanningSectionProps) => {
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
              Verwachte einddatum
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

        <div>
          <Label htmlFor="deadline_date" className="text-sm font-medium text-slate-700 mb-2 block">
            Belangrijke deadline
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
            Deadline omschrijving
          </Label>
          <Input
            id="deadline_description"
            value={formData.deadline_description || ''}
            onChange={(e) => updateFormData({ deadline_description: e.target.value })}
            placeholder="bijv. Dagvaarding indienen, Hoger beroep"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="budget" className="text-sm font-medium text-slate-700 mb-2 block">
            Budget (€)
          </Label>
          <div className="relative">
            <Euro className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={formData.budget || ''}
              onChange={(e) => updateFormData({ budget: e.target.value })}
              placeholder="5000.00"
              className="pl-10 text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
