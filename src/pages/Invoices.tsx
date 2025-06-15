
import { useEffect } from 'react';
import { InvoiceManager } from '@/components/dashboard/InvoiceManager';

const Invoices = () => {
  useEffect(() => {
    const handleOpenNewInvoiceDialog = () => {
      // Trigger the new invoice dialog in InvoiceManager
      const event = new CustomEvent('triggerNewInvoice');
      window.dispatchEvent(event);
    };

    window.addEventListener('openNewInvoiceDialog', handleOpenNewInvoiceDialog);
    
    return () => {
      window.removeEventListener('openNewInvoiceDialog', handleOpenNewInvoiceDialog);
    };
  }, []);

  return <InvoiceManager />;
};

export default Invoices;
