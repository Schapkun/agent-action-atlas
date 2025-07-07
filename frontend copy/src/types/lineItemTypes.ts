
// Shared base interface for all line items
export interface BaseLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
  sort_order?: number;
}

// Invoice-specific line item
export interface InvoiceLineItem extends BaseLineItem {
  invoice_id?: string;
  created_at?: string;
}

// Quote-specific line item  
export interface QuoteLineItem extends BaseLineItem {
  quote_id?: string;
  created_at?: string;
}

// Generic line item for forms (before saving)
export interface LineItem extends BaseLineItem {
  // Can be used for both quotes and invoices
}

// Type guards for safe type checking
export const isInvoiceLineItem = (item: any): item is InvoiceLineItem => {
  return item && typeof item === 'object' && 'invoice_id' in item;
};

export const isQuoteLineItem = (item: any): item is QuoteLineItem => {
  return item && typeof item === 'object' && 'quote_id' in item;
};

// Utility functions for type conversion
export const convertToLineItem = (item: InvoiceLineItem | QuoteLineItem): LineItem => {
  const { id, description, quantity, unit_price, vat_rate, line_total, sort_order } = item;
  return {
    id,
    description,
    quantity,
    unit_price,
    vat_rate,
    line_total,
    sort_order
  };
};

export const convertToQuoteLineItem = (item: LineItem, quoteId?: string): QuoteLineItem => {
  return {
    ...item,
    quote_id: quoteId
  };
};

export const convertToInvoiceLineItem = (item: LineItem, invoiceId?: string): InvoiceLineItem => {
  return {
    ...item,
    invoice_id: invoiceId
  };
};
