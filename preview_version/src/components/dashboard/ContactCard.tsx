
import { Building, User, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ContactCardProps {
  item: {
    id: string;
    name: string;
    type: string;
    email: string;
    phone: string;
    status: string;
    activeDossiers: number;
    lastContact: Date;
  };
}

export const ContactCard = ({ item }: ContactCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actief';
      case 'inactive':
        return 'Inactief';
      case 'prospect':
        return 'Prospect';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return Building;
      case 'person':
        return User;
      case 'institution':
        return Building;
      default:
        return User;
    }
  };

  const IconComponent = getTypeIcon(item.type);

  return (
    <div className="flex items-center space-x-4 py-4 px-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-foreground truncate">
            {item.name}
          </h4>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(item.status)}>
              {getStatusLabel(item.status)}
            </Badge>
            {item.activeDossiers > 0 && (
              <Badge variant="outline">
                {item.activeDossiers} dossier{item.activeDossiers !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground space-x-4">
          <div className="flex items-center space-x-1">
            <Mail className="h-3 w-3" />
            <span>{item.email}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Phone className="h-3 w-3" />
            <span>{item.phone}</span>
          </div>
          <span>•</span>
          <span>Laatst contact: {item.lastContact.toLocaleDateString('nl-NL')}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Mail className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
