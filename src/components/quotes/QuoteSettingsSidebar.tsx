
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface QuoteSettingsSidebarProps {
  show: boolean;
  onClose: () => void;
  onSettingsChange: (settings: any) => void;
}

export const QuoteSettingsSidebar = ({
  show,
  onClose,
  onSettingsChange
}: QuoteSettingsSidebarProps) => {
  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Offerte Instellingen</SheetTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">BTW weergave</Label>
            <Select defaultValue="separate">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="separate">BTW apart weergeven</SelectItem>
                <SelectItem value="included">BTW inbegrepen</SelectItem>
                <SelectItem value="excluded">Zonder BTW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Automatische berekening</Label>
            <div className="flex items-center space-x-2">
              <Switch id="auto-calc" defaultChecked />
              <Label htmlFor="auto-calc" className="text-sm">
                Totalen automatisch berekenen
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Klantgegevens</Label>
            <div className="flex items-center space-x-2">
              <Switch id="show-address" defaultChecked />
              <Label htmlFor="show-address" className="text-sm">
                Adres tonen op offerte
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Geldigheid</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14">14 dagen</SelectItem>
                <SelectItem value="30">30 dagen</SelectItem>
                <SelectItem value="60">60 dagen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
