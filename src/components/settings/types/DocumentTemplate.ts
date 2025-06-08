
export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  lastModified: Date;
  isDefault: boolean;
  content?: string;
}

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'legal':
      return 'bg-red-100 text-red-800';
    case 'contract':
      return 'bg-blue-100 text-blue-800';
    case 'invoice':
      return 'bg-green-100 text-green-800';
    case 'correspondence':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
