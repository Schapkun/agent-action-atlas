
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';

interface ProcedureSectionProps {
  formData: {
    procedure_type?: string;
    case_phase?: string;
  };
  updateFormData: (updates: any) => void;
}

export const ProcedureSection = ({ formData, updateFormData }: ProcedureSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Settings className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Procedure Voortgang</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="procedure_type" className="text-sm font-medium text-slate-700 mb-2 block">
            Zaaktype voor standaard procedure
          </Label>
          <Select 
            value={formData.procedure_type || ''} 
            onValueChange={(value) => updateFormData({ procedure_type: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer zaaktype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="civiel">Civiele Procedure</SelectItem>
              <SelectItem value="straf">Strafprocedure</SelectItem>
              <SelectItem value="bestuurs">Bestuursprocedure</SelectItem>
              <SelectItem value="arbeids">Arbeidsprocedure</SelectItem>
              <SelectItem value="familie">Familieprocedure</SelectItem>
              <SelectItem value="ondernemings">Ondernemingsprocedure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="case_phase" className="text-sm font-medium text-slate-700 mb-2 block">
            Huidige fase
          </Label>
          <Select 
            value={formData.case_phase || ''} 
            onValueChange={(value) => updateFormData({ case_phase: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="onderzoek">Onderzoek</SelectItem>
              <SelectItem value="voorbereiding">Voorbereiding</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="uitvoering">Uitvoering</SelectItem>
              <SelectItem value="afronding">Afronding</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="w-full text-slate-600 border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aangepaste stap toevoegen
          </Button>
        </div>
      </div>
    </div>
  );
};
