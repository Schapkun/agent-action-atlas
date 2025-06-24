
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
  FileText,
  Mail,
  Phone
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
  const [isAdding, setIsAdding] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const instructionTypes = [
    { value: 'email_processing', label: 'E-mail Verwerking', icon: Mail },
    { value: 'document_generation', label: 'Document Generatie', icon: FileText },
    { value: 'phone_call_processing', label: 'Telefoongesprek Verwerking', icon: Phone },
    { value: 'general', label: 'Algemeen', icon: Brain }
  ];

  const fetchInstructions = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      let query = supabase
        .from('ai_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;

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

  useEffect(() => {
    fetchInstructions();
  }, [selectedOrganization, selectedWorkspace]);

  const handleSaveInstruction = async (instruction: AIInstruction) => {
    if (!selectedOrganization || !user) return;

    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({
          instructions: instruction.instructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', instruction.id);

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

  const handleAddInstruction = async () => {
    if (!selectedOrganization || !user || !newInstruction.instruction_type || !newInstruction.instructions) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_settings')
        .insert({
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id,
          instruction_type: newInstruction.instruction_type,
          instructions: newInstruction.instructions,
          created_by: user.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "AI instructie toegevoegd"
      });

      setNewInstruction({ instruction_type: '', instructions: '' });
      setIsAdding(false);
      fetchInstructions();
    } catch (error) {
      console.error('Error adding AI instruction:', error);
      toast({
        title: "Fout",
        description: "Kon AI instructie niet toevoegen",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInstruction = async (id: string) => {
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

  const toggleActive = async (instruction: AIInstruction) => {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({ is_active: !instruction.is_active })
        .eq('id', instruction.id);

      if (error) throw error;

      fetchInstructions();
    } catch (error) {
      console.error('Error toggling instruction status:', error);
      toast({
        title: "Fout",
        description: "Kon status niet wijzigen",
        variant: "destructive"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const found = instructionTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeIcon = (type: string) => {
    const found = instructionTypes.find(t => t.value === type);
    return found ? found.icon : Brain;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Instructies</h2>
          <p className="text-muted-foreground">
            Configureer hoe de AI moet reageren in verschillende situaties
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Instructie
        </Button>
      </div>

      {/* Add New Instruction */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe AI Instructie Toevoegen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instruction-type">Type</Label>
              <select
                id="instruction-type"
                value={newInstruction.instruction_type}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, instruction_type: e.target.value }))}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="">Selecteer type...</option>
                {instructionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="instructions">Instructies</Label>
              <Textarea
                id="instructions"
                value={newInstruction.instructions}
                onChange={(e) => setNewInstruction(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Beschrijf hoe de AI moet handelen..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddInstruction}>
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions List */}
      {loading ? (
        <div className="text-center py-8">AI instructies laden...</div>
      ) : instructions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nog geen AI instructies geconfigureerd</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {instructions.map((instruction) => {
            const TypeIcon = getTypeIcon(instruction.instruction_type);
            const isEditing = editingId === instruction.id;
            
            return (
              <Card key={instruction.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          {getTypeLabel(instruction.instruction_type)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={instruction.is_active ? "default" : "secondary"}>
                            {instruction.is_active ? 'Actief' : 'Inactief'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Aangemaakt: {new Date(instruction.created_at).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(instruction)}
                      >
                        {instruction.is_active ? 'Deactiveren' : 'Activeren'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(isEditing ? null : instruction.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteInstruction(instruction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        value={instruction.instructions}
                        onChange={(e) => {
                          const updated = instructions.map(inst => 
                            inst.id === instruction.id 
                              ? { ...inst, instructions: e.target.value }
                              : inst
                          );
                          setInstructions(updated);
                        }}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveInstruction(instruction)}>
                          <Save className="h-4 w-4 mr-2" />
                          Opslaan
                        </Button>
                        <Button variant="outline" onClick={() => setEditingId(null)}>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
