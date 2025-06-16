
interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  payment_terms?: number;
  contact_number?: string;
}

interface ContactDropdownProps {
  isOpen: boolean;
  loading: boolean;
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  onClose: () => void;
}

export const ContactDropdown = ({
  isOpen,
  loading,
  contacts,
  onContactSelect,
  onClose
}: ContactDropdownProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="p-2 text-xs text-gray-500">Contacten laden...</div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => onContactSelect(contact)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-xs">{contact.name}</div>
                  <div className="text-xs text-gray-500">
                    {contact.email && <div>{contact.email}</div>}
                    {contact.address && contact.city && (
                      <div>{contact.address}, {contact.postal_code} {contact.city}</div>
                    )}
                  </div>
                </div>
                {contact.contact_number && (
                  <div className="text-xs text-gray-400 ml-2">
                    #{contact.contact_number}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-2 text-xs text-gray-500">
            Geen contacten gevonden
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      <div 
        className="fixed inset-0 z-10" 
        onClick={onClose}
      />
    </>
  );
};
