
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Clock } from 'lucide-react';

export const GeneralSettings = () => {
  const { selectedOrganization } = useOrganization();
  const [redHours, setRedHours] = useState(48);
  const [orangeDays, setOrangeDays] = useState(7);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (selectedOrganization?.id) {
      fetchSettings();
    }
  }, [selectedOrganization]);

  const fetchSettings = async () => {
    if (!selectedOrganization?.id) return;

    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('deadline_red_hours, deadline_orange_days')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setRedHours(data.deadline_red_hours || 48);
        setOrangeDays(data.deadline_orange_days || 7);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: selectedOrganization.id,
          deadline_red_hours: redHours,
          deadline_orange_days: orangeDays,
        }, {
          onConflict: 'organization_id'
        });

      if (error) throw error;

      toast.success('Instellingen succesvol opgeslagen');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Er is een fout opgetreden bij het opslaan van de instellingen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Deadline Waarschuwingen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="redHours">Rood (uren tot vervaldatum)</Label>
              <Input
                id="redHours"
                type="number"
                value={redHours}
                onChange={(e) => setRedHours(Number(e.target.value))}
                min="1"
                max="168"
              />
              <p className="text-xs text-slate-600 mt-1">
                Deadlines worden rood weergegeven als ze binnen dit aantal uren vervallen
              </p>
            </div>

            <div>
              <Label htmlFor="orangeDays">Oranje (dagen tot vervaldatum)</Label>
              <Input
                id="orangeDays"
                type="number"
                value={orangeDays}
                onChange={(e) => setOrangeDays(Number(e.target.value))}
                min="1"
                max="30"
              />
              <p className="text-xs text-slate-600 mt-1">
                Deadlines worden oranje weergegeven als ze binnen dit aantal dagen vervallen
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Opslaan...' : 'Instellingen Opslaan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
