
import React from 'react';
import { Code } from 'lucide-react';

interface HtmlEditorProps {
  htmlContent: string;
  onChange: (value: string) => void;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({ htmlContent, onChange }) => (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b bg-gray-50">
      <h4 className="font-medium flex items-center gap-2 text-sm">
        <Code className="h-4 w-4" />
        HTML Editor
      </h4>
    </div>
    <div className="flex-1 p-4">
      <textarea
        value={htmlContent}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full font-mono text-sm border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="HTML code hier..."
        spellCheck={false}
      />
    </div>
  </div>
);
