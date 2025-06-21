
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentDetailsCardProps {
  formData: {
    title: string;
    description: string;
  };
  documentType: string;
  content: string;
  onFormDataChange: (updates: any) => void;
  onDocumentTypeChange: (type: string) => void;
  onContentChange: (content: string) => void;
}

const documentTypes = [
  { value: 'contract', label: 'Contract' },
  { value: 'brief', label: 'Brief' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'overeenkomst', label: 'Overeenkomst' },
  { value: 'notitie', label: 'Notitie' },
  { value: 'factuur', label: 'Factuur' },
  { value: 'offerte', label: 'Offerte' }
];

export const DocumentDetailsCard = ({
  formData,
  documentType,
  content,
  onFormDataChange,
  onDocumentTypeChange,
  onContentChange
}: DocumentDetailsCardProps) => {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="documentType" className="text-xs font-medium">Document type *</Label>
            <Select value={documentType} onValueChange={onDocumentTypeChange}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecteer type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title" className="text-xs font-medium">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormDataChange({ title: e.target.value })}
              placeholder="Document titel"
              className="h-8 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-medium">Beschrijving</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              placeholder="Beschrijving (optioneel)"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="mt-3">
          <Label htmlFor="content" className="text-xs font-medium">Inhoud</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Voer de document inhoud in..."
            rows={8}
            className="text-sm mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
