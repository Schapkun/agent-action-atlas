
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Hash } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    description: string;
    category: string;
    priority: string;
  };
  updateFormData: (updates: any) => void;
}

export const BasicInfoSection = ({ formData, updateFormData }: BasicInfoSectionProps) => {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Basisinformatie</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-2 block">
            Dossiernaam *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Geef het dossier een duidelijke naam"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
            Beschrijving
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Korte beschrijving van het dossier..."
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500 min-h-[80px]"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-2 block">
              Categorie
            </Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData({ category: value })}>
              <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algemeen">Algemeen</SelectItem>
                <SelectItem value="familierecht">Familierecht</SelectItem>
                <SelectItem value="arbeidsrecht">Arbeidsrecht</SelectItem>
                <SelectItem value="strafrecht">Strafrecht</SelectItem>
                <SelectItem value="ondernemingsrecht">Ondernemingsrecht</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority" className="text-sm font-medium text-slate-700 mb-2 block">
              Prioriteit
            </Label>
            <Select value={formData.priority} onValueChange={(value) => updateFormData({ priority: value })}>
              <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Laag</SelectItem>
                <SelectItem value="medium">Normaal</SelectItem>
                <SelectItem value="high">Hoog</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
