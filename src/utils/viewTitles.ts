
export const getViewTitleFromPath = (path: string): string => {
  // Handle exact matches first
  if (path === '/') return 'Dashboard';
  if (path === '/ai-acties') return 'AI Acties';
  if (path === '/clienten' || path === '/contacten') return 'Cliënten';
  if (path === '/actieve-dossiers') return 'Actieve Dossiers';
  if (path === '/gesloten-dossiers') return 'Gesloten Dossiers';
  if (path === '/telefoongesprekken') return 'Telefoongesprekken';
  if (path === '/whatsapp') return 'WhatsApp';
  if (path === '/e-mails') return 'E-mails';
  if (path === '/instellingen') return 'Instellingen';
  if (path === '/support') return 'Hulp & Support';

  // Handle document paths
  if (path.startsWith('/documenten')) {
    if (path === '/documenten/nieuw') return 'Nieuw Document';
    if (path === '/documenten?status=draft') return 'Concept Documenten';
    if (path === '/documenten?status=sent') return 'Verzonden Documenten';
    return 'Documenten';
  }

  // Handle invoice paths
  if (path.startsWith('/facturen')) {
    if (path === '/facturen/nieuw') return 'Nieuwe Factuur';
    if (path === '/facturen?status=draft') return 'Concept Facturen';
    if (path === '/facturen?status=sent') return 'Verzonden Facturen';
    return 'Facturen';
  }

  // Handle quote paths
  if (path.startsWith('/offertes')) {
    if (path === '/offertes/nieuw') return 'Nieuwe Offerte';
    if (path === '/offertes?status=draft') return 'Concept Offertes';
    if (path === '/offertes?status=sent') return 'Verzonden Offertes';
    return 'Offertes';
  }

  // Default fallback
  return 'Dashboard';
};
