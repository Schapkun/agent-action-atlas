
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactDocumentTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactDocumentTab = ({ formData, setFormData }: ContactDocumentTabProps) => {
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Standaard korting</Label>
          <div className="flex gap-3">
            <Input
              type="number"
              value={formData.default_discount || '0'}
              onChange={(e) => handleInputChange('default_discount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="flex-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Select 
              value={formData.discount_type || 'percentage'} 
              onValueChange={(value) => handleInputChange('discount_type', value)}
            >
              <SelectTrigger className="w-40 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">% (Percentage)</SelectItem>
                <SelectItem value="fixed">€ (Vast bedrag)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Producten</Label>
          <Select 
            value={formData.products_display || 'incl_btw'} 
            onValueChange={(value) => handleInputChange('products_display', value)}
          >
            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incl_btw">Inclusief btw</SelectItem>
              <SelectItem value="excl_btw">Exclusief btw</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Betalingstermijn</Label>
          <Select 
            value={formData.payment_terms?.toString() || '30'} 
            onValueChange={(value) => handleInputChange('payment_terms', parseInt(value))}
          >
            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dagen</SelectItem>
              <SelectItem value="14">14 dagen</SelectItem>
              <SelectItem value="30">30 dagen</SelectItem>
              <SelectItem value="60">60 dagen</SelectItem>
              <SelectItem value="90">90 dagen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Standaard betalingsmethode</Label>
          <Select 
            value={formData.payment_method || 'bankoverschrijving'} 
            onValueChange={(value) => handleInputChange('payment_method', value)}
          >
            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bankoverschrijving">Bankoverschrijving</SelectItem>
              <SelectItem value="ideal">iDEAL</SelectItem>
              <SelectItem value="creditcard">Creditcard</SelectItem>
              <SelectItem value="contant">Contant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">IBAN-nummer</Label>
        <Input
          value={formData.iban || ''}
          onChange={(e) => handleInputChange('iban', e.target.value)}
          placeholder="NL91 ABNA 0417 1643 00"
          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Referentie / Extra tekst op facturen</Label>
        <Textarea
          value={formData.invoice_reference || ''}
          onChange={(e) => handleInputChange('invoice_reference', e.target.value)}
          placeholder="Extra referentie informatie voor facturen"
          className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Notities</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Aanvullende informatie over dit contact"
          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <Checkbox
          id="hide_notes_on_invoice"
          checked={formData.hide_notes_on_invoice || false}
          onCheckedChange={(checked) => handleInputChange('hide_notes_on_invoice', checked)}
          className="border-gray-300"
        />
        <Label htmlFor="hide_notes_on_invoice" className="text-sm font-semibold text-gray-700 cursor-pointer">
          Notities vermelden op nieuwe factuur
        </Label>
      </div>
    </div>
  );
};
