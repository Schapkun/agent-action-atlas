
import { useState, useEffect } from 'react';
import { LineItem, InvoiceTotals } from '@/types/invoiceTypes';
import { useInvoiceStorage } from './useInvoiceStorage';

export const useInvoiceLineItems = () => {
  const { loadLineItems, saveLineItems } = useInvoiceStorage();
  const [lineItems, setLineItems] = useState<LineItem[]>(loadLineItems);

  useEffect(() => {
    saveLineItems(lineItems);
  }, [lineItems, saveLineItems]);

  const calculateLineTotal = (item: LineItem): number => {
    const quantity = item.quantity || 0;
    const unit_price = item.unit_price || 0;
    return quantity * unit_price;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value, line_total: calculateLineTotal({ ...item, [field]: value }) } : item
      )
    );
  };

  const addLineItem = () => {
    const newItem: LineItem = {
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
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = (): InvoiceTotals => {
    let subtotal = 0;
    let vatAmount = 0;

    lineItems.forEach(item => {
      const lineTotal = calculateLineTotal(item);
      subtotal += lineTotal;
      vatAmount += lineTotal * (item.vat_rate / 100);
    });

    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      total
    };
  };

  return {
    lineItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals
  };
};
