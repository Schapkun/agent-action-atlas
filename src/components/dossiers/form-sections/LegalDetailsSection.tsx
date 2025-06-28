
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale } from 'lucide-react';

interface LegalDetailsSectionProps {
  formData: {
    case_type?: string;
    court_instance?: string;
    legal_status?: string;
    estimated_hours?: string;
    hourly_rate?: string;
  };
  updateFormData: (updates: any) => void;
}

export const LegalDetailsSection = ({ formData, updateFormData }: LegalDetailsSectionProps) => {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Scale className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Details</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="case_type" className="text-sm font-medium text-slate-700 mb-2 block">
            Zaaktype
          </Label>
          <Select 
            value={formData.case_type || ''} 
            onValueChange={(value) => updateFormData({ case_type: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer zaaktype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="civiel">Civiele Zaak</SelectItem>
              <SelectItem value="straf">Strafzaak</SelectItem>
              <SelectItem value="bestuurs">Bestuurszaak</SelectItem>
              <SelectItem value="arbeids">Arbeidszaak</SelectItem>
              <SelectItem value="familie">Familiezaak</SelectItem>
              <SelectItem value="ondernemings">Ondernemingszaak</SelectItem>
              <SelectItem value="fiscaal">Fiscale Zaak</SelectItem>
              <SelectItem value="intellectueel">Intellectueel Eigendom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="court_instance" className="text-sm font-medium text-slate-700 mb-2 block">
            Rechtbank/Instantie
          </Label>
          <Input
            id="court_instance"
            value={formData.court_instance || ''}
            onChange={(e) => updateFormData({ court_instance: e.target.value })}
            placeholder="bijv. Rechtbank Amsterdam"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="legal_status" className="text-sm font-medium text-slate-700 mb-2 block">
            Juridische Status
          </Label>
          <Select 
            value={formData.legal_status || ''} 
            onValueChange={(value) => updateFormData({ legal_status: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="onderzoek">Onderzoek</SelectItem>
              <SelectItem value="dagvaarding">Dagvaarding Ingediend</SelectItem>
              <SelectItem value="verweer">Verweer Ingediend</SelectItem>
              <SelectItem value="comparitie">Comparitie</SelectItem>
              <SelectItem value="vonnis">Vonnis</SelectItem>
              <SelectItem value="hoger_beroep">Hoger Beroep</SelectItem>
              <SelectItem value="executie">Executie</SelectItem>
              <SelectItem value="afgerond">Afgerond</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimated_hours" className="text-sm font-medium text-slate-700 mb-2 block">
              Geschatte Uren
            </Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              value={formData.estimated_hours || ''}
              onChange={(e) => updateFormData({ estimated_hours: e.target.value })}
              placeholder="0"
              className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
          
          <div>
            <Label htmlFor="hourly_rate" className="text-sm font-medium text-slate-700 mb-2 block">
              Uurtarief (€)
            </Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate || ''}
              onChange={(e) => updateFormData({ hourly_rate: e.target.value })}
              placeholder="0.00"
              className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
