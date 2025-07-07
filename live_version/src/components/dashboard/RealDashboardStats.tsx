import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, Users, Briefcase, CheckCircle, Clock, Euro, TrendingUp, Mail } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const RealDashboardStats = () => {
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { stats, loading } = useDashboardStats();

  const statItems = [
    {
      title: 'Nieuwe Berichten',
      value: stats.pendingActions.toString(),
      change: stats.pendingActions > 0 ? `${stats.pendingActions} ongelezen` : 'Geen nieuwe',
      icon: Mail,
      color: 'text-blue-600'
    },
    {
      title: 'Totaal AI Acties',
      value: stats.totalActions.toString(),
      change: `~${stats.estimatedHoursSaved}u bespaard`,
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Week Omzet',
      value: `€${stats.weekRevenue.toFixed(0)}`,
      change: 'Gefactureerd',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Maand Omzet',
      value: `€${stats.monthRevenue.toFixed(0)}`,
      change: 'Gefactureerd',
      icon: Euro,
      color: 'text-emerald-600'
    },
    {
      title: 'Actieve Cliënten',
      value: stats.activeClients.toString(),
      change: '+15%',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      title: 'Actieve Dossiers',
      value: stats.activeDossiers.toString(),
      change: '+7%',
      icon: Briefcase,
      color: 'text-orange-600'
    }
  ];

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Data voor: {getContextInfo()}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statItems.map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Data voor: {getContextInfo()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statItems.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
