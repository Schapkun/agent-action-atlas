
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { FilterSelector } from './FilterSelector';
import { HeaderActions } from './HeaderActions';
import { getViewTitle } from '@/utils/viewTitles';
import type { ViewType } from '@/components/dashboard/Sidebar';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
}

export const Header = ({ currentView, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">
            {getViewTitle(currentView)}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <FilterSelector />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
};
