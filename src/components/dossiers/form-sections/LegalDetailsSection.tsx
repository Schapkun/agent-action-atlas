
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Scale, AlertTriangle, Building } from 'lucide-react';

interface LegalDetailsSectionProps {
  formData: {
    case_type?: string;
    court_instance?: string;
    legal_status?: string;
    estimated_hours?: string;
    hourly_rate?: string;
    billing_type?: string;
  };
  updateFormData: (updates: any) => void;
}

export const LegalDetailsSection = ({ formData, updateFormData }: LegalDetailsSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <Scale className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Juridische Details</h3>
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
              <SelectItem value="strafrecht">Strafrecht</SelectItem>
              <SelectItem value="civiel_recht">Civiel recht</SelectItem>
              <SelectItem value="handelsrecht">Handelsrecht</SelectItem>
              <SelectItem value="familierecht">Familierecht</SelectItem>
              <SelectItem value="arbeidsrecht">Arbeidsrecht</SelectItem>
              <SelectItem value="verzekeringsrecht">Verzekeringsrecht</SelectItem>
              <SelectItem value="vastgoedrecht">Vastgoedrecht</SelectItem>
              <SelectItem value="intellectueel_eigendom">Intellectueel eigendom</SelectItem>
              <SelectItem value="bestuursrecht">Bestuursrecht</SelectItem>
              <SelectItem value="belastingrecht">Belastingrecht</SelectItem>
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
            placeholder="bijv. Rechtbank Amsterdam, Hof Den Haag"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>

        <div>
          <Label htmlFor="legal_status" className="text-sm font-medium text-slate-700 mb-2 block">
            Status
          </Label>
          <Select 
            value={formData.legal_status || 'nieuw'} 
            onValueChange={(value) => updateFormData({ legal_status: value })}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder="Selecteer status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nieuw">Nieuw</SelectItem>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="in_behandeling">In behandeling</SelectItem>
              <SelectItem value="dagvaarding">Dagvaarding</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="vonnis">Vonnis</SelectItem>
              <SelectItem value="hoger_beroep">Hoger beroep</SelectItem>
              <SelectItem value="afgerond">Afgerond</SelectItem>
              <SelectItem value="geseponeerd">Geseponeerd</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="billing_type" className="text-sm font-medium text-slate-700 mb-2 block">
              Factureringstype
            </Label>
            <Select 
              value={formData.billing_type || 'per_uur'} 
              onValueChange={(value) => updateFormData({ billing_type: value })}
            >
              <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                <SelectValue placeholder="Selecteer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_uur">Per uur</SelectItem>
                <SelectItem value="vast_bedrag">Vast bedrag</SelectItem>
                <SelectItem value="no_cure_no_pay">No cure, no pay</SelectItem>
                <SelectItem value="pro_bono">Pro bono</SelectItem>
                <SelectItem value="contingency">Contingency fee</SelectItem>
              </SelectContent>
            </Select>
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
              placeholder="250.00"
              className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="estimated_hours" className="text-sm font-medium text-slate-700 mb-2 block">
            Geschatte uren
          </Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.5"
            value={formData.estimated_hours || ''}
            onChange={(e) => updateFormData({ estimated_hours: e.target.value })}
            placeholder="20.0"
            className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Schatting voor budgettering en planning
          </p>
        </div>
      </div>
    </div>
  );
};
