
import { Crown, Shield, UserCheck } from 'lucide-react';

export const translateRole = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'Eigenaar';
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Gebruiker';
    default:
      return 'Gebruiker';
  }
};

export const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
      return Crown;
    case 'admin':
      return Shield;
    default:
      return UserCheck;
  }
};

export const getRoleIconProps = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
      return { className: "h-4 w-4 text-yellow-600" };
    case 'admin':
      return { className: "h-4 w-4 text-blue-600" };
    default:
      return { className: "h-4 w-4 text-gray-600" };
  }
};
