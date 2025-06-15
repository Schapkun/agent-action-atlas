
import { useState, useCallback } from 'react';
import { UNIQUE_LAYOUT_TEMPLATES, UniqueLayoutTemplate } from '../../types/LayoutTemplates';

export const useLayoutManager = () => {
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('modern-blue');

  // Get selected layout template
  const getSelectedLayout = useCallback((): UniqueLayoutTemplate | null => {
    return UNIQUE_LAYOUT_TEMPLATES.find(layout => layout.id === selectedLayoutId) || null;
  }, [selectedLayoutId]);

  // Apply layout styling to HTML content
  const applyLayoutStyling = useCallback((baseHtml: string, layoutId: string): string => {
    const layout = UNIQUE_LAYOUT_TEMPLATES.find(l => l.id === layoutId);
    if (!layout) return baseHtml;

    // Generate CSS based on layout styling
    const layoutCSS = `
      <style>
        body {
          font-family: ${layout.styling.font}, sans-serif;
          margin: 40px;
          background-color: white;
          color: #333;
        }
        .header {
          color: ${layout.styling.primaryColor};
          border-bottom: 2px solid ${layout.styling.secondaryColor};
          padding-bottom: 10px;
          margin-bottom: 20px;
          text-align: ${layout.styling.logoPosition};
        }
        .content {
          line-height: 1.6;
          ${layout.styling.spacing === 'compact' ? 'margin: 10px 0;' : 
            layout.styling.spacing === 'relaxed' ? 'margin: 30px 0;' : 'margin: 20px 0;'}
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th, td {
          border: ${layout.styling.borderStyle === 'bold' ? '2px' : 
                   layout.styling.borderStyle === 'subtle' ? '1px' : '0'} solid ${layout.styling.secondaryColor};
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: ${layout.styling.primaryColor};
          color: white;
        }
        h1, h2, h3 {
          color: ${layout.styling.primaryColor};
        }
      </style>
    `;

    // Insert CSS into HTML
    if (baseHtml.includes('<head>')) {
      return baseHtml.replace('<head>', `<head>${layoutCSS}`);
    } else if (baseHtml.includes('<html>')) {
      return baseHtml.replace('<html>', `<html><head>${layoutCSS}</head>`);
    } else {
      return `<html><head>${layoutCSS}</head><body>${baseHtml}</body></html>`;
    }
  }, []);

  // Switch layout (simplified - just updates selection)
  const switchLayout = useCallback((newLayoutId: string) => {
    console.log('[LayoutManager] Switching layout to:', newLayoutId);
    setSelectedLayoutId(newLayoutId);
    return newLayoutId;
  }, []);

  return {
    selectedLayoutId,
    layouts: UNIQUE_LAYOUT_TEMPLATES,
    switchLayout,
    getSelectedLayout,
    applyLayoutStyling
  };
};
