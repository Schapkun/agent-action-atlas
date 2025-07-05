
export const getLayoutSpecificStyles = (layout: string) => {
  switch(layout) {
    case 'modern-blue':
      return {
        headerBg: 'bg-blue-600',
        headerText: 'text-white',
        accentColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        headerPattern: 'gradient-header',
        layoutStructure: 'sidebar-left'
      };
    case 'classic-elegant':
      return {
        headerBg: 'bg-gray-800',
        headerText: 'text-white',
        accentColor: 'text-gray-800',
        borderColor: 'border-gray-300',
        primaryColor: '#1f2937',
        secondaryColor: '#6b7280',
        headerPattern: 'centered-formal',
        layoutStructure: 'centered'
      };
    case 'minimal-clean':
      return {
        headerBg: 'bg-white',
        headerText: 'text-black',
        accentColor: 'text-black',
        borderColor: 'border-gray-100',
        primaryColor: '#000000',
        secondaryColor: '#737373',
        headerPattern: 'clean-lines',
        layoutStructure: 'minimal-grid'
      };
    case 'corporate-formal':
      return {
        headerBg: 'bg-slate-800',
        headerText: 'text-white',
        accentColor: 'text-slate-800',
        borderColor: 'border-slate-200',
        primaryColor: '#0f172a',
        secondaryColor: '#475569',
        headerPattern: 'corporate-header',
        layoutStructure: 'structured'
      };
    case 'creative-modern':
      return {
        headerBg: 'bg-purple-600',
        headerText: 'text-white',
        accentColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        primaryColor: '#7c3aed',
        secondaryColor: '#a855f7',
        headerPattern: 'artistic-header',
        layoutStructure: 'creative-flow'
      };
    case 'business-green':
    default:
      return {
        headerBg: 'bg-green-600',
        headerText: 'text-white',
        accentColor: 'text-green-600',
        borderColor: 'border-green-200',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        headerPattern: 'business-header',
        layoutStructure: 'traditional'
      };
  }
};

export const getLayoutFont = (layout: string): string => {
  switch(layout) {
    case 'modern-blue':
      return 'Inter';
    case 'classic-elegant':
      return 'Times New Roman';
    case 'minimal-clean':
      return 'Arial';
    case 'corporate-formal':
      return 'Helvetica';
    case 'creative-modern':
      return 'Roboto';
    case 'business-green':
    default:
      return 'Georgia';
  }
};
