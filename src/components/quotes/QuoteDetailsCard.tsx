
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
      {/* Contact selection with quote details */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="quote_number" className="text-xs">
                Offertenummer
              </Label>
              <Input
                id="quote_number"
                value={quoteNumber}
                readOnly
                className="mt-1 h-8 text-xs bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="quote_date" className="text-xs">
                Offertedatum
              </Label>
              <Input
                id="quote_date"
                type="date"
                value={formData.quote_date || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => onFormDataChange({ quote_date: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="valid_until" className="text-xs">
                Geldig tot
              </Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                onChange={(e) => onFormDataChange({ valid_until: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kenmerk, Referentie en Notities */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="kenmerk" className="text-xs">
                Kenmerk
              </Label>
              <Input
                id="kenmerk"
                placeholder="Voer kenmerk in"
                value={formData.kenmerk || ''}
                onChange={(e) => onFormDataChange({ kenmerk: e.target.value })}
                className="mt-1 h-8 text-xs placeholder:text-xs"
              />
            </div>
            <div>
              <Label htmlFor="referentie" className="text-xs">
                Referentie
              </Label>
              <Input
                id="referentie"
                placeholder="Voer referentie in"
                value={formData.referentie || ''}
                onChange={(e) => onFormDataChange({ referentie: e.target.value })}
                className="mt-1 h-8 text-xs placeholder:text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Notities</Label>
              <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">
                Bewerk introductie
              </Button>
            </div>
            <Textarea
              placeholder="Voer hier notities in..."
              value={formData.notes || ''}
              onChange={(e) => onFormDataChange({ notes: e.target.value })}
              className="min-h-[60px] text-xs placeholder:text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
