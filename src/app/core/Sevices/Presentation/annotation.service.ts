import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
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
  shapeWidth: number;
  arrowWidth: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private canvas: fabric.Canvas | null = null;
  private isAnnotationMode = new BehaviorSubject<boolean>(false);
  private currentTool = new BehaviorSubject<string>('none');
  private annotationSettings = new BehaviorSubject<AnnotationSettings>({
    persistAcrossSlides: true,
    defaultTool: 'none',
    penColor: '#ff0000',
    penWidth: 3,
    highlighterColor: '#ffff00',
    highlighterWidth: 20,
    textColor: '#000000',
    textSize: 22,
    shapeWidth: 8,
    arrowWidth: 8
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

  // Undo/Redo functionality
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxUndoSteps: number = 50;
  
  // Per-slide undo/redo stacks
  private slideUndoStacks: Map<string, string[]> = new Map();
  private slideRedoStacks: Map<string, string[]> = new Map();

  // Available tools
  public readonly tools: AnnotationTool[] = [
    { id: 'pen', name: 'Pen', icon: '🖊', cursor: 'crosshair' },
    { id: 'highlighter', name: 'Highlighter', icon: '💄', cursor: 'crosshair' },
    { id: 'eraser', name: 'Eraser', icon: '🧼', cursor: 'crosshair' },
    { id: 'arrow', name: 'Arrow', icon: '➝', cursor: 'crosshair' },    
    { id: 'rectangle', name: 'Rectangle', icon: '▭', cursor: 'crosshair' }, 
    { id: 'circle', name: 'Circle', icon: '◯', cursor: 'crosshair' }, 
    { id: 'text', name: 'Text', icon: '𝑻', cursor: 'text' },
    { id: 'select', name: 'Select', icon: '☝', cursor: 'move' }
  ];

  constructor(
    private signalRService: WorkSignalRServiceService,
    private workspaceService: WorkspaceService,
    private cursorService: CursorService
  ) {
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.isAnnotationMode.value || !this.canvas) return;
      if (event.ctrlKey && !event.shiftKey) {
        if (event.key === 'z' || event.key === 'Z') {
          event.preventDefault();
          this.undo();
        } else if (event.key === 'y' || event.key === 'Y') {
          event.preventDefault();
          this.redo();
        }
      }
    });
  }
  private saveCanvasState(): void {
    if (!this.canvas) return;

    try {
      const canvasJson = JSON.stringify(this.canvas.toJSON());
      this.undoStack.push(canvasJson);
      if (this.undoStack.length > this.maxUndoSteps) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      if (this.currentSlideId) {
        this.slideUndoStacks.set(this.currentSlideId, [...this.undoStack]);
        this.slideRedoStacks.set(this.currentSlideId, [...this.redoStack]);
      }
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  }
  undo(): void {
    if (!this.canvas || this.undoStack.length === 0) {
      return;
    }

    try {
      const currentState = JSON.stringify(this.canvas.toJSON());
      this.redoStack.push(currentState);
      if (this.redoStack.length > this.maxUndoSteps) {
        this.redoStack.shift();
      }
      const previousState = this.undoStack.pop()!;
      this.canvas.loadFromJSON(previousState, () => {
        this.canvas?.renderAll();
        if (this.currentSlideId) {
          this.slideUndoStacks.set(this.currentSlideId, [...this.undoStack]);
          this.slideRedoStacks.set(this.currentSlideId, [...this.redoStack]);
        }
      });
    } catch (error) {
    }
  }
  redo(): void {
    if (!this.canvas || this.redoStack.length === 0) {
      return;
    }

    try {
      const currentState = JSON.stringify(this.canvas.toJSON());
      this.undoStack.push(currentState);
      if (this.undoStack.length > this.maxUndoSteps) {
        this.undoStack.shift();
      }
      const nextState = this.redoStack.pop()!;
      this.canvas.loadFromJSON(nextState, () => {
        this.canvas?.renderAll();
        if (this.currentSlideId) {
          this.slideUndoStacks.set(this.currentSlideId, [...this.undoStack]);
          this.slideRedoStacks.set(this.currentSlideId, [...this.redoStack]);
        }
      });
    } catch (error) {
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
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
    
    this.saveCanvasState();
    
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
        this.currentTool.next('none');
        this.clearAnnotations();
        this.enableAnnotationMode();
        
        setTimeout(() => {
          if (this.canvas) {
            this.canvas.defaultCursor = 'default';
            this.canvas.hoverCursor = 'default';
            const canvasElement = this.canvas.getElement();
            if (canvasElement) {
              canvasElement.style.cursor = 'default';
            }
            const upperCanvas = this.canvas.upperCanvasEl;
            if (upperCanvas) {
              upperCanvas.style.cursor = 'default';
            }
          }
        }, 10);
      } else {
        this.disableAnnotationMode();
      }
    }
  }

  resetToolSelection(): void {
    this.currentTool.next('none');
    if (this.canvas) {
      this.canvas.isDrawingMode = false;
      this.canvas.selection = false;
      this.canvas.defaultCursor = 'default';
      this.canvas.hoverCursor = 'default';
      
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        canvasElement.style.cursor = 'default';
        canvasElement.removeAttribute('data-cursor-tool');
        canvasElement.classList.remove('annotation-canvas');
      }
      
      if (this.canvas.upperCanvasEl) {
        this.canvas.upperCanvasEl.style.cursor = 'default';
        this.canvas.upperCanvasEl.removeAttribute('data-cursor-tool');
      }
      if (this.canvas.lowerCanvasEl) {
        this.canvas.lowerCanvasEl.style.cursor = 'default';
        this.canvas.lowerCanvasEl.removeAttribute('data-cursor-tool');
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

  forceResetTool(): void {
    this.currentTool.next('none');
    if (this.canvas) {
      this.canvas.defaultCursor = 'default';
      this.canvas.hoverCursor = 'default';
      
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        this.cursorService.clearCursorFromCanvas(canvasElement);
      }
      
      const upperCanvas = this.canvas.upperCanvasEl;
      if (upperCanvas) {
        this.cursorService.clearCursorFromCanvas(upperCanvas);
      }
      
      const lowerCanvas = this.canvas.lowerCanvasEl;
      if (lowerCanvas) {
        this.cursorService.clearCursorFromCanvas(lowerCanvas);
      }
      
      this.canvas.renderAll();
    }
  }

  /**
   * Update annotation settings
   */
  updateSettings(settings: Partial<AnnotationSettings>): void {
    const currentSettings = this.annotationSettings.value;
    this.annotationSettings.next({ ...currentSettings, ...settings });
    
    if (settings.highlighterColor !== undefined || settings.highlighterWidth !== undefined) {
      const currentSettings = this.annotationSettings.value;
      this.cursorService.updateHighlighterColor(
        settings.highlighterColor || currentSettings.highlighterColor,
        settings.highlighterWidth || currentSettings.highlighterWidth
      );
      
      if (this.currentTool.value === 'highlighter' && this.canvas) {
        const cursor = this.cursorService.getToolCursor('highlighter');
        this.canvas.defaultCursor = cursor;
        this.canvas.hoverCursor = cursor;
        
        const canvasElement = this.canvas.upperCanvasEl || this.canvas.lowerCanvasEl;
        if (canvasElement) {
          this.cursorService.applyCursorToCanvas(canvasElement, 'highlighter');
        }
      }
    }
    
    // Update canvas brush properties if canvas is available and in drawing mode
    if (this.canvas && this.isAnnotationMode.value) {
      this.updateCanvasBrushProperties();
      
      // Update existing shapes if size settings changed
      if (settings.shapeWidth !== undefined || settings.arrowWidth !== undefined) {
        this.updateExistingShapes();
      }
    }
  }

  /**
   * Set current slide ID for proper annotation management
   */
  setCurrentSlide(slideId: string): void {
    if (this.currentSlideId && this.currentSlideId !== slideId) {
      // Save annotations for previous slide
      this.saveAnnotationsForSlide(this.currentSlideId);
      this.saveUndoRedoStacksForSlide(this.currentSlideId);
    }
    
    this.currentSlideId = slideId;
    
    // Load annotations for new slide
    if (this.isInitialized && this.canvas) {
      this.loadAnnotationsForSlide(slideId);
      this.loadUndoRedoStacksForSlide(slideId);
    }
  }

  /**
   * Load annotations for slide
   */
  loadAnnotationsForSlide(slideId: string): void {
    if (!this.canvas || !slideId) return;
    this.canvas.clear();
    
    if (!this.annotationSettings.value.persistAcrossSlides) {
      this.clearAnnotations();
      return;
    }
    
    const annotations = this.slideAnnotations.get(slideId);
    if (annotations) {
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

  private saveUndoRedoStacksForSlide(slideId: string): void {
    if (!slideId) return;
    this.slideUndoStacks.set(slideId, [...this.undoStack]);
    this.slideRedoStacks.set(slideId, [...this.redoStack]);
    
  }

  private loadUndoRedoStacksForSlide(slideId: string): void {
    if (!slideId) return;
    this.undoStack = this.slideUndoStacks.get(slideId) || [];
    this.redoStack = this.slideRedoStacks.get(slideId) || [];
  }



  /**
   * Clear annotations for specific slide
   */
  clearAnnotationsForSlide(slideId: string): void {
    this.slideAnnotations.delete(slideId);
    this.slideUndoStacks.delete(slideId);
    this.slideRedoStacks.delete(slideId);
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
   * Get current highlighter color
   */
  getCurrentHighlighterColor(): string {
    return this.annotationSettings.value.highlighterColor;
  }

  /**
   * Get current highlighter width
   */
  getCurrentHighlighterWidth(): number {
    return this.annotationSettings.value.highlighterWidth;
  }

  /**
   * Get current highlighter size level (S, M, L, XL)
   */
  getCurrentHighlighterSizeLevel(): string {
    return this.cursorService.getSizeLevelName(this.annotationSettings.value.highlighterWidth);
  }

  /**
   * Sync cursor with current annotation settings (call this after initialization)
   */
  syncCursorWithSettings(): void {
    const settings = this.annotationSettings.value;
    this.cursorService.syncWithAnnotationSettings(settings.highlighterColor, settings.highlighterWidth);
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
      this.clearAnnotations();
      this.canvas.isDrawingMode = false;
      this.canvas.selection = false;
      
      // Reset tool to 'none' immediately to prevent cursor blinking
      this.currentTool.next('none');
      
      // Reset cursor immediately
      this.canvas.defaultCursor = 'default';
      this.canvas.hoverCursor = 'default';
      
      // Also reset cursor for the canvas element itself
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        canvasElement.style.cursor = 'default';
      }
      
      // Reset upper canvas cursor as well
      const upperCanvas = this.canvas.upperCanvasEl;
      if (upperCanvas) {
        upperCanvas.style.cursor = 'default';
      }
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
      
      // Reset cursor for all canvas elements using cursor service
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        this.cursorService.clearCursorFromCanvas(canvasElement);
      }
      
      const upperCanvas = this.canvas.upperCanvasEl;
      if (upperCanvas) {
        this.cursorService.clearCursorFromCanvas(upperCanvas);
      }
      
      const lowerCanvas = this.canvas.lowerCanvasEl;
      if (lowerCanvas) {
        this.cursorService.clearCursorFromCanvas(lowerCanvas);
      }
      
      // Force canvas to re-render
      this.canvas.renderAll();
    }
    this.cursorService.clearAllCursorStyling();
  }

  /**
   * Update canvas behavior based on selected tool
   */
  private updateCanvasForTool(toolId: string): void {
    if (!this.canvas) return;

    const settings = this.annotationSettings.value;
    const tool = this.tools.find(t => t.id === toolId);
    if (toolId === 'none') {
      this.canvas.isDrawingMode = false;
      this.canvas.selection = false;
      this.canvas.defaultCursor = 'default';
      this.canvas.hoverCursor = 'default';
      
      const canvasElement = this.canvas.getElement();
      if (canvasElement) {
        canvasElement.style.cursor = 'default';
        canvasElement.removeAttribute('data-cursor-tool');
        canvasElement.classList.remove('annotation-canvas');
      }
      
      if (this.canvas.upperCanvasEl) {
        this.canvas.upperCanvasEl.style.cursor = 'default';
        this.canvas.upperCanvasEl.removeAttribute('data-cursor-tool');
      }
      if (this.canvas.lowerCanvasEl) {
        this.canvas.lowerCanvasEl.style.cursor = 'default';
        this.canvas.lowerCanvasEl.removeAttribute('data-cursor-tool');
      }
      
      this.canvas.renderAll();
      return;
    }
    
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
        this.makeAllShapesInteractive();
        break;
      case 'arrow':
      case 'rectangle':
      case 'circle':
        this.makeAllShapesNonInteractive();
        break;
      default:
        this.makeAllShapesNonInteractive();
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
      case 'arrow':
      case 'rectangle':
      case 'circle':
      case 'triangle':
        break;
    }
  }

  private updateExistingShapes(): void {
    if (!this.canvas) return;

    const settings = this.annotationSettings.value;
    const objects = this.canvas.getObjects();

    objects.forEach(obj => {
      if (obj.type === 'rect' || obj.type === 'circle') {
        // Update stroke width for existing shapes
        obj.set('strokeWidth', settings.shapeWidth);
      } else if (obj.type === 'group') {
        // Update arrow groups
        const group = obj as fabric.Group;
        const groupObjects = group.getObjects();
        groupObjects.forEach(groupObj => {
          if (groupObj.type === 'line') {
            groupObj.set('strokeWidth', settings.arrowWidth);
          } else if (groupObj.type === 'triangle') {
            // Update arrowhead size based on arrow width
            const newSize = Math.max(10, settings.arrowWidth * 3);
            groupObj.set({
              width: newSize,
              height: newSize
            });
          }
        });
      }
    });

    this.canvas.renderAll();
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
    this.canvas.selection = false; // Disable selection to prevent interference
    
    // Ensure the canvas can detect objects for erasing
    this.canvas.perPixelTargetFind = false;
    this.canvas.targetFindTolerance = 10; // Increased tolerance for better hit detection
    
    // Force all objects to be interactive
    this.ensureAllObjectsInteractive();
  }

  /**
   * Setup select tool
   */
  private setupSelectTool(): void {
    if (!this.canvas) return;
    
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    
    // Ensure the canvas can detect objects for selection
    this.canvas.perPixelTargetFind = false;
    this.canvas.targetFindTolerance = 15; // Increased tolerance for better hit detection
    
    // Force all objects to be interactive and selectable
    this.ensureAllObjectsInteractive();
    
    // Force canvas to refresh object detection
    this.canvas.renderAll();
    
    // Force object selection to work immediately
    this.forceObjectSelection();
    
    // Enable selection events
    this.canvas.on('selection:created', (e) => {
      console.log('Selection created:', e.selected);
    });
    
    this.canvas.on('selection:updated', (e) => {
      console.log('Selection updated:', e.selected);
    });
    
    this.canvas.on('selection:cleared', () => {
      console.log('Selection cleared');
    });
  }

  /**
   * Force all objects to be immediately selectable
   */
  private forceObjectSelection(): void {
    if (!this.canvas) return;
    
    // Clear any existing selection
    this.canvas.discardActiveObject();
    
    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      // Force all objects to be selectable
      obj.selectable = true;
      obj.evented = true;
      
      // Set appropriate cursors
      if (obj.type === 'i-text') {
        obj.hoverCursor = 'text';
        // Ensure text objects are selectable but not locked
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
        // obj.editable = true;
      } else {
        obj.hoverCursor = 'pointer';
      }
      
      // For shapes, ensure they're properly selectable
      if (obj.type === 'rect' || obj.type === 'circle') {
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
      }
      
      // For groups (like arrows), ensure they're selectable
      if (obj.type === 'group') {
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
      }
      
      // For paths (pen and highlighter), ensure they're selectable
      if (obj.type === 'path') {
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
      }
    });
    
    // Force a complete refresh of the canvas
    this.canvas.renderAll();
    
    // Force the canvas to recalculate object bounds
    this.canvas.calcOffset();
    
    // Force the canvas to update its internal state
    this.canvas.setActiveObject(null);
    this.canvas.discardActiveObject();
  }

  /**
   * Handle select tool click to ensure objects are immediately selectable
   */
  private handleSelectToolClick(e: fabric.TEvent): void {
    if (!this.canvas) return;
    
    const pointer = this.canvas.getPointer(e.e);
    
    // Try to find the target object
    const target = this.canvas.findTarget(e.e);
    
    if (target) {
      // If we found a target, ensure it's selectable and select it
      target.selectable = true;
      target.evented = true;
      
      // Special handling for text objects
      if (target.type === 'i-text') {
        target.hasControls = true;
        target.hasBorders = true;
        target.lockMovementX = false;
        target.lockMovementY = false;
        target.lockRotation = false;
        target.lockScalingX = false;
        target.lockScalingY = false;
        // target.editable = true;
        target.hoverCursor = 'text';
      }
      
      // Set the object as active
      this.canvas.setActiveObject(target);
      this.canvas.renderAll();
      
      console.log(`Select tool: Selected ${target.type} object`);
    } else {
      // If no direct target found, search for objects at the click point
      const objects = this.canvas.getObjects();
      
      // Search from top to bottom (newest objects first)
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        
        // Check if the object contains the click point
        if (obj.containsPoint && obj.containsPoint(pointer)) {
          obj.selectable = true;
          obj.evented = true;
          
          // Special handling for text objects
          if (obj.type === 'i-text') {
            obj.hasControls = true;
            obj.hasBorders = true;
            obj.lockMovementX = false;
            obj.lockMovementY = false;
            obj.lockRotation = false;
            obj.lockScalingX = false;
            obj.lockScalingY = false;
            // obj.editable = true;
            obj.hoverCursor = 'text';
          }
          
          this.canvas.setActiveObject(obj);
          this.canvas.renderAll();
          console.log(`Select tool: Selected ${obj.type} object by point detection`);
          return;
        }
        
        // Special handling for shapes (rect, circle)
        if (obj.type === 'rect' || obj.type === 'circle') {
          if (this.isPointInShape(pointer, obj)) {
            obj.selectable = true;
            obj.evented = true;
            this.canvas.setActiveObject(obj);
            this.canvas.renderAll();
            console.log(`Select tool: Selected ${obj.type} shape by shape detection`);
            return;
          }
        }
        
        // Additional check for objects that might not have containsPoint working properly
        if (this.isPointInObjectBounds(pointer, obj)) {
          obj.selectable = true;
          obj.evented = true;
          
          // Special handling for text objects
          if (obj.type === 'i-text') {
            obj.hasControls = true;
            obj.hasBorders = true;
            obj.lockMovementX = false;
            obj.lockMovementY = false;
            obj.lockRotation = false;
            obj.lockScalingX = false;
            obj.lockScalingY = false;
            // obj.editable = true;
            obj.hoverCursor = 'text';
          }
          
          this.canvas.setActiveObject(obj);
          this.canvas.renderAll();
          console.log(`Select tool: Selected ${obj.type} object by bounds detection`);
          return;
        }
      }
    }
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
    
                   // Ensure objects are interactive when added
      this.canvas.on('object:added', (e) => {
        if (e.target) {
          // Basic interactivity
          e.target.selectable = true;
          e.target.evented = true;
          
          // Set appropriate cursors
          if (e.target.type === 'i-text') {
            e.target.hoverCursor = 'text';
            // Ensure text objects are selectable but not locked
            e.target.hasControls = true;
            e.target.hasBorders = true;
            e.target.lockMovementX = false;
            e.target.lockMovementY = false;
            e.target.lockRotation = false;
            e.target.lockScalingX = false;
            e.target.lockScalingY = false;
            // e.target.editable = true;
          } else {
            e.target.hoverCursor = 'pointer';
          }
          
          // For shapes, ensure they're properly selectable
          if (e.target.type === 'rect' || e.target.type === 'circle') {
            e.target.hasControls = true;
            e.target.hasBorders = true;
            e.target.lockMovementX = false;
            e.target.lockMovementY = false;
            e.target.lockRotation = false;
            e.target.lockScalingX = false;
            e.target.lockScalingY = false;
            
            // Force immediate selectability
            e.target.selectable = true;
            e.target.evented = true;
            e.target.hoverCursor = 'pointer';
          }
          
          // For groups (like arrows), ensure they're selectable
          if (e.target.type === 'group') {
            e.target.hasControls = true;
            e.target.hasBorders = true;
            e.target.lockMovementX = false;
            e.target.lockMovementY = false;
            e.target.lockRotation = false;
            e.target.lockScalingX = false;
            e.target.lockScalingY = false;
            
            // Force immediate selectability
            e.target.selectable = true;
            e.target.evented = true;
            e.target.hoverCursor = 'pointer';
          }
          
          // For paths (pen and highlighter), ensure they're selectable
          if (e.target.type === 'path') {
            e.target.selectable = true;
            e.target.evented = true;
            e.target.hoverCursor = 'pointer';
          }
          
          // Force the object to be immediately interactive
          setTimeout(() => {
            if (e.target) {
              e.target.selectable = true;
              e.target.evented = true;
              this.canvas?.renderAll();
            }
          }, 0);
        }
      });
    
  }

  /**
   * Handle mouse down events
   */
  private handleMouseDown(e: fabric.TEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas) return;

    const pointer = this.canvas.getPointer(e.e);
    const tool = this.currentTool.value;

    if (tool === 'none') {
      return;
    }
    
    switch (tool) {
      case 'pen':
      case 'highlighter':
        this.saveCanvasState();
        break;
      case 'eraser':
        this.saveCanvasState();
        this.handleEraserClick(e);
        break;
      case 'select':
        this.handleSelectToolClick(e);
        break;
      case 'arrow':
      case 'rectangle':
      case 'circle':
        this.saveCanvasState();
        this.makeAllShapesNonInteractive();
        this.startDrawingShape(tool, pointer);
        break;
    }
  }

  /**
   * Handle mouse move events
   */
  private handleMouseMove(e: fabric.TEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas || !this.isDrawing) return;

    const pointer = this.canvas.getPointer(e.e);
    this.updateDrawingShape(pointer);
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp(e: fabric.TEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas) return;

    if (this.isDrawing) {
      this.finishDrawingShape();
    }
  }

  /**
   * Handle double click for text tool
   */
  private handleDoubleClick(e: fabric.TEvent): void {
    if (!this.isAnnotationMode.value || !this.canvas) return;

    if (this.currentTool.value === 'text') {
      this.saveCanvasState();
      const pointer = this.canvas.getPointer(e.e);
      this.addTextAnnotation(pointer);
    }
  }

  /**
   * Handle eraser click
   */
  private handleEraserClick(e: fabric.TEvent): void {
    if (!this.canvas) return;
    
    // Get the pointer position
    const pointer = this.canvas.getPointer(e.e);
    
    // First try to find the exact target
    const target = this.canvas.findTarget(e.e);
    
    if (target) {
      // Remove the target object directly
      this.canvas.remove(target);
      this.canvas.renderAll();
      console.log(`Eraser: Removed ${target.type} object directly`);
      return;
    }
    
    // If no direct target found, search for objects at the click point
    const objects = this.canvas.getObjects();
    
    // Search from top to bottom (newest objects first)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Check if the object contains the click point
      if (obj.containsPoint && obj.containsPoint(pointer)) {
        this.canvas.remove(obj);
        this.canvas.renderAll();
        console.log(`Eraser: Removed ${obj.type} object by point detection`);
        return;
      }
      
      // For groups (like arrows), check if any child contains the point
      if (obj.type === 'group') {
        const group = obj as fabric.Group;
        const groupObjects = group.getObjects();
        for (const groupObj of groupObjects) {
          if (groupObj.containsPoint && groupObj.containsPoint(pointer)) {
            this.canvas.remove(obj); // Remove the entire group
            this.canvas.renderAll();
            console.log(`Eraser: Removed group object by child point detection`);
            return;
          }
        }
      }
      
      // Special handling for shapes (rect, circle)
      if (obj.type === 'rect' || obj.type === 'circle') {
        if (this.isPointInShape(pointer, obj)) {
          this.canvas.remove(obj);
          this.canvas.renderAll();
          console.log(`Eraser: Removed ${obj.type} shape by shape detection`);
          return;
        }
      }
      
      // Additional check for objects that might not have containsPoint working properly
      if (this.isPointInObjectBounds(pointer, obj)) {
        this.canvas.remove(obj);
        this.canvas.renderAll();
        console.log(`Eraser: Removed ${obj.type} object by bounds detection`);
        return;
      }
    }
    
    // If still no object found, try with a larger search radius
    this.searchAndRemoveObjectsInRadius(pointer, 15);
  }

  /**
   * Check if a point is within an object's bounds
   */
  private isPointInObjectBounds(point: fabric.Point, obj: fabric.Object): boolean {
    const bounds = obj.getBoundingRect();
    return point.x >= bounds.left && 
           point.x <= bounds.left + bounds.width &&
           point.y >= bounds.top && 
           point.y <= bounds.top + bounds.height;
  }

  /**
   * Check if a point is within a shape (more precise than bounds)
   */
  private isPointInShape(point: fabric.Point, obj: fabric.Object): boolean {
    if (obj.type === 'rect') {
      const rect = obj as fabric.Rect;
      return point.x >= rect.left! && 
             point.x <= rect.left! + rect.width! &&
             point.y >= rect.top! && 
             point.y <= rect.top! + rect.height!;
    } else if (obj.type === 'circle') {
      const circle = obj as fabric.Circle;
      const centerX = circle.left! + circle.radius!;
      const centerY = circle.top! + circle.radius!;
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      );
      return distance <= circle.radius!;
    }
    return false;
  }

  /**
   * Ensure all objects on canvas are interactive
   */
  private ensureAllObjectsInteractive(): void {
    if (!this.canvas) return;
    
    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      // Ensure basic interactivity
      obj.selectable = true;
      obj.evented = true;
      
      // Set appropriate cursors
      if (obj.type === 'i-text') {
        obj.hoverCursor = 'text';
        // Ensure text objects are selectable but not locked
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
        // obj.editable = true;
      } else {
        obj.hoverCursor = 'pointer';
      }
      
      // For shapes, ensure they're properly selectable
      if (obj.type === 'rect' || obj.type === 'circle') {
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
        
        // Force object to be selectable by setting these properties
        obj.selectable = true;
        obj.evented = true;
        obj.hoverCursor = 'pointer';
      }
      
      // For groups (like arrows), ensure they're selectable
      if (obj.type === 'group') {
        obj.hasControls = true;
        obj.hasBorders = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.lockRotation = false;
        obj.lockScalingX = false;
        obj.lockScalingY = false;
        
        // Force group to be selectable
        obj.selectable = true;
        obj.evented = true;
        obj.hoverCursor = 'pointer';
      }
    });
    
    // Force a complete refresh of the canvas
    this.canvas.renderAll();
    
    // Force the canvas to recalculate object bounds
    this.canvas.calcOffset();
  }

  /**
   * Search and remove objects within a radius of a point
   */
  private searchAndRemoveObjectsInRadius(point: fabric.Point, radius: number): void {
    if (!this.canvas) return;
    
    const objects = this.canvas.getObjects();
    
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const bounds = obj.getBoundingRect();
      
      // Check if any part of the object is within the radius
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      );
      
      if (distance <= radius) {
        this.canvas.remove(obj);
        this.canvas.renderAll();
        console.log(`Eraser: Removed ${obj.type} object by radius search (${distance.toFixed(1)}px)`);
        return;
      }
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
        this.currentShape = this.createArrow(pointer, pointer, settings.penColor, settings.arrowWidth);
        break;
      case 'rectangle':
        this.currentShape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 1, // Start with minimum size instead of 0
          height: 1, // Start with minimum size instead of 0
          fill: 'transparent',
          stroke: settings.penColor,
          strokeWidth: settings.shapeWidth,
          selectable: true,
          evented: true,
          hoverCursor: 'pointer',
          strokeDashArray: [5, 5] // Add dashed line to show it's being drawn
        });
        break;
      case 'circle':
        this.currentShape = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1, // Start with minimum size instead of 0
          fill: 'transparent',
          stroke: settings.penColor,
          strokeWidth: settings.shapeWidth,
          selectable: true,
          evented: true,
          hoverCursor: 'pointer',
          strokeDashArray: [5, 5] // Add dashed line to show it's being drawn
        });
        break;
    }

    if (this.currentShape) {
      // Ensure the object is immediately interactive
      this.currentShape.selectable = true;
      this.currentShape.evented = true;
      this.currentShape.hoverCursor = 'pointer';
      
             // Force the object to be interactive
       this.currentShape.hasControls = true;
       this.currentShape.hasBorders = true;
       this.currentShape.lockMovementX = false;
       this.currentShape.lockMovementY = false;
       this.currentShape.lockRotation = false;
       this.currentShape.lockScalingX = false;
       this.currentShape.lockScalingY = false;
      
      this.canvas.add(this.currentShape);
      this.canvas.renderAll();
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
        this.currentShape = this.createArrow(this.startPoint, pointer, settings.penColor, settings.arrowWidth);
        this.canvas.add(this.currentShape);
        break;
      case 'rectangle':
        const rect = this.currentShape as fabric.Rect;
        const width = pointer.x - this.startPoint.x;
        const height = pointer.y - this.startPoint.y;
        const absWidth = Math.abs(width);
        const absHeight = Math.abs(height);
        
        // Only update if we have meaningful dimensions
        if (absWidth > 1 && absHeight > 1) {
          rect.set({
            width: absWidth,
            height: absHeight,
            left: width < 0 ? pointer.x : this.startPoint.x,
            top: height < 0 ? pointer.y : this.startPoint.y,
            strokeDashArray: undefined // Remove dashed line when shape is properly sized
          });
        }
        break;
      case 'circle':
        const circle = this.currentShape as fabric.Circle;
        const deltaX = pointer.x - this.startPoint.x;
        const deltaY = pointer.y - this.startPoint.y;
        const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only update if we have meaningful radius
        if (radius > 1) {
          const centerX = (this.startPoint.x + pointer.x) / 2;
          const centerY = (this.startPoint.y + pointer.y) / 2;
          
          circle.set({
            radius: radius / 2,
            left: centerX - (radius / 2),
            top: centerY - (radius / 2),
            strokeDashArray: undefined // Remove dashed line when shape is properly sized
          });
        }
        break;
    }

    this.canvas.renderAll();
  }

  /**
   * Finish drawing shape
   */
  private finishDrawingShape(): void {
    if (this.currentShape) {
      // Ensure the final shape is properly interactive
      this.currentShape.selectable = true;
      this.currentShape.evented = true;
      this.currentShape.hoverCursor = 'pointer';
      
      // Ensure shapes have selection controls
      if (this.currentShape.type === 'rect' || this.currentShape.type === 'circle') {
        this.currentShape.hasControls = true;
        this.currentShape.hasBorders = true;
        this.currentShape.lockMovementX = false;
        this.currentShape.lockMovementY = false;
        this.currentShape.lockRotation = false;
        this.currentShape.lockScalingX = false;
        this.currentShape.lockScalingY = false;
      }
      
      if (this.currentShape.type === 'group') {
        this.currentShape.hasControls = true;
        this.currentShape.hasBorders = true;
        this.currentShape.lockMovementX = false;
        this.currentShape.lockMovementY = false;
        this.currentShape.lockRotation = false;
        this.currentShape.lockScalingX = false;
        this.currentShape.lockScalingY = false;
      }
      
      // Remove dashed line if it exists
      if (this.currentShape.strokeDashArray) {
        this.currentShape.set('strokeDashArray', undefined);
      }
      
      // Force a re-render to ensure the shape is properly displayed
      this.canvas?.renderAll();
    }
    
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
      originY: 'center',
      selectable: true,
      evented: true
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
      angle: 90,
      selectable: true,
      evented: true
    });

    // Group line and arrowhead
    const arrow = new fabric.Group([line, arrowHead], {
      left: start.x,
      top: start.y,
      angle: angle * 180 / Math.PI,
      originX: 'left',
      originY: 'center',
      selectable: true,
      evented: true,
      hoverCursor: 'pointer'
    });

    return arrow;
  }

  /**
   * Add text annotation
   */
  private addTextAnnotation(pointer: fabric.Point): void {
    if (!this.canvas) return;

    const settings = this.annotationSettings.value;
    
    const canvasWidth = this.canvas.width!;
    const canvasHeight = this.canvas.height!;
    const textWidth = 300;
    const textHeight = 30;
    
    const constrainedX = Math.max(10, Math.min(pointer.x, canvasWidth - textWidth - 10));
    const constrainedY = Math.max(10, Math.min(pointer.y, canvasHeight - textHeight - 10));
    
    const text = new fabric.Textbox('Click to edit', {
      left: constrainedX,
      top: constrainedY,
      fill: settings.textColor,
      fontSize: settings.textSize,
      fontFamily: 'Arial',
      editable: true,
      selectable: true,
      evented: true,
      hoverCursor: 'text',
      width: textWidth,
      textAlign: 'left',
      padding: 10,
      splitByGrapheme: true,
      minHeight: textHeight
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
            fabric.util.enlivenObjects([annotationData.pathData]).then((objects: fabric.Object[]) => {
              objects.forEach(obj => {
                this.canvas?.add(obj);
              });
              this.canvas?.renderAll();
            });
          }
          break;
        
        case 'object:added':
          if (annotationData.objectData) {
            fabric.util.enlivenObjects([annotationData.objectData]).then((objects: fabric.Object[]) => {
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
      if (this.currentSlideId) {
        this.slideAnnotations.delete(this.currentSlideId);
        this.slideUndoStacks.delete(this.currentSlideId);
        this.slideRedoStacks.delete(this.currentSlideId);
      }
      this.undoStack = [];
      this.redoStack = [];
      this.saveCanvasState();
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
    this.slideUndoStacks.clear();
    this.slideRedoStacks.clear();
    this.undoStack = [];
    this.redoStack = [];
  }

  private makeAllShapesNonInteractive(): void {
    if (!this.canvas) return;
    
    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      obj.selectable = false;
      obj.evented = false;
      obj.hoverCursor = 'default';
      
      obj.hasControls = false;
      obj.hasBorders = false;
      
      obj.lockMovementX = true;
      obj.lockMovementY = true;
      obj.lockRotation = true;
      obj.lockScalingX = true;
      obj.lockScalingY = true;
    });
    
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  private makeAllShapesInteractive(): void {
    if (!this.canvas) return;
    
    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      obj.selectable = true;
      obj.evented = true;
      obj.hoverCursor = 'pointer';
      
      obj.hasControls = true;
      obj.hasBorders = true;
      
      obj.lockMovementX = false;
      obj.lockMovementY = false;
      obj.lockRotation = false;
      obj.lockScalingX = false;
      obj.lockScalingY = false;
    });
    
    this.canvas.renderAll();
  }
}