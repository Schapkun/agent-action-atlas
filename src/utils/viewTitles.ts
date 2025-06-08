
import type { ViewType } from '@/components/dashboard/Sidebar';

export const getViewTitle = (view: ViewType): string => {
  switch (view) {
    case 'overview':
      return 'Dashboard Overzicht';
    case 'pending-tasks':
      return 'Openstaande Taken';
    case 'actions':
      return 'AI Acties';
    case 'documents':
      return 'Documentbeheer';
    case 'active-dossiers':
      return 'Actieve Dossiers';
    case 'closed-dossiers':
      return 'Gesloten Dossiers';
    case 'invoices':
      return 'Facturen';
    case 'phone-calls':
      return 'Telefoongesprekken';
    case 'emails':
      return 'E-mails';
    case 'contacts':
      return 'Contacten';
    case 'settings':
      return 'Instellingen';
    default:
      return 'Dashboard';
  }
};
