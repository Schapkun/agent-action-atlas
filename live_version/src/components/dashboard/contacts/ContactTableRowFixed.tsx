
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Contact, ColumnVisibility } from '@/components/dashboard/contacts/useContactManager';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactTableRowFixedProps {
  contact: Contact;
  columnVisibility: ColumnVisibility;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onView: (contact: Contact) => void;
}

export const ContactTableRowFixed = ({
  contact,
  columnVisibility,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView
}: ContactTableRowFixedProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleActiveToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      console.log('🔄 Updating contact active status:', contact.id, checked);
      
      const { error } = await supabase
        .from('clients')
        .update({ is_active: checked })
        .eq('id', contact.id);

      if (error) {
        console.error('❌ Error updating contact active status:', error);
        throw error;
      }

      console.log('✅ Contact active status updated successfully');
      toast({
        title: "Succes",
        description: `Contact ${checked ? 'geactiveerd' : 'gedeactiveerd'}`
      });
    } catch (error) {
      console.error('Error updating contact active status:', error);
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded"
        />
      </TableCell>
      
      <TableCell className="font-medium">
        <div>
          <div className="font-medium">{contact.name}</div>
          <div className="text-sm text-muted-foreground">
            {contact.contact_number || `#${contact.id.slice(0, 8)}`}
          </div>
        </div>
      </TableCell>

      {columnVisibility.email && (
        <TableCell>{contact.email || '-'}</TableCell>
      )}

      {columnVisibility.address && (
        <TableCell>{contact.address || '-'}</TableCell>
      )}

      {columnVisibility.phone && (
        <TableCell>{contact.phone || '-'}</TableCell>
      )}

      {columnVisibility.mobile && (
        <TableCell>{contact.mobile || '-'}</TableCell>
      )}

      {columnVisibility.postal_code && (
        <TableCell>{contact.postal_code || '-'}</TableCell>
      )}

      {columnVisibility.city && (
        <TableCell>{contact.city || '-'}</TableCell>
      )}

      {columnVisibility.country && (
        <TableCell>{contact.country || 'Nederland'}</TableCell>
      )}

      {columnVisibility.openstaand && (
        <TableCell>
          <Badge variant="outline" className="text-green-600">
            €0,00
          </Badge>
        </TableCell>
      )}

      {columnVisibility.omzet && (
        <TableCell>
          <Badge variant="outline" className="text-blue-600">
            €0,00
          </Badge>
        </TableCell>
      )}

      {columnVisibility.actief && (
        <TableCell>
          <Switch
            checked={contact.is_active !== false}
            onCheckedChange={handleActiveToggle}
            disabled={isUpdating}
            className="data-[state=checked]:bg-green-500"
          />
        </TableCell>
      )}

      {columnVisibility.labels && (
        <TableCell>
          <div className="flex gap-1 flex-wrap">
            {contact.labels?.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                style={{ backgroundColor: `${label.color}20`, color: label.color, borderColor: label.color }}
                className="text-xs"
              >
                {label.name}
              </Badge>
            )) || '-'}
          </div>
        </TableCell>
      )}

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(contact)}>
              <Eye className="mr-2 h-4 w-4" />
              Bekijken
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(contact)}>
              <Edit className="mr-2 h-4 w-4" />
              Bewerken
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(contact.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
