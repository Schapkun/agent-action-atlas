
export const folderStructure = [
  {
    id: '1',
    name: 'Cliënten',
    icon: 'users',
    items: [
      {
        id: 'c1',
        name: 'ABC Holding B.V.',
        type: 'company',
        email: 'info@abcholding.nl',
        phone: '+31 20 123 4567',
        status: 'active',
        activeDossiers: 2,
        lastContact: new Date('2024-01-15')
      },
      {
        id: 'c2',
        name: 'Jan Janssen',
        type: 'person',
        email: 'jan.janssen@email.com',
        phone: '+31 6 123 456 78',
        status: 'active',
        activeDossiers: 1,
        lastContact: new Date('2024-01-14')
      }
    ]
  },
  {
    id: '2',
    name: 'Externe Advocaten',
    icon: 'briefcase',
    items: [
      {
        id: 'c3',
        name: 'Advocatenkantoor XYZ',
        type: 'company',
        email: 'contact@xyz-advocaten.nl',
        phone: '+31 20 987 6543',
        status: 'active',
        activeDossiers: 0,
        lastContact: new Date('2024-01-10')
      }
    ]
  },
  {
    id: '3',
    name: 'Rechtbanken & Instanties',
    icon: 'gavel',
    items: [
      {
        id: 'c4',
        name: 'Rechtbank Amsterdam',
        type: 'institution',
        email: 'griffie@rechtbank-amsterdam.nl',
        phone: '+31 20 541 5415',
        status: 'active',
        activeDossiers: 1,
        lastContact: new Date('2024-01-12')
      }
    ]
  },
  {
    id: '4',
    name: 'Leveranciers',
    icon: 'truck',
    items: [
      {
        id: 'c5',
        name: 'Deurwaarder Peters',
        type: 'company',
        email: 'info@deurwaarder-peters.nl',
        phone: '+31 30 123 4567',
        status: 'active',
        activeDossiers: 1,
        lastContact: new Date('2024-01-08')
      }
    ]
  }
];
