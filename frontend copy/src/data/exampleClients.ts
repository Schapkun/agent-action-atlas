
import { supabase } from '@/integrations/supabase/client';

export const createExampleClients = async (organizationId: string, workspaceId?: string) => {
  const exampleClients = [
    {
      name: "Bakkerij De Gouden Korrel B.V.",
      email: "info@goudenekorrel.nl",
      phone: "020-1234567",
      address: "Bakkerstraat 45",
      postal_code: "1012 AB",
      city: "Amsterdam",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Jan Bakker",
      vat_number: "NL123456789B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Maria van der Berg",
      email: "maria.vandenberg@email.nl",
      phone: "06-12345678",
      address: "Kerkstraat 12",
      postal_code: "2345 CD",
      city: "Utrecht",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Tech Solutions Amsterdam B.V.",
      email: "contact@techsolutions.nl",
      phone: "020-9876543",
      address: "Zuiderpark 89",
      postal_code: "1077 AB",
      city: "Amsterdam",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Lisa de Jong",
      vat_number: "NL987654321B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Piet Jansen",
      email: "p.jansen@gmail.com",
      phone: "06-87654321",
      address: "Hoofdstraat 67",
      postal_code: "3456 EF",
      city: "Rotterdam",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Restaurant De Smakelijke Hoek",
      email: "reserveren@smakelijkehoek.nl",
      phone: "013-5555555",
      address: "Marktplein 3",
      postal_code: "5000 GH",
      city: "Tilburg",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Anna Smits",
      vat_number: "NL555555555B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Sophie Williams",
      email: "sophie.williams@outlook.com",
      phone: "06-11111111",
      address: "Wilgenstraat 23",
      postal_code: "6789 IJ",
      city: "Den Haag",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Groenteboer Vers & Gezond B.V.",
      email: "bestellen@versgezond.nl",
      phone: "030-2222222",
      address: "Groentemarkt 15",
      postal_code: "3511 KL",
      city: "Utrecht",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Frank Groene",
      vat_number: "NL222222222B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Mohamed El Hassan",
      email: "m.elhasan@hotmail.com",
      phone: "06-33333333",
      address: "Tulpenstraat 8",
      postal_code: "1234 MN",
      city: "Amsterdam",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Advocatenkantoor Recht & Rechtvaardig",
      email: "info@rechtenrechtvaardig.nl",
      phone: "070-4444444",
      address: "Justitieplein 12",
      postal_code: "2511 OP",
      city: "Den Haag",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Mr. Robert van Recht",
      vat_number: "NL444444444B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Emma de Vries",
      email: "emma.devries@ziggo.nl",
      phone: "06-55555555",
      address: "Rosenlaan 44",
      postal_code: "5678 QR",
      city: "Eindhoven",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Bouwbedrijf Stevige Fundamenten B.V.",
      email: "offerte@stevigeenfundamenten.nl",
      phone: "040-6666666",
      address: "Industrieweg 78",
      postal_code: "5656 ST",
      city: "Eindhoven",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Karel Bouwer",
      vat_number: "NL666666666B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Fatima Al-Rashid",
      email: "fatima.alrashid@kpnmail.nl",
      phone: "06-77777777",
      address: "Moscheelaan 19",
      postal_code: "3000 UV",
      city: "Rotterdam",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Kapperszaak Knippen & Kleuren",
      email: "afspraak@knippenkleuren.nl",
      phone: "053-8888888",
      address: "Schoonheidsstraat 7",
      postal_code: "7500 WX",
      city: "Enschede",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Sandra Schaar",
      vat_number: "NL888888888B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Thomas Müller",
      email: "thomas.muller@xs4all.nl",
      phone: "06-99999999",
      address: "Europaplein 56",
      postal_code: "6200 YZ",
      city: "Maastricht",
      country: "Nederland",
      type: "prive",
      organization_id: organizationId,
      workspace_id: workspaceId
    },
    {
      name: "Accountantskantoor Cijfers & Co",
      email: "hulp@cijfersenco.nl",
      phone: "058-1010101",
      address: "Boekhoudlaan 33",
      postal_code: "8900 AB",
      city: "Leeuwarden",
      country: "Nederland",
      type: "zakelijk",
      contact_person: "Drs. Patricia Teller",
      vat_number: "NL101010101B01",
      organization_id: organizationId,
      workspace_id: workspaceId
    }
  ];

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(exampleClients)
      .select();

    if (error) throw error;
    
    console.log('✅ Example clients created:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Error creating example clients:', error);
    throw error;
  }
};
