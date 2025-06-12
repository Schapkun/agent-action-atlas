
export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom';
  description: string;
  htmlContent: string;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'legal':
    case 'contract':
      return 'bg-blue-100 text-blue-800';
    case 'factuur':
      return 'bg-green-100 text-green-800';
    case 'brief':
      return 'bg-purple-100 text-purple-800';
    case 'custom':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
