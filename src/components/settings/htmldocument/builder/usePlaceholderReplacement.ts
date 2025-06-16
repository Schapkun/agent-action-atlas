
import { PLACEHOLDER_FIELDS } from './htmlDocumentConstants';

interface UsePlaceholderReplacementProps {
  placeholderValues: Record<string, string>;
  companyData?: Record<string, string>;
}

export function usePlaceholderReplacement({ placeholderValues, companyData = {} }: UsePlaceholderReplacementProps) {
  const replacePlaceholders = (content: string, forPreview = false) => {
    let replaced = content;
    
    // Combine placeholder values with company data
    const allValues = { ...companyData, ...placeholderValues };
    
    PLACEHOLDER_FIELDS.forEach(({ id, type }) => {
      const regex = new RegExp(`{{${id}}}`, "g");
      if (forPreview && type === "image") {
        const srcRegex = new RegExp(`src=[\\"']{{${id}}}[\\"']`, "g");
        if (allValues[id]) {
          replaced = replaced.replace(
            srcRegex,
            `src="${allValues[id]}"`
          );
          replaced = replaced.replace(
            regex,
            `<img src="${allValues[id]}" alt="Bedrijfslogo" style="width:120px;max-height:75px;object-fit:contain;" />`
          );
        } else {
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

  const getScaledHtmlContent = (content: string) => {
    const withValues = replacePlaceholders(content, true);

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
