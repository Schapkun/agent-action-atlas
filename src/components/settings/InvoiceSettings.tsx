
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface InvoiceSettings {
  invoice_prefix: string;
  invoice_start_number: number;
  quote_prefix: string;
  quote_start_number: number;
}

export const InvoiceSettings = () => {
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<InvoiceSettings>({
    invoice_prefix: '2025-',
    invoice_start_number: 1,
    quote_prefix: 'OFF-2025-',
    quote_start_number: 1
  });

  const fetchSettings = async () => {
    if (!selectedOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('invoice_prefix, invoice_start_number, quote_prefix, quote_start_number')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          invoice_prefix: data.invoice_prefix || '2025-',
          invoice_start_number: data.invoice_start_number || 1,
          quote_prefix: data.quote_prefix || 'OFF-2025-',
          quote_start_number: data.quote_start_number || 1
        });
      }
    } catch (error) {
      console.error('Error fetching invoice settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: selectedOrganization.id,
          invoice_prefix: settings.invoice_prefix,
          invoice_start_number: settings.invoice_start_number,
          quote_prefix: settings.quote_prefix,
          quote_start_number: settings.quote_start_number
        });

      if (error) throw error;

      toast({
        title: "Instellingen opgeslagen",
        description: "Facturatie instellingen zijn succesvol bijgewerkt"
      });
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Facturatie Instellingen</h2>
        <p className="text-muted-foreground">
          Beheer uw factuur- en offertenummering instellingen.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Facturen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invoice_prefix">Voorvoegsel</Label>
              <Input
                id="invoice_prefix"
                value={settings.invoice_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                placeholder="2025-"
              />
            </div>
            <div>
              <Label htmlFor="invoice_start_number">Startnummer</Label>
              <Input
                id="invoice_start_number"
                type="number"
                value={settings.invoice_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, invoice_start_number: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Voorbeeld: {settings.invoice_prefix}{settings.invoice_start_number.toString().padStart(3, '0')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quote_prefix">Voorvoegsel</Label>
              <Input
                id="quote_prefix"
                value={settings.quote_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, quote_prefix: e.target.value }))}
                placeholder="OFF-2025-"
              />
            </div>
            <div>
              <Label htmlFor="quote_start_number">Startnummer</Label>
              <Input
                id="quote_start_number"
                type="number"
                value={settings.quote_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, quote_start_number: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Voorbeeld: {settings.quote_prefix}{settings.quote_start_number.toString().padStart(3, '0')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? 'Opslaan...' : 'Instellingen Opslaan'}
        </Button>
      </div>
    </div>
  );
};
