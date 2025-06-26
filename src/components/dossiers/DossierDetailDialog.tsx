
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Scale, Calendar, Building2, FileText } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
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
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Dossier Informatie</h3>
            
            <div className="space-y-4">
              {(dossier.client_name || dossier.client) && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Client</p>
                    <p className="text-slate-600">
                      {dossier.client_name || dossier.client?.name}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
