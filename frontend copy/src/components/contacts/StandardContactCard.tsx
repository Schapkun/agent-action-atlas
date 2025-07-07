
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContactActions } from './ContactActions';
import { Edit, Eye, Phone, Mail, MapPin } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  contact_number?: string;
  is_active?: boolean;
  labels?: Array<{ id: string; name: string; color: string; }>;
}

interface StandardContactCardProps {
  contact: Contact;
  variant?: 'compact' | 'full';
  showActions?: boolean;
  onEdit?: (contact: Contact) => void;
  onView?: (contact: Contact) => void;
  onContactsUpdated?: () => void;
}

export const StandardContactCard = ({
  contact,
  variant = 'compact',
  showActions = true,
  onEdit,
  onView,
  onContactsUpdated
}: StandardContactCardProps) => {
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{contact.name}</h3>
            {contact.contact_number && (
              <Badge variant="outline" className="text-xs">
                #{contact.contact_number}
              </Badge>
            )}
            {!contact.is_active && (
              <Badge variant="secondary" className="text-xs">
                Inactief
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {contact.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{contact.email}</span>
              </div>
            )}
            {(contact.phone || contact.mobile) && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{contact.phone || contact.mobile}</span>
              </div>
            )}
            {contact.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{contact.city}</span>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(contact)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <ContactActions
              contact={contact}
              onContactsUpdated={onContactsUpdated || (() => {})}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-lg">{contact.name}</h3>
            {contact.contact_number && (
              <p className="text-sm text-muted-foreground">
                Contact #{contact.contact_number}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!contact.is_active && (
              <Badge variant="secondary">Inactief</Badge>
            )}
            {showActions && (
              <div className="flex gap-1">
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(contact)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <ContactActions
                  contact={contact}
                  onContactsUpdated={onContactsUpdated || (() => {})}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {contact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{contact.email}</span>
            </div>
          )}
          
          {(contact.phone || contact.mobile) && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone || contact.mobile}</span>
            </div>
          )}
          
          {(contact.address || contact.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                {contact.address && <div>{contact.address}</div>}
                <div>
                  {contact.postal_code} {contact.city} {contact.country && contact.country !== 'Nederland' && contact.country}
                </div>
              </div>
            </div>
          )}
        </div>

        {contact.labels && contact.labels.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-3">
            {contact.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  borderColor: label.color
                }}
                className="text-xs"
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
