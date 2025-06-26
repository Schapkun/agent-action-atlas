
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Calendar, User, Building2, Clock, FileText } from 'lucide-react';
import { StatusUpdateTimeline } from './StatusUpdateTimeline';

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
    responsible_user_id?: string;
    start_date?: string;
    end_date?: string;
    client?: {
      name: string;
      contact_number?: string;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="!w-[95vw] !h-[98vh] !max-w-none !fixed !top-[1vh] !left-[2.5vw] !transform-none !translate-x-0 !translate-y-0 p-0 rounded-lg overflow-hidden flex flex-col bg-white">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 rounded-lg p-2">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-900">{dossier.name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(dossier.status)}>
                      {dossier.status}
                    </Badge>
                    {dossier.priority && (
                      <Badge variant="outline" className={getPriorityColor(dossier.priority)}>
                        {dossier.priority}
                      </Badge>
                    )}
                    {dossier.category && (
                      <Badge variant="outline" className="text-xs">
                        {dossier.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="timeline" className="h-full flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-white p-0">
              <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800">
                Status Updates
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-800">
                Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="flex-1 p-6 overflow-y-auto bg-slate-50 mt-0">
              <StatusUpdateTimeline dossierId={dossier.id} />
            </TabsContent>
            
            <TabsContent value="details" className="flex-1 p-6 overflow-y-auto bg-slate-50 mt-0">
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Dossier Informatie</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {(dossier.client_name || dossier.client) && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Client</p>
                          <p className="text-slate-600">
                            {dossier.client_name || dossier.client?.name}
                            {dossier.client?.contact_number && (
                              <span className="text-slate-400 ml-2">#{dossier.client.contact_number}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Aangemaakt</p>
                        <p className="text-slate-600">
                          {new Date(dossier.created_at).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {dossier.start_date && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Startdatum</p>
                          <p className="text-slate-600">
                            {new Date(dossier.start_date).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {dossier.end_date && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Einddatum</p>
                          <p className="text-slate-600">
                            {new Date(dossier.end_date).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {dossier.description && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 mb-2">Beschrijving</p>
                        <p className="text-slate-600 leading-relaxed">{dossier.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
