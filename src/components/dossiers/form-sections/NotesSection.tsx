
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Tag } from 'lucide-react';

interface NotesSectionProps {
  formData: {
    description: string;
    tags: string;
    intake_notes?: string;
  };
  updateFormData: (updates: any) => void;
}

export const NotesSection = ({ formData, updateFormData }: NotesSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Notities & Labels</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
            Beschrijving
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Korte beschrijving van de zaak"
            rows={3}
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 resize-none"
          />
        </div>

        <div>
          <Label htmlFor="intake_notes" className="text-sm font-medium text-slate-700 mb-2 block">
            Intake notities
          </Label>
          <Textarea
            id="intake_notes"
            value={formData.intake_notes || ''}
            onChange={(e) => updateFormData({ intake_notes: e.target.value })}
            placeholder="Eerste gesprek met client, belangrijke details..."
            rows={4}
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 resize-none"
          />
        </div>

        <div>
          <Label htmlFor="tags" className="text-sm font-medium text-slate-700 mb-2 block">
            Labels
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => updateFormData({ tags: e.target.value })}
            placeholder="urgent, complexe zaak, mediatie"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Gescheiden door komma's
          </p>
        </div>
      </div>
    </div>
  );
};
