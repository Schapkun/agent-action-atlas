
import { PLACEHOLDER_FIELDS } from './htmlDocumentConstants';
import { loadCompanyData } from '@/utils/companyDataMapping';
import { useOrganization } from '@/contexts/OrganizationContext';

interface UsePlaceholderReplacementProps {
  placeholderValues: Record<string, string>;
  companyData?: Record<string, string>;
}

export function usePlaceholderReplacement({ placeholderValues, companyData = {} }: UsePlaceholderReplacementProps) {
  const { selectedOrganization } = useOrganization();

  const replacePlaceholders = async (content: string, forPreview = false) => {
    let replaced = content;
    
    // Load fresh company data including logo if we have an organization
    let enhancedCompanyData = { ...companyData };
    if (selectedOrganization?.id && forPreview) {
      try {
        const freshCompanyData = await loadCompanyData(selectedOrganization.id);
        enhancedCompanyData = { ...enhancedCompanyData, ...freshCompanyData };
        console.log('🔄 HTML EDITOR: Enhanced company data with logo:', enhancedCompanyData);
      } catch (error) {
        console.error('Failed to load company data for HTML editor:', error);
      }
    }
    
    // Combine placeholder values with enhanced company data
    const allValues = { ...enhancedCompanyData, ...placeholderValues };
    
    console.log('🎨 HTML EDITOR: All values for replacement:', allValues);
    
    PLACEHOLDER_FIELDS.forEach(({ id, type }) => {
      const regex = new RegExp(`{{${id}}}`, "g");
      if (forPreview && type === "image") {
        const srcRegex = new RegExp(`src=[\\"']{{${id}}}[\\"']`, "g");
        if (allValues[id]) {
          console.log(`🖼️ HTML EDITOR: Replacing logo placeholder ${id} with:`, allValues[id]);
          replaced = replaced.replace(
            srcRegex,
            `src="${allValues[id]}"`
          );
          replaced = replaced.replace(
            regex,
            `<img src="${allValues[id]}" alt="Bedrijfslogo" style="width:120px;max-height:75px;object-fit:contain;" />`
          );
        } else {
          console.log(`⚠️ HTML EDITOR: No value found for logo placeholder ${id}`);
          replaced = replaced.replace(
            srcRegex,
            `src="" style="background:#eee;border:1px dashed #ccc;width:120px;max-height:75px;object-fit:contain;"`
          );
          replaced = replaced.replace(
            regex,
            `<span style="color:#ddd;">[Logo]</span>`
          );
        }
      } else {
        replaced = replaced.replace(
          regex,
          forPreview ? (allValues[id] || `<span style="color:#9ca3af;">[${id}]</span>`) : `{{${id}}}`
        );
      }
    });
    
    // Also replace common logo placeholders that might not be in PLACEHOLDER_FIELDS
    const logoPlaceholders = ['logo', 'bedrijfslogo', 'company_logo', 'LOGO', 'BEDRIJFSLOGO'];
    logoPlaceholders.forEach(logoField => {
      const logoRegex = new RegExp(`{{${logoField}}}`, 'g');
      const logoSrcRegex = new RegExp(`src=[\\"']{{${logoField}}}[\\"']`, "g");
      
      if (allValues[logoField] && forPreview) {
        console.log(`🖼️ HTML EDITOR: Replacing ${logoField} with:`, allValues[logoField]);
        replaced = replaced.replace(
          logoSrcRegex,
          `src="${allValues[logoField]}"`
        );
        replaced = replaced.replace(
          logoRegex,
          `<img src="${allValues[logoField]}" alt="Bedrijfslogo" style="max-width:200px;max-height:100px;object-fit:contain;" />`
        );
      } else if (forPreview) {
        console.log(`⚠️ HTML EDITOR: No logo found for ${logoField}`);
        replaced = replaced.replace(
          logoSrcRegex,
          `src="" style="background:#eee;border:1px dashed #ccc;width:200px;max-height:100px;object-fit:contain;"`
        );
        replaced = replaced.replace(
          logoRegex,
          `<div style="background:#eee;border:1px dashed #ccc;width:200px;max-height:100px;display:flex;align-items:center;justify-content:center;color:#999;">[Logo]</div>`
        );
      }
    });
    
    // Also replace any other placeholders that might exist in the content
    const remainingPlaceholders = content.match(/{{([^}]+)}}/g);
    if (remainingPlaceholders) {
      remainingPlaceholders.forEach(placeholder => {
        const key = placeholder.replace(/[{}]/g, '');
        if (allValues[key]) {
          const regex = new RegExp(placeholder.replace(/[{}]/g, '\\{\\}'), 'g');
          replaced = replaced.replace(regex, allValues[key]);
        }
      });
    }
    
    return replaced;
  };

  const getScaledHtmlContent = async (content: string) => {
    const withValues = await replacePlaceholders(content, true);

    const htmlMatch = withValues.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) return withValues;

    const scaledContent = withValues.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          html, body {
            margin: 0;
            padding: 25px;
            overflow: hidden;
            transform-origin: top left;
            transform: scale(0.75);
            width: 133.33%;
            height: 133.33%;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            width: 210mm;
            min-height: 297mm;
            font-family: Arial, sans-serif;
            background: white;
          }
        </style>`;
      }
    );
    return scaledContent;
  };

  return {
    replacePlaceholders,
    getScaledHtmlContent
  };
}
