
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { PendingTasksManager } from '@/components/dashboard/PendingTasksManager';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <Separator />
      <PendingTasksManager />
    </div>
  );
};

export default Dashboard;
