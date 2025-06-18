import { ContactTable } from './ContactTable';
import { ContactTableFilters } from './ContactTableFilters';
import { ContactEmptyState } from './ContactEmptyState';
import { useContactManager } from './useContactManager';
import { ContactTableHeader } from './ContactTableHeader';

export const ContactManager = () => {
  const {
    searchTerm,
    userRole,
    contacts,
    loading,
    selectedContacts,
    columnVisibility,
    filteredContacts,
    isAllSelected,
    isIndeterminate,
    selectedOrganization,
    selectedWorkspace,
    setSearchTerm,
    setContacts,
    setSelectedContacts,
    setColumnVisibility,
    toast,
    fetchContacts,
    bulkDeleteContacts
    ,
  } = useContactManager();

  if (!selectedOrganization && !selectedWorkspace) {
    return <ContactEmptyState />;
  }

  return (
    <div className="space-y-6">
      <ContactTableHeader />
      <ContactTableFilters />
      <ContactTable />
    </div>
  );
};
