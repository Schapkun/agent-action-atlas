
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  default_footer_text: string;
}

export const InvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings>({
    default_payment_terms: 30,
    default_vat_rate: 21,
    invoice_prefix: '2025-',
    invoice_start_number: 1,
    quote_prefix: 'OFF-2025-',
    quote_start_number: 1,
    default_footer_text: 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%'
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
      console.log('📊 Instellingen ophalen voor organisatie:', selectedOrganization.id);
      
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('📊 Database error:', error);
        throw error;
      }

      if (data) {
        setSettings({
          default_payment_terms: data.default_payment_terms || 30,
          default_vat_rate: data.default_vat_rate || 21,
          invoice_prefix: data.invoice_prefix || '2025-',
          invoice_start_number: data.invoice_start_number || 1,
          quote_prefix: data.quote_prefix || 'OFF-2025-',
          quote_start_number: data.quote_start_number || 1,
          default_footer_text: data.default_footer_text || 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%'
        });
        
        console.log('📊 Instellingen succesvol opgehaald:', data);
      } else {
        console.log('📊 Geen instellingen gevonden, standaardwaarden gebruikt');
      }
    } catch (error) {
      console.error('📊 Fout bij ophalen instellingen:', error);
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
    if (!selectedOrganization) {
      console.error('💾 Geen organisatie geselecteerd');
      toast({
        title: "Fout", 
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Instellingen opslaan voor organisatie:', selectedOrganization.id);
      console.log('💾 Settings data:', settings);
      
      const upsertData = {
        organization_id: selectedOrganization.id,
        default_payment_terms: settings.default_payment_terms,
        default_vat_rate: settings.default_vat_rate,
        invoice_prefix: settings.invoice_prefix,
        invoice_start_number: settings.invoice_start_number,
        quote_prefix: settings.quote_prefix,
        quote_start_number: settings.quote_start_number,
        default_footer_text: settings.default_footer_text,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Upsert data:', upsertData);

      const { data, error } = await supabase
        .from('organization_settings')
        .upsert(upsertData, {
          onConflict: 'organization_id'
        })
        .select();

      if (error) {
        console.error('💾 Database fout bij opslaan:', error);
        console.error('💾 Error details:', error.details, error.hint, error.message);
        throw error;
      }

      console.log('💾 Instellingen succesvol opgeslagen:', data);
      
      toast({
        title: "Succes",
        description: "Instellingen succesvol opgeslagen"
      });
    } catch (error: any) {
      console.error('💾 Fout bij opslaan instellingen:', error);
      toast({
        title: "Fout",
        description: `Kon instellingen niet opslaan: ${error.message || 'Onbekende fout'}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof InvoiceSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Facturatie Instellingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_payment_terms">Standaard betalingstermijn (dagen)</Label>
              <Input
                id="default_payment_terms"
                type="number"
                value={settings.default_payment_terms}
                onChange={(e) => handleInputChange('default_payment_terms', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="default_vat_rate">Standaard BTW-tarief (%)</Label>
              <Input
                id="default_vat_rate"
                type="number"
                step="0.01"
                value={settings.default_vat_rate}
                onChange={(e) => handleInputChange('default_vat_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_prefix">Factuur voorvoegsel</Label>
              <Input
                id="invoice_prefix"
                value={settings.invoice_prefix}
                onChange={(e) => handleInputChange('invoice_prefix', e.target.value)}
                placeholder="bijv. 2025-"
              />
            </div>
            <div>
              <Label htmlFor="invoice_start_number">Factuur startnummer</Label>
              <Input
                id="invoice_start_number"
                type="number"
                value={settings.invoice_start_number}
                onChange={(e) => handleInputChange('invoice_start_number', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500 mt-1">Volgende factuur krijgt dit nummer</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quote_prefix">Offerte voorvoegsel</Label>
              <Input
                id="quote_prefix"
                value={settings.quote_prefix}
                onChange={(e) => handleInputChange('quote_prefix', e.target.value)}
                placeholder="bijv. OFF-2025-"
              />
            </div>
            <div>
              <Label htmlFor="quote_start_number">Offerte startnummer</Label>
              <Input
                id="quote_start_number"
                type="number"
                value={settings.quote_start_number}
                onChange={(e) => handleInputChange('quote_start_number', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500 mt-1">Volgende offerte krijgt dit nummer</p>
            </div>
          </div>

          <div>
            <Label htmlFor="default_footer_text">Standaard footer tekst</Label>
            <Textarea
              id="default_footer_text"
              value={settings.default_footer_text}
              onChange={(e) => handleInputChange('default_footer_text', e.target.value)}
              placeholder="Standaard tekst die onderaan facturen verschijnt"
              className="h-20 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gebruik %INVOICE_NUMBER% om het factuurnummer in te voegen
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Opslaan...' : 'Instellingen opslaan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
