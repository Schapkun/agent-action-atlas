
import { VisualTemplateData } from './VisualTemplate';

export interface UniqueLayoutTemplate {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'corporate';
  styling: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logoPosition: 'left' | 'center' | 'right';
    headerStyle: 'simple' | 'bordered' | 'colored';
    spacing: 'compact' | 'normal' | 'relaxed';
    borderStyle: 'none' | 'subtle' | 'bold';
  };
  preview: {
    backgroundColor: string;
    accentColor: string;
    textStyle: string;
  };
}

export const UNIQUE_LAYOUT_TEMPLATES: UniqueLayoutTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    thumbnail: '/layouts/modern-blue.png',
    description: 'Clean modern design with blue accents',
    category: 'modern',
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      font: 'Inter',
      logoPosition: 'left',
      headerStyle: 'colored',
      spacing: 'normal',
      borderStyle: 'subtle'
    },
    preview: {
      backgroundColor: 'from-blue-50 to-blue-100',
      accentColor: 'text-blue-600',
      textStyle: 'modern'
    }
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    thumbnail: '/layouts/classic-elegant.png',
    description: 'Traditional business style',
    category: 'classic',
    styling: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      font: 'Times New Roman',
      logoPosition: 'center',
      headerStyle: 'bordered',
      spacing: 'relaxed',
      borderStyle: 'bold'
    },
    preview: {
      backgroundColor: 'from-gray-50 to-gray-100',
      accentColor: 'text-gray-800',
      textStyle: 'classic'
    }
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    thumbnail: '/layouts/minimal-clean.png',
    description: 'Simple and professional',
    category: 'minimal',
    styling: {
      primaryColor: '#000000',
      secondaryColor: '#737373',
      font: 'Arial',
      logoPosition: 'left',
      headerStyle: 'simple',
      spacing: 'compact',
      borderStyle: 'none'
    },
    preview: {
      backgroundColor: 'from-white to-gray-50',
      accentColor: 'text-black',
      textStyle: 'minimal'
    }
  },
  {
    id: 'corporate-formal',
    name: 'Corporate Formal',
    thumbnail: '/layouts/corporate-formal.png',
    description: 'Professional corporate design',
    category: 'corporate',
    styling: {
      primaryColor: '#0f172a',
      secondaryColor: '#475569',
      font: 'Helvetica',
      logoPosition: 'right',
      headerStyle: 'colored',
      spacing: 'normal',
      borderStyle: 'bold'
    },
    preview: {
      backgroundColor: 'from-slate-50 to-slate-100',
      accentColor: 'text-slate-800',
      textStyle: 'formal'
    }
  },
  {
    id: 'creative-modern',
    name: 'Creative Modern',
    thumbnail: '/layouts/creative-modern.png',
    description: 'Creative design with bold elements',
    category: 'modern',
    styling: {
      primaryColor: '#7c3aed',
      secondaryColor: '#a855f7',
      font: 'Roboto',
      logoPosition: 'center',
      headerStyle: 'colored',
      spacing: 'relaxed',
      borderStyle: 'subtle'
    },
    preview: {
      backgroundColor: 'from-purple-50 to-purple-100',
      accentColor: 'text-purple-600',
      textStyle: 'creative'
    }
  },
  {
    id: 'business-classic',
    name: 'Business Classic',
    thumbnail: '/layouts/business-classic.png',
    description: 'Conservative business approach',
    category: 'classic',
    styling: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      font: 'Georgia',
      logoPosition: 'left',
      headerStyle: 'bordered',
      spacing: 'normal',
      borderStyle: 'subtle'
    },
    preview: {
      backgroundColor: 'from-green-50 to-green-100',
      accentColor: 'text-green-600',
      textStyle: 'business'
    }
  }
];
