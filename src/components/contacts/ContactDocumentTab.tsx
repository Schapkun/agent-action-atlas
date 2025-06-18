
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactDocumentTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactDocumentTab = ({ formData, setFormData }: ContactDocumentTabProps) => {
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Betalingstermijn</Label>
          <Select 
            value={formData.payment_terms?.toString() || '30'} 
            onValueChange={(value) => handleInputChange('payment_terms', parseInt(value))}
          >
            <SelectTrigger className="mt-1">
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
          <Label className="text-sm font-medium">Standaard betalingsmethode</Label>
          <Select 
            value={formData.payment_method || 'bankoverschrijving'} 
            onValueChange={(value) => handleInputChange('payment_method', value)}
          >
            <SelectTrigger className="mt-1">
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
        <Label className="text-sm font-medium">IBAN-nummer</Label>
        <Input
          value={formData.iban || ''}
          onChange={(e) => handleInputChange('iban', e.target.value)}
          placeholder="NL91 ABNA 0417 1643 00"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Opmerkingen</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Aanvullende informatie over dit contact"
          className="mt-1 resize-none"
          rows={6}
        />
      </div>
    </div>
  );
};
