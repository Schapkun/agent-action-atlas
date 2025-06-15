
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductLine } from './ProductLine';

interface InvoiceFormDataProps {
  formData: {
    invoiceDate: string;
    paymentTerms: number;
    dueDate: string;
  };
  setFormData: (data: any) => void;
}

export const InvoiceFormData = ({ formData, setFormData }: InvoiceFormDataProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-green-600">Factuur Details</h3>
      
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Factuur</Label>
          <div className="flex">
            <span className="bg-gray-100 px-2 py-1 rounded-l border text-sm h-9 flex items-center">
              2025-
            </span>
            <Input 
              className="rounded-l-none border-l-0 w-16" 
              placeholder="001"
              readOnly
            />
          </div>
        </div>
        <div>
          <Label htmlFor="invoiceDate">Datum</Label>
          <Input 
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
            className="w-32"
          />
        </div>
        <div>
          <Label htmlFor="paymentTerms">Betalingstermijn</Label>
          <Select 
            value={formData.paymentTerms.toString()} 
            onValueChange={(value) => setFormData({...formData, paymentTerms: parseInt(value)})}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dagen</SelectItem>
              <SelectItem value="14">14 dagen</SelectItem>
              <SelectItem value="21">21 dagen</SelectItem>
              <SelectItem value="30">30 dagen</SelectItem>
              <SelectItem value="60">60 dagen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dueDate">Vervaldatum</Label>
          <Input 
            type="date"
            value={formData.dueDate}
            readOnly
            className="w-32 bg-gray-100"
          />
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-md font-medium text-green-600 mb-4">Productregels</h4>
        <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700 mb-2">
          <div className="col-span-1">Aantal</div>
          <div className="col-span-6">Omschrijving</div>
          <div className="col-span-2">Prijs</div>
          <div className="col-span-1">btw</div>
          <div className="col-span-2">Totaal</div>
        </div>
        
        <ProductLine />
      </div>
    </div>
  );
};
