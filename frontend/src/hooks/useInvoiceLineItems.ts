import { useState, useEffect } from 'react';
import { LineItem, InvoiceTotals } from '@/types/invoiceTypes';
import { useInvoiceStorage } from './useInvoiceStorage';

export const useInvoiceLineItems = () => {
  const { loadLineItems, saveLineItems } = useInvoiceStorage();
  const [lineItems, setLineItems] = useState<LineItem[]>(loadLineItems);
  const [vatSettings, setVatSettings] = useState<{ vatDisplay: 'incl_btw' | 'excl_btw' }>({ vatDisplay: 'excl_btw' });

  useEffect(() => {
    saveLineItems(lineItems);
  }, [lineItems, saveLineItems]);

  // Load VAT settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('invoice-vat-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setVatSettings(parsed);
        console.log('VAT instellingen geladen:', parsed);
      } catch (error) {
        console.error('Failed to parse saved VAT settings in line items:', error);
      }
    }
  }, []);

  // Listen for VAT settings changes from storage and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'invoice-vat-settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setVatSettings(parsed);
          console.log('VAT instellingen bijgewerkt via storage:', parsed);
        } catch (error) {
          console.error('Failed to parse VAT settings from storage:', error);
        }
      }
    };

    const handleCustomVatChange = (e: CustomEvent) => {
      console.log('Custom VAT event ontvangen:', e.detail);
      setVatSettings(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vatSettingsChanged', handleCustomVatChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vatSettingsChanged', handleCustomVatChange as EventListener);
    };
  }, []);

  const calculateLineTotal = (item: LineItem): number => {
    // Text-only items have no financial calculation
    if (item.is_text_only) {
      return 0;
    }
    
    const quantity = item.quantity || 0;
    const unit_price = item.unit_price || 0;
    return quantity * unit_price;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number | boolean) => {
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
      line_total: 0,
      is_text_only: false
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = (): InvoiceTotals => {
    let subtotal = 0;
    let vatAmount = 0;

    console.log('Berekening met VAT instelling:', vatSettings.vatDisplay);

    lineItems.forEach(item => {
      // Skip text-only items in calculations
      if (item.is_text_only) {
        return;
      }
      
      const lineTotal = calculateLineTotal(item);
      const vatRate = item.vat_rate / 100;
      
      if (vatSettings.vatDisplay === 'incl_btw') {
        // Prijs is inclusief BTW - BTW moet uit de prijs gehaald worden
        const priceExclVat = lineTotal / (1 + vatRate);
        const vatForThisLine = lineTotal - priceExclVat;
        
        subtotal += priceExclVat;
        vatAmount += vatForThisLine;
      } else {
        // Prijs is exclusief BTW - BTW moet bij de prijs opgeteld worden
        subtotal += lineTotal;
        vatAmount += lineTotal * vatRate;
      }
    });

    const total = subtotal + vatAmount;

    console.log('Berekende totalen:', { subtotal, vatAmount, total, vatDisplay: vatSettings.vatDisplay });

    return {
      subtotal,
      vatAmount,
      total
    };
  };

  // Update VAT settings when they change
  const updateVatSettings = (newSettings: { vatDisplay: 'incl_btw' | 'excl_btw' }) => {
    console.log('VAT instellingen bijgewerkt in line items:', newSettings);
    setVatSettings(newSettings);
    
    // Save to localStorage to sync with settings sidebar
    localStorage.setItem('invoice-vat-settings', JSON.stringify(newSettings));
    
    // Dispatch custom event for cross-component communication
    window.dispatchEvent(new CustomEvent('vatSettingsChanged', { detail: newSettings }));
  };

  return {
    lineItems,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    updateVatSettings,
    vatSettings
  };
};
