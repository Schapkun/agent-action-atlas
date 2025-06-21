
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplateLabel } from '@/types/documentTemplateLabels';

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
      const { data, error } = await supabase
        .from('document_settings')
        .select('document_type, default_label_id')
        .eq('organization_id', selectedOrganization.id);

      if (error) throw error;

      const updatedSettings = documentTypes.map(type => {
        const setting = data?.find(d => d.document_type === type.documentType);
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
    setSettings(prev => prev.map(setting => 
      setting.documentType === documentType 
        ? { ...setting, defaultLabelId: labelId }
        : setting
    ));
  };

  const handleSave = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    try {
      // Delete existing settings
      await supabase
        .from('document_settings')
        .delete()
        .eq('organization_id', selectedOrganization.id);

      // Insert new settings
      const settingsToInsert = settings
        .filter(setting => setting.defaultLabelId)
        .map(setting => ({
          organization_id: selectedOrganization.id,
          document_type: setting.documentType,
          default_label_id: setting.defaultLabelId
        }));

      if (settingsToInsert.length > 0) {
        const { error } = await supabase
          .from('document_settings')
          .insert(settingsToInsert);

        if (error) throw error;
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
                    value={setting.defaultLabelId || ''}
                    onValueChange={(value) => handleLabelChange(setting.documentType, value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer label" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Geen label</SelectItem>
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
