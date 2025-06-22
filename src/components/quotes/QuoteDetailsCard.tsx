
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';

interface QuoteDetailsCardProps {
  formData: any;
  quoteNumber: string;
  onFormDataChange: (updates: any) => void;
}

export const QuoteDetailsCard = ({
  formData,
  quoteNumber,
  onFormDataChange
}: QuoteDetailsCardProps) => {
  return (
    <>
      {/* Notities sectie */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Notities</Label>
            <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">
              Bewerk introductie
            </Button>
          </div>
          <Textarea
            placeholder="Voer hier notities in..."
            value={formData.notes || ''}
            onChange={(e) => onFormDataChange({ notes: e.target.value })}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Kenmerk en Referentie velden */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kenmerk" className="text-sm font-medium">
                Kenmerk
              </Label>
              <Input
                id="kenmerk"
                placeholder="Voer kenmerk in"
                value={formData.kenmerk || ''}
                onChange={(e) => onFormDataChange({ kenmerk: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="referentie" className="text-sm font-medium">
                Referentie
              </Label>
              <Input
                id="referentie"
                placeholder="Voer referentie in"
                value={formData.referentie || ''}
                onChange={(e) => onFormDataChange({ referentie: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offertedetails */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quote_number" className="text-sm font-medium">
                Offertenummer
              </Label>
              <Input
                id="quote_number"
                value={quoteNumber}
                readOnly
                className="mt-1 bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="quote_date" className="text-sm font-medium">
                Offertedatum
              </Label>
              <Input
                id="quote_date"
                type="date"
                value={formData.quote_date || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => onFormDataChange({ quote_date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="valid_until" className="text-sm font-medium">
                Geldig tot
              </Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                onChange={(e) => onFormDataChange({ valid_until: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
