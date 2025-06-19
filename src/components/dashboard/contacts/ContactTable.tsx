
import { Table, TableBody } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ContactTableRow } from './ContactTableRow';
import { ContactTableHeader } from './ContactTableHeader';
import { useContactManager } from './useContactManager';
import { useState } from 'react';
import { ContactEditDialog } from './ContactEditDialog';

export const ContactTable = () => {
  const {
    filteredContacts,
    loading,
    selectedContacts,
    setSelectedContacts,
    columnVisibility,
    setColumnVisibility,
    isAllSelected,
    isIndeterminate,
    bulkDeleteContacts
  } = useContactManager();

  const [editingContact, setEditingContact] = useState(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;
    
    if (confirm(`Weet je zeker dat je ${selectedContacts.size} contact(en) wilt verwijderen?`)) {
      await bulkDeleteContacts(selectedContacts);
      setSelectedContacts(new Set());
    }
  };

  const handleToggleStatus = async (contactId: string, currentStatus: boolean) => {
    console.log('Toggle status for contact:', contactId, !currentStatus);
  };

  const handleContactsUpdated = () => {
    console.log('Contacts updated, refresh needed');
  };

  const handleFilterByLabels = (contact: any) => {
    console.log('Filter by labels for contact:', contact.name);
  };

  const handleColumnVisibilityChange = (column: string, checked: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: checked
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Contacten laden...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <ContactTableHeader
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              selectedContactsCount={selectedContacts.size}
              columnVisibility={columnVisibility}
              onSelectAll={handleSelectAll}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onBulkDelete={handleBulkDelete}
            />
            
            <TableBody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={20} className="text-center py-8 text-muted-foreground">
                    Geen contacten gevonden
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <ContactTableRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContacts.has(contact.id)}
                    columnVisibility={columnVisibility}
                    onSelect={handleSelectContact}
                    onToggleStatus={handleToggleStatus}
                    onContactsUpdated={handleContactsUpdated}
                    onFilterByLabels={handleFilterByLabels}
                    onEditContact={setEditingContact}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingContact && (
        <ContactEditDialog
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
        />
      )}
    </>
  );
};
