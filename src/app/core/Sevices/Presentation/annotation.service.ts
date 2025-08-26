import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { BehaviorSubject, Subject } from 'rxjs';
import { WorkSignalRServiceService } from '../WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from '../WorkSpace/workspace.service';
import { CursorService } from './cursor.service';

export interface AnnotationTool {
  id: string;
  name: string;
  icon: string;
  cursor: string;
}

export interface AnnotationSettings {
  persistAcrossSlides: boolean;
  defaultTool: string;
  penColor: string;
  penWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  textColor: string;
  textSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private canvas: fabric.Canvas | null = null;
  private isAnnotationMode = new BehaviorSubject<boolean>(false);
  private currentTool = new BehaviorSubject<string>('pen');
  private annotationSettings = new BehaviorSubject<AnnotationSettings>({
    persistAcrossSlides: true,
    defaultTool: 'pen',
    penColor: '#ff0000',
    penWidth: 3,
    highlighterColor: '#ffff00',
    highlighterWidth: 20,
    textColor: '#000000',
    textSize: 16
  });

  // Observables
  public isAnnotationMode$ = this.isAnnotationMode.asObservable();
  public currentTool$ = this.currentTool.asObservable();
  public annotationSettings$ = this.annotationSettings.asObservable();

  // Drawing state
  private isDrawing = false;
  private currentPath: fabric.Path | null = null;
  private pathData: string = '';

  // Annotation storage per slide
  private slideAnnotations: Map<string, string> = new Map();
  
  // Current slide tracking
  private currentSlideId: string = '';
  private isInitialized: boolean = false;

  // Available tools
  public readonly tools: AnnotationTool[] = [
    { id: 'pen', name: 'Pen', icon: '✏️', cursor: 'crosshair' },
    { id: 'highlighter', name: 'Highlighter', icon: '🖍️', cursor: 'crosshair' },
    { id: 'eraser', name: 'Eraser', icon: '🧽', cursor: 'crosshair' },
    { id: 'arrow', name: 'Arrow', icon: '➡️', cursor: 'crosshair' },
    { id: 'rectangle', name: 'Rectangle', icon: '⏹️', cursor: 'crosshair' },
    { id: 'circle', name: 'Circle', icon: '⭕', cursor: 'crosshair' },
    { id: 'text', name: 'Text', icon: '🔤', cursor: 'text' },
    { id: 'select', name: 'Select', icon: '👆', cursor: 'default' }
  ];

  constructor(
    private signalRService: WorkSignalRServiceService,
    private workspaceService: WorkspaceService,
    private cursorService: CursorService
  ) {
  }

  /**
   * Initialize annotation canvas
   */
  initializeCanvas(canvasElement: HTMLCanvasElement, containerElement: HTMLElement): void {
    if (this.canvas) {
      this.canvas.dispose();
    }

    // Get container dimensions for initial sizing
    const containerRect = containerElement.getBoundingClientRect();
    const initialWidth = 1680;
    const initialHeight =  945;

    this.canvas = new fabric.Canvas(canvasElement, {
      width: initialWidth,
      height: initialHeight,
      isDrawingMode: false,
      selection: false,
      backgroundColor: 'transparent',
    });
    
    // Initialize the drawing brush
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    
    this.scaleCanvasContainer(canvasElement);

    this.setupCanvasEvents();
    this.setupRealtimeListeners();
    // Load annotations for current slide if available
    if (this.currentSlideId && this.slideAnnotations.has(this.currentSlideId)) {
      this.loadAnnotationsForSlide(this.currentSlideId);
    }
    
    this.isInitialized = true;
    
    console.log('Canvas initialized with dimensions:', initialWidth, 'x', initialHeight);
  }

