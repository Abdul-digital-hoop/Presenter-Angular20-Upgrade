import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CursorService {
  private cursorCache: Map<string, string> = new Map();
  
  constructor() {
    this.initializeCursors();
  }

  private initializeCursors(): void {
    // Try canvas-based cursors first
    let penCursor = this.createToolCursor('pen');
    let highlighterCursor = this.createToolCursor('highlighter');
    
    // If canvas cursors fail, try SVG-based cursors
    if (!penCursor || penCursor.length === 0) {
      penCursor = this.createSimpleCursor('pen');
    }
    
    if (!highlighterCursor || highlighterCursor.length === 0) {
      highlighterCursor = this.createSimpleCursor('highlighter');
    }
    
    this.cursorCache.set('pen', penCursor);
    this.cursorCache.set('highlighter', highlighterCursor);
    this.cursorCache.set('eraser', this.createEmojiCursor('🧽'));
    this.cursorCache.set('arrow', this.createEmojiCursor('➡️'));
    this.cursorCache.set('rectangle', this.createEmojiCursor('⏹️'));
    this.cursorCache.set('circle', this.createEmojiCursor('⭕'));
    this.cursorCache.set('text', this.createEmojiCursor('🔤'));
    this.cursorCache.set('select', this.createEmojiCursor('👆'));
    
    // Inject CSS styles for cursor override
    setTimeout(() => this.injectCursorCSS(), 100);
  }

  /**
   * Create a custom cursor for specific tools (pen, highlighter)
   */
  private createToolCursor(toolType: string): string {
    try {
      // Use higher resolution for crisp rendering
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return '';
      }

      // Enable crisp rendering
      ctx.imageSmoothingEnabled = false;
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, size, size);

    if (toolType === 'highlighter') {
      // Draw pen icon without background
      
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
      
      // Highlighter tip - darker yellow
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(8, 28);
      ctx.lineTo(4, 30);
      ctx.lineTo(2, 28);
      ctx.closePath();
      ctx.fill();
      
      // Cap - orange
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

  /**
   * Create a custom cursor from emoji
   */
  private createEmojiCursor(emoji: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.clearRect(0, 0, 32, 32);
    
    // Try different font families for better emoji support
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
        
        // Draw emoji
        ctx.fillText(emoji, 16, 16);
        
        // Check if something was actually drawn
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
    
    // If emoji failed, fall back to a simple symbol
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
  
  /**
   * Get cursor CSS for a specific tool
   */
  getToolCursor(toolId: string): string {
    const customCursor = this.cursorCache.get(toolId);
    if (customCursor && customCursor.length > 0) {
      // Updated hotspot positions for 32x32 cursor with precise tip alignment
      const hotspotX = toolId === 'pen' ? 14 : toolId === 'highlighter' ? 4 : 16;
      const hotspotY = toolId === 'pen' ? 28 : toolId === 'highlighter' ? 28 : 16;
      return `url("${customCursor}") ${hotspotX} ${hotspotY}, auto`;
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
        return 'n-resize';
      case 'rectangle':
        return 'se-resize';
      case 'circle':
        return 'se-resize';
      case 'text':
        return 'text';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  }

  /**
   * Force refresh cursors
   */
  refreshCursors(): void {
    this.cursorCache.clear();
    this.initializeCursors();
  }

  /**
   * Apply cursor directly to canvas element
   */
  applyCursorToCanvas(canvasElement: HTMLElement, toolId: string): void {
    const cursor = this.getToolCursor(toolId);
    
    if (canvasElement) {
      // Force cursor application with !important
      canvasElement.style.setProperty('cursor', cursor, 'important');
      
      // Add data attribute for CSS targeting
      canvasElement.setAttribute('data-cursor-tool', toolId);
      canvasElement.classList.add('annotation-canvas');
      
      // Apply cursor to parent wrapper if exists
      const wrapper = canvasElement.closest('.fabric-canvas-wrapper') || canvasElement.parentElement;
      if (wrapper && wrapper !== canvasElement) {
        (wrapper as HTMLElement).style.setProperty('cursor', cursor, 'important');
        wrapper.setAttribute('data-cursor-tool', toolId);
      }
      
      // Update CSS injection and setup mouse event fallback
      this.injectCursorCSS();
      this.setupMouseEventCursors(canvasElement, toolId);
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

  /**
   * Inject CSS to ensure our cursors have priority
   */
  private injectCursorCSS(): void {
    const styleId = 'annotation-cursor-styles';
    
    // Remove existing style if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
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
      
      /* Fabric.js canvas elements */
      canvas[data-cursor-tool="pen"] {
        cursor: ${this.getToolCursor('pen')} !important;
      }
      
      canvas[data-cursor-tool="highlighter"] {
        cursor: ${this.getToolCursor('highlighter')} !important;
      }
      
      /* Override any conflicting cursor styles */
      .fabric-canvas-wrapper canvas {
        cursor: inherit !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Apply cursor using mouse events (ultimate fallback)
   */
  private setupMouseEventCursors(canvasElement: HTMLElement, toolId: string): void {
    const cursor = this.getToolCursor(toolId);
    
    // Remove existing event listeners
    canvasElement.removeEventListener('mouseenter', this.mouseEnterHandler);
    canvasElement.removeEventListener('mousemove', this.mouseMoveHandler);
    
    // Create new handlers
    this.mouseEnterHandler = () => {
      canvasElement.style.setProperty('cursor', cursor, 'important');
    };
    
    this.mouseMoveHandler = () => {
      if (canvasElement.style.cursor !== cursor) {
        canvasElement.style.setProperty('cursor', cursor, 'important');
      }
    };
    
    // Add event listeners
    canvasElement.addEventListener('mouseenter', this.mouseEnterHandler);
    canvasElement.addEventListener('mousemove', this.mouseMoveHandler);
  }
  
  private mouseEnterHandler?: () => void;
  private mouseMoveHandler?: () => void;
}
