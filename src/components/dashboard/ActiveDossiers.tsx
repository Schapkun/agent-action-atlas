
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Calendar, Clock, Search, Filter, Plus, User, Building2 } from 'lucide-react';
import { useDossiers } from '@/hooks/useDossiers';
import { DossierDetailDialog } from '@/components/dossiers/DossierDetailDialog';
import { CreateDossierDialog } from '@/components/dossiers/CreateDossierDialog';
import { DossierUpdatesSection } from './DossierUpdatesSection';

export const ActiveDossiers = () => {
  const { dossiers, loading } = useDossiers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

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

  const filteredDossiers = dossiers.filter(dossier => {
    const matchesSearch = dossier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dossier.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dossier.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeDossiers = filteredDossiers.filter(d => d.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actieve Dossiers</h1>
          <p className="text-slate-600">Beheer en volg de voortgang van je actieve rechtszaken</p>
        </div>
        
        <CreateDossierDialog>
          <Button className="bg-slate-800 hover:bg-slate-700">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Dossier
          </Button>
        </CreateDossierDialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Dossiers Overzicht</TabsTrigger>
          <TabsTrigger value="updates">Recente Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Zoek dossiers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Statussen</SelectItem>
                    <SelectItem value="active">Actief</SelectItem>
                    <SelectItem value="pending">In Behandeling</SelectItem>
                    <SelectItem value="completed">Voltooid</SelectItem>
                    <SelectItem value="cancelled">Geannuleerd</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Prioriteit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Prioriteiten</SelectItem>
                    <SelectItem value="low">Laag</SelectItem>
                    <SelectItem value="medium">Normaal</SelectItem>
                    <SelectItem value="high">Hoog</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dossiers Grid */}
          {filteredDossiers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Geen dossiers gevonden</h3>
                  <p className="text-slate-600 mb-4">
                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                      ? 'Geen dossiers gevonden die voldoen aan je zoekcriteria.'
                      : 'Je hebt nog geen dossiers aangemaakt.'
                    }
                  </p>
                  <CreateDossierDialog>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Dossier Aanmaken
                    </Button>
                  </CreateDossierDialog>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDossiers.map((dossier) => (
                <DossierDetailDialog key={dossier.id} dossier={dossier}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-slate-800 rounded-lg p-2">
                            <Scale className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(dossier.status)}>
                              {getStatusLabel(dossier.status)}
                            </Badge>
                            {dossier.priority && (
                              <Badge variant="outline" className={getPriorityColor(dossier.priority)}>
                                {getPriorityLabel(dossier.priority)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-2">
                        {dossier.name}
                      </CardTitle>
                      {dossier.description && (
                        <CardDescription className="line-clamp-2">
                          {dossier.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {dossier.client_name && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User className="h-4 w-4" />
                            <span>Client: {dossier.client_name}</span>
                          </div>
                        )}
                        
                        {dossier.category && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Building2 className="h-4 w-4" />
                            <span className="capitalize">Categorie: {dossier.category}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>Aangemaakt: {new Date(dossier.created_at).toLocaleDateString('nl-NL')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DossierDetailDialog>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recente Updates & Deadlines
              </CardTitle>
              <CardDescription>
                Overzicht van alle recente status updates en komende deadlines van je dossiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DossierUpdatesSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
