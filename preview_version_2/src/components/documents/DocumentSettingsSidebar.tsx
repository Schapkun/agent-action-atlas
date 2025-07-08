
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DocumentSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
  onSettingsChange: (settings: any) => void;
}

export const DocumentSettingsSidebar = ({
  show,
  onClose,
  onSettingsChange
}: DocumentSettingsSidebarProps) => {
  const navigate = useNavigate();

  const handleOpenFullSettings = () => {
    navigate('/instellingen?tab=templates');
    onClose();
  };

  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Document Instellingen
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="text-sm text-muted-foreground">
            Beheer je document templates, labels en instellingen in het volledige instellingen menu.
          </div>
          
          <Button 
            onClick={handleOpenFullSettings}
            className="w-full"
          >
            Open Template Beheer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
