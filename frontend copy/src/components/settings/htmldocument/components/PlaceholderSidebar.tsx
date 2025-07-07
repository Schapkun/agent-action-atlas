
import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MousePointer,
} from "lucide-react";

type PlaceholderField = {
  label: string;
  id: string;
  placeholder?: string;
  type?: "image";
};

type Snippet = {
  name: string;
  icon: React.ReactNode;
  code: string;
};

type SnippetCategory = {
  category: string;
  items: Snippet[];
};

interface PlaceholderSidebarProps {
  placeholderFields: PlaceholderField[];
  placeholderValues: Record<string, string>;
  setPlaceholderValues: (values: Record<string, string>) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  snippets: SnippetCategory[];
  insertSnippet: (code: string) => void;
}

export const PlaceholderSidebar: React.FC<PlaceholderSidebarProps> = ({
  placeholderFields,
  placeholderValues,
  setPlaceholderValues,
  handleLogoUpload,
  snippets,
  insertSnippet,
}) => (
  <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
    <h3 className="font-semibold mb-4 flex items-center gap-2">
      <MousePointer className="h-4 w-4" />
      Code Snippets
    </h3>
    {/* Preview gegevens */}
    <div className="mb-8">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        Preview gegevens (voorbeeldwaarden)
      </h4>
      <div className="space-y-2">
        {placeholderFields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">{field.label}</label>
            {field.type === "image" ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {placeholderValues[field.id] && (
                  <img
                    src={placeholderValues[field.id]}
                    alt="Logo preview"
                    className="mt-2 h-12"
                    style={{
                      objectFit: "contain",
                      background: "#f5f5f5",
                      border: "1px solid #eee",
                      borderRadius: 4,
                      padding: 2,
                    }}
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                className="px-2 py-1 border rounded text-xs"
                placeholder={field.placeholder}
                value={placeholderValues[field.id] ?? ""}
                onChange={e =>
                  setPlaceholderValues({ ...placeholderValues, [field.id]: e.target.value })
                }
              />
            )}
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
    {/* Snippets */}
    {snippets.map((category, categoryIndex) => (
      <div key={categoryIndex} className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {category.category}
        </h4>
        <div className="space-y-2">
          {category.items.map((snippet, index) => (
            <button
              key={index}
              onClick={() => insertSnippet(snippet.code)}
              className="w-full p-3 text-left bg-background hover:bg-accent rounded-lg border transition-colors"
            >
              <div className="flex items-center gap-2">
                {snippet.icon}
                <span className="text-sm font-medium">{snippet.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

