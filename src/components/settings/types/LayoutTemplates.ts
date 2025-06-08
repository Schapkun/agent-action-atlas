
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
    headerPattern: string;
    layoutStructure: string;
  };
}

export const UNIQUE_LAYOUT_TEMPLATES: UniqueLayoutTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Professional',
    thumbnail: '/layouts/modern-blue.png',
    description: 'Strak blauw design met moderne typografie',
    category: 'modern',
    styling: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      font: 'Inter',
      logoPosition: 'left',
      headerStyle: 'colored',
      spacing: 'normal',
      borderStyle: 'subtle'
    },
    preview: {
      backgroundColor: 'from-blue-50 to-blue-100',
      accentColor: 'text-blue-700',
      textStyle: 'modern',
      headerPattern: 'gradient-header',
      layoutStructure: 'sidebar-left'
    }
  },
  {
    id: 'classic-elegant',
    name: 'Klassiek Elegant',
    thumbnail: '/layouts/classic-elegant.png',
    description: 'Traditioneel zakelijk met serif lettertype',
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
      textStyle: 'classic',
      headerPattern: 'centered-formal',
      layoutStructure: 'centered'
    }
  },
  {
    id: 'minimal-clean',
    name: 'Minimalistisch',
    thumbnail: '/layouts/minimal-clean.png',
    description: 'Wit en zwart met veel witruimte',
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
      textStyle: 'minimal',
      headerPattern: 'clean-lines',
      layoutStructure: 'minimal-grid'
    }
  },
  {
    id: 'corporate-formal',
    name: 'Corporate Donker',
    thumbnail: '/layouts/corporate-formal.png',
    description: 'Donkere corporate styling met structuur',
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
      backgroundColor: 'from-slate-100 to-slate-200',
      accentColor: 'text-slate-900',
      textStyle: 'formal',
      headerPattern: 'corporate-header',
      layoutStructure: 'structured'
    }
  },
  {
    id: 'creative-modern',
    name: 'Creatief Paars',
    thumbnail: '/layouts/creative-modern.png',
    description: 'Paarse accenten met creatieve layouts',
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
      accentColor: 'text-purple-700',
      textStyle: 'creative',
      headerPattern: 'artistic-header',
      layoutStructure: 'creative-flow'
    }
  },
  {
    id: 'business-green',
    name: 'Zakelijk Groen',
    thumbnail: '/layouts/business-classic.png',
    description: 'Groene accenten voor zakelijke vertrouwen',
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
      accentColor: 'text-green-700',
      textStyle: 'business',
      headerPattern: 'business-header',
      layoutStructure: 'traditional'
    }
  }
];
