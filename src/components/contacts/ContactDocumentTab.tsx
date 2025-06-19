
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactDocumentTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactDocumentTab = ({ formData, setFormData }: ContactDocumentTabProps) => {
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left column */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Standaard korting</Label>
            <div className="col-span-2 flex gap-2">
              <Input
                type="number"
                value={formData.default_discount || '0'}
                onChange={(e) => handleInputChange('default_discount', parseFloat(e.target.value) || 0)}
                className="text-sm h-8 flex-1"
                placeholder="0"
              />
              <Select 
                value={formData.discount_type || 'percentage'} 
                onValueChange={(value) => handleInputChange('discount_type', value)}
              >
                <SelectTrigger className="w-16 text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="fixed">€</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Producten</Label>
            <div className="col-span-2">
              <Select 
                value={formData.products_display || 'incl_btw'} 
                onValueChange={(value) => handleInputChange('products_display', value)}
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incl_btw">Inclusief btw</SelectItem>
                  <SelectItem value="excl_btw">Exclusief btw</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Betalingstermijn</Label>
            <div className="col-span-2">
              <Select 
                value={formData.payment_terms?.toString() || '30'} 
                onValueChange={(value) => handleInputChange('payment_terms', parseInt(value))}
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dagen</SelectItem>
                  <SelectItem value="14">14 dagen</SelectItem>
                  <SelectItem value="30">30 dagen</SelectItem>
                  <SelectItem value="60">60 dagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">Betalingsmethode</Label>
            <div className="col-span-2">
              <Select 
                value={formData.payment_method || 'bankoverschrijving'} 
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bankoverschrijving">Bankoverschrijving</SelectItem>
                  <SelectItem value="ideal">iDEAL</SelectItem>
                  <SelectItem value="creditcard">Creditcard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">IBAN-nummer</Label>
            <div className="col-span-2">
              <Input
                value={formData.iban || ''}
                onChange={(e) => handleInputChange('iban', e.target.value)}
                className="text-sm h-8"
                placeholder="NL91 ABNA 0417 1643 00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-start">
            <Label className="text-sm pt-2">Referentie / Extra tekst op facturen</Label>
            <div className="col-span-2">
              <Input
                value={formData.invoice_reference || ''}
                onChange={(e) => handleInputChange('invoice_reference', e.target.value)}
                className="text-sm h-8"
                placeholder="Extra referentie informatie"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-start">
            <Label className="text-sm pt-2">Notities</Label>
            <div className="col-span-2">
              <Input
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="text-sm h-8"
                placeholder="Aanvullende informatie"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