  private scaleCanvasContainer(parentElement: HTMLElement) {
    const canvasEl = this.canvas.getElement();
    const containerWidth = parentElement.clientWidth || parentElement.offsetWidth;
    const containerHeight = parentElement.clientHeight || parentElement.offsetHeight;
    
    const scaleX = containerWidth / this.canvas.width!;
    const scaleY = containerHeight / this.canvas.height!;
    const scale = Math.min(scaleX, scaleY);
    
    // Scale the canvas element
    canvasEl.style.transform = `scale(${scale})`;
    canvasEl.style.transformOrigin = 'top left';
    
    // Update container dimensions
    const scaledWidth = this.canvas.width! * scale;
    const scaledHeight = this.canvas.height! * scale;
    
    // Center the canvas in container
    const left = (containerWidth - scaledWidth) / 2;
    const top = (containerHeight - scaledHeight) / 2;
    
    canvasEl.style.left = `${left}px`;
    
    canvasEl.style.position = 'absolute';
    
    // Update upper canvas position and style
    const upperCanvas = this.canvas.upperCanvasEl;
    upperCanvas.style.left = `${left}px`;
    
    upperCanvas.style.transform = `scale(${scale})`;
    upperCanvas.style.transformOrigin = 'top left';
    
    this.setCanvasScale();
  }
  setCanvasScale() {
    const scale = this.canvas.getZoom();
    document.documentElement.style.setProperty('--canvas-scale', scale.toString());
  }
  /**
   * Toggle annotation mode
   */
  toggleAnnotationMode(): void {
    const newMode = !this.isAnnotationMode.value;
    this.isAnnotationMode.next(newMode);
    
    if (this.canvas) {
      if (newMode) {
        this.enableAnnotationMode();
      } else {
        this.disableAnnotationMode();
      }
    }
  }

  /**
   * Set current annotation tool
   */
  setCurrentTool(toolId: string): void {
    this.currentTool.next(toolId);
    this.updateCanvasForTool(toolId);
    
    // Also update brush properties to ensure current settings are applied
    if (this.canvas && this.isAnnotationMode.value) {
      this.updateCanvasBrushProperties();
      
      // Update cursor for the new tool
      const cursor = this.cursorService.getToolCursor(toolId);
      this.canvas.defaultCursor = cursor;
      this.canvas.hoverCursor = cursor;
    }
  }

  /**
   * Update annotation settings
   */
  updateSettings(settings: Partial<AnnotationSettings>): void {
    const currentSettings = this.annotationSettings.value;
    this.annotationSettings.next({ ...currentSettings, ...settings });
    
    // Update canvas brush properties if canvas is available and in drawing mode
    if (this.canvas && this.isAnnotationMode.value) {
      this.updateCanvasBrushProperties();
    }
  }

  /**
   * Set current slide ID for proper annotation management
   */
  setCurrentSlide(slideId: string): void {
    if (this.currentSlideId && this.currentSlideId !== slideId) {
      // Save annotations for previous slide
      this.saveAnnotationsForSlide(this.currentSlideId);
    }
    
    this.currentSlideId = slideId;
    
    // Load annotations for new slide
    if (this.isInitialized && this.canvas) {
      this.loadAnnotationsForSlide(slideId);
    }
  }

  /**
   * Load annotations for slide
   */
  loadAnnotationsForSlide(slideId: string): void {
    if (!this.canvas || !slideId) return;
    
    const annotations = this.slideAnnotations.get(slideId);
    if (annotations && this.annotationSettings.value.persistAcrossSlides) {
      try {
        this.canvas.loadFromJSON(annotations, () => {
          this.canvas?.renderAll();
        });
      } catch (error) {
        console.error('Error loading annotations for slide:', slideId, error);
        this.clearAnnotations();
      }
    } else {
      this.clearAnnotations();
    }
  }



  /**
   * Clear annotations for specific slide
   */
  clearAnnotationsForSlide(slideId: string): void {
    this.slideAnnotations.delete(slideId);
    if (this.canvas) {
      this.clearAnnotations();
    }
  }

  /**
   * Get canvas instance
   */
  getCanvas(): fabric.Canvas | null {
    return this.canvas;
  }

  /**
   * Get current cursor for the active tool
   */
  getCurrentCursor(): string {
    return this.cursorService.getToolCursor(this.currentTool.value);
  }

  /**
   * Get cursor for a specific tool
   */
  getToolCursor(toolId: string): string {
    return this.cursorService.getToolCursor(toolId);
  }

  /**
   * Resize canvas
   */
  resizeCanvas(width: string | number, height: string | number): void {
    if (this.canvas) {
      // Convert string dimensions to numbers (remove 'px' if present)
      const numericWidth = typeof width === 'string' ? parseInt(width.replace('px', ''), 10) : width;
      const numericHeight = typeof height === 'string' ? parseInt(height.replace('px', ''), 10) : height;
      
      // Ensure we have valid dimensions
      if (isNaN(numericWidth) || isNaN(numericHeight) || numericWidth <= 0 || numericHeight <= 0) {
        console.warn('Invalid canvas dimensions:', width, height);
        return;
      }
      
      console.log('Resizing canvas to:', numericWidth, 'x', numericHeight);
      this.canvas.setDimensions({ width: numericWidth, height: numericHeight });
      this.canvas.renderAll();
    }
  }

