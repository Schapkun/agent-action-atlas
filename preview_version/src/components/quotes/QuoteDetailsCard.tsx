
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuoteDetailsCardProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

export const QuoteDetailsCard = ({
  formData,
  onFormDataChange
}: QuoteDetailsCardProps) => {
  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        {/* Kenmerk en Referentie velden */}
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

        {/* Notities sectie */}
        <div>
          <Label className="text-xs">Notities</Label>
          <Textarea
            placeholder="Voer hier notities in..."
            value={formData.notes || ''}
            onChange={(e) => onFormDataChange({ notes: e.target.value })}
            className="min-h-[60px] text-xs placeholder:text-xs mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
