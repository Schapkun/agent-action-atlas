
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, Users, Briefcase, CheckCircle, Clock } from 'lucide-react';

export const DashboardStats = () => {
  const stats = [
    {
      title: 'Totaal Acties',
      value: '247',
      change: '+12%',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Openstaande Acties',
      value: '8',
      change: '-3%',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Voltooid Vandaag',
      value: '23',
      change: '+5%',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Documenten',
      value: '1,429',
      change: '+8%',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Actieve Cliënten',
      value: '42',
      change: '+2%',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      title: 'Actieve Dossiers',
      value: '87',
      change: '+7%',
      icon: Briefcase,
      color: 'text-emerald-600'
    }
  ];

  return (
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
              <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {stat.change}
              </span>{' '}
              t.o.v. vorige week
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
