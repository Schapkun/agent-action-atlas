
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActionOverview } from '@/components/dashboard/ActionOverview';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <ActionOverview limit={10} showFilters={false} />
    </div>
  );
};

export default Dashboard;
