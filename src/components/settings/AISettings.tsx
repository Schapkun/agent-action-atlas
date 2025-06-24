
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Save, FileText, Mail, Sparkles } from 'lucide-react';

interface AISetting {
  id: string;
  instruction_type: string;
  instructions: string;
  is_active: boolean;
}

export const AISettings = () => {
  const [settings, setSettings] = useState<AISetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    general: { instructions: '', is_active: true },
    document_generation: { instructions: '', is_active: true },
    email_responses: { instructions: '', is_active: true }
  });

  const fetchSettings = async () => {
    if (!selectedOrganization) return;

    try {
      let query = supabase
        .from('ai_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id);

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      } else {
        query = query.is('workspace_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSettings(data || []);

      // Update form data with existing settings
      const newFormData = { ...formData };
      data?.forEach(setting => {
        if (setting.instruction_type in newFormData) {
          newFormData[setting.instruction_type as keyof typeof newFormData] = {
            instructions: setting.instructions,
            is_active: setting.is_active
          };
        }
      });
      setFormData(newFormData);

    } catch (error: any) {
      console.error('Error fetching AI settings:', error);
      toast({
        title: "Fout",
        description: "Kon AI instellingen niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!selectedOrganization) return;

    setSaving(true);
    try {
      // Delete existing settings for this org/workspace
      let deleteQuery = supabase
        .from('ai_settings')
        .delete()
        .eq('organization_id', selectedOrganization.id);

      if (selectedWorkspace) {
        deleteQuery = deleteQuery.eq('workspace_id', selectedWorkspace.id);
      } else {
        deleteQuery = deleteQuery.is('workspace_id', null);
      }

      await deleteQuery;

      // Insert new settings
      const settingsToInsert = Object.entries(formData)
        .filter(([_, data]) => data.instructions.trim() !== '')
        .map(([type, data]) => ({
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null,
          instruction_type: type,
          instructions: data.instructions,
          is_active: data.is_active
        }));

      if (settingsToInsert.length > 0) {
        const { error } = await supabase
          .from('ai_settings')
          .insert(settingsToInsert);

        if (error) throw error;
      }

      toast({
        title: "Opgeslagen",
        description: "AI instellingen zijn succesvol opgeslagen"
      });

      fetchSettings();
    } catch (error: any) {
      console.error('Error saving AI settings:', error);
      toast({
        title: "Fout",
        description: "Kon AI instellingen niet opslaan",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (type: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof prev],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization, selectedWorkspace]);

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const exampleInstructions = {
    general: "Je bent een professionele assistent voor een advocatenkantoor. Wees altijd beleefd, formeel en juridisch accuraat in je antwoorden.",
    document_generation: "Bij het genereren van documenten, gebruik altijd de officiële bedrijfsstijl. Zorg ervoor dat alle juridische clausules compleet zijn en verwijs naar relevante wetgeving.",
    email_responses: "Beantwoord e-mails professioneel en tijdig. Begin altijd met een gepaste begroeting en sluit af met vriendelijke groeten. Verwijs altijd naar het dossiernummer als relevant."
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">AI instellingen laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Instellingen
          </h2>
          <p className="text-muted-foreground mt-1">
            Configureer AI instructies voor jouw organisatie
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {getContextInfo()}
        </Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Algemeen
          </TabsTrigger>
          <TabsTrigger value="document_generation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documenten
          </TabsTrigger>
          <TabsTrigger value="email_responses" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Algemene AI Instructies
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Deze instructies worden gebruikt voor alle AI interacties binnen jouw organisatie.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="general-active"
                  checked={formData.general.is_active}
                  onCheckedChange={(checked) => updateFormData('general', 'is_active', checked)}
                />
                <Label htmlFor="general-active">Actief</Label>
              </div>
              
              <div>
                <Label htmlFor="general-instructions">Instructies</Label>
                <Textarea
                  id="general-instructions"
                  value={formData.general.instructions}
                  onChange={(e) => updateFormData('general', 'instructions', e.target.value)}
                  placeholder={exampleInstructions.general}
                  className="min-h-[120px] mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document_generation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Generatie
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Instructies voor het automatisch genereren van documenten zoals contracten, brieven en rapporten.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="doc-active"
                  checked={formData.document_generation.is_active}
                  onCheckedChange={(checked) => updateFormData('document_generation', 'is_active', checked)}
                />
                <Label htmlFor="doc-active">Actief</Label>
              </div>
              
              <div>
                <Label htmlFor="doc-instructions">Instructies</Label>
                <Textarea
                  id="doc-instructions"
                  value={formData.document_generation.instructions}
                  onChange={(e) => updateFormData('document_generation', 'instructions', e.target.value)}
                  placeholder={exampleInstructions.document_generation}
                  className="min-h-[120px] mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email_responses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-mail Antwoorden
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Instructies voor het automatisch beantwoorden van e-mails en het opstellen van concept antwoorden.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-active"
                  checked={formData.email_responses.is_active}
                  onCheckedChange={(checked) => updateFormData('email_responses', 'is_active', checked)}
                />
                <Label htmlFor="email-active">Actief</Label>
              </div>
              
              <div>
                <Label htmlFor="email-instructions">Instructies</Label>
                <Textarea
                  id="email-instructions"
                  value={formData.email_responses.instructions}
                  onChange={(e) => updateFormData('email_responses', 'instructions', e.target.value)}
                  placeholder={exampleInstructions.email_responses}
                  className="min-h-[120px] mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Opslaan...' : 'Instellingen Opslaan'}
        </Button>
      </div>
    </div>
  );
};
