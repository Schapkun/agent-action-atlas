
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

  // PUNT 3: Automatische nummering ophalen uit database
  const fetchCurrentNumbers = async () => {
    if (!selectedOrganization) return { invoice: 1, quote: 1, contact: 1 };

    try {
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

      // Huidige hoogste contactnummer ophalen
      const { data: contacts } = await supabase
        .from('clients')
        .select('contact_number')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextInvoiceNumber = 1;
      let nextQuoteNumber = 1;
      let nextContactNumber = 1;

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

      // Parse hoogste contactnummer
      if (contacts && contacts.length > 0 && contacts[0].contact_number) {
        const match = contacts[0].contact_number.match(/(\d+)$/);
        if (match) {
          nextContactNumber = parseInt(match[1]) + 1;
        }
      }

      console.log('📊 PUNT 3: Huidige nummers opgehaald:', {
        nextInvoiceNumber,
        nextQuoteNumber, 
        nextContactNumber
      });

      return {
        invoice: nextInvoiceNumber,
        quote: nextQuoteNumber,
        contact: nextContactNumber
      };
    } catch (error) {
      console.error('📊 PUNT 3: Fout bij ophalen huidige nummers:', error);
      return { invoice: 1, quote: 1, contact: 1 };
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
          contact_prefix: data.contact_prefix || '',
          contact_start_number: currentNumbers.contact,  // Automatisch bijgewerkt
        });
      } else {
        // Geen instellingen gevonden, gebruik automatische nummering
        setSettings(prev => ({
          ...prev,
          invoice_start_number: currentNumbers.invoice,
          quote_start_number: currentNumbers.quote,
          contact_start_number: currentNumbers.contact,
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

  // PUNT 3: Werkende opslaan functie
  const handleSave = async () => {
    if (!selectedOrganization) return;

    setSaving(true);
    try {
      console.log('💾 PUNT 3: Instellingen opslaan:', settings);
      
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
        }, {
          onConflict: 'organization_id'
        });

      if (error) {
        console.error('💾 PUNT 3: Database fout bij opslaan:', error);
        throw error;
      }

      console.log('💾 PUNT 3: Instellingen succesvol opgeslagen');
      
      toast({
        title: "Succes",
        description: "Instellingen succesvol opgeslagen"
      });
    } catch (error) {
      console.error('💾 PUNT 3: Fout bij opslaan instellingen:', error);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_prefix">Contact voorvoegsel</Label>
              <Input
                id="contact_prefix"
                value={settings.contact_prefix}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_prefix: e.target.value }))}
                placeholder="optioneel"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Functie uitgeschakeld zoals gevraagd</p>
            </div>
            <div>
              <Label htmlFor="contact_start_number">Contact startnummer (automatisch bijgewerkt)</Label>
              <Input
                id="contact_start_number"
                type="number"
                value={settings.contact_start_number}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_start_number: parseInt(e.target.value) || 1 }))}
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
