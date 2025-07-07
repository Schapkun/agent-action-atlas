
export interface DocumentElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'table' | 'shape';
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
  };
  content: any;
  zIndex?: number;
}

export interface DocumentSettings {
  title: string;
  format: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface DocumentTemplate {
  id: string;
  name: string;
  elements: DocumentElement[];
  settings: DocumentSettings;
  createdAt: Date;
  updatedAt: Date;
}
