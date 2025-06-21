
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { useDocumentTypes, DocumentType } from '@/hooks/useDocumentTypes';
import { DocumentTypeActions } from './components/DocumentTypeActions';
import { DocumentTypeList } from './components/DocumentTypeList';
import { DocumentTypeDialog } from './components/DocumentTypeDialog';
import { Loader2 } from 'lucide-react';

interface DocumentTypeSettings {
  documentTypeId: string;
  label: string;
  defaultLabelId: string | null;
}

export const DocumentSettings = () => {
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();
  const { labels } = useDocumentTemplateLabels();
  const { documentTypes, loading: documentTypesLoading, createDocumentType, updateDocumentType, deleteDocumentType, refetch } = useDocumentTypes();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<DocumentTypeSettings[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocumentType, setEditingDocumentType] = useState<DocumentType | undefined>();

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization?.id, documentTypes]);

  const fetchSettings = async () => {
    if (!selectedOrganization?.id || documentTypes.length === 0) return;

    try {
      const response = await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_settings?organization_id=eq.${selectedOrganization.id}&select=document_type_id,default_label_id`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA'
        }
      });

      const fetchedData = await response.json();

      const updatedSettings = documentTypes.map(type => {
        const setting = fetchedData?.find((d: any) => d.document_type_id === type.id);
        return {
          documentTypeId: type.id,
          label: type.label,
          defaultLabelId: setting?.default_label_id || null
        };
      });

      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error fetching document settings:', error);
    }
  };

  const handleLabelChange = (documentTypeId: string, labelId: string | null) => {
    const actualLabelId = labelId === 'none' ? null : labelId;
    setSettings(prev => prev.map(setting => 
      setting.documentTypeId === documentTypeId 
        ? { ...setting, defaultLabelId: actualLabelId }
        : setting
    ));
  };

  const handleSave = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    try {
      // Delete existing settings
      await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_settings?organization_id=eq.${selectedOrganization.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA'
        }
      });

      // Insert new settings
      const settingsToInsert = settings
        .filter(setting => setting.defaultLabelId)
        .map(setting => ({
          organization_id: selectedOrganization.id,
          document_type_id: setting.documentTypeId,
          default_label_id: setting.defaultLabelId
        }));

      if (settingsToInsert.length > 0) {
        await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_settings`, {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settingsToInsert)
        });
      }

      toast({
        title: "Instellingen opgeslagen",
        description: "Document label instellingen zijn succesvol opgeslagen"
      });
    } catch (error) {
      console.error('Error saving document settings:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewDocumentType = () => {
    setEditingDocumentType(undefined);
    setIsDialogOpen(true);
  };

  const handleEditDocumentType = (documentType: DocumentType) => {
    setEditingDocumentType(documentType);
    setIsDialogOpen(true);
  };

  const handleDeleteDocumentType = async (documentType: DocumentType) => {
    if (window.confirm(`Weet je zeker dat je "${documentType.label}" wilt verwijderen?`)) {
      const success = await deleteDocumentType(documentType.id);
      if (success) {
        toast({
          title: "Document type verwijderd",
          description: `"${documentType.label}" is verwijderd.`
        });
      } else {
        toast({
          title: "Fout",
          description: "Kon document type niet verwijderen",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveDocumentType = async (name: string, label: string) => {
    if (editingDocumentType) {
      const success = await updateDocumentType(editingDocumentType.id, name, label);
      if (success) {
        toast({
          title: "Document type bijgewerkt",
          description: `"${label}" is bijgewerkt.`
        });
        return true;
      }
    } else {
      const success = await createDocumentType(name, label);
      if (success) {
        toast({
          title: "Document type aangemaakt",
          description: `"${label}" is aangemaakt.`
        });
        return true;
      }
    }
    return false;
  };

  if (documentTypesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Document types laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentTypeActions onNewDocumentType={handleNewDocumentType} />

      <div className="text-sm text-gray-600">
        {documentTypes.length} document {documentTypes.length === 1 ? 'type' : 'types'} gevonden
      </div>

      <DocumentTypeList
        documentTypes={documentTypes}
        onEditDocumentType={handleEditDocumentType}
        onDeleteDocumentType={handleDeleteDocumentType}
      />

      {documentTypes.length > 0 && (
        <>
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Standaard Labels per Document Type</h3>
            <div className="grid gap-4">
              {settings.map((setting) => (
                <Card key={setting.documentTypeId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        Standaard label voor {setting.label.toLowerCase()}
                      </p>
                    </div>
                    <div className="w-64">
                      <Select
                        value={setting.defaultLabelId || 'none'}
                        onValueChange={(value) => handleLabelChange(setting.documentTypeId, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Geen label</SelectItem>
                          {labels.map((label) => (
                            <SelectItem key={label.id} value={label.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: label.color }}
                                />
                                {label.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Opslaan...' : 'Label instellingen opslaan'}
              </Button>
            </div>
          </div>
        </>
      )}

      <DocumentTypeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveDocumentType}
        documentType={editingDocumentType}
        existingNames={documentTypes.map(dt => dt.name)}
      />
    </div>
  );
};
