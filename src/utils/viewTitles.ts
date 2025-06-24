
import type { ViewType } from '@/components/dashboard/Sidebar';

interface ViewTitle {
  id: ViewType;
  title: string;
  paths: string[];
}

const viewTitles: ViewTitle[] = [
  {
    id: 'overview',
    title: 'Dashboard',
    paths: ['/']
  },
  {
    id: 'pending-tasks',
    title: 'Openstaande Taken',
    paths: ['/openstaande-taken']
  },
  {
    id: 'actions',
    title: 'AI Acties',
    paths: ['/ai-acties']
  },
  {
    id: 'documents',
    title: 'Documenten',
    paths: ['/documenten']
  },
  {
    id: 'active-dossiers',
    title: 'Actieve Dossiers',
    paths: ['/actieve-dossiers']
  },
  {
    id: 'closed-dossiers',
    title: 'Gesloten Dossiers',
    paths: ['/gesloten-dossiers']
  },
  {
    id: 'invoices',
    title: 'Facturen',
    paths: ['/facturen', '/factuur-maken']
  },
  {
    id: 'quotes',
    title: 'Offertes',
    paths: ['/offertes', '/offerte-maken']
  },
  {
    id: 'phone-calls',
    title: 'Telefoongesprekken',
    paths: ['/telefoongesprekken']
  },
  {
    id: 'emails',
    title: 'E-mails',
    paths: ['/e-mails']
  },
  {
    id: 'contacts',
    title: 'Contacten',
    paths: ['/contacten']
  },
  {
    id: 'settings',
    title: 'Instellingen',
    paths: ['/instellingen']
  }
];

export const getViewTitleFromPath = (path: string): string => {
  // Remove query parameters for matching
  const cleanPath = path.split('?')[0];
  
  const viewTitle = viewTitles.find(view => 
    view.paths.some(viewPath => cleanPath === viewPath || cleanPath.startsWith(viewPath + '/'))
  );
  
  return viewTitle?.title || 'meester.app';
};

export const getViewIdFromPath = (path: string): ViewType => {
  // Remove query parameters for matching
  const cleanPath = path.split('?')[0];
  
  const viewTitle = viewTitles.find(view => 
    view.paths.some(viewPath => cleanPath === viewPath || cleanPath.startsWith(viewPath + '/'))
  );
  
  return viewTitle?.id || 'overview';
};
