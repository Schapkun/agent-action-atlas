
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, Users, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export const DashboardStats = () => {
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // For now, show placeholder data since we'll implement actual data fetching later
  // This will be replaced with real data queries based on selected organization/workspace
  const stats = [
    {
      title: 'Totaal Acties',
      value: '-',
      change: '-',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Openstaande Acties',
      value: '-',
      change: '-',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Voltooid Vandaag',
      value: '-',
      change: '-',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Documenten',
      value: '-',
      change: '-',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Actieve Cliënten',
      value: '-',
      change: '-',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      title: 'Actieve Dossiers',
      value: '-',
      change: '-',
      icon: Briefcase,
      color: 'text-emerald-600'
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

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Data voor: {getContextInfo()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
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
                {stat.change !== '-' && (
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                )}
                {stat.change !== '-' && ' t.o.v. vorige week'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
