
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactShippingTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactShippingTab = ({ formData, setFormData }: ContactShippingTabProps) => {
  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Verzendmethode</Label>
          <Select
            value={formData.shippingMethod}
            onValueChange={(value) => setFormData(prev => ({ ...prev, shippingMethod: value }))}
          >
            <SelectTrigger className="text-xs h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="E-mail">E-mail</SelectItem>
              <SelectItem value="Post">Post</SelectItem>
              <SelectItem value="Geen">Geen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Standaard e-mailtekst</Label>
          <Select
            value={formData.standardEmailText}
            onValueChange={(value) => setFormData(prev => ({ ...prev, standardEmailText: value }))}
          >
            <SelectTrigger className="text-xs h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="geen">geen</SelectItem>
              <SelectItem value="standaard">Standaard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Herinnering e-mail</Label>
        <Input
          value={formData.reminderEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, reminderEmail: e.target.value }))}
          className="text-xs h-7"
          placeholder="E-mailadres voor herinneringen"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Betalingstermijn</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={formData.paymentTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: parseInt(e.target.value) || 14 }))}
              className="text-xs h-7 w-16"
            />
            <span className="text-xs">dagen</span>
          </div>
        </div>

        <div>
          <Label className="text-xs">IBAN</Label>
          <Input
            value={formData.iban}
            onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
            className="text-xs h-7"
            placeholder="NL00 BANK 0000 0000 00"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">BIC</Label>
        <Input
          value={formData.bic}
          onChange={(e) => setFormData(prev => ({ ...prev, bic: e.target.value }))}
          className="text-xs h-7"
          placeholder="BANKNL2A"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="automaticCollection"
          checked={formData.automaticCollection}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automaticCollection: checked }))}
        />
        <Label htmlFor="automaticCollection" className="text-xs">
          Automatische incasso
        </Label>
      </div>
    </div>
  );
};
