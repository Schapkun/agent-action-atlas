
import { HTMLElement, HTMLDocument, A4_DIMENSIONS } from '../types/HTMLBuilder';

export class HTMLBuilderEngine {
  private document: HTMLDocument;

  constructor(document?: HTMLDocument) {
    this.document = document || this.createEmptyDocument();
  }

  createEmptyDocument(): HTMLDocument {
    return {
      id: crypto.randomUUID(),
      name: 'Nieuw Document',
      pageSize: 'a4',
      orientation: 'portrait',
      margins: { top: 60, right: 60, bottom: 60, left: 60 },
      elements: [],
      styles: '',
      lastModified: new Date()
    };
  }

  addElement(element: Omit<HTMLElement, 'id'>): HTMLElement {
    const newElement: HTMLElement = {
      ...element,
      id: crypto.randomUUID()
    };
    
    this.document.elements.push(newElement);
    this.document.lastModified = new Date();
    
    return newElement;
  }

  updateElement(id: string, updates: Partial<HTMLElement>): void {
    const elementIndex = this.document.elements.findIndex(el => el.id === id);
    if (elementIndex !== -1) {
      this.document.elements[elementIndex] = {
        ...this.document.elements[elementIndex],
        ...updates
      };
      this.document.lastModified = new Date();
    }
  }

  removeElement(id: string): void {
    this.document.elements = this.document.elements.filter(el => el.id !== id);
    this.document.lastModified = new Date();
  }

  generateHTML(): string {
    const { margins } = this.document;
    const { width, height } = A4_DIMENSIONS;
    
    const containerStyles = `
      width: ${width}px;
      height: ${height}px;
      position: relative;
      background: white;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;
      box-sizing: border-box;
      overflow: hidden;
    `;

    const elementsHTML = this.document.elements
      .map(element => this.generateElementHTML(element))
      .join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.document.name}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: Arial, sans-serif; 
      background: #f5f5f5;
    }
    .document-container {
      ${containerStyles}
    }
    ${this.document.styles}
  </style>
</head>
<body>
  <div class="document-container">
    ${elementsHTML}
  </div>
</body>
</html>`;
  }

  private generateElementHTML(element: HTMLElement): string {
    const { position, styles } = element;
    
    const positionStyles = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: ${position.width}px;
      height: ${position.height}px;
    `;

    const customStyles = Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');

    const allStyles = `${positionStyles}; ${customStyles}`;

    switch (element.type) {
      case 'text':
        return `<div style="${allStyles}">${element.content || ''}</div>`;
      
      case 'image':
        return `<img src="${element.src || ''}" alt="${element.alt || ''}" style="${allStyles}" />`;
      
      case 'div':
        const childrenHTML = element.children 
          ? element.children.map(child => this.generateElementHTML(child)).join('')
          : '';
        return `<div style="${allStyles}">${childrenHTML}</div>`;
      
      default:
        return `<div style="${allStyles}">${element.content || ''}</div>`;
    }
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  getDocument(): HTMLDocument {
    return { ...this.document };
  }

  setDocument(document: HTMLDocument): void {
    this.document = document;
  }
}
