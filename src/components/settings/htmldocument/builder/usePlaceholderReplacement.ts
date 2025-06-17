import { PLACEHOLDER_FIELDS } from './htmlDocumentConstants';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';

interface UsePlaceholderReplacementProps {
  placeholderValues: Record<string, string>;
  companyData?: Record<string, string>;
}

export function usePlaceholderReplacement({ placeholderValues, companyData = {} }: UsePlaceholderReplacementProps) {
  const { selectedOrganization } = useOrganization();

  const replacePlaceholders = async (content: string, forPreview = false) => {
    console.log('🎨 HTML EDITOR: Using universal placeholder replacement system');
    console.log('🔍 HTML EDITOR: Preview mode:', forPreview);
    console.log('🔍 HTML EDITOR: Organization:', selectedOrganization?.name);
    
    if (forPreview) {
      // Use the universal system for preview
      try {
        const processed = await replaceAllPlaceholders(content, {
          organizationId: selectedOrganization?.id,
          placeholderValues: { ...companyData, ...placeholderValues }
        });
        console.log('✅ HTML EDITOR: Universal replacement completed');
        return processed;
      } catch (error) {
        console.error('❌ HTML EDITOR: Universal replacement failed:', error);
        return content;
      }
    } else {
      // For editor mode, keep placeholders intact
      console.log('📝 HTML EDITOR: Editor mode - keeping placeholders intact');
      return content;
    }
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
