import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Calendar, Building2, FileText, AlertCircle, Clock, Euro, User, Mail, Phone, ExternalLink, Plus, Download, Edit, Trash2 } from 'lucide-react';
import { AddStatusUpdateDialog } from './AddStatusUpdateDialog';
import { AddDeadlineDialog } from './AddDeadlineDialog';
import { EditDeadlineDialog } from './EditDeadlineDialog';
import { useDossierStatusUpdates } from '@/hooks/useDossierStatusUpdates';
import { useDossierDeadlines } from '@/hooks/useDossierDeadlines';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';
import { useToast } from '@/hooks/use-toast';

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
      id?: string;
      name: string;
    };
  };
  children: React.ReactNode;
}

export const DossierDetailDialog = ({ dossier, children }: DossierDetailDialogProps) => {
  const [open, setOpen] = useState(false);
  const { statusUpdates, isLoading: statusLoading } = useDossierStatusUpdates(dossier.id);
  const { deadlines, isLoading: deadlinesLoading } = useDossierDeadlines(dossier.id);
  const { settings } = useOrganizationSettings();
  const { toast } = useToast();

  const handleEditClient = () => {
    toast({
      title: "Client bewerken",
      description: "Client bewerk functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleEditNotes = () => {
    toast({
      title: "Notities bewerken",
      description: "Notities bewerk functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleEditActivity = (activityId: string) => {
    toast({
      title: "Activiteit bewerken",
      description: "Activiteit bewerk functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleDeleteActivity = (activityId: string) => {
    toast({
      title: "Activiteit verwijderen",
      description: "Activiteit verwijder functionaliteit wordt binnenkort toegevoegd.",
      variant: "destructive"
    });
  };

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

  const getDeadlineColor = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffInHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours <= settings.deadline_red_hours) {
      return 'text-red-600';
    } else if (diffInDays <= settings.deadline_orange_days) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadlineDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    internalNotes: 'Cliënt wacht nog op aangepaste conceptovereenkomst',
    clientContact: {
      name: dossier.client_name || 'Onbekende Client',
      phone: '+31 6 12345678',
      email: 'marie@dekorenbloem.nl',
      address: 'Hoofdstraat 123, 1234 AB Amsterdam'
    },
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

  const upcomingDeadlines = deadlines.filter(d => d.status === 'pending').slice(0, 3);
  const nextDeadline = upcomingDeadlines[0];

  // Separate activities by type
  const recentActivities = statusUpdates.map(update => ({
    id: update.id,
    type: 'status_update' as const,
    title: update.status_title,
    description: update.status_description,
    date: update.created_at,
    priority: update.priority,
    update_type: update.update_type,
    hours_spent: update.hours_spent,
    is_billable: update.is_billable,
    dossier_id: update.dossier_id
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentDeadlines = deadlines.map(deadline => ({
    id: deadline.id,
    type: 'deadline' as const,
    title: deadline.title,
    description: deadline.description,
    date: deadline.due_date,
    createdDate: deadline.created_at,
    priority: deadline.priority,
    status: deadline.status,
    dossier_id: deadline.dossier_id,
    deadline: deadline
  })).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 rounded-lg p-2">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">{dossier.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(dossier.status)}`}>
                    {getStatusLabel(dossier.status)}
                  </Badge>
                  {dossier.priority && (
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(dossier.priority)}`}>
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
            
            {/* Action Buttons - Same line as title */}
            <div className="flex gap-2">
              <AddStatusUpdateDialog 
                dossierId={dossier.id}
                clientName={dossier.client_name || dossier.client?.name}
              >
                <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Status Update
                </Button>
              </AddStatusUpdateDialog>
              <AddDeadlineDialog
                dossierId={dossier.id}
                clientName={dossier.client_name || dossier.client?.name}
              >
                <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Deadline
                </Button>
              </AddDeadlineDialog>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 mb-3 flex-shrink-0">
            <TabsTrigger value="overview" className="text-xs">Overzicht</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financieel & Documenten</TabsTrigger>
            <TabsTrigger value="communication" className="text-xs">Communicatie</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="space-y-3 mt-0 h-full">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700">Uren</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {mockDossierDetails.hoursSpent}h
                  </div>
                  <div className="text-xs text-slate-600">
                    Nog {mockDossierDetails.hoursAvailable}h beschikbaar
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Euro className="h-3 w-3 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700">Waarde</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    €{mockDossierDetails.totalValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">
                    €{mockDossierDetails.hourlyRate}/uur
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700">Toegewezen</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900">
                    {mockDossierDetails.assignedUser}
                  </div>
                  <div className="text-xs text-slate-600">
                    Verantwoordelijk
                  </div>
                </div>

                <div className={`rounded-lg p-3 ${nextDeadline ? 'bg-orange-50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`h-3 w-3 ${nextDeadline ? 'text-orange-600' : 'text-slate-600'}`} />
                    <span className={`text-xs font-medium ${nextDeadline ? 'text-orange-700' : 'text-slate-700'}`}>Deadline</span>
                  </div>
                  {nextDeadline ? (
                    <>
                      <div className={`text-xs font-semibold ${getDeadlineColor(nextDeadline.due_date)}`}>
                        {formatDeadlineDateTime(nextDeadline.due_date)}
                      </div>
                      <div className="text-xs text-orange-600">
                        {nextDeadline.title}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-600">
                      Geen deadlines
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Client Informatie
                  </h3>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 h-6 w-6 p-0" onClick={handleEditClient}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Naam</p>
                    <p className="text-xs text-slate-900">{mockDossierDetails.clientContact.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Telefoon</p>
                    <p className="text-xs text-slate-900">{mockDossierDetails.clientContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Adres</p>
                    <p className="text-xs text-slate-900">{mockDossierDetails.clientContact.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">E-mail</p>
                    <p className="text-xs text-slate-900">{mockDossierDetails.clientContact.email}</p>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900">Interne Notities</h3>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600" onClick={handleEditNotes}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-slate-700">{mockDossierDetails.internalNotes}</p>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Komende Deadlines
                  </h3>
                </div>
                {deadlinesLoading ? (
                  <div className="text-xs text-slate-600">Deadlines laden...</div>
                ) : upcomingDeadlines.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                        <div>
                          <p className={`text-xs font-medium ${getDeadlineColor(deadline.due_date)}`}>
                            {formatDeadlineDateTime(deadline.due_date)}
                          </p>
                          <p className="text-xs font-medium text-slate-900">{deadline.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(deadline.priority)}`}>
                            {getPriorityLabel(deadline.priority)}
                          </Badge>
                          <EditDeadlineDialog deadline={deadline} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">Geen komende deadlines</div>
                )}
              </div>

              {/* Deadlines Section */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Deadlines
                  </h3>
                </div>
                {deadlinesLoading ? (
                  <div className="text-xs text-slate-600">Deadlines laden...</div>
                ) : recentDeadlines.length > 0 ? (
                  <div className="space-y-2">
                    {recentDeadlines.slice(0, 5).map((deadline) => (
                      <div key={`deadline-${deadline.id}`} className="flex items-start justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="bg-slate-100 p-1 rounded-lg flex-shrink-0">
                            <Calendar className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${getDeadlineColor(deadline.date)}`}>
                              {formatDeadlineDateTime(deadline.date)}
                            </p>
                            <p className="text-xs font-medium text-slate-900 truncate">{deadline.title}</p>
                            {deadline.description && (
                              <p className="text-xs text-slate-700 line-clamp-2">{deadline.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 flex-shrink-0 ml-2">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">
                              {formatDateTime(deadline.createdDate)}
                            </span>
                            <Badge variant="outline" className={`text-xs mt-1 ${getPriorityColor(deadline.priority)}`}>
                              {getPriorityLabel(deadline.priority)}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <EditDeadlineDialog deadline={deadline.deadline} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">Geen deadlines gevonden</div>
                )}
              </div>

              {/* Recente activiteiten */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
                </div>
                {statusLoading ? (
                  <div className="text-xs text-slate-600">Activiteiten laden...</div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivities.slice(0, 10).map((activity) => (
                      <div key={`activity-${activity.id}`} className="flex items-start justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="bg-slate-100 p-1 rounded-lg flex-shrink-0">
                            <Clock className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">{activity.title}</p>
                            <p className="text-xs text-slate-600 mb-1">
                              Type: {UPDATE_TYPE_LABELS[activity.update_type] || activity.update_type}
                            </p>
                            {activity.description && (
                              <p className="text-xs text-slate-700 line-clamp-2">{activity.description}</p>
                            )}
                            {activity.hours_spent > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                {activity.hours_spent}h besteed {activity.is_billable ? '(factureerbaar)' : '(niet factureerbaar)'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 flex-shrink-0 ml-2">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">
                              {formatDateTime(activity.date)}
                            </span>
                            <Badge variant="outline" className={`text-xs mt-1 ${getPriorityColor(activity.priority)}`}>
                              {getPriorityLabel(activity.priority)}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600" onClick={() => handleEditActivity(activity.id)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-red-600" onClick={() => handleDeleteActivity(activity.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">Geen activiteiten gevonden</div>
                )}
              </div>

              {/* Description */}
              {dossier.description && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Beschrijving
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{dossier.description}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Uren & Tarieven</h3>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
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
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-xs text-slate-600">Uurtarief:</span>
                      <span className="text-xs font-medium">€{mockDossierDetails.hourlyRate}/uur</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600">Totale waarde:</span>
                      <span className="text-sm font-semibold">€{mockDossierDetails.totalValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">Facturatie & Betalingen</h3>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600">Totaal gefactureerd:</span>
                      <span className="text-xs font-medium">€{mockDossierDetails.totalInvoiced.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600">Betaald:</span>
                      <span className="text-xs font-medium text-green-600">€{mockDossierDetails.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-xs text-slate-600">Openstaand:</span>
                      <span className="text-sm font-semibold text-orange-600">€{mockDossierDetails.outstanding.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
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
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto">
                    {mockDossierDetails.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 p-1.5 rounded-lg">
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

            <TabsContent value="communication" className="space-y-4 mt-0">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Laatste Communicatie
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-slate-900">Laatste e-mail</p>
                      <p className="text-xs text-slate-600">{mockDossierDetails.lastEmail}</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
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
      </DialogContent>
    </Dialog>
  );
};
