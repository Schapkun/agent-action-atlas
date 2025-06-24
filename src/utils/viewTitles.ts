
import type { ViewType } from '@/components/dashboard/Sidebar';

export const getViewTitle = (view: ViewType): string => {
  const titles = {
    overview: 'Dashboard',
    actions: 'AI Acties',
    documents: 'Documenten',
    'active-dossiers': 'Actieve Dossiers',
    'closed-dossiers': 'Gesloten Dossiers',
    invoices: 'Facturen',
    quotes: 'Offertes',
    factuursturen: 'factuursturen.nl',
    'phone-calls': 'Telefoongesprekken',
    emails: 'E-mails',
    contacts: 'Cliënten',
    settings: 'Instellingen',
    support: 'Hulp & Support',
  };

  return titles[view] || 'Dashboard';
};

export const getViewTitleFromPath = (path: string): string => {
  if (path === '/') return 'Dashboard';
  if (path === '/facturen/opstellen' || path === '/facturen/nieuw') return 'Factuur Opstellen';
  if (path === '/offertes/opstellen' || path === '/offertes/nieuw') return 'Offerte Opstellen';
  if (path === '/documenten/opstellen' || path === '/documenten/nieuw') return 'Document Opstellen';
  if (path === '/ai-acties') return 'AI Acties';
  if (path === '/documenten') return 'Documenten';
  if (path === '/documenten?status=draft') return 'Concept Documenten';
  if (path === '/documenten?status=sent') return 'Verzonden Documenten';
  if (path === '/actieve-dossiers') return 'Actieve Dossiers';
  if (path === '/gesloten-dossiers') return 'Gesloten Dossiers';
  if (path === '/facturen') return 'Facturen';
  if (path === '/facturen?status=draft') return 'Concept Facturen';
  if (path === '/facturen?status=sent') return 'Verzonden Facturen';
  if (path === '/offertes') return 'Offertes';
  if (path === '/offertes?status=draft') return 'Concept Offertes';
  if (path === '/offertes?status=sent') return 'Verzonden Offertes';
  if (path === '/factuursturen') return 'factuursturen.nl';
  if (path === '/telefoongesprekken') return 'Telefoongesprekken';
  if (path === '/e-mails') return 'E-mails';
  if (path === '/clienten' || path === '/contacten') return 'Cliënten';
  if (path === '/instellingen' || path.startsWith('/instellingen')) return 'Instellingen';
  if (path === '/support') return 'Hulp & Support';
  return 'Dashboard';
};
