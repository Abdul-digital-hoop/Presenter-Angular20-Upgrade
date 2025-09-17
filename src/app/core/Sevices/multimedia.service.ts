import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MultimediaItem {
  id: string;
  type: 'fabric-object' | 'text' | 'image' | 'shape';
  data: any;
  timestamp: number;
  sourceSlideId?: string;
  metadata?: {
    objectType?: string;
    dimensions?: { width: number; height: number };
    position?: { left: number; top: number };
    properties?: any;
    copyMetadata?: any;
    objectIndex?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MultimediaService {
  private clipboardItems: MultimediaItem[] = [];
  private maxClipboardSize = 10; // Maximum number of items to keep in clipboard history
  
  private clipboardSubject = new BehaviorSubject<MultimediaItem[]>([]);
  public clipboard$ = this.clipboardSubject.asObservable();

  constructor() {}

  /**
   * Copy objects to the global clipboard
   */
  copyObjects(objects: any[], sourceSlideId?: string, copyMetadata?: any): void {
    const timestamp = Date.now();
    
    objects.forEach((obj, index) => {
      const clipboardItem: MultimediaItem = {
        id: `${timestamp}_${index}`,
        type: this.getObjectType(obj),
        data: this.serializeObject(obj),
        timestamp,
        sourceSlideId,
        metadata: {
          objectType: obj.type,
          dimensions: { 
            width: obj.width || obj.scaleX * (obj.width || 100),
            height: obj.height || obj.scaleY * (obj.height || 100)
          },
          position: { 
            left: obj.left || 0, 
            top: obj.top || 0 
          },
          properties: {
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            opacity: obj.opacity,
            angle: obj.angle,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY
          },
          // Enhanced positioning metadata
          copyMetadata: copyMetadata || {},
          objectIndex: index
        }
      };
      
      this.addToClipboard(clipboardItem);
    });
  }

  /**
   * Get the most recent copied objects
   */
  getRecentCopiedObjects(): MultimediaItem[] {
    if (this.clipboardItems.length === 0) return [];
    
    const latestTimestamp = Math.max(...this.clipboardItems.map(item => item.timestamp));
    return this.clipboardItems.filter(item => item.timestamp === latestTimestamp);
  }

  /**
   * Get all clipboard items
   */
  getAllClipboardItems(): MultimediaItem[] {
    return [...this.clipboardItems];
  }

  /**
   * Clear the clipboard
   */
  clearClipboard(): void {
    this.clipboardItems = [];
    this.clipboardSubject.next([...this.clipboardItems]);
  }

  /**
   * Check if clipboard has items
   */
  hasClipboardItems(): boolean {
    return this.clipboardItems.length > 0;
  }

  /**
   * Get clipboard items by type
   */
  getClipboardItemsByType(type: MultimediaItem['type']): MultimediaItem[] {
    return this.clipboardItems.filter(item => item.type === type);
  }

  /**
   * Remove specific clipboard item
   */
  removeClipboardItem(itemId: string): void {
    this.clipboardItems = this.clipboardItems.filter(item => item.id !== itemId);
    this.clipboardSubject.next([...this.clipboardItems]);
  }

  private addToClipboard(item: MultimediaItem): void {
    // Add to beginning of array (most recent first)
    this.clipboardItems.unshift(item);
    
    // Keep only the maximum number of items
    if (this.clipboardItems.length > this.maxClipboardSize) {
      this.clipboardItems = this.clipboardItems.slice(0, this.maxClipboardSize);
    }
    
    this.clipboardSubject.next([...this.clipboardItems]);
  }

  private getObjectType(obj: any): MultimediaItem['type'] {
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      return 'text';
    } else if (obj.type === 'image') {
      return 'image';
    } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || 
               obj.type === 'polygon' || obj.type === 'ellipse' || obj.type === 'path') {
      return 'shape';
    } else {
      return 'fabric-object';
    }
  }

  private serializeObject(obj: any): any {
    try {
      // For fabric objects, we want to preserve all properties
      return JSON.parse(JSON.stringify(obj.toObject ? obj.toObject() : obj));
    } catch (error) {
      console.warn('Failed to serialize object:', error);
      return obj;
    }
  }
} 