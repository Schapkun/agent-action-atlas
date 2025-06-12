
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus } from 'lucide-react';
import { HTMLDocumentBuilder } from './htmldocument/HTMLDocumentBuilder';
import { DialogHeader } from './components/DialogHeader';
import { DialogFooter } from './components/DialogFooter';

export const DocumentLayoutSettings = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Simulate save operation
    setTimeout(() => {
      setSaving(false);
      setIsBuilderOpen(false);
    }, 1000);
  };

  const handleCancel = () => {
    setIsBuilderOpen(false);
  };

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
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex flex-col">
            <div className="flex-1 p-1 min-h-0">
              <HTMLDocumentBuilder />
            </div>
            <DialogFooter onCancel={handleCancel} onSave={handleSave} saving={saving} />
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
