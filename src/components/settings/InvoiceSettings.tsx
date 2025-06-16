
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
}

export const InvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings>({
    default_payment_terms: 30,
    default_vat_rate: 21,
    invoice_prefix: '',
    invoice_start_number: 1,
    quote_prefix: '',
    quote_start_number: 1,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, [selectedOrganization]);

  // PUNT 3: Automatische nummering ophalen uit database
  const fetchCurrentNumbers = async () => {
    if (!selectedOrganization) return { invoice: 1, quote: 1 };

    try {
      console.log('📊 PUNT 3: Huidige nummers ophalen voor organisatie:', selectedOrganization.id);
      
      // Huidige hoogste factuurnummer ophalen
      const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Huidige hoogste offertenummer ophalen
      const { data: quotes } = await supabase
        .from('quotes')
        .select('quote_number')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextInvoiceNumber = 1;
      let nextQuoteNumber = 1;

      // Parse hoogste factuurnummer
      if (invoices && invoices.length > 0 && invoices[0].invoice_number) {
        const match = invoices[0].invoice_number.match(/(\d+)$/);
        if (match) {
          nextInvoiceNumber = parseInt(match[1]) + 1;
        }
      }

      // Parse hoogste offertenummer
      if (quotes && quotes.length > 0 && quotes[0].quote_number) {
        const match = quotes[0].quote_number.match(/(\d+)$/);
        if (match) {
          nextQuoteNumber = parseInt(match[1]) + 1;
        }
      }

      console.log('📊 PUNT 3: Huidige nummers opgehaald:', {
        nextInvoiceNumber,
        nextQuoteNumber
      });

      return {
        invoice: nextInvoiceNumber,
        quote: nextQuoteNumber
      };
    } catch (error) {
      console.error('📊 PUNT 3: Fout bij ophalen huidige nummers:', error);
      return { invoice: 1, quote: 1 };
    }
  };

  const fetchSettings = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📊 PUNT 3: Instellingen ophalen voor organisatie:', selectedOrganization.id);
      
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // PUNT 3: Automatische nummering ophalen
      const currentNumbers = await fetchCurrentNumbers();

      if (data) {
        setSettings({
          default_payment_terms: 30,
          default_vat_rate: 21,
          invoice_prefix: data.invoice_prefix || '',
          invoice_start_number: currentNumbers.invoice,  // Automatisch bijgewerkt
          quote_prefix: data.quote_prefix || '',
          quote_start_number: currentNumbers.quote,      // Automatisch bijgewerkt
        });
      } else {
        // Geen instellingen gevonden, gebruik automatische nummering
        setSettings(prev => ({
          ...prev,
          invoice_start_number: currentNumbers.invoice,
          quote_start_number: currentNumbers.quote,
        }));
      }
    } catch (error) {
      console.error('📊 PUNT 3: Fout bij ophalen instellingen:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // PUNT 4: Werkende opslaan functie
  const handleSave = async () => {
    if (!selectedOrganization) {
      console.error('💾 PUNT 4: Geen organisatie geselecteerd');
      toast({
        title: "Fout", 
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      console.log('💾 PUNT 4: Instellingen opslaan voor organisatie:', selectedOrganization.id);
      console.log('💾 PUNT 4: Settings data:', settings);
      
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: selectedOrganization.id,
          invoice_prefix: settings.invoice_prefix,
          invoice_start_number: settings.invoice_start_number,
          quote_prefix: settings.quote_prefix,
          quote_start_number: settings.quote_start_number,
        }, {
          onConflict: 'organization_id'
        });

      if (error) {
        console.error('💾 PUNT 4: Database fout bij opslaan:', error);
        throw error;
      }

      console.log('💾 PUNT 4: Instellingen succesvol opgeslagen');
      
      toast({
        title: "Succes",
        description: "Instellingen succesvol opgeslagen"
      });
    } catch (error) {
      console.error('💾 PUNT 4: Fout bij opslaan instellingen:', error);
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
              <Label htmlFor="invoice_start_number">Factuur startnummer (automatisch bijgewerkt)</Label>
              <Input
                id="invoice_start_number"
                type="number"
                value={settings.invoice_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, invoice_start_number: parseInt(e.target.value) || 1 }))}
                className="bg-blue-50"
              />
              <p className="text-xs text-gray-500 mt-1">Wordt automatisch bijgewerkt naar het volgende beschikbare nummer</p>
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
              <Label htmlFor="quote_start_number">Offerte startnummer (automatisch bijgewerkt)</Label>
              <Input
                id="quote_start_number"
                type="number"
                value={settings.quote_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, quote_start_number: parseInt(e.target.value) || 1 }))}
                className="bg-blue-50"
              />
              <p className="text-xs text-gray-500 mt-1">Wordt automatisch bijgewerkt naar het volgende beschikbare nummer</p>
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
