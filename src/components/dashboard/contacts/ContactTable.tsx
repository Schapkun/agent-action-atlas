
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ContactTableRow } from './ContactTableRow';
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

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Weet je zeker dat je dit contact wilt verwijderen?')) {
      await bulkDeleteContacts(new Set([contactId]));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;
    
    if (confirm(`Weet je zeker dat je ${selectedContacts.size} contact(en) wilt verwijderen?`)) {
      await bulkDeleteContacts(selectedContacts);
      setSelectedContacts(new Set());
    }
  };

  const handleToggleStatus = async (contactId: string, currentStatus: boolean) => {
    // Implementation for status toggle
    console.log('Toggle status for contact:', contactId, !currentStatus);
  };

  const handleContactsUpdated = () => {
    // Refresh contacts when updated
    console.log('Contacts updated, refresh needed');
  };

  const handleFilterByLabels = (contact: any) => {
    // Implementation for label filtering
    console.log('Filter by labels for contact:', contact.name);
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
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-8 p-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded h-4 w-4"
                  />
                </TableHead>
                <TableHead className="p-2 text-xs font-semibold w-16">Klantnr</TableHead>
                <TableHead className="p-2 text-xs font-semibold">Klant</TableHead>
                {columnVisibility.email && (
                  <TableHead className="p-2 text-xs font-semibold">E-mail</TableHead>
                )}
                {columnVisibility.address && (
                  <TableHead className="p-2 text-xs font-semibold">Adres</TableHead>
                )}
                {columnVisibility.phone && (
                  <TableHead className="p-2 text-xs font-semibold">Telefoon</TableHead>
                )}
                {columnVisibility.mobile && (
                  <TableHead className="p-2 text-xs font-semibold">Mobiel</TableHead>
                )}
                {columnVisibility.postal_code && (
                  <TableHead className="p-2 text-xs font-semibold">Postcode</TableHead>
                )}
                {columnVisibility.city && (
                  <TableHead className="p-2 text-xs font-semibold">Plaats</TableHead>
                )}
                {columnVisibility.country && (
                  <TableHead className="p-2 text-xs font-semibold">Land</TableHead>
                )}
                {columnVisibility.labels && (
                  <TableHead className="p-2 text-xs font-semibold">Labels</TableHead>
                )}
                {columnVisibility.openstaand && (
                  <TableHead className="p-2 text-xs font-semibold text-right">Openstaand</TableHead>
                )}
                {columnVisibility.omzet && (
                  <TableHead className="p-2 text-xs font-semibold text-right">Omzet</TableHead>
                )}
                {columnVisibility.actief && (
                  <TableHead className="p-2 text-xs font-semibold text-center">Actief</TableHead>
                )}
                <TableHead className="p-2 text-xs font-semibold w-20">Acties</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <td colSpan={20} className="text-center py-8 text-muted-foreground">
                    Geen contacten gevonden
                  </td>
                </TableRow>
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
