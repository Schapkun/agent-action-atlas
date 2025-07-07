
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CreditCard } from 'lucide-react';

interface PlanningBudgetSectionProps {
  formData: {
    start_date: string;
    end_date: string;
    budget: string;
    is_billable: boolean;
  };
  updateFormData: (updates: any) => void;
}

export const PlanningBudgetSection = ({ formData, updateFormData }: PlanningBudgetSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200 w-full">
      <div className="flex items-center gap-1 mb-2">
        <div className="bg-purple-600 rounded-lg p-1">
          <Calendar className="h-2 w-2 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-purple-900">Planning & Budget</h3>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="start_date" className="text-xs text-purple-900 font-medium">Start</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
              className="mt-1 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-7"
            />
          </div>
          
          <div>
            <Label htmlFor="end_date" className="text-xs text-purple-900 font-medium">Eind</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
              className="mt-1 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-7"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="budget" className="text-xs text-purple-900 font-medium">Budget (€)</Label>
          <div className="relative mt-1">
            <CreditCard className="absolute left-2 top-2 h-2 w-2 text-purple-500" />
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => updateFormData({ budget: e.target.value })}
              placeholder="0.00"
              className="pl-6 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-7"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_billable"
            checked={formData.is_billable}
            onCheckedChange={(checked) => updateFormData({ is_billable: !!checked })}
            className="border-purple-300 text-purple-600 focus:ring-purple-500"
          />
          <Label htmlFor="is_billable" className="text-xs text-purple-900 font-medium">Factuurbaar</Label>
        </div>
      </div>
    </div>
  );
};
