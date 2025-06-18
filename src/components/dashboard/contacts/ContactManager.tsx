
import { ContactTable } from './ContactTable';
import { ContactTableFilters } from './ContactTableFilters';
import { ContactEmptyState } from './ContactEmptyState';
import { useContactManager } from './useContactManager';
import { ContactTableHeader } from './ContactTableHeader';

export const ContactManager = () => {
  const {
    selectedOrganization,
    selectedWorkspace,
  } = useContactManager();

  if (!selectedOrganization && !selectedWorkspace) {
    return <ContactEmptyState canInviteUsers={false} onContactsUpdated={() => {}} />;
  }

  return (
    <div className="space-y-6">
      <ContactTableHeader 
        isAllSelected={false}
        isIndeterminate={false}
        selectedContactsCount={0}
        columnVisibility={{
          email: true,
          address: false,
          phone: false,
          mobile: false,
          postal_code: false,
          city: false,
          country: false,
          openstaand: true,
          omzet: true,
          actief: true,
          labels: false
        }}
        onColumnVisibilityChange={() => {}}
        onSelectAll={() => {}}
        onBulkDelete={() => {}}
      />
      <ContactTableFilters 
        searchTerm=""
        onSearchChange={() => {}}
        canInviteUsers={false}
        contextInfo="Geen selectie"
        labelFilter={[]}
        onRemoveLabelFilter={() => {}}
        onContactsUpdated={() => {}}
      />
      <ContactTable />
    </div>
  );
};
