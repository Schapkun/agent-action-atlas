
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Scale, X } from 'lucide-react';
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
  editMode?: boolean;
  editDossier?: any;
}

export const EnhancedCreateDossierDialog = ({ 
  children, 
  onDossierCreated, 
  editMode = false,
  editDossier 
}: EnhancedCreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, updateFormData, submitForm, loading, initializeFormData } = useDossierForm(() => {
    setOpen(false);
    onDossierCreated?.();
  }, editMode, editDossier);

  // Initialize form data when dialog opens in edit mode
  useEffect(() => {
    if (editMode && editDossier && open) {
      console.log('📝 Dialog opened in edit mode, initializing with:', editDossier);
      initializeFormData(editDossier);
    }
  }, [editMode, editDossier, open, initializeFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const dialogTitle = editMode ? 'Dossier Bewerken' : 'Nieuw Dossier Aanmaken';
  const buttonText = editMode ? 'Dossier Bijwerken' : 'Dossier Aanmaken';
  const loadingText = editMode ? 'Bijwerken...' : 'Aanmaken...';

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
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 pb-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 rounded-lg p-2">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-900">{dialogTitle}</DialogTitle>
                  <p className="text-slate-600 text-sm mt-1">
                    {editMode ? 'Bewerk het geselecteerde dossier' : 'Maak een nieuw juridisch dossier aan'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={loading}
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
                      <span>{loadingText}</span>
                    </div>
                  ) : (
                    buttonText
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
