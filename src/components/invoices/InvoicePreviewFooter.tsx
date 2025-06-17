
import React from 'react';
import { LineItem } from '@/types/invoiceTypes';

interface InvoicePreviewFooterProps {
  lineItems: LineItem[];
}

export const InvoicePreviewFooter = ({ lineItems }: InvoicePreviewFooterProps) => {
  return (
    <div className="flex-shrink-0 h-[40px] px-4 py-2 bg-gray-100 border-t border-l text-xs text-gray-600 flex items-center justify-between">
      <span>A4 Formaat • Custom Invoice System</span>
      <span>{lineItems.length} regel{lineItems.length !== 1 ? 's' : ''}</span>
    </div>
  );
};
