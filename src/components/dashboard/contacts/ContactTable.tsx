
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ContactTableRowFixed } from './ContactTableRowFixed';
import { useContactManager } from './useContactManager';
import { useState } from 'react';
import { ContactEditDialog } from './ContactEditDialog';
import { ContactInvoicesDialog } from './ContactInvoicesDialog';
import { ContactQuotesDialog } from './ContactQuotesDialog';
import { ContactEmailDialog } from './ContactEmailDialog';
import { ContactLabelsDialog } from './ContactLabelsDialog';

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
  const [viewingContactId, setViewingContactId] = useState(null);
  const [emailContactId, setEmailContactId] = useState(null);
  const [invoicesContactId, setInvoicesContactId] = useState(null);
  const [quotesContactId, setQuotesContactId] = useState(null);
  const [labelsContactId, setLabelsContactId] = useState(null);

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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  {columnVisibility.email && <TableHead>Email</TableHead>}
                  {columnVisibility.address && <TableHead>Adres</TableHead>}
                  {columnVisibility.phone && <TableHead>Telefoon</TableHead>}
                  {columnVisibility.mobile && <TableHead>Mobiel</TableHead>}
                  {columnVisibility.postal_code && <TableHead>Postcode</TableHead>}
                  {columnVisibility.city && <TableHead>Plaats</TableHead>}
                  {columnVisibility.country && <TableHead>Land</TableHead>}
                  {columnVisibility.openstaand && <TableHead>Openstaand</TableHead>}
                  {columnVisibility.omzet && <TableHead>Omzet</TableHead>}
                  {columnVisibility.actief && <TableHead>Actief</TableHead>}
                  {columnVisibility.labels && <TableHead>Labels</TableHead>}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <td colSpan={12} className="text-center py-8 text-muted-foreground">
                      Geen contacten gevonden
                    </td>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <ContactTableRowFixed
                      key={contact.id}
                      contact={contact}
                      columnVisibility={columnVisibility}
                      isSelected={selectedContacts.has(contact.id)}
                      onSelect={(checked) => handleSelectContact(contact.id, checked)}
                      onEdit={setEditingContact}
                      onDelete={handleDeleteContact}
                      onView={setEditingContact}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {selectedContacts.size > 0 && (
            <div className="p-4 border-t bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedContacts.size} contact(en) geselecteerd
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          )}
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
