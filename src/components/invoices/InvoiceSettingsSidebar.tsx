
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
  selectedContact?: any;
  onContactUpdated?: (contact: any) => void;
}

export const InvoiceSettingsSidebar = ({ show, onClose, selectedContact, onContactUpdated }: InvoiceSettingsSidebarProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vatReversed, setVatReversed] = useState(false);
  const [productsDisplay, setProductsDisplay] = useState(selectedContact?.products_display || 'incl_btw');

  if (!show || !selectedContact) return null;

  const handleVatReversedChange = async (value: boolean) => {
    setVatReversed(value);
    await updateContactSetting('vat_reversed', value);
  };

  const handleProductsDisplayChange = async (value: string) => {
    setProductsDisplay(value);
    await updateContactSetting('products_display', value);
  };

  const updateContactSetting = async (field: string, value: any) => {
    if (!selectedContact?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', selectedContact.id)
        .select()
        .single();

      if (error) throw error;

      if (onContactUpdated) {
        onContactUpdated(data);
      }

      toast({
        title: "Instellingen bijgewerkt",
        description: "Klantinstellingen zijn succesvol opgeslagen"
      });
    } catch (error) {
      console.error('Error updating contact setting:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de instellingen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Klantinstellingen</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          Contact: <strong>{selectedContact.name}</strong>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">Btw verlegd</Label>
            <div className="flex gap-2 mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs ${vatReversed ? 'bg-green-100' : ''}`}
                onClick={() => handleVatReversedChange(true)}
                disabled={loading}
              >
                Ja
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs ${!vatReversed ? 'bg-green-100' : ''}`}
                onClick={() => handleVatReversedChange(false)}
                disabled={loading}
              >
                Nee
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Producten btw</Label>
            <div className="flex gap-2 mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs ${productsDisplay === 'incl_btw' ? 'bg-green-100' : ''}`}
                onClick={() => handleProductsDisplayChange('incl_btw')}
                disabled={loading}
              >
                incl.
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs ${productsDisplay === 'excl_btw' ? 'bg-green-100' : ''}`}
                onClick={() => handleProductsDisplayChange('excl_btw')}
                disabled={loading}
              >
                excl.
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            Deze opties passen de klant instelling aan. Ingevulde periodieke facturen voor deze klant zullen ook aangepast worden.
          </div>
        </div>
      </div>
    </div>
  );
};
