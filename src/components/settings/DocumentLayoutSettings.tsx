
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus } from 'lucide-react';
import { HTMLDocumentBuilder } from './htmldocument/HTMLDocumentBuilder';

export const DocumentLayoutSettings = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Document Templates</h3>
        <p className="text-sm text-muted-foreground">
          Beheer en creëer document templates voor automatische generatie.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nieuw Document Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                HTML Document Builder
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 pt-0 h-full">
              <HTMLDocumentBuilder />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Geen templates gevonden</p>
          <p className="text-sm">Klik op "Nieuw Document Template" om te beginnen</p>
        </div>
      </div>
    </div>
  );
};
