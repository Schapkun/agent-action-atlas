
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Download, Send, Edit, Clock, Check, AlertCircle } from 'lucide-react';

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_city?: string;
  client_postal_code?: string;
  status: string;
  quote_date: string;
  valid_until: string;
  total_amount: number;
  notes?: string;
}

interface QuoteViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onEdit: (quoteId: string) => void;
}

export const QuoteViewDialog = ({ isOpen, onClose, quote, onEdit }: QuoteViewDialogProps) => {
  if (!quote) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-600"><Clock className="h-3 w-3 mr-1" />Concept</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-600"><Send className="h-3 w-3 mr-1" />Verzonden</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3 mr-1" />Geaccepteerd</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Verlopen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = () => {
    onEdit(quote.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Offerte {quote.quote_number}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Bewerken
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quote Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Offerte Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Nummer:</span> {quote.quote_number}</div>
                <div><span className="font-medium">Datum:</span> {new Date(quote.quote_date).toLocaleDateString('nl-NL')}</div>
                <div><span className="font-medium">Geldig tot:</span> {new Date(quote.valid_until).toLocaleDateString('nl-NL')}</div>
                <div><span className="font-medium">Status:</span> {getStatusBadge(quote.status)}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Klant Informatie</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Naam:</span> {quote.client_name}</div>
                {quote.client_email && <div><span className="font-medium">Email:</span> {quote.client_email}</div>}
                {quote.client_address && <div><span className="font-medium">Adres:</span> {quote.client_address}</div>}
                {quote.client_postal_code && quote.client_city && (
                  <div><span className="font-medium">Postcode/Plaats:</span> {quote.client_postal_code} {quote.client_city}</div>
                )}
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Totaal Bedrag:</span>
              <span className="text-xl font-bold text-green-600">€ {quote.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Opmerkingen</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
