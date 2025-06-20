
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Send, Plus, Edit, Calendar, Building, User, MapPin, Phone, Mail, Hash, CreditCard, CalendarDays, Eye } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { InvoiceViewDialog } from './InvoiceViewDialog';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { InvoicePDFDialog } from './InvoicePDFDialog';
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';

interface InvoiceOverviewProps {
  invoiceData: any;
  onEdit: () => void;
  onGeneratePDF: () => void;
  onSendEmail: () => void;
  onDuplicate: () => void;
  onAddLine: () => void;
  selectedTemplate: DocumentTemplate | null;
  onTemplateChange: (template: DocumentTemplate | null) => void;
}

export const InvoiceOverview = ({
  invoiceData,
  onEdit,
  onGeneratePDF,
  onSendEmail,
  onDuplicate,
  onAddLine,
  selectedTemplate,
  onTemplateChange
}: InvoiceOverviewProps) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false);
  const { templates, loading: templatesLoading } = useDocumentTemplates();

  // Auto-select first template if none selected
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0 && !templatesLoading) {
      onTemplateChange(templates[0] as DocumentTemplate);
    }
  }, [templates, selectedTemplate, onTemplateChange, templatesLoading]);

  if (!invoiceData) return null;

  const statusVariant = invoiceData.status === 'sent' ? 'default' : 
                       invoiceData.status === 'paid' ? 'secondary' : 'outline';

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-bold">
              Factuur {invoiceData.invoice_number}
            </CardTitle>
            <Badge variant={statusVariant} className="text-sm">
              {invoiceData.status === 'draft' && 'Concept'}
              {invoiceData.status === 'sent' && 'Verzonden'}
              {invoiceData.status === 'paid' && 'Betaald'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Bekijken
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Voorbeeld
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPDFDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Versturen
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Bewerken
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Template Selector */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Template</h3>
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateChange={onTemplateChange}
            />
          </div>

          <Separator />

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Klantgegevens
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{invoiceData.client_name}</span>
                </div>
                {invoiceData.client_email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{invoiceData.client_email}</span>
                  </div>
                )}
                {invoiceData.client_address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <div>{invoiceData.client_address}</div>
                      <div>
                        {invoiceData.client_postal_code} {invoiceData.client_city}
                      </div>
                      <div>{invoiceData.client_country}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                Factuurgegevens
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Factuurdatum: {new Date(invoiceData.invoice_date).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Vervaldatum: {new Date(invoiceData.due_date).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Betalingstermijn: {invoiceData.payment_terms} dagen
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">
                Financieel overzicht
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotaal:</span>
                  <span>€{Number(invoiceData.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>BTW ({invoiceData.vat_percentage}%):</span>
                  <span>€{Number(invoiceData.vat_amount || 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Totaal:</span>
                  <span>€{Number(invoiceData.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {invoiceData.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Notities</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{invoiceData.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={onAddLine} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Regel toevoegen
            </Button>
            <Button onClick={onDuplicate} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Dupliceren
            </Button>
          </div>
        </CardContent>
      </Card>

      <InvoiceViewDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        invoice={invoiceData}
      />

      <InvoicePreviewDialog
        open={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        invoiceData={invoiceData}
        selectedTemplate={selectedTemplate}
      />

      <InvoicePDFDialog
        open={isPDFDialogOpen}
        onClose={() => setIsPDFDialogOpen(false)}
        invoiceData={invoiceData}
        selectedTemplate={selectedTemplate}
      />
    </>
  );
};
