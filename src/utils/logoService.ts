
import { supabase } from '@/integrations/supabase/client';

interface LogoServiceResult {
  logoUrl: string;
  hasLogo: boolean;
}

export const getOrganizationLogo = async (organizationId: string): Promise<LogoServiceResult> => {
  console.log('🔍 LOGO SERVICE: Fetching logo for organization:', organizationId);
  
  try {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('company_logo')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('❌ LOGO SERVICE: Database error:', error);
      return { logoUrl: '', hasLogo: false };
    }

    const logoUrl = data?.company_logo || '';
    const hasLogo = logoUrl.trim().length > 0;
    
    console.log('✅ LOGO SERVICE: Logo result:', { logoUrl: logoUrl.substring(0, 50) + '...', hasLogo });
    
    return { logoUrl, hasLogo };
  } catch (error) {
    console.error('❌ LOGO SERVICE: Exception:', error);
    return { logoUrl: '', hasLogo: false };
  }
};

export const insertLogoIntoHtml = (htmlContent: string, logoUrl: string): string => {
  console.log('🔄 LOGO SERVICE: Inserting logo into HTML');
  console.log('🔍 LOGO SERVICE: Logo URL:', logoUrl.substring(0, 50) + '...');
  
  let processedHtml = htmlContent;
  
  if (logoUrl && logoUrl.trim().length > 0) {
    // Direct replacement van alle logo placeholders
    processedHtml = processedHtml.replace(/\{\{logo\}\}/g, logoUrl);
    processedHtml = processedHtml.replace(/\{\{bedrijfslogo\}\}/g, logoUrl);
    processedHtml = processedHtml.replace(/\{\{company_logo\}\}/g, logoUrl);
    processedHtml = processedHtml.replace(/\{\{LOGO\}\}/g, logoUrl);
    
    // Conditional blocks - show logo section
    processedHtml = processedHtml.replace(/\{\{#if logo\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g, '$1');
    processedHtml = processedHtml.replace(/\{\{#if logo\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    
    console.log('✅ LOGO SERVICE: Logo inserted successfully');
  } else {
    // No logo - remove logo placeholders and show alternative
    processedHtml = processedHtml.replace(/\{\{logo\}\}/g, '');
    processedHtml = processedHtml.replace(/\{\{bedrijfslogo\}\}/g, '');
    processedHtml = processedHtml.replace(/\{\{company_logo\}\}/g, '');
    processedHtml = processedHtml.replace(/\{\{LOGO\}\}/g, '');
    
    // Conditional blocks - show no-logo section
    processedHtml = processedHtml.replace(/\{\{#if logo\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    processedHtml = processedHtml.replace(/\{\{#if logo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    
    console.log('⚠️ LOGO SERVICE: No logo - placeholders removed');
  }
  
  return processedHtml;
};
