
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActionOverview } from '@/components/dashboard/ActionOverview';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">Overzicht van uw activiteiten en prestaties</p>
      </div>
      
      <DashboardStats />
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">AI Acties</h2>
          <p className="text-sm text-muted-foreground">Recente geautomatiseerde acties en processen</p>
        </div>
        <ActionOverview limit={10} showFilters={false} />
      </div>
    </div>
  );
};

export default Dashboard;
