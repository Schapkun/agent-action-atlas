
export interface HTMLElement {
  id: string;
  type: 'div' | 'text' | 'image' | 'table' | 'header' | 'footer';
  content?: string;
  src?: string;
  alt?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    zIndex?: number;
  };
  children?: HTMLElement[];
}

export interface HTMLDocument {
  id: string;
  name: string;
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  elements: HTMLElement[];
  styles: string; // Custom CSS
  lastModified: Date;
}

export interface A4Dimensions {
  width: number;  // 794px for A4
  height: number; // 1123px for A4
}

export const A4_DIMENSIONS: A4Dimensions = {
  width: 794,
  height: 1123
};
