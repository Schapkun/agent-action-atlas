
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Scale } from 'lucide-react';
import { useDossierForm } from '@/hooks/useDossierForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { LegalDetailsSection } from './form-sections/LegalDetailsSection';
import { ClientSection } from './form-sections/ClientSection';
import { PlanningSection } from './form-sections/PlanningSection';
import { CaseProgressSection } from './form-sections/CaseProgressSection';
import { NotesSection } from './form-sections/NotesSection';

interface EnhancedCreateDossierDialogProps {
  children?: React.ReactNode;
  onDossierCreated?: () => void;
}

export const EnhancedCreateDossierDialog = ({ children, onDossierCreated }: EnhancedCreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, updateFormData, submitForm, loading } = useDossierForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitForm();
    if (success) {
      setOpen(false);
      onDossierCreated?.();
    }
  };

  // Mock status updates for the case progress section
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);

  const handleStatusChange = (status: string) => {
    updateFormData({ status: status as 'active' | 'closed' | 'pending' });
  };

  const handleAddStatusUpdate = (update: any) => {
    setStatusUpdates(prev => [...prev, { ...update, id: Date.now().toString(), updated_at: new Date().toISOString() }]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm border-0">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Dossier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="!w-[95vw] !h-[98vh] !max-w-none !fixed !top-[1vh] !left-[2.5vw] !transform-none !translate-x-0 !translate-y-0 p-0 rounded-lg overflow-hidden flex flex-col bg-white">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 rounded-lg p-2">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">Nieuw Dossier Aanmaken</DialogTitle>
                <p className="text-slate-600 text-sm mt-1">Maak een nieuw juridisch dossier aan</p>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 min-h-0">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <ClientSection 
                  formData={{ client_id: formData.client_id || '' }} 
                  updateFormData={updateFormData} 
                />
                <BasicInfoSection 
                  formData={{
                    name: formData.name || formData.title,
                    reference: formData.reference,
                    category: formData.category,
                    priority: formData.priority,
                    responsible_user_id: formData.responsible_user_id,
                    assigned_users: formData.assigned_users
                  }} 
                  updateFormData={updateFormData} 
                />
                <LegalDetailsSection 
                  formData={{
                    case_type: formData.case_type,
                    court_instance: formData.court_instance,
                    legal_status: formData.legal_status,
                    estimated_hours: formData.estimated_hours,
                    hourly_rate: formData.hourly_rate,
                    billing_type: formData.billing_type
                  }} 
                  updateFormData={updateFormData} 
                />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <PlanningSection 
                  formData={{
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    budget: formData.budget,
                    deadline_date: formData.deadline_date,
                    deadline_description: formData.deadline_description
                  }} 
                  updateFormData={updateFormData} 
                />
                <CaseProgressSection 
                  currentStatus={formData.status}
                  statusUpdates={statusUpdates}
                  onStatusChange={handleStatusChange}
                  onAddStatusUpdate={handleAddStatusUpdate}
                />
                <NotesSection 
                  formData={{
                    description: formData.description,
                    tags: formData.tags,
                    intake_notes: formData.intake_notes
                  }} 
                  updateFormData={updateFormData} 
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="px-6 py-2 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Annuleren
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white shadow-sm"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Aanmaken...</span>
              </div>
            ) : (
              'Dossier Aanmaken'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
