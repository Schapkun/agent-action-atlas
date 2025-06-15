
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
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Left column */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="standardDiscount" className="text-xs">Standaard korting</Label>
          <div className="flex items-center gap-1 mt-1">
            <Input
              id="standardDiscount"
              type="number"
              value={formData.standardDiscount || 0}
              onChange={(e) => setFormData({...formData, standardDiscount: parseFloat(e.target.value) || 0})}
              className="h-7 text-xs w-16"
            />
            <span className="text-xs">% (Percentage)</span>
          </div>
        </div>

        <div>
          <Label htmlFor="documentLanguage" className="text-xs">Document taal</Label>
          <Select value={formData.documentLanguage || 'Standaardinstelling'} onValueChange={(value) => setFormData({...formData, documentLanguage: value})}>
            <SelectTrigger className="h-7 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standaardinstelling">Standaardinstelling</SelectItem>
              <SelectItem value="Nederlands">Nederlands</SelectItem>
              <SelectItem value="Engels">Engels</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="currency" className="text-xs">Valuta</Label>
          <Select value={formData.currency || 'Euro'} onValueChange={(value) => setFormData({...formData, currency: value})}>
            <SelectTrigger className="h-7 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Euro">Euro</SelectItem>
              <SelectItem value="Dollar">Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="products" className="text-xs">Producten</Label>
          <Select value={formData.products || 'Inclusief btw'} onValueChange={(value) => setFormData({...formData, products: value})}>
            <SelectTrigger className="h-7 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inclusief btw">Inclusief btw</SelectItem>
              <SelectItem value="Exclusief btw">Exclusief btw</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="standardCategory" className="text-xs">Standaardcategorie</Label>
          <Select value={formData.standardCategory || 'geen'} onValueChange={(value) => setFormData({...formData, standardCategory: value})}>
            <SelectTrigger className="h-7 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geen">geen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="referenceText" className="text-xs">Referentie / Extra tekst op facturen</Label>
          <Textarea
            id="referenceText"
            value={formData.referenceText || ''}
            onChange={(e) => setFormData({...formData, referenceText: e.target.value})}
            rows={3}
            className="text-xs mt-1 min-h-[60px]"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-xs">Notities</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={4}
            className="text-xs mt-1 min-h-[80px]"
          />
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="hideNoticesOnNewInvoice" 
            checked={formData.hideNoticesOnNewInvoice || false}
            onCheckedChange={(checked) => setFormData({...formData, hideNoticesOnNewInvoice: checked as boolean})}
          />
          <Label htmlFor="hideNoticesOnNewInvoice" className="text-xs">Notities vermelden op nieuwe factuur</Label>
        </div>
      </div>
    </div>
  );
};
