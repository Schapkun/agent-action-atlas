
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Calendar,
  Euro,
  Edit,
  Eye,
  Trash2,
  Download
} from 'lucide-react';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { InvoiceDialog } from './InvoiceDialog';
import { InvoiceViewDialog } from './InvoiceViewDialog';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Concept';
    case 'sent': return 'Verzonden';
    case 'paid': return 'Betaald';
    case 'overdue': return 'Vervallen';
    case 'cancelled': return 'Geannuleerd';
    default: return status;
  }
};

export const InvoiceOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const { invoices, loading, deleteInvoice } = useInvoices();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === '' || invoice.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsCreateDialogOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleDownload = (invoice: Invoice) => {
    console.log('Downloading invoice:', invoice.invoice_number);
    // TODO: Implement PDF download functionality
  };

  const handleDelete = async (invoice: Invoice) => {
    if (confirm(`Weet je zeker dat je factuur ${invoice.invoice_number} wilt verwijderen?`)) {
      await deleteInvoice(invoice.id);
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingInvoice(null);
  };

  const handleCloseViewDialog = () => {
    setViewingInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturen</h1>
          <p className="text-gray-600">Beheer je facturen en bekijk de status</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Factuur
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek op factuurnummer of klant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Alle statussen</option>
              <option value="draft">Concept</option>
              <option value="sent">Verzonden</option>
              <option value="paid">Betaald</option>
              <option value="overdue">Vervallen</option>
              <option value="cancelled">Geannuleerd</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Facturen ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Facturen laden...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Geen facturen gevonden</p>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Maak je eerste factuur
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Klant:</span> {invoice.client_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(invoice.invoice_date), 'dd MMM yyyy', { locale: nl })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          €{invoice.total_amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Vervaldatum:</span> {' '}
                          {format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: nl })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(invoice)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(invoice)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(invoice)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <InvoiceDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseDialog}
        invoice={editingInvoice}
      />

      {/* View Dialog */}
      {viewingInvoice && (
        <InvoiceViewDialog
          isOpen={!!viewingInvoice}
          onClose={handleCloseViewDialog}
          invoice={viewingInvoice}
        />
      )}
    </div>
  );
};
