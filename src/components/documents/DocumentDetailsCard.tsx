
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { Loader2 } from 'lucide-react';

interface DocumentDetailsCardProps {
  formData: any;
  documentType: string;
  content: string;
  onFormDataChange: (updates: any) => void;
  onDocumentTypeChange: (type: string) => void;
  onContentChange: (content: string) => void;
}

export const DocumentDetailsCard = ({
  formData,
  documentType,
  content,
  onFormDataChange,
  onDocumentTypeChange,
  onContentChange
}: DocumentDetailsCardProps) => {
  const { documentTypes, loading } = useDocumentTypes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document type *</Label>
            <Select 
              value={documentType} 
              onValueChange={onDocumentTypeChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Laden..." : "Selecteer type"} />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Document types laden...</span>
                  </div>
                ) : (
                  documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormDataChange({ title: e.target.value })}
              placeholder="Document titel"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschrijving</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Korte beschrijving (optioneel)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Inhoud</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Document inhoud..."
            rows={10}
          />
        </div>
      </CardContent>
    </Card>
  );
};
