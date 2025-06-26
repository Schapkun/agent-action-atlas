
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  notes?: string;
  hourly_rate?: number;
  is_billable: boolean;
  user_name: string;
}

interface DossierTimeTrackingProps {
  dossierId: string;
  dossierName: string;
}

export const DossierTimeTracking = ({ dossierId, dossierName }: DossierTimeTrackingProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    notes: '',
    hourly_rate: '',
    is_billable: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('dossier_time_entries')
        .insert({
          dossier_id: dossierId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null,
          date: formData.date,
          hours: parseFloat(formData.hours),
          description: formData.description,
          notes: formData.notes || null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          is_billable: formData.is_billable
        });

      if (error) throw error;

      toast({
        title: "Tijd geregistreerd",
        description: `${formData.hours} uur toegevoegd aan ${dossierName}`
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        notes: '',
        hourly_rate: '',
        is_billable: true
      });
      setIsDialogOpen(false);
      
      // Refresh time entries would go here
    } catch (error) {
      console.error('Error adding time entry:', error);
      toast({
        title: "Fout",
        description: "Kon tijd niet registreren",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Tijdsregistratie</h3>
            <p className="text-sm text-slate-600">Bestede uren en werkzaamheden</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tijd Toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tijd Registreren - {dossierName}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hours">Uren *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                    placeholder="2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Werkzaamheden *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschrijving van uitgevoerde werkzaamheden..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Aanvullende notities..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate">Uurtarief (€)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    placeholder="150.00"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_billable"
                    checked={formData.is_billable}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_billable: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_billable">Declarabel</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Bezig...' : 'Registreren'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {timeEntries.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">Nog geen tijdsregistraties voor dit dossier.</p>
            <p className="text-sm text-slate-400">Klik op "Tijd Toevoegen" om te beginnen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(entry.date).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{entry.hours}h</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <span>{entry.user_name}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{entry.description}</p>
                  {entry.notes && (
                    <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entry.hourly_rate && (
                    <Badge variant="secondary">
                      €{(entry.hours * entry.hourly_rate).toFixed(2)}
                    </Badge>
                  )}
                  <Badge variant={entry.is_billable ? "default" : "outline"}>
                    {entry.is_billable ? 'Declarabel' : 'Intern'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
