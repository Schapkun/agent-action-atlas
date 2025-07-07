
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';

interface TagsSectionProps {
  formData: {
    tags: string;
  };
  updateFormData: (updates: any) => void;
}

export const TagsSection = ({ formData, updateFormData }: TagsSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-2 border border-orange-200 w-full">
      <div className="flex items-center gap-1 mb-2">
        <div className="bg-orange-600 rounded-lg p-1">
          <Tag className="h-2 w-2 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-orange-900">Tags</h3>
      </div>
      
      <div>
        <Label htmlFor="tags" className="text-xs text-orange-900 font-medium">Labels</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => updateFormData({ tags: e.target.value })}
          placeholder="urgent, project, review"
          className="mt-1 text-xs border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-7"
        />
        <p className="text-xs text-orange-600 mt-1">
          Gescheiden door komma's
        </p>
      </div>
    </div>
  );
};
