
import { VisualTemplateData } from '../types/VisualTemplate';

export interface StyleConfig {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  logoPosition: 'left' | 'center' | 'right';
  headerStyle: 'simple' | 'bordered' | 'colored';
}

export interface ColorMapping {
  header: {
    background: string;
    text: string;
    border?: string;
  };
  title: {
    color: string;
  };
  table: {
    headerBorder: string;
    rowBorder: string;
    totalBorder: string;
    totalText: string;
  };
  accents: {
    primary: string;
    secondary: string;
  };
}

export interface LayoutMetrics {
  containerWidth: number;
  containerHeight: number;
  padding: number;
  headerHeight: number;
  titleMarginBottom: number;
  contentSpacing: number;
  tableSpacing: number;
  footerMarginTop: number;
}

export class SharedStyleEngine {
  private styleConfig: StyleConfig;
  private colorMapping: ColorMapping;
  private layoutMetrics: LayoutMetrics;

  constructor(templateData: VisualTemplateData) {
    this.styleConfig = templateData.styling;
    this.initializeColorMapping();
    this.initializeLayoutMetrics();
  }

  private initializeColorMapping(): void {
    const { primaryColor, secondaryColor, headerStyle } = this.styleConfig;

    this.colorMapping = {
      header: {
        background: headerStyle === 'colored' ? primaryColor : 'transparent',
        text: headerStyle === 'colored' ? '#ffffff' : primaryColor,
        border: headerStyle === 'bordered' ? primaryColor : undefined
      },
      title: {
        color: primaryColor
      },
      table: {
        headerBorder: primaryColor,
        rowBorder: '#e5e7eb',
        totalBorder: secondaryColor, // Secundaire kleur voor totaal lijn
        totalText: secondaryColor    // Secundaire kleur voor totaal tekst
      },
      accents: {
        primary: primaryColor,
        secondary: secondaryColor
      }
    };
  }

  private initializeLayoutMetrics(): void {
    this.layoutMetrics = {
      containerWidth: 794,
      containerHeight: 1123,
      padding: 60,
      headerHeight: 100,
      titleMarginBottom: 32,
      contentSpacing: 32,
      tableSpacing: 32,
      footerMarginTop: 64
    };
  }

  // CSS Styling voor Preview
  getPreviewStyles() {
    return {
      container: {
        width: `${this.layoutMetrics.containerWidth}px`,
        minHeight: `${this.layoutMetrics.containerHeight}px`,
        padding: `${this.layoutMetrics.padding}px`,
        fontFamily: this.styleConfig.font || 'Arial',
        fontSize: '11pt',
        lineHeight: '1.4',
        color: '#000000',
        backgroundColor: '#ffffff'
      },
      header: {
        backgroundColor: this.colorMapping.header.background,
        color: this.colorMapping.header.text,
        borderColor: this.colorMapping.header.border,
        borderWidth: this.styleConfig.headerStyle === 'bordered' ? '2px' : '0',
        borderStyle: 'solid',
        padding: '16px',
        marginBottom: `${this.layoutMetrics.titleMarginBottom}px`,
        minHeight: `${this.layoutMetrics.headerHeight}px`
      },
      title: {
        color: this.colorMapping.title.color,
        fontSize: '18pt',
        fontWeight: 'bold',
        marginBottom: `${this.layoutMetrics.titleMarginBottom}px`
      },
      tableHeader: {
        borderBottomColor: this.colorMapping.table.headerBorder,
        borderBottomWidth: '2pt'
      },
      tableRow: {
        borderBottomColor: this.colorMapping.table.rowBorder,
        borderBottomWidth: '1pt'
      },
      tableTotal: {
        borderTopColor: this.colorMapping.table.totalBorder,
        borderTopWidth: '2pt',
        color: this.colorMapping.table.totalText
      },
      accents: {
        secondary: this.colorMapping.accents.secondary
      }
    };
  }

  // PDF Styling conversies
  getPDFStyles() {
    return {
      colors: {
        primary: this.hexToRgb(this.styleConfig.primaryColor),
        secondary: this.hexToRgb(this.styleConfig.secondaryColor),
        headerText: this.styleConfig.headerStyle === 'colored' ? [255, 255, 255] : this.hexToRgb(this.styleConfig.primaryColor),
        headerBg: this.styleConfig.headerStyle === 'colored' ? this.hexToRgb(this.styleConfig.primaryColor) : null,
        headerBorder: this.styleConfig.headerStyle === 'bordered' ? this.hexToRgb(this.styleConfig.primaryColor) : null
      },
      layout: {
        containerWidth: this.layoutMetrics.containerWidth * 0.264, // px to mm
        containerHeight: this.layoutMetrics.containerHeight * 0.264,
        padding: this.layoutMetrics.padding * 0.264,
        headerHeight: this.layoutMetrics.headerHeight * 0.264,
        spacing: this.layoutMetrics.contentSpacing * 0.264
      },
      alignment: this.getAlignment()
    };
  }

  private getAlignment() {
    switch (this.styleConfig.logoPosition) {
      case 'center':
        return { position: 'center', align: 'center' as const };
      case 'right':
        return { position: 'right', align: 'right' as const };
      default:
        return { position: 'left', align: 'left' as const };
    }
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  // Utility methods
  getDocumentTitle(documentType: string): string {
    switch (documentType) {
      case 'invoice':
        return 'FACTUUR';
      case 'quote':
        return 'OFFERTE';
      case 'letter':
        return 'BRIEF';
      default:
        return 'DOCUMENT';
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('nl-NL');
  }

  getFutureDate(daysFromNow: number): string {
    return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL');
  }
}
