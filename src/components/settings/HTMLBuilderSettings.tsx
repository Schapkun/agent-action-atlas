
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HTMLBuilderEditor } from './htmlbuilder/components/HTMLBuilderEditor';
import { HTMLDocument } from './htmlbuilder/types/HTMLBuilder';
import { HTMLToPDFService } from './htmlbuilder/services/HTMLToPDFService';

export const HTMLBuilderSettings = () => {
  const [documents, setDocuments] = useState<HTMLDocument[]>([]);
  const { toast } = useToast();

  const handleSaveDocument = (document: HTMLDocument) => {
    const existingIndex = documents.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      const updatedDocuments = [...documents];
      updatedDocuments[existingIndex] = document;
      setDocuments(updatedDocuments);
    } else {
      setDocuments([...documents, document]);
    }

    toast({
      title: "Document opgeslagen",
      description: `${document.name} is succesvol opgeslagen.`,
    });
  };

  const handleExportPDF = async (html: string) => {
    try {
      await HTMLToPDFService.generatePDF(html);
      
      toast({
        title: "PDF Export",
        description: "PDF wordt gegenereerd via browser print functie.",
      });
    } catch (error) {
      toast({
        title: "Export fout",
        description: "Er is een fout opgetreden bij het exporteren naar PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full">
      <HTMLBuilderEditor
        onSave={handleSaveDocument}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
};
