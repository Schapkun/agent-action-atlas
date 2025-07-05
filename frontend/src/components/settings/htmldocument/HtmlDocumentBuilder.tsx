
import React from 'react';
import { DocumentBuilder } from './components/DocumentBuilder';

interface HtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

export const HtmlDocumentBuilder = ({ documentId, onComplete }: HtmlDocumentBuilderProps) => {
  return (
    <DocumentBuilder 
      documentId={documentId}
      onComplete={onComplete}
    />
  );
};
