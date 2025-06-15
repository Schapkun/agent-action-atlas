
import type { ViewType } from '@/components/dashboard/Sidebar';

export const getViewTitle = (view: ViewType): string => {
  const titles = {
    overview: 'Dashboard',
    'pending-tasks': 'Openstaande Taken',
    actions: 'AI Acties',
    documents: 'Documenten',
    'active-dossiers': 'Actieve Dossiers',
    'closed-dossiers': 'Gesloten Dossiers',
    invoices: 'Facturen',
    'phone-calls': 'Telefoongesprekken',
    emails: 'E-mails',
    contacts: 'Contacten',
    settings: 'Instellingen',
  };

  return titles[view] || 'Dashboard';
};

export const getViewTitleFromPath = (path: string): string => {
  if (path === '/') return 'Dashboard';
  if (path === '/facturen/opstellen') return 'Nieuwe Factuur';
  if (path === '/openstaande-taken') return 'Openstaande Taken';
  if (path === '/ai-acties') return 'AI Acties';
  if (path === '/documenten') return 'Documenten';
  if (path === '/actieve-dossiers') return 'Actieve Dossiers';
  if (path === '/gesloten-dossiers') return 'Gesloten Dossiers';
  if (path === '/facturen') return 'Facturen';
  if (path === '/telefoongesprekken') return 'Telefoongesprekken';
  if (path === '/e-mails') return 'E-mails';
  if (path === '/contacten') return 'Contacten';
  if (path === '/instellingen') return 'Instellingen';
  return 'Dashboard';
};
