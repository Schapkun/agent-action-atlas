
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';

interface DocumentTypeSettings {
  documentType: string;
  label: string;
  defaultLabelId: string | null;
}

export const DocumentSettings = () => {
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();
  const { labels } = useDocumentTemplateLabels();
  const [loading, setLoading] = useState(false);
  const [documentTypes] = useState<DocumentTypeSettings[]>([
    { documentType: 'contract', label: 'Contracten', defaultLabelId: null },
    { documentType: 'brief', label: 'Brieven', defaultLabelId: null },
    { documentType: 'rapport', label: 'Rapporten', defaultLabelId: null },
    { documentType: 'overeenkomst', label: 'Overeenkomsten', defaultLabelId: null },
    { documentType: 'notitie', label: 'Notities', defaultLabelId: null },
    { documentType: 'factuur', label: 'Facturen', defaultLabelId: null },
    { documentType: 'offerte', label: 'Offertes', defaultLabelId: null }
  ]);

  const [settings, setSettings] = useState<DocumentTypeSettings[]>(documentTypes);

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization?.id]);

  const fetchSettings = async () => {
    if (!selectedOrganization?.id) return;

    try {
      const response = await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_settings?organization_id=eq.${selectedOrganization.id}&select=document_type,default_label_id`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA'
        }
      });

      const fetchedData = await response.json();

      const updatedSettings = documentTypes.map(type => {
        const setting = fetchedData?.find((d: any) => d.document_type === type.documentType);
        return {
          ...type,
          defaultLabelId: setting?.default_label_id || null
        };
      });

      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error fetching document settings:', error);
    }
  };

  const handleLabelChange = (documentType: string, labelId: string | null) => {
    const actualLabelId = labelId === 'none' ? null : labelId;
    setSettings(prev => prev.map(setting => 
      setting.documentType === documentType 
        ? { ...setting, defaultLabelId: actualLabelId }
        : setting
    ));
  };

  const handleSave = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    try {
      // Delete existing settings using fetch API
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
          document_type: setting.documentType,
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Instellingen</h2>
        <p className="text-muted-foreground">
          Stel default template labels in voor verschillende document types.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Standaard Template Labels</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecteer welke labels standaard gebruikt worden voor elk document type.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {settings.map((setting) => (
              <div key={setting.documentType} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">{setting.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    Standaard label voor {setting.label.toLowerCase()}
                  </p>
                </div>
                <div className="w-64">
                  <Select
                    value={setting.defaultLabelId || 'none'}
                    onValueChange={(value) => handleLabelChange(setting.documentType, value)}
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
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Opslaan...' : 'Instellingen opslaan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
