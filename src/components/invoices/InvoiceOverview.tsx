import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Loader2,
  CheckCircle,
  FileEdit,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  
  const { invoices, loading, deleteInvoice, updateInvoice, generateInvoiceNumber } = useInvoices();
  const { toast } = useToast();

  // Get status filter from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const statusFilter = urlParams.get('status') || '';

  // Filter invoices based on URL parameter and search term
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Determine page title based on status filter
  const getPageTitle = () => {
    switch (statusFilter) {
      case 'draft': return 'Conceptfacturen';
      case 'sent': return 'Verzonden Facturen';
      case 'paid': return 'Betaalde Facturen';
      case 'overdue': return 'Vervallen Facturen';
      default: return 'Alle Facturen';
    }
  };

  // Selection handlers
  const isAllSelected = filteredInvoices.length > 0 && selectedInvoices.size === filteredInvoices.length;
  const isIndeterminate = selectedInvoices.size > 0 && selectedInvoices.size < filteredInvoices.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(new Set(filteredInvoices.map(invoice => invoice.id)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.size === 0) return;

    const invoiceType = statusFilter === 'draft' ? 'concepten' : 'facturen';
    if (confirm(`Weet je zeker dat je ${selectedInvoices.size} ${invoiceType} wilt verwijderen?`)) {
      try {
        // Delete each selected invoice
        const deletePromises = Array.from(selectedInvoices).map(id => deleteInvoice(id));
        await Promise.all(deletePromises);
        
        setSelectedInvoices(new Set());
        
        toast({
          title: "Verwijderd",
          description: `${selectedInvoices.size} ${invoiceType} succesvol verwijderd`
        });
      } catch (error) {
        console.error('Error bulk deleting invoices:', error);
        toast({
          title: "Fout",
          description: `Kon ${invoiceType} niet verwijderen`,
          variant: "destructive"
        });
      }
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsCreateDialogOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleConvertToInvoice = async (invoice: Invoice) => {
    try {
      console.log('Converting draft to invoice:', invoice.id);
      
      // Generate new invoice number for the draft
      const invoiceNumber = await generateInvoiceNumber();
      
      // Update the invoice status to 'sent' and assign invoice number
      await updateInvoice(invoice.id, { 
        status: 'sent',
        invoice_number: invoiceNumber
      });
      
      toast({
        title: "Factuur Verzonden",
        description: `Concept is omgezet naar factuur ${invoiceNumber} en verzonden.`
      });
    } catch (error) {
      console.error('Error converting draft to invoice:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het omzetten van het concept.",
        variant: "destructive"
      });
    }
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

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      console.log('Markeren als betaald:', invoice.invoice_number);
      
      await updateInvoice(invoice.id, { status: 'paid' });
      
      toast({
        title: "Status Bijgewerkt",
        description: `Factuur ${invoice.invoice_number} is gemarkeerd als betaald.`
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de factuurstatus.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (confirm(`Weet je zeker dat je ${invoice.status === 'draft' ? 'concept' : 'factuur'} ${invoice.invoice_number || 'zonder nummer'} wilt verwijderen?`)) {
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

  // Render action buttons based on invoice status
  const renderActionButtons = (invoice: Invoice) => {
    if (invoice.status === 'draft') {
      // Draft invoice actions
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(invoice)}
            className="h-8 w-8 p-0"
            title="Bewerken"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleConvertToInvoice(invoice)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
            title="Omzetten naar factuur en versturen"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Meer opties"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate('/offertes/opstellen')}
                className="flex items-center gap-2"
              >
                <FileEdit className="h-4 w-4" />
                Omzetten naar offerte
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
      );
    } else {
      // Sent/Paid invoice actions
      return (
        <div className="flex items-center justify-end gap-2">
          {invoice.status !== 'paid' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsPaid(invoice)}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              title="Markeer als betaald"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(invoice)}
            className="h-8 w-8 p-0"
            title="Bekijken"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(invoice)}
            disabled={downloadingId === invoice.id}
            className="h-8 w-8 p-0"
            title="Download PDF"
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
                title="Meer opties"
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
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600">
            {statusFilter === 'draft' ? 'Beheer je conceptfacturen en zet ze om naar verzonden facturen' : 'Beheer je facturen en bekijk de status'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Factuur
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zoeken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zoek op factuurnummer of klant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{getPageTitle()} ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Facturen laden...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">
                {statusFilter === 'draft' ? 'Geen conceptfacturen gevonden' : 'Geen facturen gevonden'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {statusFilter === 'draft' ? 'Maak je eerste concept' : 'Maak je eerste factuur'}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) {
                          const inputElement = el.querySelector('input') as HTMLInputElement;
                          if (inputElement) {
                            inputElement.indeterminate = isIndeterminate;
                          }
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                      className="h-4 w-4"
                    />
                  </TableHead>
                  <TableHead>Factuurnummer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Factuurdatum</TableHead>
                  <TableHead>Vervaldatum</TableHead>
                  <TableHead>Factuurbedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {selectedInvoices.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="h-6 px-1 text-red-600 hover:text-red-700"
                          title={`Geselecteerde ${statusFilter === 'draft' ? 'concepten' : 'facturen'} verwijderen`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      Acties
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedInvoices.has(invoice.id)}
                        onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.status === 'draft' ? (
                        <span className="text-gray-500 italic">CONCEPT</span>
                      ) : (
                        invoice.invoice_number
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.client_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), 'dd MMM yyyy', { locale: nl })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: nl })}
                    </TableCell>
                    <TableCell>
                      €{invoice.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActionButtons(invoice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
