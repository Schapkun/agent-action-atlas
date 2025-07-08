
import React from 'react';
import { Code } from 'lucide-react';

interface EnhancedHtmlEditorProps {
  htmlContent: string;
  onChange: (value: string) => void;
}

export const EnhancedHtmlEditor = ({ htmlContent, onChange }: EnhancedHtmlEditorProps) => {
  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="text-sm font-medium">HTML Editor</span>
        </div>
      </div>
      
      <div className="flex-1 p-0">
        <textarea
          value={htmlContent}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full font-mono text-sm p-4 resize-none border-0 focus:outline-none focus:ring-0"
          placeholder="Voer hier je HTML code in..."
          spellCheck={false}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            lineHeight: '1.5',
            fontSize: '13px'
          }}
        />
      </div>
    </div>
  );
};
