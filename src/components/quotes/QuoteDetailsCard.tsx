
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuoteFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  quote_date: string;
  valid_until: string;
  notes: string;
  vat_percentage: number;
}

interface QuoteDetailsCardProps {
  formData: QuoteFormData;
  quoteNumber: string;
  onFormDataChange: (updates: Partial<QuoteFormData>) => void;
}

export const QuoteDetailsCard = ({
  formData,
  quoteNumber,
  onFormDataChange
}: QuoteDetailsCardProps) => {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-medium">Offerte</Label>
            <div className="flex mt-1">
              <Input 
                className="text-xs h-8" 
                value={quoteNumber}
                readOnly
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Datum</Label>
            <Input 
              type="date"
              value={formData.quote_date}
              onChange={(e) => onFormDataChange({ quote_date: e.target.value })}
              className="mt-1 text-xs h-8"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Geldig tot</Label>
            <Input 
              type="date"
              value={formData.valid_until}
              onChange={(e) => onFormDataChange({ valid_until: e.target.value })}
              className="mt-1 text-xs h-8"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
