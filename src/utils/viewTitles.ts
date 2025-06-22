
export const getViewTitle = (path: string): { title: string; description: string } => {
  // Handle paths with query parameters
  const [basePath, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');
  const status = params.get('status');
  
  // Dynamic titles based on status parameter
  if (basePath === '/facturen') {
    if (status === 'draft') {
      return { title: 'Concept Facturen', description: 'Beheer uw concept facturen' };
    }
    if (status === 'sent') {
      return { title: 'Verzonden Facturen', description: 'Overzicht van verzonden facturen' };
    }
    return { title: 'Facturen', description: 'Beheer al uw facturen' };
  }

  if (basePath === '/offertes') {
    if (status === 'draft') {
      return { title: 'Concept Offertes', description: 'Beheer uw concept offertes' };
    }
    if (status === 'sent') {
      return { title: 'Verzonden Offertes', description: 'Overzicht van verzonden offertes' };
    }
    return { title: 'Offertes', description: 'Beheer al uw offertes' };
  }

  // Static titles for other paths
  const viewTitles: Record<string, { title: string; description: string }> = {
    '/dashboard': { title: 'Dashboard', description: 'Overzicht van uw activiteiten' },
    '/contacten': { title: 'Cliënten', description: 'Beheer uw cliënten en contactgegevens' },
    '/facturen/nieuw': { title: 'Nieuwe Factuur', description: 'Maak een nieuwe factuur aan' },
    '/offertes/nieuw': { title: 'Nieuwe Offerte', description: 'Maak een nieuwe offerte aan' },
    '/documenten': { title: 'Documenten', description: 'Beheer al uw documenten' },
    '/documenten/nieuw': { title: 'Nieuw Document', description: 'Maak een nieuw document aan' },
    '/acties': { title: 'Acties', description: 'Overzicht van uitgevoerde acties' },
    '/dossiers': { title: 'Actieve Dossiers', description: 'Beheer uw actieve dossiers' },
    '/dossiers/gesloten': { title: 'Gesloten Dossiers', description: 'Overzicht van gesloten dossiers' },
    '/taken': { title: 'Openstaande Taken', description: 'Beheer uw openstaande taken' },
    '/gesprekken': { title: 'Telefoongesprekken', description: 'Beheer telefoongesprekken' },
    '/emails': { title: 'E-mails', description: 'Beheer e-mailcorrespondentie' },
    '/instellingen': { title: 'Instellingen', description: 'Configureer uw account en organisatie' }
  };

  return viewTitles[basePath] || { title: 'Overzicht', description: 'Beheer uw gegevens' };
};
