
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Scale } from 'lucide-react';
import { useDossierForm } from '@/hooks/useDossierForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { ClientSection } from './form-sections/ClientSection';
import { PlanningSection } from './form-sections/PlanningSection';
import { LegalDetailsSection } from './form-sections/LegalDetailsSection';
import { NotesSection } from './form-sections/NotesSection';
import { ProcedureSection } from './form-sections/ProcedureSection';

interface EnhancedCreateDossierDialogProps {
  children?: React.ReactNode;
  onDossierCreated?: () => void;
}

export const EnhancedCreateDossierDialog = ({ children, onDossierCreated }: EnhancedCreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, updateFormData, submitForm, loading } = useDossierForm(() => {
    setOpen(false);
    onDossierCreated?.();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
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
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ClientSection formData={formData} updateFormData={updateFormData} />
              <BasicInfoSection formData={formData} updateFormData={updateFormData} />
              <LegalDetailsSection formData={formData} updateFormData={updateFormData} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <PlanningSection formData={formData} updateFormData={updateFormData} />
              <ProcedureSection formData={formData} updateFormData={updateFormData} />
              <NotesSection formData={formData} updateFormData={updateFormData} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
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
        </form>
      </DialogContent>
    </Dialog>
  );
};
