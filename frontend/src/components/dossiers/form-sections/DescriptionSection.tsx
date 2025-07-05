
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface DescriptionSectionProps {
  formData: {
    description: string;
  };
  updateFormData: (updates: any) => void;
}

export const DescriptionSection = ({ formData, updateFormData }: DescriptionSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-2 border border-gray-200 w-full">
      <div className="flex items-center gap-1 mb-2">
        <div className="bg-gray-600 rounded-lg p-1">
          <FileText className="h-2 w-2 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-gray-900">Beschrijving</h3>
      </div>
      
      <div>
        <Label htmlFor="description" className="text-xs text-gray-900 font-medium">Omschrijving</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Beschrijving van het dossier"
          rows={2}
          className="mt-1 text-xs border-gray-200 focus:border-gray-500 focus:ring-gray-500 resize-none"
        />
      </div>
    </div>
  );
};
