
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderPlus } from 'lucide-react';
import { useDossierForm } from '@/hooks/useDossierForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { ClientSection } from './form-sections/ClientSection';
import { PlanningBudgetSection } from './form-sections/PlanningBudgetSection';
import { DescriptionSection } from './form-sections/DescriptionSection';
import { TagsSection } from './form-sections/TagsSection';

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
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Dossier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="!w-[98vw] !h-[92vh] !max-w-none !fixed !top-[4vh] !left-[1vw] !transform-none !translate-x-0 !translate-y-0 p-0 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg p-1">
                <FolderPlus className="h-3 w-3" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-white">Nieuw Dossier</DialogTitle>
                <p className="text-blue-100 text-xs">Maak een nieuw dossier aan</p>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 min-h-0">
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
            <BasicInfoSection formData={formData} updateFormData={updateFormData} />
            <ClientSection formData={formData} updateFormData={updateFormData} />
            <PlanningBudgetSection formData={formData} updateFormData={updateFormData} />
            <DescriptionSection formData={formData} updateFormData={updateFormData} />
            <TagsSection formData={formData} updateFormData={updateFormData} />
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="px-6 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuleren
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Bezig...</span>
              </div>
            ) : (
              'Aanmaken'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
