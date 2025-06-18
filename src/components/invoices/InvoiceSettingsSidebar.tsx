
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [productsDisplay, setProductsDisplay] = useState('incl_btw');

  // Synchroniseer state met selectedContact data
  useEffect(() => {
    if (selectedContact) {
      setVatReversed(selectedContact.vat_reversed || false);
      setProductsDisplay(selectedContact.products_display || 'incl_btw');
    }
  }, [selectedContact]);

  if (!show) return null;

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
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Klantinstellingen</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedContact ? (
            <div className="text-sm text-gray-600">
              Contact: <strong>{selectedContact.name}</strong>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Geen contact geselecteerd
            </div>
          )}
        </div>

        {selectedContact ? (
          <div className="flex-1 p-4 space-y-4">
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
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <p className="text-sm">Selecteer eerst een contact om instellingen te wijzigen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
