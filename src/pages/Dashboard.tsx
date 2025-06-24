
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { PendingTasksManager } from '@/components/dashboard/PendingTasksManager';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <PendingTasksManager />
    </div>
  );
};

export default Dashboard;
