
import { ContactTable } from './ContactTable';
import { ContactTableFilters } from './ContactTableFilters';
import { ContactEmptyState } from './ContactEmptyState';
import { useContactManager } from './useContactManager';

export const ContactManager = () => {
  const {
    selectedOrganization,
    selectedWorkspace,
    filteredContacts,
    loading,
    searchTerm,
    setSearchTerm,
    labelFilter,
    removeLabelFilter,
    refreshContacts
  } = useContactManager();

  const handleContactsUpdated = () => {
    refreshContacts();
  };

  if (!selectedOrganization && !selectedWorkspace) {
    return <ContactEmptyState canInviteUsers={false} onContactsUpdated={handleContactsUpdated} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">Contacten laden...</div>
      </div>
    );
  }

  if (filteredContacts.length === 0 && !searchTerm) {
    return <ContactEmptyState canInviteUsers={true} onContactsUpdated={handleContactsUpdated} />;
  }

  return (
    <div className="space-y-6">
      <ContactTableFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        canInviteUsers={true}
        contextInfo={selectedOrganization ? `Organisatie: ${selectedOrganization.name}` : `Werkruimte: ${selectedWorkspace?.name}`}
        labelFilter={labelFilter}
        onRemoveLabelFilter={removeLabelFilter}
        onContactsUpdated={handleContactsUpdated}
      />
      <ContactTable />
    </div>
  );
};
