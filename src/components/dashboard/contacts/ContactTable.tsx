
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { StandardContactCard } from '@/components/contacts/StandardContactCard';
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
          {/* Header met bulk selectie */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">
                {selectedContacts.size > 0 
                  ? `${selectedContacts.size} contact(en) geselecteerd`
                  : `${filteredContacts.length} contact(en)`
                }
              </span>
              
              {selectedContacts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Verwijderen
                </button>
              )}
            </div>
          </div>

          {/* Contact lijst */}
          <div className="divide-y">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Geen contacten gevonden
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div key={contact.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <StandardContactCard
                        contact={contact}
                        variant="compact"
                        showActions={true}
                        onEdit={setEditingContact}
                        onView={setEditingContact}
                        onContactsUpdated={() => {}}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
