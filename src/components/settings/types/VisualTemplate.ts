
export interface CompanyInfo {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
}

export interface Variable {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  defaultValue?: string;
  required: boolean;
}

export interface TemplateLayout {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'corporate';
}

export interface VisualTemplateData {
  id: string;
  name: string;
  documentType: 'invoice' | 'letter' | 'contract' | 'quote';
  layout: string;
  styling: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logoPosition: 'left' | 'center' | 'right';
    headerStyle: 'simple' | 'bordered' | 'colored';
  };
  companyInfo: CompanyInfo;
  variables: Variable[];
  content: {
    header: string;
    footer: string;
    customFields: Record<string, string>;
  };
}

export const DEFAULT_LAYOUTS: TemplateLayout[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    thumbnail: '/layouts/modern-blue.png',
    description: 'Clean modern design with blue accents',
    category: 'modern'
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    thumbnail: '/layouts/classic-elegant.png',
    description: 'Traditional business style',
    category: 'classic'
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    thumbnail: '/layouts/minimal-clean.png',
    description: 'Simple and professional',
    category: 'minimal'
  },
  {
    id: 'corporate-formal',
    name: 'Corporate Formal',
    thumbnail: '/layouts/corporate-formal.png',
    description: 'Professional corporate design',
    category: 'corporate'
  }
];

export const DEFAULT_VARIABLES: Variable[] = [
  {
    id: 'invoice_number',
    name: 'invoice_number',
    label: 'Factuurnummer',
    type: 'text',
    required: true
  },
  {
    id: 'invoice_date',
    name: 'invoice_date',
    label: 'Factuurdatum',
    type: 'date',
    required: true
  },
  {
    id: 'due_date',
    name: 'due_date',
    label: 'Vervaldatum',
    type: 'date',
    required: true
  },
  {
    id: 'customer_name',
    name: 'customer_name',
    label: 'Klantnaam',
    type: 'text',
    required: true
  },
  {
    id: 'total_amount',
    name: 'total_amount',
    label: 'Totaalbedrag',
    type: 'currency',
    required: true
  }
];
