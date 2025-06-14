
import React from 'react';

interface HtmlEditorProps {
  htmlContent: string;
  onChange: (value: string) => void;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({ htmlContent, onChange }) => (
  <div className="w-1/2 flex flex-col border-r">
    <div className="p-4 border-b">
      <h3 className="font-semibold flex items-center gap-2">
        {/* Icon pas na complete refactor als prop? */}
        <span aria-hidden className="h-4 w-4" />
        HTML Editor
      </h3>
    </div>
    <div className="flex-1 p-4">
      <textarea
        id="html-editor"
        value={htmlContent}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full font-mono text-sm border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="HTML code hier..."
      />
    </div>
  </div>
);

