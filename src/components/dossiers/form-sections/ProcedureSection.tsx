
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Edit } from 'lucide-react';
import { SectionEditorDialog } from './SectionEditorDialog';

interface ProcedureSectionProps {
  formData: {
    procedure_type?: string;
  };
  updateFormData: (updates: any) => void;
}

export const ProcedureSection = ({ formData, updateFormData }: ProcedureSectionProps) => {
  const [customFields, setCustomFields] = useState([
    { id: 'procedure_type', name: 'Type Procedure', type: 'select' as const, options: ['dagvaarding', 'kort_geding', 'arbitrage', 'mediation', 'onderhandeling', 'advies', 'hoger_beroep', 'cassatie'] }
  ]);

  const handleFieldsUpdate = (fields: any[]) => {
    setCustomFields(fields);
  };

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Procedure</h3>
        </div>
        
        <SectionEditorDialog
          sectionName="Procedure"
          fields={customFields}
          onFieldsUpdate={handleFieldsUpdate}
        >
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </SectionEditorDialog>
      </div>
      
      <div>
        <Label htmlFor="procedure_type" className="text-sm font-medium text-slate-700 mb-2 block">
          Type Procedure
        </Label>
        <Select 
          value={formData.procedure_type || ''} 
          onValueChange={(value) => updateFormData({ procedure_type: value })}
        >
          <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
            <SelectValue placeholder="Selecteer procedure type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dagvaarding">Dagvaarding</SelectItem>
            <SelectItem value="kort_geding">Kort Geding</SelectItem>
            <SelectItem value="arbitrage">Arbitrage</SelectItem>
            <SelectItem value="mediation">Mediation</SelectItem>
            <SelectItem value="onderhandeling">Onderhandeling</SelectItem>
            <SelectItem value="advies">Juridisch Advies</SelectItem>
            <SelectItem value="hoger_beroep">Hoger Beroep</SelectItem>
            <SelectItem value="cassatie">Cassatie</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
