
import React, { useState } from 'react';
import { BarChart3, Users, Mail, FileText, Receipt, Calculator, Phone, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/contexts/OrganizationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export type ViewType =
  | 'dashboard'
  | 'contacts'
  | 'emails'
  | 'documents'
  | 'invoices'
  | 'quotes'
  | 'phone-calls'
  | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { selectedOrganization } = useOrganization();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard' as ViewType, icon: BarChart3, label: 'Dashboard' },
    { id: 'contacts' as ViewType, icon: Users, label: 'Contacten' },
    { id: 'emails' as ViewType, icon: Mail, label: 'E-mails' },
    { id: 'documents' as ViewType, icon: FileText, label: 'Documenten' },
    { id: 'invoices' as ViewType, icon: Receipt, label: 'Facturen' },
    { id: 'quotes' as ViewType, icon: Calculator, label: 'Offertes' },
    { id: 'phone-calls' as ViewType, icon: Phone, label: 'Telefoongesprekken' },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary border-r">
      <div className="p-4 flex-grow">
        <ScrollArea className="h-full space-y-0.5">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "justify-start rounded-md w-full hover:bg-accent hover:text-accent-foreground",
                currentView === item.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </ScrollArea>
      </div>
      <div className="p-4">
        <Button
          variant="secondary"
          className="justify-start rounded-md w-full hover:bg-accent hover:text-accent-foreground"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Instellingen</span>
        </Button>
      </div>
    </div>
  );
};

export { Sidebar };
export default Sidebar;
