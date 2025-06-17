
import { supabase } from '@/integrations/supabase/client';

export const loadCompanyData = async (organizationId: string) => {
  console.log('🏢 Loading company data for organization:', organizationId);
  
  try {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error loading company data:', error);
      return {};
    }

    if (!data) {
      console.log('No company data found for organization');
      return {};
    }

    console.log('✅ Company data loaded:', data);

    // Add comprehensive logo logging
    if (data.company_logo) {
      console.log('🖼️ Logo found:', data.company_logo);
    } else {
      console.log('⚠️ No logo found in company data');
    }

    // Create a comprehensive mapping with extensive logo field variations for maximum compatibility
    const mappedData = {
      // Company info
      bedrijfsnaam: data.company_name || '',
      adres: data.company_address || '',
      postcode: data.company_postal_code || '',
      plaats: data.company_city || '',
      email: data.company_email || '',
      telefoon: data.company_phone || '',
      website: data.company_website || '',
      btw_nummer: data.company_vat || '',
      kvk_nummer: data.company_kvk || '',
      banknummer: data.company_bank || '',
      
      // Extensive logo variations - covering all possible naming conventions
      logo: data.company_logo || '',
      bedrijfslogo: data.company_logo || '',
      company_logo: data.company_logo || '',
      LOGO: data.company_logo || '',
      BEDRIJFSLOGO: data.company_logo || '',
      Logo: data.company_logo || '',
      CompanyLogo: data.company_logo || '',
      logoUrl: data.company_logo || '',
      logoURL: data.company_logo || '',
      
      // Current date and reference
      datum: new Date().toLocaleDateString('nl-NL'),
      referentie: `REF-${Date.now()}`
    };

    console.log('🔄 Mapped company data with extensive logo support:', {
      ...mappedData,
      logoVariationsCount: Object.keys(mappedData).filter(key => 
        key.toLowerCase().includes('logo')).length
    });
    
    return mappedData;

  } catch (error) {
    console.error('Error in loadCompanyData:', error);
    return {};
  }
};
