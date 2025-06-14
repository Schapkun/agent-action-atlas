
import { PLACEHOLDER_FIELDS } from './htmlDocumentConstants';

interface UsePlaceholderReplacementProps {
  placeholderValues: Record<string, string>;
}

export function usePlaceholderReplacement({ placeholderValues }: UsePlaceholderReplacementProps) {
  const replacePlaceholders = (content: string, forPreview = false) => {
    let replaced = content;
    PLACEHOLDER_FIELDS.forEach(({ id, type }) => {
      const regex = new RegExp(`{{${id}}}`, "g");
      if (forPreview && type === "image") {
        const srcRegex = new RegExp(`src=[\\"']{{${id}}}[\\"']`, "g");
        if (placeholderValues[id]) {
          replaced = replaced.replace(
            srcRegex,
            `src="${placeholderValues[id]}"`
          );
          replaced = replaced.replace(
            regex,
            `<img src="${placeholderValues[id]}" alt="Bedrijfslogo" style="width:120px;max-height:75px;object-fit:contain;" />`
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
          forPreview ? (placeholderValues[id] || `<span style="color:#9ca3af;">[${id}]</span>`) : `{{${id}}}`
        );
      }
    });
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
            transform: scale(0.85);
            width: 117.65%;
            height: 117.65%;
            box-sizing: border-box;
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
