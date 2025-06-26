
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Calendar, Building2, FileText, AlertCircle, Clock, Euro, User, Mail, Phone, ExternalLink } from 'lucide-react';

interface DossierDetailDialogProps {
  dossier: {
    id: string;
    name: string;
    description?: string;
    status: string;
    category?: string;
    priority?: string;
    client_name?: string;
    created_at: string;
    client?: {
      name: string;
    };
  };
  children: React.ReactNode;
}

export const DossierDetailDialog = ({ dossier, children }: DossierDetailDialogProps) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'pending': return 'In Behandeling';
      case 'completed': return 'Voltooid';
      case 'cancelled': return 'Geannuleerd';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Laag';
      case 'medium': return 'Normaal';
      case 'high': return 'Hoog';
      case 'urgent': return 'Urgent';
      default: return priority;
    }
  };

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
    documentCount: 5,
    lastDocument: 'Leveringscontract biologisch meel (01-06-2025)',
    lastCall: '15 min gesprek - intake nieuwe leveringscontract',
    assignedUser: 'Marie van der Berg',
    nextDeadline: '28 juni 2025 - Conceptovereenkomst opstellen',
    internalNotes: 'Cliënt wacht nog op aangepaste conceptovereenkomst',
    clientContact: {
      email: 'marie@dekorenbloem.nl',
      phone: '+31 6 12345678',
      address: 'Hoofdstraat 123, 1234 AB Amsterdam'
    },
    recentActivities: [
      {
        date: 'Vandaag 14:23',
        type: 'email',
        description: 'E-mail ontvangen: Vraag over nieuwe leveringscontract',
        user: 'Marie van der Berg'
      },
      {
        date: 'Gisteren 16:45',
        type: 'document',
        description: 'Contract opgesteld: Leveringscontract Biologisch Meel Q1-Q2 2025',
        user: 'Marie van der Berg'
      },
      {
        date: '1 week geleden',
        type: 'phone',
        description: 'Telefoongesprek: Intake gesprek nieuwe leveringscontract (15 min)',
        user: 'Marie van der Berg'
      }
    ],
    upcomingDeadlines: [
      {
        date: '28 juni 2025',
        description: 'Conceptovereenkomst opstellen',
        priority: 'high'
      },
      {
        date: '5 juli 2025',
        description: 'Definitieve overeenkomst verzenden',
        priority: 'medium'
      }
    ]
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 rounded-lg p-2">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">{dossier.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(dossier.status)}>
                  {getStatusLabel(dossier.status)}
                </Badge>
                {dossier.priority && (
                  <Badge variant="outline" className={getPriorityColor(dossier.priority)}>
                    {getPriorityLabel(dossier.priority)}
                  </Badge>
                )}
                {dossier.category && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {dossier.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="financial">Financieel</TabsTrigger>
            <TabsTrigger value="communication">Communicatie</TabsTrigger>
            <TabsTrigger value="timeline">Tijdlijn</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Uren</span>
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {mockDossierDetails.hoursSpent}h
                </div>
                <div className="text-xs text-slate-600">
                  Nog {mockDossierDetails.hoursAvailable}h beschikbaar
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Waarde</span>
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  €{mockDossierDetails.totalValue.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">
                  €{mockDossierDetails.hourlyRate}/uur
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Toegewezen</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {mockDossierDetails.assignedUser}
                </div>
                <div className="text-xs text-slate-600">
                  Verantwoordelijk
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Deadline</span>
                </div>
                <div className="text-sm font-semibold text-orange-900">
                  28 juni
                </div>
                <div className="text-xs text-orange-600">
                  Conceptovereenkomst
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Informatie
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Naam</p>
                  <p className="text-slate-900">{dossier.client_name || dossier.client?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">E-mail</p>
                  <p className="text-slate-900">{mockDossierDetails.clientContact.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Telefoon</p>
                  <p className="text-slate-900">{mockDossierDetails.clientContact.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Adres</p>
                  <p className="text-slate-900">{mockDossierDetails.clientContact.address}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Komende Deadlines
              </h3>
              <div className="space-y-3">
                {mockDossierDetails.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-slate-900">{deadline.description}</p>
                      <p className="text-sm text-slate-600">{deadline.date}</p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(deadline.priority)}>
                      {getPriorityLabel(deadline.priority)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {dossier.description && (
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Beschrijving
                </h3>
                <p className="text-slate-700 leading-relaxed">{dossier.description}</p>
              </div>
            )}

            {/* Internal Notes */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Interne Notities</h3>
              <p className="text-slate-700">{mockDossierDetails.internalNotes}</p>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Uren & Tarieven</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bestede uren:</span>
                    <span className="font-medium">{mockDossierDetails.hoursSpent}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Beschikbare uren:</span>
                    <span className="font-medium">{mockDossierDetails.hoursAvailable}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Totaal uren:</span>
                    <span className="font-medium">{mockDossierDetails.totalHours}h</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-slate-600">Uurtarief:</span>
                    <span className="font-medium">€{mockDossierDetails.hourlyRate}/uur</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Totale waarde:</span>
                    <span className="font-semibold text-lg">€{mockDossierDetails.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Facturatie & Betalingen</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Totaal gefactureerd:</span>
                    <span className="font-medium">€{mockDossierDetails.totalInvoiced.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Betaald:</span>
                    <span className="font-medium text-green-600">€{mockDossierDetails.paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-slate-600">Openstaand:</span>
                    <span className="font-semibold text-lg text-orange-600">€{mockDossierDetails.outstanding.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Laatste Communicatie
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Laatste e-mail</p>
                      <p className="text-sm text-slate-600">{mockDossierDetails.lastEmail}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Laatste gesprek</p>
                      <p className="text-sm text-slate-600">{mockDossierDetails.lastCall}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documenten
                </h3>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{mockDossierDetails.documentCount} documenten</p>
                    <p className="text-sm text-slate-600">Laatste: {mockDossierDetails.lastDocument}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Bekijk alle
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recente Activiteiten</h3>
              <div className="space-y-4">
                {mockDossierDetails.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      {activity.type === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'document' && <FileText className="h-4 w-4 text-green-600" />}
                      {activity.type === 'phone' && <Phone className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900">{activity.description}</p>
                          <p className="text-sm text-slate-600">Door: {activity.user}</p>
                        </div>
                        <span className="text-sm text-slate-500">{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
