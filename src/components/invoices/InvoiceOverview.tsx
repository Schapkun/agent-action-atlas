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
  Download,
  Mail,
  Clock,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useInvoiceLines } from '@/hooks/useInvoiceLines';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';
import { InvoiceDialog } from './InvoiceDialog';
import { InvoiceViewDialog } from './InvoiceViewDialog';
import { InvoicePDFGenerator } from '@/utils/InvoicePDFGenerator';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const { invoices, loading, deleteInvoice } = useInvoices();
  const { toast } = useToast();

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

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    
    try {
      console.log('Quick download started for invoice:', invoice.invoice_number);
      
      // Fetch invoice lines and template data
      const { data: lines, error: linesError } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('sort_order', { ascending: true });

      if (linesError) throw linesError;

      const { data: templates, error: templateError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('organization_id', invoice.organization_id)
        .eq('type', 'factuur')
        .eq('is_active', true)
        .limit(1);

      if (templateError) console.warn('Template fetch warning:', templateError);

      // Properly type the template to match DocumentTemplate interface
      const defaultTemplate: DocumentTemplate | null = templates?.[0] ? {
        ...templates[0],
        placeholder_values: templates[0].placeholder_values ? 
          (typeof templates[0].placeholder_values === 'object' && templates[0].placeholder_values !== null ? 
            templates[0].placeholder_values as Record<string, string> : null) : null,
        labels: [] // Add empty labels array for compatibility
      } : null;
      
      const pdfData = {
        invoice,
        lines: lines || [],
        template: defaultTemplate,
        companyInfo: {
          name: 'Uw Bedrijf B.V.',
          address: 'Voorbeeldstraat 123',
          postalCode: '1234AB',
          city: 'Amsterdam',
          phone: '+31 20 123 4567',
          email: 'info@uwbedrijf.nl',
          kvk: '12345678',
          vat: 'NL123456789B01',
          iban: 'NL91ABNA0417164300',
          bic: 'ABNANL2A'
        }
      };

      await InvoicePDFGenerator.generatePDF(pdfData, {
        filename: `factuur-${invoice.invoice_number}.pdf`,
        download: true
      });
      
      toast({
        title: "PDF Download",
        description: `Factuur ${invoice.invoice_number} is gedownload`
      });
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast({
        title: "Fout",
        description: `Kon PDF niet downloaden: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResend = async (invoice: Invoice) => {
    if (!invoice.client_email) {
      toast({
        title: "Fout",
        description: "Geen email adres gevonden voor deze klant.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Opnieuw versturen factuur:', invoice.invoice_number);
      
      const emailTemplate = {
        subject: "Factuur {invoice_number}",
        message: `Beste {client_name},

Hierbij ontvangt u factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Met vriendelijke groet,
Uw administratie`
      };

      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoice_id: invoice.id,
          email_template: emailTemplate,
          email_type: 'resend'
        }
      });

      if (error) throw error;

      toast({
        title: "Email Verzonden",
        description: `Factuur ${invoice.invoice_number} is opnieuw verzonden naar ${invoice.client_email}.`
      });
    } catch (error) {
      console.error('Error resending invoice:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opnieuw versturen van de factuur.",
        variant: "destructive"
      });
    }
  };

  const handleReminder = async (invoice: Invoice) => {
    if (!invoice.client_email) {
      toast({
        title: "Fout",
        description: "Geen email adres gevonden voor deze klant.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Herinnering versturen factuur:', invoice.invoice_number);
      
      const emailTemplate = {
        subject: "Herinnering factuur {invoice_number}",
        message: `Beste {client_name},

Dit is een vriendelijke herinnering voor factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Mocht u deze factuur al hebben betaald, dan kunt u deze herinnering negeren.

Met vriendelijke groet,
Uw administratie`
      };

      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoice_id: invoice.id,
          email_template: emailTemplate,
          email_type: 'reminder'
        }
      });

      if (error) throw error;

      toast({
        title: "Herinnering Verzonden",
        description: `Herinnering voor factuur ${invoice.invoice_number} is verzonden naar ${invoice.client_email}.`
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het versturen van de herinnering.",
        variant: "destructive"
      });
    }
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
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                        className="h-8 w-8 p-0"
                      >
                        {downloadingId === invoice.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleResend(invoice)}
                            disabled={!invoice.client_email}
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email opnieuw versturen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReminder(invoice)}
                            disabled={!invoice.client_email}
                            className="flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            Herinnering versturen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(invoice)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Bewerken
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(invoice)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
