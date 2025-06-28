
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Download, Edit, Trash2, Mail, ExternalLink, Phone } from 'lucide-react';

interface DossierTabsProps {
  children?: React.ReactNode;
}

export const DossierTabs = ({ children }: DossierTabsProps) => {
  // Mock data - in real app this would come from API
  const mockDossierDetails = {
    hoursSpent: 14.5,
    hoursAvailable: 5.5,
    totalHours: 20,
    hourlyRate: 175,
    totalValue: 3500,
    totalInvoiced: 3500,
    paid: 2250,
    outstanding: 1250,
    lastEmail: 'Vandaag 14:23 - Vraag over nieuw contract',
    lastCall: '15 min gesprek - intake nieuwe leveringscontract',
    documents: [
      {
        id: '1',
        name: 'Leveringscontract Biologisch Meel Q1-Q2 2025',
        type: 'Contract',
        size: '245 KB',
        uploadDate: 'Gisteren 16:45',
        uploadedBy: 'Marie van der Berg'
      },
      {
        id: '2',
        name: 'Intake Notities - Eerste Gesprek',
        type: 'Notitie',
        size: '89 KB',
        uploadDate: '1 week geleden',
        uploadedBy: 'Marie van der Berg'
      },
      {
        id: '3',
        name: 'Bedrijfsgegevens De Korenbloem',
        type: 'Referentie',
        size: '156 KB',
        uploadDate: '1 week geleden',
        uploadedBy: 'Marie van der Berg'
      },
      {
        id: '4',
        name: 'Vorige Leveringsovereenkomst 2024',
        type: 'Contract',
        size: '298 KB',
        uploadDate: '2 weken geleden',
        uploadedBy: 'Marie van der Berg'
      },
      {
        id: '5',
        name: 'Correspondentie E-mails',
        type: 'Communicatie',
        size: '67 KB',
        uploadDate: '3 dagen geleden',
        uploadedBy: 'Marie van der Berg'
      }
    ]
  };

  return (
    <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="grid w-full grid-cols-3 mb-2 flex-shrink-0">
        <TabsTrigger value="overview" className="text-xs">Overzicht</TabsTrigger>
        <TabsTrigger value="financial" className="text-xs">Financieel & Documenten</TabsTrigger>
        <TabsTrigger value="communication" className="text-xs">Communicatie</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="overview" className="space-y-2 mt-0 h-full">
          {children}
        </TabsContent>

        <TabsContent value="financial" className="space-y-3 mt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">Uren & Tarieven</h3>
              <div className="bg-slate-50 rounded-lg p-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">Bestede uren:</span>
                  <span className="text-xs font-medium">{mockDossierDetails.hoursSpent}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">Beschikbare uren:</span>
                  <span className="text-xs font-medium">{mockDossierDetails.hoursAvailable}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">Totaal uren:</span>
                  <span className="text-xs font-medium">{mockDossierDetails.totalHours}h</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-xs text-slate-600">Uurtarief:</span>
                  <span className="text-xs font-medium">€{mockDossierDetails.hourlyRate}/uur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">Totale waarde:</span>
                  <span className="text-sm font-semibold">€{mockDossierDetails.totalValue.toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">Facturatie & Betalingen</h3>
              <div className="bg-slate-50 rounded-lg p-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">Totaal gefactureerd:</span>
                  <span className="text-xs font-medium">€{mockDossierDetails.totalInvoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">Betaald:</span>
                  <span className="text-xs font-medium text-green-600">€{mockDossierDetails.paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-xs text-slate-600">Openstaand:</span>
                  <span className="text-sm font-semibold text-orange-600">€{mockDossierDetails.outstanding.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documenten ({mockDossierDetails.documents.length})
                </h3>
                <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-xs px-2 py-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Document Toevoegen
                </Button>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 space-y-1 max-h-64 overflow-y-auto">
                {mockDossierDetails.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-1.5 bg-white rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1 rounded-lg">
                        <FileText className="h-3 w-3 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-3 mt-0">
          <div className="bg-slate-50 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Laatste Communicatie
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-1.5 bg-white rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-900">Laatste e-mail</p>
                  <p className="text-xs text-slate-600">{mockDossierDetails.lastEmail}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-white rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-900">Laatste gesprek</p>
                  <p className="text-xs text-slate-600">{mockDossierDetails.lastCall}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                  <Phone className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};
