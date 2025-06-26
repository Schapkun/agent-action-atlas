import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Clock, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useCaseTypes } from '@/hooks/useCaseTypes';

interface CaseStep {
  id: string;
  step_name: string;
  step_description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
  notes?: string;
}

interface CaseTemplate {
  id: string;
  case_type: string;
  step_name: string;
  step_description: string;
  step_order: number;
  estimated_days: number;
}

interface CaseProgressSectionProps {
  formData: {
    case_type?: string;
  };
  updateFormData: (updates: any) => void;
}

export const CaseProgressSection = ({ formData, updateFormData }: CaseProgressSectionProps) => {
  const [caseSteps, setCaseSteps] = useState<CaseStep[]>([]);
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [customStep, setCustomStep] = useState({ name: '', description: '' });
  const [showAddCustom, setShowAddCustom] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { caseTypes, loading: caseTypesLoading } = useCaseTypes();

  useEffect(() => {
    if (formData.case_type && selectedOrganization) {
      loadCaseTemplates();
    }
  }, [formData.case_type, selectedOrganization]);

  const loadCaseTemplates = async () => {
    if (!selectedOrganization || !formData.case_type) return;

    try {
      let query = supabase
        .from('case_step_templates')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .eq('case_type', formData.case_type)
        .order('step_order');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const steps: CaseStep[] = (data || []).map(template => ({
        id: `template-${template.id}`,
        step_name: template.step_name,
        step_description: template.step_description,
        status: 'pending' as const
      }));

      setCaseSteps(steps);
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading case templates:', error);
    }
  };

  const addCustomStep = () => {
    if (!customStep.name.trim()) return;

    const newStep: CaseStep = {
      id: `custom-${Date.now()}`,
      step_name: customStep.name,
      step_description: customStep.description,
      status: 'pending'
    };

    setCaseSteps([...caseSteps, newStep]);
    setCustomStep({ name: '', description: '' });
    setShowAddCustom(false);
  };

  const updateStepStatus = (stepId: string, status: CaseStep['status']) => {
    setCaseSteps(steps =>
      steps.map(step =>
        step.id === stepId
          ? {
              ...step,
              status,
              completed_at: status === 'completed' ? new Date().toISOString() : undefined
            }
          : step
      )
    );
  };

  const updateStepNotes = (stepId: string, notes: string) => {
    setCaseSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, notes } : step
      )
    );
  };

  const removeStep = (stepId: string) => {
    setCaseSteps(steps => steps.filter(step => step.id !== stepId));
  };

  const getStatusIcon = (status: CaseStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CaseStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'skipped':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-2">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Procedure Voortgang</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="case_type" className="text-sm font-medium text-slate-700 mb-2 block">
            Zaaktype voor standaard procedure
          </Label>
          <Select 
            value={formData.case_type || ''} 
            onValueChange={(value) => updateFormData({ case_type: value })}
            disabled={caseTypesLoading}
          >
            <SelectTrigger className="text-sm border-slate-300 focus:border-slate-500 focus:ring-slate-500">
              <SelectValue placeholder={caseTypesLoading ? "Laden..." : "Selecteer zaaktype"} />
            </SelectTrigger>
            <SelectContent>
              {caseTypes.map((type) => (
                <SelectItem key={type.id} value={type.name.toLowerCase()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {caseSteps.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Procedure stappen ({caseSteps.filter(s => s.status === 'completed').length}/{caseSteps.length} voltooid)
            </Label>
            
            {caseSteps.map((step, index) => (
              <div key={step.id} className={`p-4 rounded-lg border ${getStatusColor(step.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">{step.step_name}</h4>
                        <Select
                          value={step.status}
                          onValueChange={(value) => updateStepStatus(step.id, value as CaseStep['status'])}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Wachtend</SelectItem>
                            <SelectItem value="in_progress">Bezig</SelectItem>
                            <SelectItem value="completed">Voltooid</SelectItem>
                            <SelectItem value="skipped">Overgeslagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {step.step_description && (
                        <p className="text-sm text-slate-600 mb-2">{step.step_description}</p>
                      )}
                      
                      <Textarea
                        placeholder="Notities voor deze stap..."
                        value={step.notes || ''}
                        onChange={(e) => updateStepNotes(step.id, e.target.value)}
                        rows={2}
                        className="text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      />
                      
                      {step.completed_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Voltooid op: {new Date(step.completed_at).toLocaleDateString('nl-NL')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {step.id.startsWith('custom-') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4">
          {!showAddCustom ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddCustom(true)}
              className="text-slate-600 hover:text-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aangepaste stap toevoegen
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
              <Input
                placeholder="Naam van de stap"
                value={customStep.name}
                onChange={(e) => setCustomStep(prev => ({ ...prev, name: e.target.value }))}
                className="text-sm"
              />
              <Textarea
                placeholder="Omschrijving (optioneel)"
                value={customStep.description}
                onChange={(e) => setCustomStep(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addCustomStep}>
                  Toevoegen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowAddCustom(false);
                    setCustomStep({ name: '', description: '' });
                  }}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
