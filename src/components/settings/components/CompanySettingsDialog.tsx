
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface CompanyData {
  company_name: string;
  company_address: string;
  company_postal_code: string;
  company_city: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  company_vat: string;
  company_kvk: string;
  company_bank: string;
}

interface CompanySettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CompanySettingsDialog = ({ open, onClose }: CompanySettingsDialogProps) => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    company_address: '',
    company_postal_code: '',
    company_city: '',
    company_email: '',
    company_phone: '',
    company_website: '',
    company_vat: '',
    company_kvk: '',
    company_bank: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (open && selectedOrganization) {
      loadCompanyData();
    }
  }, [open, selectedOrganization]);

  const loadCompanyData = async () => {
    if (!selectedOrganization) return;
    
    setIsLoading(true);
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
        setCompanyData({
          company_name: data.company_name || '',
          company_address: data.company_address || '',
          company_postal_code: data.company_postal_code || '',
          company_city: data.company_city || '',
          company_email: data.company_email || '',
          company_phone: data.company_phone || '',
          company_website: data.company_website || '',
          company_vat: data.company_vat || '',
          company_kvk: data.company_kvk || '',
          company_bank: data.company_bank || ''
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsgegevens niet laden",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedOrganization) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: selectedOrganization.id,
          ...companyData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Opgeslagen",
        description: "Bedrijfsgegevens succesvol opgeslagen"
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving company data:', error);
      toast({
        title: "Fout",
        description: "Kon bedrijfsgegevens niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Bedrijfsgegevens
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">Laden...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Deze gegevens worden automatisch gebruikt in document templates via shortcodes zoals {{company_name}}, {{company_address}}, etc.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Bedrijfsnaam *</Label>
                <Input
                  id="company_name"
                  value={companyData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Uw bedrijfsnaam"
                />
              </div>

              <div>
                <Label htmlFor="company_email">E-mail</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={companyData.company_email}
                  onChange={(e) => handleInputChange('company_email', e.target.value)}
                  placeholder="info@bedrijf.nl"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="company_address">Adres</Label>
                <Input
                  id="company_address"
                  value={companyData.company_address}
                  onChange={(e) => handleInputChange('company_address', e.target.value)}
                  placeholder="Straat en huisnummer"
                />
              </div>

              <div>
                <Label htmlFor="company_postal_code">Postcode</Label>
                <Input
                  id="company_postal_code"
                  value={companyData.company_postal_code}
                  onChange={(e) => handleInputChange('company_postal_code', e.target.value)}
                  placeholder="1234 AB"
                />
              </div>

              <div>
                <Label htmlFor="company_city">Plaats</Label>
                <Input
                  id="company_city"
                  value={companyData.company_city}
                  onChange={(e) => handleInputChange('company_city', e.target.value)}
                  placeholder="Amsterdam"
                />
              </div>

              <div>
                <Label htmlFor="company_phone">Telefoon</Label>
                <Input
                  id="company_phone"
                  value={companyData.company_phone}
                  onChange={(e) => handleInputChange('company_phone', e.target.value)}
                  placeholder="+31 6 12345678"
                />
              </div>

              <div>
                <Label htmlFor="company_website">Website</Label>
                <Input
                  id="company_website"
                  value={companyData.company_website}
                  onChange={(e) => handleInputChange('company_website', e.target.value)}
                  placeholder="www.bedrijf.nl"
                />
              </div>

              <div>
                <Label htmlFor="company_vat">BTW-nummer</Label>
                <Input
                  id="company_vat"
                  value={companyData.company_vat}
                  onChange={(e) => handleInputChange('company_vat', e.target.value)}
                  placeholder="NL123456789B01"
                />
              </div>

              <div>
                <Label htmlFor="company_kvk">KvK-nummer</Label>
                <Input
                  id="company_kvk"
                  value={companyData.company_kvk}
                  onChange={(e) => handleInputChange('company_kvk', e.target.value)}
                  placeholder="12345678"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="company_bank">Bankrekeningnummer</Label>
                <Input
                  id="company_bank"
                  value={companyData.company_bank}
                  onChange={(e) => handleInputChange('company_bank', e.target.value)}
                  placeholder="NL12 BANK 0123 4567 89"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Annuleren
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
