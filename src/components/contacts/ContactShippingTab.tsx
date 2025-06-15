
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactShippingTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContactShippingTab = ({ formData, setFormData }: ContactShippingTabProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {/* Left column */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="shippingMethod" className="text-xs">Verzendmethode</Label>
          <Select value={formData.shippingMethod || 'E-mail'} onValueChange={(value) => setFormData({...formData, shippingMethod: value})}>
            <SelectTrigger className="h-7 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="E-mail">E-mail</SelectItem>
              <SelectItem value="Post">Post</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="standardEmailText" className="text-xs">Standaard e-mail tekst</Label>
          <Select value={formData.standardEmailText || 'geen'} onValueChange={(value) => setFormData({...formData, standardEmailText: value})}>
            <SelectTrigger className="h-7 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geen">geen</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-gray-500 mt-1">
            Als u meerdere e-mailteksten heeft gedefinieerd kunt u een van de teksten selecteren specifiek voor deze klant.
          </div>
        </div>

        <div>
          <Label htmlFor="reminderEmail" className="text-xs">E-mail voor herinneringen</Label>
          <Input
            id="reminderEmail"
            type="email"
            value={formData.reminderEmail || ''}
            onChange={(e) => setFormData({...formData, reminderEmail: e.target.value})}
            className="h-7 text-xs mt-1"
          />
          <div className="text-xs text-gray-500 mt-1">
            Vul dit veld in als u een alternatief e-mailadres wilt gebruiken voor herinneringen naar deze klant.
          </div>
        </div>

        <div>
          <Label htmlFor="paymentTerms" className="text-xs">Betalingstermijn</Label>
          <div className="flex items-center gap-1 mt-1">
            <Input
              id="paymentTerms"
              type="number"
              value={formData.paymentTerms || ''}
              placeholder="14"
              onChange={(e) => setFormData({...formData, paymentTerms: parseInt(e.target.value) || 14})}
              className="h-7 text-xs w-16"
            />
            <span className="text-xs">dagen</span>
          </div>
        </div>

        <div>
          <Label htmlFor="iban" className="text-xs">IBAN</Label>
          <Input
            id="iban"
            value={formData.iban || ''}
            onChange={(e) => setFormData({...formData, iban: e.target.value})}
            className="h-7 text-xs mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bic" className="text-xs">BIC</Label>
          <Input
            id="bic"
            value={formData.bic || ''}
            onChange={(e) => setFormData({...formData, bic: e.target.value})}
            className="h-7 text-xs mt-1"
          />
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="automaticCollection" 
            checked={formData.automaticCollection || false}
            onCheckedChange={(checked) => setFormData({...formData, automaticCollection: checked as boolean})}
          />
          <Label htmlFor="automaticCollection" className="text-xs">Automatische incasso</Label>
        </div>
      </div>
    </div>
  );
};