  /**
   * Enable annotation mode
   */
  private enableAnnotationMode(): void {
    if (this.canvas) {
      this.canvas.isDrawingMode = false;
      this.canvas.selection = false;
      this.updateCanvasForTool(this.currentTool.value);
      
      // Ensure cursor is set for the current tool
      const cursor = this.cursorService.getToolCursor(this.currentTool.value);
      this.canvas.defaultCursor = cursor;
      this.canvas.hoverCursor = cursor;
    }
  }

  /**
   * Disable annotation mode
   */
  private disableAnnotationMode(): void {
    if (this.canvas) {
      this.canvas.isDrawingMode = false;
      this.canvas.selection = false;
      this.canvas.defaultCursor = 'default';
      this.canvas.hoverCursor = 'default';
      
      // Reset cursor for the canvas element itself
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        canvasElement.style.cursor = 'default';
      }
    }
  }

  /**
   * Update canvas behavior based on selected tool
   */
  private updateCanvasForTool(toolId: string): void {
    if (!this.canvas) return;

    const settings = this.annotationSettings.value;
    const tool = this.tools.find(t => t.id === toolId);
    
    if (!tool) return;

    // Reset canvas state
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    
    // Set cursor for the tool
    const cursor = this.cursorService.getToolCursor(toolId);
    
    this.canvas.defaultCursor = cursor;
    this.canvas.hoverCursor = cursor;
    
    // Also apply cursor directly to canvas element as backup
    const canvasElement = this.canvas.upperCanvasEl || this.canvas.lowerCanvasEl;
    if (canvasElement) {
      this.cursorService.applyCursorToCanvas(canvasElement, toolId);
    }
    
    // Force cursor update by refreshing canvas
    this.canvas.renderAll();

    switch (toolId) {
      case 'pen':
        this.setupPenTool(settings);
        break;
      case 'highlighter':
        this.setupHighlighterTool(settings);
        break;
      case 'eraser':
        this.setupEraserTool();
        break;
      case 'select':
        this.setupSelectTool();
        break;
      default:
        // For shapes and text, we'll handle in mouse events
        break;
    }
  }

  /**
   * Update canvas brush properties based on current tool and settings
   */
  private updateCanvasBrushProperties(): void {
    if (!this.canvas) return;

    const currentTool = this.currentTool.value;
    const settings = this.annotationSettings.value;

    switch (currentTool) {
      case 'pen':
        if (this.canvas.freeDrawingBrush) {
          this.canvas.freeDrawingBrush.color = settings.penColor;
          this.canvas.freeDrawingBrush.width = settings.penWidth;
        }
        break;
      case 'highlighter':
        if (this.canvas.freeDrawingBrush) {
          this.canvas.freeDrawingBrush.color = this.hexToRgba(settings.highlighterColor, 0.5);
          this.canvas.freeDrawingBrush.width = settings.highlighterWidth;
        }
        break;
    }
  }

  /**
   * Setup pen tool
   */
  private setupPenTool(settings: AnnotationSettings): void {
    if (!this.canvas) return;
    
    this.canvas.isDrawingMode = true;
    
    // Ensure we have a PencilBrush for pen tool
    if (!(this.canvas.freeDrawingBrush instanceof fabric.PencilBrush)) {
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    }
    
    this.canvas.freeDrawingBrush.color = settings.penColor;
    this.canvas.freeDrawingBrush.width = settings.penWidth;
  }

  /**
   * Setup highlighter tool
   */
  private setupHighlighterTool(settings: AnnotationSettings): void {
    if (!this.canvas) return;
    
    this.canvas.isDrawingMode = true;
    
    // Ensure we have a PencilBrush for highlighter
    if (!(this.canvas.freeDrawingBrush instanceof fabric.PencilBrush)) {
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    }
    
    this.canvas.freeDrawingBrush.color = this.hexToRgba(settings.highlighterColor, 0.5);
    this.canvas.freeDrawingBrush.width = settings.highlighterWidth;
  }

  /**
   * Setup eraser tool
   */
  private setupEraserTool(): void {
    if (!this.canvas) return;
    
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
  }

  /**
   * Setup select tool
   */
  private setupSelectTool(): void {
    if (!this.canvas) return;
    
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
  }

  /**
   * Setup canvas event handlers
   */
  private setupCanvasEvents(): void {
    if (!this.canvas) return;

    this.canvas.on('mouse:down', (e) => this.handleMouseDown(e));
    this.canvas.on('mouse:move', (e) => this.handleMouseMove(e));
    this.canvas.on('mouse:up', (e) => this.handleMouseUp(e));
    this.canvas.on('mouse:dblclick', (e) => this.handleDoubleClick(e));
    
  }

  /**
   * Handle mouse down events
   */
  private handleMouseDown(e: fabric.IEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas) return;

    const pointer = this.canvas.getPointer(e.e);
    const tool = this.currentTool.value;

    switch (tool) {
      case 'eraser':
        this.handleEraserClick(e);
        break;
      case 'arrow':
      case 'rectangle':
      case 'circle':
        this.startDrawingShape(tool, pointer);
        break;
    }
  }

  /**
   * Handle mouse move events
   */
  private handleMouseMove(e: fabric.IEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas || !this.isDrawing) return;

    const pointer = this.canvas.getPointer(e.e);
    this.updateDrawingShape(pointer);
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp(e: fabric.IEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas) return;

    if (this.isDrawing) {
      this.finishDrawingShape();
    }
  }

  /**
   * Handle double click for text tool
   */
  private handleDoubleClick(e: fabric.IEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas) return;

    if (this.currentTool.value === 'text') {
      const pointer = this.canvas.getPointer(e.e);
      this.addTextAnnotation(pointer);
    }
  }

  /**
   * Handle eraser click
   */
  private handleEraserClick(e: fabric.IEvent): void {
    const target = this.canvas?.findTarget(e.e, false);
    if (target) {
      this.canvas?.remove(target);
    }
  }

  // Shape drawing state
  private startPoint: fabric.Point | null = null;
  private currentShape: fabric.Object | null = null;

  /**
   * Start drawing shape
   */
  private startDrawingShape(tool: string, pointer: fabric.Point): void {
    if (!this.canvas) return;
    
    this.isDrawing = true;
    this.startPoint = pointer;
    const settings = this.annotationSettings.value;

    switch (tool) {
      case 'arrow':
        this.currentShape = this.createArrow(pointer, pointer, settings.penColor, settings.penWidth);
        break;
      case 'rectangle':
        this.currentShape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: settings.penColor,
          strokeWidth: settings.penWidth
        });
        break;
      case 'circle':
        this.currentShape = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: settings.penColor,
          strokeWidth: settings.penWidth
        });
        break;
    }

    if (this.currentShape) {
      this.canvas.add(this.currentShape);
    }
  }

  /**
   * Update drawing shape
   */
  private updateDrawingShape(pointer: fabric.Point): void {
    if (!this.canvas || !this.currentShape || !this.startPoint) return;

    const tool = this.currentTool.value;
    const settings = this.annotationSettings.value;

    switch (tool) {
      case 'arrow':
        this.canvas.remove(this.currentShape);
        this.currentShape = this.createArrow(this.startPoint, pointer, settings.penColor, settings.penWidth);
        this.canvas.add(this.currentShape);
        break;
      case 'rectangle':
        const rect = this.currentShape as fabric.Rect;
        const width = pointer.x - this.startPoint.x;
        const height = pointer.y - this.startPoint.y;
        rect.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width < 0 ? pointer.x : this.startPoint.x,
          top: height < 0 ? pointer.y : this.startPoint.y
        });
        break;
      case 'circle':
        const circle = this.currentShape as fabric.Circle;
        const radius = Math.sqrt(
          Math.pow(pointer.x - this.startPoint.x, 2) + 
          Math.pow(pointer.y - this.startPoint.y, 2)
        ) / 2;
        circle.set({
          radius: radius,
          left: this.startPoint.x - radius,
          top: this.startPoint.y - radius
        });
        break;
    }

    this.canvas.renderAll();
  }

  /**
   * Finish drawing shape
   */
  private finishDrawingShape(): void {
    this.isDrawing = false;
    this.startPoint = null;
    this.currentShape = null;
  }

  /**
   * Create arrow shape
   */
  private createArrow(start: fabric.Point, end: fabric.Point, color: string, strokeWidth: number): fabric.Group {
    // Calculate arrow properties
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Create arrow line
    const line = new fabric.Line([0, 0, length, 0], {
      stroke: color,
      strokeWidth: strokeWidth,
      originX: 'left',
      originY: 'center'
    });

    // Create arrowhead
    const arrowHeadSize = Math.max(10, strokeWidth * 3);
    const arrowHead = new fabric.Triangle({
      width: arrowHeadSize,
      height: arrowHeadSize,
      fill: color,
      left: length,
      top: 0,
      originX: 'center',
      originY: 'center',
      angle: 90
    });

    // Group line and arrowhead
    const arrow = new fabric.Group([line, arrowHead], {
      left: start.x,
      top: start.y,
      angle: angle * 180 / Math.PI,
      originX: 'left',
      originY: 'center'
    });

    return arrow;
  }

  /**
   * Add text annotation
   */
  private addTextAnnotation(pointer: fabric.Point): void {
    if (!this.canvas) return;

    const settings = this.annotationSettings.value;
    const text = new fabric.IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fill: settings.textColor,
      fontSize: settings.textSize,
      fontFamily: 'Arial',
      editable: true
    });

    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing();
  }

  /**
   * Convert hex color to rgba
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Setup real-time annotation listeners
   */
  private setupRealtimeListeners(): void {
    // Listen for annotation broadcasts from presenter (for audience)
    this.workspaceService.receiveAnnotationBehavioursSubject.subscribe((annotationData) => {
      if (annotationData && !this.workspaceService.isPreviewMode) {
        this.handleReceivedAnnotation(annotationData);
      }
    });

    // Listen for annotation clear commands
    this.workspaceService.clearAnnotationsBehavioursSubject.subscribe((data) => {
      if (data && !this.workspaceService.isPreviewMode) {
        this.clearAnnotations();
      }
    });

    // Listen for annotation sync commands
    this.workspaceService.syncAnnotationsBehavioursSubject.subscribe((data) => {
      if (data && data.annotations && !this.workspaceService.isPreviewMode) {
        this.loadAnnotationsFromJson(data.annotations);
      }
    });
  }

 

  /**
   * Handle received annotation from presenter
   */
  private handleReceivedAnnotation(annotationData: any): void {
    if (!this.canvas || !annotationData) return;

    try {
      switch (annotationData.eventType) {
        case 'path:created':
          if (annotationData.pathData) {
            fabric.util.enlivenObjects([annotationData.pathData], (objects: fabric.Object[]) => {
              objects.forEach(obj => {
                this.canvas?.add(obj);
              });
              this.canvas?.renderAll();
            });
          }
          break;
        
        case 'object:added':
          if (annotationData.objectData) {
            fabric.util.enlivenObjects([annotationData.objectData], (objects: fabric.Object[]) => {
              objects.forEach(obj => {
                this.canvas?.add(obj);
              });
              this.canvas?.renderAll();
            });
          }
          break;
        
        case 'object:removed':
          // For removal, we might need to sync the entire canvas
          if (annotationData.canvasData) {
            this.loadAnnotationsFromJson(annotationData.canvasData);
          }
          break;
        
        case 'object:modified':
          // For modifications, sync the entire canvas to ensure consistency
          if (annotationData.canvasData) {
            this.loadAnnotationsFromJson(annotationData.canvasData);
          }
          break;
        
        default:
          // For any other events, sync the entire canvas
          if (annotationData.canvasData) {
            this.loadAnnotationsFromJson(annotationData.canvasData);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling received annotation:', error);
      // Fallback to full canvas sync
      if (annotationData.canvasData) {
        this.loadAnnotationsFromJson(annotationData.canvasData);
      }
    }
  }

  /**
   * Load annotations from JSON string
   */
  private loadAnnotationsFromJson(jsonData: string): void {
    if (!this.canvas) return;

    try {
      this.canvas.loadFromJSON(jsonData, () => {
        this.canvas?.renderAll();
      });
    } catch (error) {
      console.error('Error loading annotations from JSON:', error);
    }
  }

  /**
   * Clear annotations and broadcast to audience
   */
  clearAnnotations(): void {
    if (this.canvas) {
      this.canvas.clear();
      this.canvas.backgroundColor = 'transparent';
      this.canvas.renderAll();
      
    }
  }



  /**
   * Save annotations for specific slide
   */
  saveAnnotationsForSlide(slideId: string): void {
    if (!this.canvas || !slideId) return;
    
    try {
      const canvasJson = JSON.stringify(this.canvas.toJSON());
      this.slideAnnotations.set(slideId, canvasJson);
    } catch (error) {
      console.error('Error saving annotations for slide:', slideId, error);
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
    this.slideAnnotations.clear();
  }
}