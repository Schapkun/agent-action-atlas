
import { supabase } from '@/integrations/supabase/client';

export const loadCompanyData = async (organizationId: string) => {
  console.log('🏢 COMPANY DATA: Loading for organization:', organizationId);
  
  try {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('❌ COMPANY DATA: Error loading:', error);
      return {};
    }

    if (!data) {
      console.log('⚠️ COMPANY DATA: No data found for organization');
      return {};
    }

    console.log('✅ COMPANY DATA: Raw data loaded:', {
      company_name: data.company_name,
      has_logo: !!data.company_logo,
      logo_length: data.company_logo ? data.company_logo.length : 0,
      logo_preview: data.company_logo ? data.company_logo.substring(0, 100) + '...' : 'NONE'
    });

    // Enhanced logo logging and validation
    if (data.company_logo) {
      console.log('🖼️ LOGO FOUND:', {
        logoUrl: data.company_logo.substring(0, 50) + '...',
        isValidUrl: data.company_logo.startsWith('http'),
        logoType: data.company_logo.includes('data:') ? 'base64' : 'url',
        fullLogoLength: data.company_logo.length
      });
    } else {
      console.log('⚠️ NO LOGO: Company logo field is empty or null - THIS IS WHY NO LOGO SHOWS!');
    }

    // Create a comprehensive mapping with extensive logo field variations
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

    console.log('🔄 COMPANY DATA: Final mapped data:', {
      bedrijfsnaam: mappedData.bedrijfsnaam,
      hasLogo: !!mappedData.logo,
      logoVariationsCount: Object.keys(mappedData).filter(key => 
        key.toLowerCase().includes('logo')).length,
      totalFields: Object.keys(mappedData).length,
      logoValuePreview: mappedData.logo ? String(mappedData.logo).substring(0, 50) + '...' : 'NONE'
    });
    
    return mappedData;

  } catch (error) {
    console.error('❌ COMPANY DATA: Exception in loadCompanyData:', error);
    return {};
  }
};
