
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Brain,
  AlertCircle
} from 'lucide-react';

interface AIInstruction {
  id: string;
  instruction_type: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AIInstructionsSettings = () => {
  const [instructions, setInstructions] = useState<AIInstruction[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInstruction, setNewInstruction] = useState({
    instruction_type: '',
    instructions: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchInstructions = async () => {
    if (!selectedOrganization || !user) return;

    setLoading(true);
    try {
      console.log('🤖 Fetching AI instructions for org:', selectedOrganization.id);
      
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

  const saveInstruction = async () => {
    if (!selectedOrganization || !user) {
      toast({
        title: "Fout",
        description: "Je moet ingelogd zijn en een organisatie geselecteerd hebben",
        variant: "destructive"
      });
      return;
    }

    if (!newInstruction.instruction_type.trim() || !newInstruction.instructions.trim()) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🤖 Saving new AI instruction:', newInstruction);
      
      const instructionData = {
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        instruction_type: newInstruction.instruction_type.trim(),
        instructions: newInstruction.instructions.trim(),
        created_by: user.id,
        is_active: true
      };

      console.log('🤖 Instruction data to insert:', instructionData);

      const { data, error } = await supabase
        .from('ai_settings')
        .insert([instructionData])
        .select();

      if (error) {
        console.error('❌ Error inserting AI instruction:', error);
        throw error;
      }

      console.log('✅ AI instruction saved:', data);

      toast({
        title: "Succes",
        description: "AI instructie succesvol toegevoegd"
      });

      setNewInstruction({ instruction_type: '', instructions: '' });
      setShowAddForm(false);
      fetchInstructions();
    } catch (error) {
      console.error('Error saving AI instruction:', error);
      toast({
        title: "Fout",
        description: "Kon AI instructie niet opslaan",
        variant: "destructive"
      });
    }
  };

  const updateInstruction = async (id: string, updates: Partial<AIInstruction>) => {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "AI instructie bijgewerkt"
      });

      setEditingId(null);
      fetchInstructions();
    } catch (error) {
      console.error('Error updating AI instruction:', error);
      toast({
        title: "Fout",
        description: "Kon AI instructie niet bijwerken",
        variant: "destructive"
      });
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

  useEffect(() => {
    fetchInstructions();
  }, [selectedOrganization, selectedWorkspace]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Instructies</h2>
          <p className="text-muted-foreground">
            Beheer instructies voor AI-gestuurde functies
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Instructie
        </Button>
      </div>

      {/* Add New Instruction Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Nieuwe AI Instructie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instruction-type">Type Instructie</Label>
              <Input
                id="instruction-type"
                value={newInstruction.instruction_type}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, instruction_type: e.target.value }))}
                placeholder="Bijv. email_reply, document_generation, etc."
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructies</Label>
              <Textarea
                id="instructions"
                value={newInstruction.instructions}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Beschrijf hier hoe de AI zich moet gedragen..."
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveInstruction}>
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false);
                setNewInstruction({ instruction_type: '', instructions: '' });
              }}>
                <X className="h-4 w-4 mr-2" />
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions List */}
      {loading ? (
        <div className="text-center py-8">
          <p>AI instructies laden...</p>
        </div>
      ) : instructions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Geen AI instructies gevonden</p>
            <p className="text-sm text-muted-foreground mt-2">
              Voeg je eerste AI instructie toe om te beginnen
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {instructions.map((instruction) => (
            <Card key={instruction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    <CardTitle className="text-lg">{instruction.instruction_type}</CardTitle>
                    <Badge variant={instruction.is_active ? "default" : "secondary"}>
                      {instruction.is_active ? "Actief" : "Inactief"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingId(instruction.id)}
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
              </CardHeader>
              <CardContent>
                {editingId === instruction.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={instruction.instructions}
                      onChange={(e) => {
                        const updatedInstructions = instructions.map(inst => 
                          inst.id === instruction.id 
                            ? { ...inst, instructions: e.target.value }
                            : inst
                        );
                        setInstructions(updatedInstructions);
                      }}
                      rows={6}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => updateInstruction(instruction.id, { 
                          instructions: instruction.instructions 
                        })}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Opslaan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuleren
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">
                    {instruction.instructions}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-4">
                  Aangemaakt: {new Date(instruction.created_at).toLocaleDateString('nl-NL')}
                  {instruction.updated_at !== instruction.created_at && (
                    <span> • Bijgewerkt: {new Date(instruction.updated_at).toLocaleDateString('nl-NL')}</span>
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
