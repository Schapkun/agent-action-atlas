
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Upload } from 'lucide-react';

type Option = {
  label: string;
  value: string;
};

interface DocumentToolbarProps {
  documentName: string;
  setDocumentName: (name: string) => void;
  documentType: string;
  setDocumentType: (type: string) => void;
  options: Option[];
  hasUnsavedChanges: boolean;
  onPreview: () => void;
  onPDFDownload: () => void;
  onHTMLExport: () => void;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  documentName,
  setDocumentName,
  documentType,
  setDocumentType,
  options,
  hasUnsavedChanges,
  onPreview,
  onPDFDownload,
  onHTMLExport,
}) => (
  <div className="flex-shrink-0 p-4 border-b bg-muted/30">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Input
          placeholder="Document naam..."
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasUnsavedChanges && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Niet opgeslagen
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={onPreview} 
          variant="outline" 
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button onClick={onPDFDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button onClick={onHTMLExport} variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          HTML
        </Button>
      </div>
    </div>
  </div>
);

