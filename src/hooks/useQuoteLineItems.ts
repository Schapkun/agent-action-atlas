
import { useState, useEffect } from 'react';

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

export const useQuoteLineItems = () => {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 21,
      line_total: 0
    }
  ]);

  const updateVatSettings = (settings: any) => {
    if (settings?.default_vat_rate) {
      setLineItems(prev => prev.map(item => ({
        ...item,
        vat_rate: settings.default_vat_rate
      })));
    }
  };

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Recalculate line total when quantity or unit_price changes
      if (field === 'quantity' || field === 'unit_price') {
        updated[index].line_total = updated[index].quantity * updated[index].unit_price;
      }
      
      return updated;
    });
  };

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 21,
      line_total: 0
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  return {
    lineItems,
    setLineItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    updateVatSettings
  };
};
