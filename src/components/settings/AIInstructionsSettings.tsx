
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Brain, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

interface AIInstruction {
  id: string;
  instruction_type: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization_id: string;
  workspace_id?: string;
  created_by?: string;
}

const instructionTypes = [
  { value: 'email_reply', label: 'E-mail Antwoorden' },
  { value: 'task_creation', label: 'Taak Aanmaken' },
  { value: 'document_generation', label: 'Document Generatie' },
  { value: 'client_communication', label: 'Cliënt Communicatie' },
  { value: 'general', label: 'Algemeen' }
];

export const AIInstructionsSettings = () => {
  const [instructions, setInstructions] = useState<AIInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInstruction, setNewInstruction] = useState({
    instruction_type: 'general',
    instructions: ''
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInstructions = async () => {
    if (!selectedOrganization) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Fetching AI instructions for organization:', selectedOrganization.id);

      let query = supabase
        .from('ai_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching AI instructions:', error);
        setError(`Fout bij ophalen: ${error.message}`);
        throw error;
      }

      console.log('📋 AI instructions fetched:', data?.length || 0);
      setInstructions(data || []);
    } catch (error: any) {
      console.error('❌ Error in fetchInstructions:', error);
      toast({
        title: "Fout",
        description: `Kon AI instructies niet ophalen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInstruction = async (instructionId?: string) => {
    if (!selectedOrganization || !user) return;

    const isNew = !instructionId;
    const instructionData = isNew ? newInstruction : 
      instructions.find(inst => inst.id === instructionId);

    if (!instructionData?.instructions.trim()) {
      toast({
        title: "Fout",
        description: "Voer instructies in",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (isNew) {
        console.log('🆕 Creating new AI instruction');
        
        const { data, error } = await supabase
          .from('ai_settings')
          .insert({
            organization_id: selectedOrganization.id,
            workspace_id: selectedWorkspace?.id,
            instruction_type: instructionData.instruction_type,
            instructions: instructionData.instructions,
            is_active: true,
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        setInstructions(prev => [data, ...prev]);
        setNewInstruction({ instruction_type: 'general', instructions: '' });
        setShowNewForm(false);

        toast({
          title: "Succes",
          description: "AI instructie aangemaakt"
        });
      } else {
        console.log('💾 Updating AI instruction:', instructionId);

        const { data, error } = await supabase
          .from('ai_settings')
          .update({
            instructions: instructionData.instructions,
            updated_at: new Date().toISOString()
          })
          .eq('id', instructionId)
          .select()
          .single();

        if (error) throw error;

        setInstructions(prev => prev.map(inst => 
          inst.id === instructionId ? data : inst
        ));

        toast({
          title: "Succes",
          description: "AI instructie bijgewerkt"
        });
      }
    } catch (error: any) {
      console.error('❌ Error saving instruction:', error);
      toast({
        title: "Fout",
        description: `Kon instructie niet opslaan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteInstruction = async (instructionId: string) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('ai_settings')
        .delete()
        .eq('id', instructionId);

      if (error) throw error;

      setInstructions(prev => prev.filter(inst => inst.id !== instructionId));

      toast({
        title: "Succes",
        description: "AI instructie verwijderd"
      });
    } catch (error: any) {
      console.error('❌ Error deleting instruction:', error);
      toast({
        title: "Fout",
        description: `Kon instructie niet verwijderen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateInstructionText = (instructionId: string, text: string) => {
    setInstructions(prev => prev.map(inst => 
      inst.id === instructionId 
        ? { ...inst, instructions: text }
        : inst
    ));
  };

  const toggleActive = async (instructionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({ is_active: !isActive })
        .eq('id', instructionId);

      if (error) throw error;

      setInstructions(prev => prev.map(inst => 
        inst.id === instructionId 
          ? { ...inst, is_active: !isActive }
          : inst
      ));

      toast({
        title: "Succes",
        description: `Instructie ${!isActive ? 'geactiveerd' : 'gedeactiveerd'}`
      });
    } catch (error: any) {
      console.error('❌ Error toggling instruction:', error);
      toast({
        title: "Fout",
        description: "Kon status niet wijzigen",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      fetchInstructions();
    }
  }, [selectedOrganization, selectedWorkspace]);

  const getTypeLabel = (type: string) => {
    return instructionTypes.find(t => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Instructies
          </h2>
          <p className="text-sm text-muted-foreground">
            Configureer AI gedrag voor verschillende scenario's
          </p>
        </div>

        <Button onClick={() => setShowNewForm(true)} disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Instructie
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nieuwe AI Instructie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={newInstruction.instruction_type}
                onValueChange={(value) => 
                  setNewInstruction(prev => ({ ...prev, instruction_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {instructionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instructies</label>
              <Textarea
                value={newInstruction.instructions}
                onChange={(e) => 
                  setNewInstruction(prev => ({ ...prev, instructions: e.target.value }))
                }
                placeholder="Voer AI instructies in..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => saveInstruction()}
                disabled={saving || !newInstruction.instructions.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Opslaan...' : 'Opslaan'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewForm(false);
                  setNewInstruction({ instruction_type: 'general', instructions: '' });
                }}
              >
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {instructions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nog geen AI instructies geconfigureerd</p>
            {!showNewForm && (
              <Button 
                className="mt-4" 
                onClick={() => setShowNewForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Eerste Instructie Toevoegen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {instructions.map((instruction) => (
            <Card key={instruction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {getTypeLabel(instruction.instruction_type)}
                    </CardTitle>
                    <Badge 
                      variant={instruction.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleActive(instruction.id, instruction.is_active)}
                    >
                      {instruction.is_active ? 'Actief' : 'Inactief'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveInstruction(instruction.id)}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteInstruction(instruction.id)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={instruction.instructions}
                  onChange={(e) => updateInstructionText(instruction.id, e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  Aangemaakt: {new Date(instruction.created_at).toLocaleDateString('nl-NL')}
                  {instruction.updated_at !== instruction.created_at && (
                    <> • Bijgewerkt: {new Date(instruction.updated_at).toLocaleDateString('nl-NL')}</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
