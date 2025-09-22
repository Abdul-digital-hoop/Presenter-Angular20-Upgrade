import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CursorService {
  private cursorCache: Map<string, string> = new Map();
  
  public static readonly HIGHLIGHTER_SIZES = {
    SMALL: 8,      // S
    MEDIUM: 15,    // M  
    LARGE: 25,     // L
    EXTRA_LARGE: 35 // XL
  };
  
  constructor() {
    this.initializeCursors();
  }

  private initializeCursors(): void {
    let penCursor = this.createToolCursor('pen');
    let highlighterCursor = this.createToolCursor('highlighter');
    
    if (!penCursor || penCursor.length === 0) {
      penCursor = this.createSimpleCursor('pen');
    }
    
    if (!highlighterCursor || highlighterCursor.length === 0) {
      highlighterCursor = this.createSimpleCursor('highlighter');
    }
    
    this.cursorCache.set('pen', this.createEmojiCursor('🖊'));
    this.cursorCache.set('highlighter', this.createColoredCircleCursor('#ffff00', 20)); // Default L size (20px = L)
    this.cursorCache.set('eraser', this.createEmojiCursor('🧽'));
    this.cursorCache.set('arrow', 'crosshair');
    this.cursorCache.set('rectangle', 'crosshair');
    this.cursorCache.set('circle', 'crosshair');
    this.cursorCache.set('text', 'text');
    this.cursorCache.set('select', 'move');
    
    setTimeout(() => this.injectCursorCSS(), 100);
  }

  private createToolCursor(toolType: string): string {
    try {
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return '';
      }

      ctx.imageSmoothingEnabled = false;
      
      ctx.clearRect(0, 0, size, size);

    if (toolType === 'highlighter') {
      
      // Pen body - main blue part
      ctx.fillStyle = '#2196F3';
      ctx.strokeStyle = '#1976D2';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(10, 24);
      ctx.lineTo(12, 8);
      ctx.lineTo(20, 8);
      ctx.lineTo(18, 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Pen tip - black pointed end
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(10, 24);
      ctx.lineTo(18, 24);
      ctx.lineTo(16, 28);
      ctx.lineTo(12, 28);
      ctx.closePath();
      ctx.fill();
      
      // Pen clip - silver/gray
      ctx.fillStyle = '#757575';
      ctx.strokeStyle = '#424242';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(20, 8);
      ctx.lineTo(22, 6);
      ctx.lineTo(23, 6);
      ctx.lineTo(23, 12);
      ctx.lineTo(20, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
    } else if (toolType === 'pen') {
      // Draw highlighter icon without background
      
      // Highlighter body - yellow
      ctx.fillStyle = '#FFEB3B';
      ctx.strokeStyle = '#F57F17';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(20, 12);
      ctx.lineTo(22, 14);
      ctx.lineTo(8, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(8, 28);
      ctx.lineTo(4, 30);
      ctx.lineTo(2, 28);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#FF5722';
      ctx.strokeStyle = '#D84315';
      
      ctx.beginPath();
      ctx.moveTo(20, 12);
      ctx.lineTo(22, 14);
      ctx.lineTo(24, 12);
      ctx.lineTo(22, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    return canvas.toDataURL();
    
    } catch (error) {
      return '';
    }
  }

  private createEmojiCursor(emoji: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 32, 32);
    
    const fonts = [
      '24px "Segoe UI Emoji"',
      '24px "Apple Color Emoji"',
      '24px "Noto Color Emoji"',
      '24px Arial, sans-serif'
    ];
    
    let drawn = false;
    for (const font of fonts) {
      try {
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(emoji, 16, 16);
        
        const imageData = ctx.getImageData(0, 0, 32, 32);
        const hasContent = imageData.data.some(pixel => pixel !== 0);
        
        if (hasContent) {
          drawn = true;
          break;
        }
      } catch (error) {
        console.warn(`Failed to draw emoji ${emoji} with font ${font}:`, error);
        continue;
      }
    }
    
    if (!drawn) {
      ctx.clearRect(0, 0, 32, 32);
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#2C3E50';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Use better fallback symbols
      let fallbackSymbol = '●';
      if (emoji === '🧽') fallbackSymbol = 'E'; // Eraser
      else if (emoji === '➡️') fallbackSymbol = '→'; // Arrow
      else if (emoji === '⬜') fallbackSymbol = '□'; // Rectangle
      else if (emoji === '⭕') fallbackSymbol = '○'; // Circle
      else if (emoji === '📝') fallbackSymbol = 'T'; // Text
      else if (emoji === '👆') fallbackSymbol = '↖'; // Select
      
      ctx.fillText(fallbackSymbol, 16, 16);
    }
    
    return canvas.toDataURL();
  }
  
  getToolCursor(toolId: string): string {
    const customCursor = this.cursorCache.get(toolId);
    if (customCursor && customCursor.length > 0) {
      if (customCursor.startsWith('data:') || customCursor.startsWith('url(')) {
        const hotspotX = toolId === 'pen' ? 14 : toolId === 'highlighter' ? 16 : 16;
        const hotspotY = toolId === 'pen' ? 28 : toolId === 'highlighter' ? 16 : 16;
        return `url("${customCursor}") ${hotspotX} ${hotspotY}, auto`;
      } else {
        return customCursor;
      }
    }
    
    // Fallback to default cursors
    switch (toolId) {
      case 'pen':
        return 'crosshair';
      case 'highlighter':
        return 'cell';
      case 'eraser':
        return 'grab';
      case 'arrow':
        return 'crosshair';
      case 'rectangle':
        return 'crosshair';
      case 'circle':
        return 'crosshair';
      case 'text':
        return 'text';
      case 'select':
        return 'move';
      default:
        return 'default';
    }
  }

  private createColoredCircleCursor(color: string, size?: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.clearRect(0, 0, 32, 32);
    
    let radius: number;
    if (size) {
      if (size <= CursorService.HIGHLIGHTER_SIZES.SMALL) {
        radius = 4; 
      } else if (size <= CursorService.HIGHLIGHTER_SIZES.MEDIUM) {
        radius = 6; 
      } else if (size <= CursorService.HIGHLIGHTER_SIZES.LARGE) {
        radius = 8; 
      } else {
        radius = 10;
      }
    } else {
      radius = 6; 
    }
    
    ctx.fillStyle = color;
    ctx.strokeStyle = this.darkenColor(color, 0.3);
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(16, 16, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    const innerRadius = radius * 0.8;
    const gradient = ctx.createRadialGradient(16 - innerRadius * 0.3, 16 - innerRadius * 0.3, 0, 16, 16, innerRadius);
    gradient.addColorStop(0, this.lightenColor(color, 0.3));
    gradient.addColorStop(1, color);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, innerRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    return canvas.toDataURL();
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 - parseInt(hex.substr(0, 2), 16)) * amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 - parseInt(hex.substr(2, 2), 16)) * amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 - parseInt(hex.substr(4, 2), 16)) * amount);
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  refreshCursors(): void {
    this.cursorCache.clear();
    this.initializeCursors();
  }

  clearAllCursorStyling(): void {
    // Remove all cursor-related CSS
    const styleId = 'annotation-cursor-styles';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const canvasElements = document.querySelectorAll('canvas[data-cursor-tool]');
    const annotationElements = document.querySelectorAll('.annotation-canvas[data-cursor-tool]');
    
    canvasElements.forEach((element) => {
      (element as HTMLElement).style.cursor = 'default';
      element.removeAttribute('data-cursor-tool');
    });
    
    annotationElements.forEach((element) => {
      (element as HTMLElement).style.cursor = 'default';
      element.removeAttribute('data-cursor-tool');
      element.classList.remove('annotation-canvas');
    });

    const fabricWrappers = document.querySelectorAll('.fabric-canvas-wrapper');
    fabricWrappers.forEach((wrapper) => {
      const canvas = wrapper.querySelector('canvas');
      if (canvas) {
        canvas.style.cursor = 'default';
        canvas.removeAttribute('data-cursor-tool');
      }
      wrapper.removeAttribute('data-cursor-tool');
    });
  }

  updateHighlighterColor(color: string, size?: number): void {
    this.cursorCache.set('highlighter', this.createColoredCircleCursor(color, size));
    setTimeout(() => this.injectCursorCSS(), 50);
    
    this.forceCursorUpdate();
  }

  updateHighlighterSize(size: number, color?: string): void {
    const currentColor = color || '#ffff00';
    this.cursorCache.set('highlighter', this.createColoredCircleCursor(currentColor, size));
    setTimeout(() => this.injectCursorCSS(), 50);
    this.forceCursorUpdate();
  }

  syncWithAnnotationSettings(highlighterColor: string, highlighterWidth: number): void {
    this.cursorCache.set('highlighter', this.createColoredCircleCursor(highlighterColor, highlighterWidth));
    setTimeout(() => this.injectCursorCSS(), 50);
  }

  getSizeLevelName(size: number): string {
    if (size <= CursorService.HIGHLIGHTER_SIZES.SMALL) {
      return 'S';
    } else if (size <= CursorService.HIGHLIGHTER_SIZES.MEDIUM) {
      return 'M';
    } else if (size <= CursorService.HIGHLIGHTER_SIZES.LARGE) {
      return 'L';
    } else {
      return 'XL';
    }
  }

  private forceCursorUpdate(): void {
    // Find all canvas elements with cursor tool attributes
    const canvasElements = document.querySelectorAll('canvas[data-cursor-tool="highlighter"]');
    const annotationElements = document.querySelectorAll('.annotation-canvas[data-cursor-tool="highlighter"]');
    
    const newCursor = this.getToolCursor('highlighter');
    
    canvasElements.forEach((element) => {
      (element as HTMLElement).style.setProperty('cursor', newCursor, 'important');
    });
    
    annotationElements.forEach((element) => {
      (element as HTMLElement).style.setProperty('cursor', newCursor, 'important');
    });
    
    const fabricWrappers = document.querySelectorAll('.fabric-canvas-wrapper');
    fabricWrappers.forEach((wrapper) => {
      const canvas = wrapper.querySelector('canvas');
      if (canvas && canvas.getAttribute('data-cursor-tool') === 'highlighter') {
        canvas.style.setProperty('cursor', newCursor, 'important');
      }
    });
  }

  applyCursorToCanvas(canvasElement: HTMLElement, toolId: string): void {
    const cursor = this.getToolCursor(toolId);
    
    if (canvasElement) {
      canvasElement.style.setProperty('cursor', cursor, 'important');
      
      canvasElement.setAttribute('data-cursor-tool', toolId);
      canvasElement.classList.add('annotation-canvas');
      
      const wrapper = canvasElement.closest('.fabric-canvas-wrapper') || canvasElement.parentElement;
      if (wrapper && wrapper !== canvasElement) {
        (wrapper as HTMLElement).style.setProperty('cursor', cursor, 'important');
        wrapper.setAttribute('data-cursor-tool', toolId);
      }
      
      this.injectCursorCSS();
      this.setupMouseEventCursors(canvasElement, toolId);
    }
  }

  clearCursorFromCanvas(canvasElement: HTMLElement): void {
    if (canvasElement) {
      canvasElement.style.setProperty('cursor', 'default', 'important');
      
      canvasElement.removeAttribute('data-cursor-tool');
      canvasElement.classList.remove('annotation-canvas');
      
      const wrapper = canvasElement.closest('.fabric-canvas-wrapper') || canvasElement.parentElement;
      if (wrapper && wrapper !== canvasElement) {
        (wrapper as HTMLElement).style.setProperty('cursor', 'default', 'important');
        wrapper.removeAttribute('data-cursor-tool');
      }
    }
  }

  /**
   * Create a simple CSS-based cursor as fallback
   */
  createSimpleCursor(toolId: string): string {
    if (toolId === 'pen') {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <rect x="10" y="8" width="8" height="16" fill="#2196F3" stroke="#1976D2" stroke-width="1"/>
          <polygon points="10,24 18,24 16,28 12,28" fill="#000"/>
          <rect x="18" y="6" width="4" height="6" fill="#757575" stroke="#424242" stroke-width="1"/>
        </svg>
      `);
    } else if (toolId === 'highlighter') {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <polygon points="6,26 20,12 22,14 8,28" fill="#FFEB3B" stroke="#F57F17" stroke-width="1"/>
          <polygon points="6,26 8,28 4,30 2,28" fill="#FF9800"/>
          <polygon points="20,12 22,14 24,12 22,10" fill="#FF5722" stroke="#D84315" stroke-width="1"/>
        </svg>
      `);
    }
    return '';
  }

  private injectCursorCSS(): void {
    const styleId = 'annotation-cursor-styles';
    
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Force custom cursors for annotation canvas */
      .annotation-canvas[data-cursor-tool="pen"] {
        cursor: ${this.getToolCursor('pen')} !important;
      }
      
      .annotation-canvas[data-cursor-tool="highlighter"] {
        cursor: ${this.getToolCursor('highlighter')} !important;
      }
      
      .annotation-canvas[data-cursor-tool="eraser"] {
        cursor: ${this.getToolCursor('eraser')} !important;
      }
      
      .annotation-canvas[data-cursor-tool="arrow"] {
        cursor: crosshair !important;
      }
      
      .annotation-canvas[data-cursor-tool="rectangle"] {
        cursor: crosshair !important;
      }
      
      .annotation-canvas[data-cursor-tool="circle"] {
        cursor: crosshair !important;
      }
      
      .annotation-canvas[data-cursor-tool="text"] {
        cursor: text !important;
      }
      
      /* Fabric.js canvas elements */
      canvas[data-cursor-tool="pen"] {
        cursor: ${this.getToolCursor('pen')} !important;
      }
      
      canvas[data-cursor-tool="highlighter"] {
        cursor: ${this.getToolCursor('highlighter')} !important;
      }
        
      canvas[data-cursor-tool="eraser"] {
        cursor: ${this.getToolCursor('eraser')} !important;
      }
      
      canvas[data-cursor-tool="arrow"] {
        cursor: crosshair !important;
      }
      
      canvas[data-cursor-tool="rectangle"] {
        cursor: crosshair !important;
      }
      
      canvas[data-cursor-tool="circle"] {
        cursor: crosshair !important;
      }
      
      canvas[data-cursor-tool="text"] {
        cursor: text !important;
      }
      annotation-canvas[data-cursor-tool="select"] {
        cursor: move !important;
      }
      canvas[data-cursor-tool="select"] {
        cursor: move !important;
      }
      /* Override any conflicting cursor styles */
      .fabric-canvas-wrapper canvas {
        cursor: inherit !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  private setupMouseEventCursors(canvasElement: HTMLElement, toolId: string): void {
    const cursor = this.getToolCursor(toolId);
    
    canvasElement.removeEventListener('mouseenter', this.mouseEnterHandler);
    canvasElement.removeEventListener('mousemove', this.mouseMoveHandler);
    
    this.mouseEnterHandler = () => {
      canvasElement.style.setProperty('cursor', cursor, 'important');
    };
    
    this.mouseMoveHandler = () => {
      if (canvasElement.style.cursor !== cursor) {
        canvasElement.style.setProperty('cursor', cursor, 'important');
      }
    };
    
    canvasElement.addEventListener('mouseenter', this.mouseEnterHandler);
    canvasElement.addEventListener('mousemove', this.mouseMoveHandler);
  }
  
  private mouseEnterHandler?: () => void;
  private mouseMoveHandler?: () => void;
}
