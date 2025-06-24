
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Edit, Trash2, Save } from 'lucide-react';

interface AIInstruction {
  id: string;
  instruction_type: string;
  instructions: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const INSTRUCTION_TYPES = [
  { value: 'email_response', label: 'E-mail Response', description: 'Instructies voor automatische e-mail antwoorden' },
  { value: 'task_creation', label: 'Taak Aanmaak', description: 'Instructies voor automatische taak aanmaak' },
  { value: 'document_generation', label: 'Document Generatie', description: 'Instructies voor automatische document aanmaak' },
  { value: 'client_communication', label: 'Cliënt Communicatie', description: 'Instructies voor cliënt interacties' },
  { value: 'case_analysis', label: 'Zaak Analyse', description: 'Instructies voor zaak analyse en advies' },
  { value: 'general', label: 'Algemeen', description: 'Algemene AI instructies en gedrag' }
];

export const AIInstructionsSettings = () => {
  const [instructions, setInstructions] = useState<AIInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const [newInstruction, setNewInstruction] = useState({
    instruction_type: '',
    instructions: ''
  });

  const fetchInstructions = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('🤖 Fetching AI instructions for organization:', selectedOrganization.id);
      
      let query = supabase
        .from('ai_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true)
        .order('instruction_type');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching AI instructions:', error);
        throw error;
      }

      console.log('🤖 AI instructions fetched:', data?.length || 0);
      setInstructions(data || []);
    } catch (error) {
      console.error('Error fetching AI instructions:', error);
      toast({
        title: "Fout",
        description: "Kon AI instructies niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInstruction = async (instruction: Partial<AIInstruction>) => {
    if (!selectedOrganization) return;

    setSaving(true);
    try {
      const instructionData = {
        instruction_type: instruction.instruction_type,
        instructions: instruction.instructions,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        is_active: true
      };

      let result;
      if (instruction.id) {
        // Update existing
        result = await supabase
          .from('ai_settings')
          .update({
            ...instructionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', instruction.id);
      } else {
        // Create new
        result = await supabase
          .from('ai_settings')
          .insert([instructionData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Succes",
        description: `AI instructie ${instruction.id ? 'bijgewerkt' : 'toegevoegd'}`
      });

      setEditingId(null);
      setShowNewForm(false);
      setNewInstruction({ instruction_type: '', instructions: '' });
      fetchInstructions();
    } catch (error) {
      console.error('Error saving AI instruction:', error);
      toast({
        title: "Fout",
        description: "Kon AI instructie niet opslaan",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteInstruction = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze AI instructie wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('ai_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "AI instructie verwijderd"
      });

      fetchInstructions();
    } catch (error) {
      console.error('Error deleting AI instruction:', error);
      toast({
        title: "Fout",
        description: "Kon AI instructie niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    return INSTRUCTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeDescription = (type: string) => {
    return INSTRUCTION_TYPES.find(t => t.value === type)?.description || '';
  };

  const getAvailableTypes = () => {
    const usedTypes = instructions.map(i => i.instruction_type);
    return INSTRUCTION_TYPES.filter(type => !usedTypes.includes(type.value));
  };

  useEffect(() => {
    fetchInstructions();
  }, [selectedOrganization, selectedWorkspace]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>AI instructies laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">AI Instructies</h3>
          <p className="text-sm text-muted-foreground">
            Configureer hoe de AI moet reageren in verschillende situaties.
          </p>
        </div>
        
        {getAvailableTypes().length > 0 && (
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Instructie
          </Button>
        )}
      </div>

      <Alert>
        <AlertDescription>
          AI instructies helpen het systeem om consistente en accurate responses te geven. 
          Hoe specifieker je instructies, hoe beter de AI kan presteren.
        </AlertDescription>
      </Alert>

      {/* New Instruction Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe AI Instructie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <Select 
                value={newInstruction.instruction_type} 
                onValueChange={(value) => setNewInstruction(prev => ({ ...prev, instruction_type: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecteer een type..." />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border shadow-lg z-[100] max-h-[300px] overflow-y-auto"
                  position="popper"
                  sideOffset={5}
                >
                  {getAvailableTypes().map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value} 
                      className="cursor-pointer hover:bg-gray-50 p-3"
                    >
                      <div className="w-full">
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instructies *</label>
              <Textarea
                value={newInstruction.instructions}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Beschrijf hoe de AI moet reageren..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => saveInstruction(newInstruction)}
                disabled={!newInstruction.instruction_type || !newInstruction.instructions.trim() || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Opslaan
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions List */}
      <div className="space-y-4">
        {instructions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nog geen AI instructies geconfigureerd. Voeg je eerste instructie toe!
              </p>
            </CardContent>
          </Card>
        ) : (
          instructions.map((instruction) => (
            <Card key={instruction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{getTypeLabel(instruction.instruction_type)}</CardTitle>
                    <Badge variant="outline">{instruction.instruction_type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(editingId === instruction.id ? null : instruction.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteInstruction(instruction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getTypeDescription(instruction.instruction_type)}
                </p>
              </CardHeader>
              <CardContent>
                {editingId === instruction.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={instruction.instructions}
                      onChange={(e) => {
                        setInstructions(prev => 
                          prev.map(i => 
                            i.id === instruction.id 
                              ? { ...i, instructions: e.target.value }
                              : i
                          )
                        );
                      }}
                      rows={6}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => saveInstruction(instruction)}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Opslaan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingId(null);
                          fetchInstructions(); // Reset changes
                        }}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">
                    {instruction.instructions}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {getAvailableTypes().length === 0 && instructions.length > 0 && (
        <Alert>
          <AlertDescription>
            Alle beschikbare AI instructie types zijn geconfigureerd. 
            Je kunt bestaande instructies bewerken of verwijderen om nieuwe toe te voegen.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
