
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface InvoiceSettings {
  default_payment_terms: number;
  default_vat_rate: number;
  invoice_prefix: string;
  invoice_start_number: number;
  quote_prefix: string;
  quote_start_number: number;
  contact_prefix: string;
  contact_start_number: number;
}

export const InvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings>({
    default_payment_terms: 30,
    default_vat_rate: 21,
    invoice_prefix: '',
    invoice_start_number: 1,
    quote_prefix: '',
    quote_start_number: 1,
    contact_prefix: '',
    contact_start_number: 1,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization]);

  const fetchSettings = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          default_payment_terms: 30,
          default_vat_rate: 21,
          invoice_prefix: data.invoice_prefix || '',
          invoice_start_number: data.invoice_start_number || 1,
          quote_prefix: data.quote_prefix || '',
          quote_start_number: data.quote_start_number || 1,
          contact_prefix: data.contact_prefix || '',
          contact_start_number: data.contact_start_number || 1,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedOrganization) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: selectedOrganization.id,
          invoice_prefix: settings.invoice_prefix,
          invoice_start_number: settings.invoice_start_number,
          quote_prefix: settings.quote_prefix,
          quote_start_number: settings.quote_start_number,
          contact_prefix: settings.contact_prefix,
          contact_start_number: settings.contact_start_number,
        });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Instellingen succesvol opgeslagen"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Facturatie Instellingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_payment_terms">Standaard betalingstermijn (dagen)</Label>
              <Input
                id="default_payment_terms"
                type="number"
                value={settings.default_payment_terms}
                onChange={(e) => setSettings(prev => ({ ...prev, default_payment_terms: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="default_vat_rate">Standaard BTW-tarief (%)</Label>
              <Input
                id="default_vat_rate"
                type="number"
                value={settings.default_vat_rate}
                onChange={(e) => setSettings(prev => ({ ...prev, default_vat_rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_prefix">Factuur voorvoegsel</Label>
              <Input
                id="invoice_prefix"
                value={settings.invoice_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                placeholder="bijv. 2025-"
              />
            </div>
            <div>
              <Label htmlFor="invoice_start_number">Factuur startnummer</Label>
              <Input
                id="invoice_start_number"
                type="number"
                value={settings.invoice_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, invoice_start_number: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quote_prefix">Offerte voorvoegsel</Label>
              <Input
                id="quote_prefix"
                value={settings.quote_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, quote_prefix: e.target.value }))}
                placeholder="bijv. OFF-2025-"
              />
            </div>
            <div>
              <Label htmlFor="quote_start_number">Offerte startnummer</Label>
              <Input
                id="quote_start_number"
                type="number"
                value={settings.quote_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, quote_start_number: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_prefix">Contact voorvoegsel</Label>
              <Input
                id="contact_prefix"
                value={settings.contact_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_prefix: e.target.value }))}
                placeholder="optioneel"
              />
            </div>
            <div>
              <Label htmlFor="contact_start_number">Contact startnummer</Label>
              <Input
                id="contact_start_number"
                type="number"
                value={settings.contact_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_start_number: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Opslaan...' : 'Instellingen opslaan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
