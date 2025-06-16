
import { supabase } from '@/integrations/supabase/client';

// Mapping van database velden naar template placeholders
export const COMPANY_FIELD_MAPPING = {
  company_name: 'bedrijfsnaam',
  company_address: 'adres', 
  company_postal_code: 'postcode',
  company_city: 'plaats',
  company_email: 'email',
  company_phone: 'telefoon',
  company_website: 'website',
  company_vat: 'btw_nummer',
  company_kvk: 'kvk_nummer',
  company_bank: 'banknummer'
};

export interface CompanyData {
  company_name?: string;
  company_address?: string;
  company_postal_code?: string;
  company_city?: string;
  company_email?: string;
  company_phone?: string;
  company_website?: string;
  company_vat?: string;
  company_kvk?: string;
  company_bank?: string;
}

export const loadCompanyData = async (organizationId: string): Promise<Record<string, string>> => {
  try {
    console.log('Loading company data for organization:', organizationId);
    
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error loading company data:', error);
      return {};
    }

    if (!data) {
      console.log('No company data found');
      return {};
    }

    console.log('Company data loaded:', data);

    // Map database fields to placeholder keys
    const mappedData: Record<string, string> = {};
    
    Object.entries(COMPANY_FIELD_MAPPING).forEach(([dbField, placeholderKey]) => {
      const value = data[dbField as keyof CompanyData];
      if (value) {
        mappedData[placeholderKey] = value;
      }
    });

    // Add some computed fields
    mappedData['datum'] = new Date().toLocaleDateString('nl-NL');
    mappedData['referentie'] = `REF-${Date.now()}`;

    console.log('Mapped company data:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Error in loadCompanyData:', error);
    return {};
  }
};
