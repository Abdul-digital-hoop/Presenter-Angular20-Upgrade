import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { fabric } from 'fabric';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as paper from 'paper';


/**
 * Interface for shape configuration
 */
interface ShapeConfig {
  type: string;
  properties: any;
}

export interface ToolbarDropdown {
  isOpen: boolean;
  position: { x: number; y: number };
}

interface TableConfig {
  rows: number;
  columns: number;
  cellWidth: number;
  cellHeight: number;
  backgroundColor?: string;
  borderColor?: string;
}

@Component({
  selector: 'app-multimedia',
  templateUrl: './multimedia.component.html',
  styleUrls: ['./multimedia.component.scss']
})
export class MultimediaComponent implements OnInit, OnDestroy {

  // Canvas References
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;
  @ViewChild('textToolbar') textToolbar!: ElementRef;
  canvas!: fabric.Canvas;

  // Subscriptions and State Management
  private actionSubscription!: Subscription;
  private history: string[] = [];  
  private historyIndex: number = -1;
  private saveSubject = new Subject<string>();
  private lastSavedJson = '';
  private existingJson: any;

  // Object Selection and Context Menu
  private selectedObject: fabric.Object | null = null;
  public showContextMenu = false;
  public contextMenuX = 0;
  public contextMenuY = 0;
  public contextMenu_Y = 0;

  // Text Styling Properties
  selectedTextObject: fabric.IText | null = null;
  currentFontFamily: string = 'Arial';
  currentFontSize: number = 14;
  currentColor: string = '#000000';
  currentBold: boolean = false;
  currentItalic: boolean = false;
  currentUnderline: boolean = false;
  currentStrike: boolean = false;
  currentAlignment: string = 'left';

  // Available Fonts and Sizes
  fonts: string[] = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Helvetica'
  ];
  fontSizes: number[] = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

  shapes: ShapeConfig[] = [
    { type: 'text', properties: { text: 'T' } },
    { type: 'rectangle', properties: { width: 100, height: 60 } },
    { type: 'table', properties: { rows: 3, cols: 3 } },
    { type: 'arrow', properties: { width: 100, height: 50 } },
    { type: 'triangle', properties: { width: 100, height: 100 } },
    { type: 'line', properties: { length: 100 } },
    { type: 'hexagon', properties: { radius: 50 } },
    { type: 'circle', properties: { radius: 50 } },
    { type: 'star', properties: { points: 5, radius: 50 } },
    { type: 'pentagon', properties: { radius: 50 } },
    { type: 'cube', properties: { size: 100 } },
    { type: 'pie', properties: { radius: 50, angle: 270 } },
    { type: 'tag', properties: {} },
    { type: 'teardrop', properties: { radius: 50 } },
    { type: 'diamond', properties: { size: 100 } },
    { type: 'parallelogram', properties: { width: 100, height: 60 } },
    { type: 'trapezoid', properties: { width: 100, height: 60 } },
    { type: 'semiCircle', properties: { radius: 50 } },
    { type: 'chat', properties: {} },
    { type: 'chevron', properties: { radius: 50 } },
    { type: 'halfFrame', properties: { size: 100 } },
    { type: 'frame', properties: { size: 100 } },
    { type: 'donut', properties: { radius: 50 } },
    { type: 'blockArc', properties: { radius: 50 } },
    { type: 'forwardArrow', properties: { width: 100, height: 50 } }   
  ];

  showAlignmentDropdown = false;
  currentAlignmentIcon = '/assets/multimedia-icons/multimedia-text-align-left.svg';

  // Add property to control toolbar visibility
  showTextToolbar: boolean = false;

  // Add these properties to your component
  showShapeToolbar = false;
  selectedShape: fabric.Object | null = null;
  borderStyles = [
    { id: 'none', icon: '/assets/multimedia-icons/multimedia-border-none.svg', label: 'No Border' },
    { id: 'solid', icon: '/assets/multimedia-icons/multimedia-border-solid.svg', label: 'Solid' },
    { id: 'dashed', icon: '/assets/multimedia-icons/multimedia-border-dashed.svg', label: 'Dashed' },
    { id: 'dotted', icon: '/assets/multimedia-icons/multimedia-border-dotted.svg', label: 'Dotted' }
  ];

  borderWidths = [
    { value: 1, label: '1px' },
    { value: 2, label: '2px' },
    { value: 4, label: '4px' },
    { value: 6, label: '6px' },
    { value: 8, label: '8px' }
  ];

  dropdowns = {
    borderStyle: { isOpen: false, position: { x: 0, y: 0 } },
    borderRadius: { isOpen: false, position: { x: 0, y: 0 } },
    shapeSelector: { isOpen: false, position: { x: 0, y: 0 } },
    fillColor: { isOpen: false, position: { x: 0, y: 0 } },
    borderColor: { isOpen: false, position: { x: 0, y: 0 } }
  };

  // Add this to make Math available in the template
  Math = Math;

  // Add property to track current radius
  private currentRadius: number = 0;

  // List of all basic shapes in our application
  private readonly shapesWithRadius = [
    'rect',           // Native support
    'textbox',        // Native support
    'triangle',       // Custom implementation
    'pentagon',       // Custom implementation
    'hexagon',        // Custom implementation
    'diamond',        // Custom implementation
    'parallelogram',  // Custom implementation
    'trapezoid'       // Custom implementation
  ];

  // Add new property for alignment mode
  alignToSelection: boolean = true;

  // Add new property for tracking merged shapes
  private mergedShapes: fabric.Object[] = [];

  constructor(
    public presentationService: PresentationService,
    public workspaceService: WorkspaceService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.existingJson = this.workspaceService.options;
  }

  /**
   * LIFECYCLE HOOKS
   */
  ngOnInit(): void {
    if (!this.workspaceService.presentationMode) {
      this.initializeCanvas(this.existingJson);
      this.subscribeToActions();
      this.setupAutoSave();
      this.initializeStateTracking();
      this.setupTextSelectionHandler();
      this.setupShapeSelectionHandler();
    } else {
      this.renderCanvas(this.existingJson);
    }
  }

  ngOnDestroy() {
    if (!this.workspaceService.presentationMode) {
      this.actionSubscription.unsubscribe();
      this.saveSubject.unsubscribe();
    }
    this.canvas?.dispose();
  }

  /**
   * CANVAS INITIALIZATION AND SETUP
   */
  private initializeCanvas(existingJson?: string) {
    const parentElement = this.canvasRef.nativeElement.parentElement;
    
    const EDITOR_WIDTH = 1024;
    const EDITOR_HEIGHT = 576;
    
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      width: EDITOR_WIDTH,
      height: EDITOR_HEIGHT,
      selection: true,
      preserveObjectStacking: true
    });

    // Scale canvas container to fit parent while maintaining aspect ratio
    this.scaleCanvasContainer(parentElement);
    
    const parsedJson = JSON.parse(existingJson);
    if (parsedJson.objects && Array.isArray(parsedJson.objects)) {
      this.loadFromJson(existingJson);
    } else {
      this.addDefaultText();
    }

    fabric.Object.prototype.set({
      borderColor: '#44aaff',
      cornerColor: '#44aaff',
      cornerSize: 12,
      cornerStyle: 'circle',
      transparentCorners: false,
      selectable: true,
      evented: true
    });

    this.canvas.renderAll();

    // Listen to canvas changes for auto-save & undo/redo tracking
    this.canvas.on('object:modified', () => this.recordHistory());
    this.canvas.on('object:added', () => this.recordHistory());
    this.canvas.on('object:removed', () => this.recordHistory());
    this.canvas.on('object:moved', () => this.recordHistory());
    // Handle right-click specifically
    this.canvas.wrapperEl.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      const clickedObject = this.canvas.findTarget(e, false);
      
      if (clickedObject) {
        this.selectedObject = clickedObject;
        this.showContextMenu = true;
        
        // Get canvas scale and offset
        const scale = this.canvas.getZoom();
        const rect = this.canvas.getElement().getBoundingClientRect();
        const canvasOffset = {
          left: rect.left,
          top: rect.top
        };

        // Calculate actual position considering scale and offset
        const pointerX = (e.clientX - canvasOffset.left) / scale;
        const pointerY = (e.clientY - canvasOffset.top) / scale;

        // Set context menu position
        this.contextMenuX = pointerX;
        this.contextMenuY = pointerY;
        
        // Adjust if menu would go outside canvas
        const menuWidth = 115;
        const menuHeight = 250;
        
        if (this.contextMenuX + menuWidth > this.canvas.width!) {
          this.contextMenuX = this.canvas.width! - menuWidth;
        }
        
        if (this.contextMenuY + menuHeight > this.canvas.height!) {
          this.contextMenuY = this.canvas.height! - menuHeight;
        }
        
        this.canvas.setActiveObject(clickedObject);
        this.canvas.renderAll();
      } else {
        this.showContextMenu = false;
      }
    });
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
    canvasEl.style.top = `${top}px`;
    canvasEl.style.position = 'absolute';
    
    // Update upper canvas position and style
    const upperCanvas = this.canvas.upperCanvasEl;
    upperCanvas.style.left = `${left}px`;
    upperCanvas.style.top = `${top}px`;
    upperCanvas.style.transform = `scale(${scale})`;
    upperCanvas.style.transformOrigin = 'top left';
    
    this.setCanvasScale();
  }

  setCanvasScale() {
    const scale = this.canvas.getZoom();
    document.documentElement.style.setProperty('--canvas-scale', scale.toString());
  }

  subscribeToActions() {
    this.actionSubscription = this.workspaceService.multimediaActionSubject$.subscribe(action => {
      if (!action) return;
      
      switch (action.type) {
        case 'addText': this.addShape({ type: 'text', properties: { text: 'T' } }); break;
        case 'addRectangle': this.addShape({ type: 'rectangle', properties: { width: 100, height: 60 } }); break;
        case 'addTable': this.addShape({ type: 'table', properties: { rows: 3, cols: 3 } }); break;
        case 'addArrow': this.addShape({ type: 'arrow', properties: { width: 100, height: 50 } }); break;
        case 'addTriangle': this.addShape({ type: 'triangle', properties: { width: 100, height: 100 } }); break;
        case 'addLine': this.addShape({ type: 'line', properties: { length: 100 } }); break;
        case 'addHexagon': this.addShape({ type: 'hexagon', properties: { radius: 50 } }); break;
        case 'addCircle': this.addShape({ type: 'circle', properties: { radius: 50 } }); break;
        case 'addStar': this.addShape({ type: 'star', properties: { points: 5, radius: 50 } }); break;
        case 'addPentagon': this.addShape({ type: 'pentagon', properties: { radius: 50 } }); break;
        case 'addCube': this.addShape({ type: 'cube', properties: { size: 100 } }); break;
        case 'addPie': this.addShape({ type: 'pie', properties: { radius: 50, angle: 270 } }); break;
        case 'addTag': this.addShape({ type: 'tag', properties: { radius: 50 } }); break;
        case 'addTeardrop': this.addShape({ type: 'teardrop', properties: { radius: 50 } }); break;
        case 'addDiamond': this.addShape({ type: 'diamond', properties: { size: 100 } }); break;
        case 'addParallelogram': this.addShape({ type: 'parallelogram', properties: { width: 100, height: 60 } }); break;
        case 'addTrapezoid': this.addShape({ type: 'trapezoid', properties: { width: 100, height: 60 } }); break;
        case 'addSemiCircle': this.addShape({ type: 'semiCircle', properties: { radius: 50 } }); break;
        case 'addChat': this.addShape({ type: 'chat', properties: { radius: 50 } }); break;
        case 'addChevron': this.addShape({ type: 'chevron', properties: { radius: 50 } }); break;
        case 'addHalfFrame': this.addShape({ type: 'halfFrame', properties: { size: 100 } }); break;
        case 'addFrame': this.addShape({ type: 'frame', properties: { size: 100 } }); break;
        case 'addDonut': this.addShape({ type: 'donut', properties: { radius: 50 } }); break;
        case 'addBlockArc': this.addShape({ type: 'blockArc', properties: { radius: 50 } }); break;
        case 'addForwardArrow': this.addShape({ type: 'forwardArrow', properties: { radius: 50 } }); break;

        case 'addImageUrl': this.addImageFromUrl(action.imageUrl); break;

        case 'toggleAlignMode': this.alignToSelection = !this.alignToSelection; break;

        case 'alignLeft': this.alignObjects('left'); break;
        case 'alignCenter': this.alignObjects('center'); break;
        case 'alignRight': this.alignObjects('right'); break;
        case 'alignTop': this.alignObjects('top'); break;
        case 'alignMiddle': this.alignObjects('middle'); break;
        case 'alignBottom': this.alignObjects('bottom'); break;
        case 'distributeHorizontally': this.distributeHorizontally(); break;
        case 'distributeVertically': this.distributeVertically(); break;

        case 'union': this.mergeShapes('union'); break;
        case 'intersect': this.mergeShapes('intersect'); break;
        case 'subtract': this.mergeShapes('subtract'); break;
        case 'combine': this.mergeShapes('combine'); break;
        case 'fragment': this.mergeShapes('fragment'); break;
        
        default: break;
      }
    });
  }

  addDefaultText() {
    const headingBorder = new fabric.Rect({
      left: 15,
      top: 15,
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      height: 60,
      fill: 'transparent',
      stroke: '#ccc',
      strokeWidth: 1
    });
    const heading = new fabric.Textbox("Click to add heading", {
      left: 20,
      top: 30,
      fontSize: 25,
      fontWeight: 'bold',
      fill: '#333',
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      textAlign: 'center'
    });

    const contentBorder = new fabric.Rect({
      left: 15,
      top: 90,
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      height: this.canvasRef.nativeElement.parentElement.offsetHeight - 140,
      fill: 'transparent',
      stroke: '#ccc',
      strokeWidth: 1
    });
    const content = new fabric.Textbox("Click to add content", {
      left: 20,
      top: 100,
      fontSize: 16,
      fill: '#666',
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      textAlign: 'center'
    });

    this.canvas.add(headingBorder, heading, contentBorder, content);
    this.canvas.sendToBack(headingBorder);
    this.canvas.sendToBack(contentBorder);
    this.canvas.renderAll();
    this.recordHistory();
  }

  renderCanvas(existingJson?: string) {
    const parentElement = this.canvasRef.nativeElement.parentElement;
    
    // Use same reference dimensions as editor
    const EDITOR_WIDTH = 1024;
    const EDITOR_HEIGHT = 576;
    
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      width: EDITOR_WIDTH,
      height: EDITOR_HEIGHT
    });

    // Scale canvas container
    this.scaleCanvasContainer(parentElement);

    // Disable editing in presentation mode
    fabric.Object.prototype.set({
      selectable: false,
      evented: false
    });

    // Load content
    if (existingJson) {
      this.canvas.loadFromJSON(existingJson, () => {
        this.canvas.renderAll();
      });
    }
  }

  deleteSelected() {
    const obj = this.canvas.getActiveObject();
  
    if (!obj) return;
  
    if (obj.type === 'activeSelection') {
      obj.getObjects().forEach(element => {
        this.canvas.remove(element);
      });
    } else {
      this.canvas.remove(obj);
    }
  
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }
  

  loadFromJson(dbJson?: string) {
    const savedJson = dbJson;
    if (savedJson) {
      this.canvas.loadFromJSON(savedJson, () => this.canvas.renderAll());
    }
  }

  /*** UNDO / REDO ***/
  private recordHistory() {
    const currentJson = JSON.stringify(this.canvas.toJSON());

    if (this.history[this.historyIndex] === currentJson) {
      return; // Avoid duplicate entries
    }

    // Remove redo steps if we add a new action
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add new state
    this.history.push(currentJson);
    this.historyIndex++;

    this.triggerSave(); // Auto-save after recording history
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
    }
  }

  private restoreFromHistory() {
    const state = this.history[this.historyIndex];
    if (state) {
      this.canvas.loadFromJSON(state, () => {
        this.canvas.renderAll();
      });
    }
  }

  /*** AUTO-SAVE ***/
  private triggerSave() {
    const currentJson = JSON.stringify(this.canvas.toJSON());

    if (currentJson !== this.lastSavedJson) {
      this.lastSavedJson = currentJson;
      this.saveSubject.next(currentJson); // Trigger debounced save
    }
  }

  private setupAutoSave() {
    this.saveSubject.pipe(debounceTime(2000)) // Debounce to prevent frequent saves
      .subscribe((json) => this.saveToDatabase(json));
  }

  private saveToDatabase(json: string) {
      let multimediaContentDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      Json: json
     }
    this.presentationService.updateMultimediaData(multimediaContentDTO).subscribe(
      (response: any) => {
        // If any data missing occur then add here re-render logic
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event) {
    event.preventDefault();
    return false;
  }

  /* Ordering Object */
  bringToFront() {
    const obj = this.canvas.getActiveObject();
    if (obj) {
      this.canvas.bringToFront(obj);
      this.canvas.renderAll();
    }
  }
  
  sendToBack() {
    const obj = this.canvas.getActiveObject();
    if (obj) {
      this.canvas.sendToBack(obj);
      this.canvas.renderAll();
    }
  }
  
  bringForward() {
    const obj = this.canvas.getActiveObject();
    if (obj) {
      this.canvas.bringForward(obj);
      this.canvas.renderAll();
    }
  }
  
  sendBackward() {
    const obj = this.canvas.getActiveObject();
    if (obj) {
      this.canvas.sendBackwards(obj);
      this.canvas.renderAll();
    }
  }

  
  //#region Positioning
  private alignObjects(alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const activeObjects = this.canvas.getActiveObjects();
    if (!activeObjects || activeObjects.length === 0) return;

    if (this.alignToSelection && activeObjects.length > 1) {
      // Get extreme value based on alignment type
      const value = this.getExtremeValue(activeObjects, alignType);
      this.setObjectsPosition(activeObjects, alignType, value);
    } else {
      const activeSelection = this.canvas.getActiveObject();
      if (activeSelection && activeSelection.type === 'activeSelection') {
        const objects = (activeSelection as fabric.ActiveSelection).getObjects();
        const selectionLeft = activeSelection.left!;
        const selectionTop = activeSelection.top!;

        // First align objects within selection
        const extremeValue = this.getExtremeValue(objects, alignType);
        this.setObjectsPosition(objects, alignType, extremeValue);

        // Then move to canvas edge
        const targetValue = this.getCanvasEdgeValue(alignType);
        objects.forEach(obj => {
          const relativePos = this.getRelativePosition(obj, activeSelection, alignType);
          this.setObjectPosition(obj, alignType, targetValue + relativePos);
        });

        // Refresh selection without moving objects
        this.canvas.discardActiveObject();
        this.canvas.setActiveObject(new fabric.ActiveSelection(objects, {
          canvas: this.canvas
        }));
      } else {
        // Single object
        const targetValue = this.getCanvasEdgeValue(alignType);
        this.setObjectPosition(activeObjects[0], alignType, targetValue);
      }
    }
    
    this.canvas.renderAll();
    this.recordHistory();
  }

  private getExtremeValue(objects: fabric.Object[], alignType: string): number {
    switch (alignType) {
      case 'left': return Math.min(...objects.map(obj => obj.left!));
      case 'right': return Math.max(...objects.map(obj => obj.left! + obj.width! * obj.scaleX!));
      case 'center': return Math.min(...objects.map(obj => obj.left!)) + 
        (Math.max(...objects.map(obj => obj.left! + obj.width! * obj.scaleX!)) - 
         Math.min(...objects.map(obj => obj.left!))) / 2;
      case 'top': return Math.min(...objects.map(obj => obj.top!));
      case 'bottom': return Math.max(...objects.map(obj => obj.top! + obj.height! * obj.scaleY!));
      case 'middle': return Math.min(...objects.map(obj => obj.top!)) + 
        (Math.max(...objects.map(obj => obj.top! + obj.height! * obj.scaleY!)) - 
         Math.min(...objects.map(obj => obj.top!))) / 2;
      default: return 0;
    }
  }

  private getCanvasEdgeValue(alignType: string): number {
    switch (alignType) {
      case 'left': return 10;
      case 'right': return this.canvas.width! - 10;
      case 'center': return this.canvas.width! / 2;
      case 'top': return 10;
      case 'bottom': return this.canvas.height! - 10;
      case 'middle': return this.canvas.height! / 2;
      default: return 0;
    }
  }

  private getRelativePosition(obj: fabric.Object, selection: fabric.Object, alignType: string): number {
    switch (alignType) {
      case 'left':
      case 'right':
      case 'center':
        return obj.left! - selection.left!;
      case 'top':
      case 'bottom':
      case 'middle':
        return obj.top! - selection.top!;
      default: return 0;
    }
  }

  private setObjectPosition(obj: fabric.Object, alignType: string, value: number) {
    switch (alignType) {
      case 'left':
        obj.set({ left: value });
        break;
      case 'right':
        obj.set({ left: value - obj.width! * obj.scaleX! });
        break;
      case 'center':
        obj.set({ left: value - (obj.width! * obj.scaleX!) / 2 });
        break;
      case 'top':
        obj.set({ top: value });
        break;
      case 'bottom':
        obj.set({ top: value - obj.height! * obj.scaleY! });
        break;
      case 'middle':
        obj.set({ top: value - (obj.height! * obj.scaleY!) / 2 });
        break;
    }
    obj.setCoords();
  }

  private setObjectsPosition(objects: fabric.Object[], alignType: string, value: number) {
    objects.forEach(obj => this.setObjectPosition(obj, alignType, value));
  }

    // Add these methods to your MultimediaComponent class

    private distributeHorizontally() {
      const activeObjects = this.canvas.getActiveObjects();
      if (activeObjects.length < 2) return;
  
      // Sort objects by their left position
      const sortedObjects = [...activeObjects].sort((a, b) => 
        (a.left + a.width * a.scaleX / 2) - (b.left + b.width * b.scaleX / 2)
      );
  
      // Get leftmost and rightmost objects
      const firstObject = sortedObjects[0];
      const lastObject = sortedObjects[sortedObjects.length - 1];
  
      // Calculate total available space
      const totalSpace = (lastObject.left + lastObject.width * lastObject.scaleX) - firstObject.left;
      const spacing = totalSpace / (sortedObjects.length - 1);
  
      // Distribute objects evenly
      sortedObjects.forEach((obj, index) => {
        if (index !== 0 && index !== sortedObjects.length - 1) {
          const newLeft = firstObject.left + spacing * index - (obj.width * obj.scaleX / 2);
          obj.set('left', newLeft);
        }
      });
  
      this.canvas.renderAll();
      this.recordHistory();
    }
  
    private distributeVertically() {
      const activeObjects = this.canvas.getActiveObjects();
      if (activeObjects.length < 2) return;
  
      // Sort objects by their top position
      const sortedObjects = [...activeObjects].sort((a, b) => 
        (a.top + a.height * a.scaleY / 2) - (b.top + b.height * b.scaleY / 2)
      );
  
      // Get topmost and bottommost objects
      const firstObject = sortedObjects[0];
      const lastObject = sortedObjects[sortedObjects.length - 1];
  
      // Calculate total available space
      const totalSpace = (lastObject.top + lastObject.height * lastObject.scaleY) - firstObject.top;
      const spacing = totalSpace / (sortedObjects.length - 1);
  
      // Distribute objects evenly
      sortedObjects.forEach((obj, index) => {
        if (index !== 0 && index !== sortedObjects.length - 1) {
          const newTop = firstObject.top + spacing * index - (obj.height * obj.scaleY / 2);
          obj.set('top', newTop);
        }
      });
  
      this.canvas.renderAll();
      this.recordHistory();
    }
  //#endregion
  

  updateTheme(data:any){
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Don't trigger shortcuts if user is typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Select All - Ctrl+A
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      const objects = this.canvas.getObjects();
      this.canvas.discardActiveObject();
      const sel = new fabric.ActiveSelection(objects, { canvas: this.canvas });
      this.canvas.setActiveObject(sel);
      this.canvas.renderAll();
    }

    // Group - Ctrl+G
    if (event.ctrlKey && !event.shiftKey && event.key === 'g') {
      event.preventDefault();
      if (!this.canvas.getActiveObject()) return;
      if (this.canvas.getActiveObject().type === 'activeSelection') {
        this.canvas.getActiveObject().toGroup();
        this.canvas.renderAll();
      }
    }

    // Duplicate - Ctrl+D
    if (event.ctrlKey && event.key === 'd') {
      event.preventDefault();
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        activeObject.clone((cloned: fabric.Object) => {
          cloned.set({
            left: activeObject.left! + 10,
            top: activeObject.top! + 10
          });
          this.canvas.add(cloned);
          this.canvas.setActiveObject(cloned);
          this.canvas.renderAll();
        });
      }
    }

    // Ungroup - Ctrl+Shift+G
    if (event.ctrlKey && event.shiftKey && event.key === 'G') {
      event.preventDefault();
      if (!this.canvas.getActiveObject()) return;
      if (this.canvas.getActiveObject().type === 'group') {
        this.canvas.getActiveObject().toActiveSelection();
        this.canvas.renderAll();
      }
    }

    // Rotate Clockwise - Alt+Right
    if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault();
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        activeObject.rotate!((activeObject.angle || 0) + 15);
        this.canvas.renderAll();
      }
    }

    // Rotate Counter-clockwise - Alt+Left
    if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        activeObject.rotate!((activeObject.angle || 0) - 15);
        this.canvas.renderAll();
      }
    }

    // Copy - Ctrl+C
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      this.copySelectedObject();
    }

    // Cut - Ctrl+X
    if (event.ctrlKey && event.key === 'x') {
      event.preventDefault();
      this.copySelectedObject();
      this.deleteSelected();
    }

    // Paste - Ctrl+V
    if (event.ctrlKey && event.key === 'v') {
      event.preventDefault();
      this.pasteObject();
    }

    // Delete - Del
    if (event.key === 'Delete') {
      event.preventDefault();
      this.deleteSelected();
    }

    // Bring Forward - Ctrl+Shift+F
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      event.preventDefault();
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.canvas.bringForward(activeObject);
        this.canvas.renderAll();
      }
    }

    // Send Backward - Ctrl+Shift+B
    if (event.ctrlKey && event.shiftKey && event.key === 'B') {
      event.preventDefault();
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.canvas.sendBackwards(activeObject);
        this.canvas.renderAll();
      }
    }

    // Undo - Ctrl+Z
    if (event.ctrlKey && !event.shiftKey && event.key === 'z') {
      event.preventDefault();
      this.undo();
    }

    // Redo - Ctrl+Y
    if (event.ctrlKey && event.key === 'y') {
      event.preventDefault();
      this.redo();
    }
  }

  // Helper methods for clipboard operations
  private clipboardObject: any = null;

  private copySelectedObject() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        this.clipboardObject = cloned;
      });
    }
  }

  private pasteObject() {
    if (this.clipboardObject) {
      this.clipboardObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: this.clipboardObject.left! + 10,
          top: this.clipboardObject.top! + 10
        });
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.renderAll();
      });
    }
  }

  // Undo/Redo functionality
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  private saveState() {
    const json = JSON.stringify(this.canvas.toJSON());
    this.undoStack.push(json);
    this.redoStack = []; // Clear redo stack when new action is performed
  }

  private initializeStateTracking() {
    this.canvas.on('object:modified', () => this.saveState());
    this.canvas.on('object:added', () => this.saveState());
    this.canvas.on('object:removed', () => this.saveState());
  }

  addShape(shapeConfig: ShapeConfig) {
    let shape;
    const commonProps = {
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#000',
      strokeWidth: 2,
      strokeUniform: true,
      objectCaching: false
    };

    switch (shapeConfig.type) {
      case 'text':
        shape = new fabric.Textbox('Enter Text', {
          ...commonProps,
          fill: '#000',
          fontSize: 40,
          fontFamily: 'Arial'
        });
        break;

      case 'rectangle':
        shape = new fabric.Rect({
          ...commonProps,
          width: 100,
          height: 60
        });
        break;

      case 'table':
        this.addTable();
        break;

      case 'arrow':
        shape = this.createArrow({
          ...commonProps,
          width: 100,
          height: 30
        });
        break;

      case 'triangle':
        shape = new fabric.Triangle({
          ...commonProps,
          width: 100,
          height: 100
        });
        break;

      case 'line':
        shape = new fabric.Line([0, 0, 100, 0], {
          ...commonProps
        });
        break;

      case 'hexagon':
        shape = this.createPolygon({
          ...commonProps,
          sides: 6,
          radius: 50
        });
        break;

      case 'circle':
        shape = new fabric.Circle({
          ...commonProps,
          radius: 50
        });
        break;

      case 'star':
        shape = this.createStar({
          ...commonProps,
          points: 5,
          radius: 50
        });
        break;

      case 'pentagon':
        shape = this.createPolygon({
          ...commonProps,
          sides: 5,
          radius: 50
        });
        break;

      case 'cube':
        shape = this.createCube({
          ...commonProps,
          size: 100
        });
        break;

      case 'pie':
        shape = this.createPie({
          ...commonProps,
          radius: 50,
          startAngle: 0,
          endAngle: 270
        });
        break;

      case 'tag':
        shape = this.createTag({
          ...commonProps,
          radius: 50
        });
        break;

      case 'teardrop':
        shape = this.createTeardrop({
          ...commonProps,
          radius: 50
        });
        break;

      case 'diamond':
        shape = this.createDiamond({
          ...commonProps,
          size: 100
        });
        break;

      case 'parallelogram':
        shape = this.createParallelogram({
          ...commonProps,
          width: 100,
          height: 60
        });
        break;

      case 'trapezoid':
        shape = this.createTrapezoid({
          ...commonProps,
          width: 100,
          height: 60
        });
        break;

      case 'semiCircle':
        shape = this.createSemiCircle({
          ...commonProps,
          radius: 50
        });
        break;

      case 'chat':
        shape = this.createChat({
          ...commonProps,
          radius: 50
        });
        break;
      
      case 'chevron':
        shape = this.createChevron({
          ...commonProps,
          radius: 50
        });
        break;
        
      case 'halfFrame':
        shape = this.createHalfFrame({
          ...commonProps,
          size: 100
        });
        break;

      case 'frame':
        shape = this.createFrame({
          ...commonProps,
          size: 100
        });
        break;

      case 'donut':
        shape = this.createDonut({
          ...commonProps,
          radius: 50
        });
        break;
      
      case 'blockArc':
        shape = this.createBlockArc({
          ...commonProps,
          radius: 50
        });
        break;

      case 'forwardArrow':
        shape = this.createForwardArrow({
          ...commonProps,
          width: 75,
          height: 30
        });
        break;
    }

    if (shape) {
      this.canvas.add(shape);
      this.canvas.setActiveObject(shape);
      this.canvas.renderAll();
      this.saveState();
    }
  }

  // Helper methods for shapes
  addText() {
    const text = new fabric.Textbox("Enter Text", { left: 150, top: 150, fontSize: 24 });
    this.canvas.add(text);
    this.canvas.renderAll();
  }
  
  addRectangle() {
    const obj = this.canvas.getActiveObject();
    const left = obj ? obj.left + 10 : 50;
    const top = obj ? obj.top + 10 : 50;
    
    const rect = new fabric.Rect({width: 100,height: 60,fill: 'blue',left: left,top: top});
    
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.requestRenderAll();
    
  }

  addTable() {
    const rows = prompt('Enter number of rows (1-10):', '3');
    const columns = prompt('Enter number of columns (1-10):', '3');
    
    if (rows && columns) {
      const numRows = Math.min(Math.max(parseInt(rows, 10), 1), 10);
      const numColumns = Math.min(Math.max(parseInt(columns, 10), 1), 10);

      const table = this.createTable({
        rows: numRows,
        columns: numColumns,
        cellWidth: 100,
        cellHeight: 50,
        backgroundColor: 'white',
        borderColor: '#000'
      });

      this.canvas.add(table);
      this.canvas.renderAll();
      this.recordHistory();
    }
  }

  private createTable(config: TableConfig) {
    const { rows, columns, cellWidth, cellHeight } = config;
    const tableObjects = [];

    // Create cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Cell rectangle
        const cell = new fabric.Rect({
          left: col * cellWidth,
          top: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
          fill: config.backgroundColor || 'white',
          stroke: config.borderColor || '#000',
          strokeWidth: 1,
          selectable: true
        });

        // Cell text
        const text = new fabric.Textbox('', {
          left: col * cellWidth + 5,
          top: row * cellHeight + 5,
          width: cellWidth - 10,
          fontSize: 16,
          selectable: true,
          editable: true
        });

        tableObjects.push(cell, text);
      }
    }

    const table = new fabric.Group(tableObjects, {
      left: 100,
      top: 100,
      selectable: true,
      subTargetCheck: true
    });

    return table;
  }

  private createArrow(options: any) {
    const path = `M 0 ${options.height/2} 
                  L ${options.width - 20} ${options.height/2} 
                  L ${options.width - 20} ${options.height} 
                  L ${options.width} ${options.height/2} 
                  L ${options.width - 20} 0 
                  L ${options.width - 20} ${options.height/2}`;
    return new fabric.Path(path, options);
  }

  private createPolygon(options: any) {
    const points = [];
    const sides = options.sides;
    const radius = options.radius;

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      });
    }

    return new fabric.Polygon(points, options);
  }

  addCircle() {
    const obj = this.canvas.getActiveObject();
    const left = obj ? obj.left + 10 : 50;
    const top = obj ? obj.top + 10 : 50;
    
    const circle = new fabric.Circle({
      radius: 40,
      fill: 'red',
      left: left,
      top: top,
    });
    
    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
    this.canvas.requestRenderAll();
    
  }

  private createStar(options: any) {
    const numPoints = 5;
    const outerRadius = options.radius || 50;
    const innerRadius = outerRadius * 0.4;
    const points = [];

    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      
      // Create points array in the format Fabric.js expects
      points.push({
        x: radius * Math.sin(angle),
        y: radius * Math.cos(angle)
      });
    }

    // Convert points array to the format Fabric.js Polygon requires
    const fabricPoints = points.map(point => ({
      x: point.x,
      y: point.y
    }));

    return new fabric.Polygon(fabricPoints, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#000000',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createCube(options: any) {
    const size = options.size;
    const depth = size * 0.3;
    const path = `M 0 ${size * 0.3}
                  L ${size * 0.7} 0
                  L ${size} ${size * 0.3}
                  L ${size} ${size}
                  L ${size * 0.3} ${size * 1.3}
                  L 0 ${size}
                  Z
                  M ${size * 0.7} 0
                  L ${size * 0.7} ${size * 0.7}
                  L 0 ${size}
                  M ${size * 0.7} ${size * 0.7}
                  L ${size} ${size}`;
    return new fabric.Path(path, options);
  }

  private createPie(options: any) {
    const radius = options.radius;
    const startAngle = options.startAngle * Math.PI / 180;
    const endAngle = options.endAngle * Math.PI / 180;
    
    const x1 = radius * Math.cos(startAngle);
    const y1 = radius * Math.sin(startAngle);
    const x2 = radius * Math.cos(endAngle);
    const y2 = radius * Math.sin(endAngle);
    
    const path = `M 0 0
                  L ${x1} ${y1}
                  A ${radius} ${radius} 0 1 1 ${x2} ${y2}
                  Z`;
    return new fabric.Path(path, options);
  }

  private createTag(options: any) {
    // Define the tag shape points
    const width = options.radius * 2;
    const height = options.radius * 1.5;
    const notchSize = height * 0.2;
    
    const points = [
      { x: 0, y: 0 },                           // Top left
      { x: width - notchSize, y: 0 },          // Top right before notch
      { x: width, y: height / 2 },             // Right point
      { x: width - notchSize, y: height },     // Bottom right after notch
      { x: 0, y: height },                     // Bottom left
      { x: 0, y: 0 }                           // Back to start
    ];
  
    // Create the tag shape
    return new fabric.Polygon(points, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createTeardrop(options: any) {
    const radius = options.radius;
    // Create teardrop path using bezier curves
    const path = `M 0 ${-radius}
                C ${radius} ${-radius}, ${radius} ${radius/2}, 0 ${radius}
                C ${-radius} ${radius/2}, ${-radius} ${-radius}, 0 ${-radius}
                Z`;

    return new fabric.Path(path, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createDiamond(options: any) {
    const size = options.size;
    const points = [
      { x: size/2, y: 0 },
      { x: size, y: size/2 },
      { x: size/2, y: size },
      { x: 0, y: size/2 }
    ];
    return new fabric.Polygon(points, options);
  }

  private createParallelogram(options: any) {
    const width = options.width;
    const height = options.height;
    const skew = width * 0.25;
    const points = [
      { x: skew, y: 0 },
      { x: width + skew, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
    return new fabric.Polygon(points, options);
  }

  private createTrapezoid(options: any) {
    const width = options.width;
    const height = options.height;
    const indent = width * 0.2;
    const points = [
      { x: indent, y: 0 },
      { x: width - indent, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
    return new fabric.Polygon(points, options);
  }

  private createSemiCircle(options: any) {
    const radius = options.radius;
    const path = `M ${-radius} 0
                A ${radius} ${radius} 0 0 1 ${radius} 0
                L ${-radius} 0
                Z`;
    return new fabric.Path(path, {
      ...options,
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createChat(options: any) {
    const radius = options.radius;
    const width = radius * 2;
    const height = radius * 1.5;
    const tailSize = radius * 0.4;
    
    // Create chat bubble path with a tail at bottom right
    const path = `M ${radius/4} 0
                Q 0 0, 0 ${radius/4}
                L 0 ${height - radius/4}
                Q 0 ${height}, ${radius/4} ${height}
                L ${width - radius/4} ${height}
                Q ${width} ${height}, ${width} ${height - radius/4}
                L ${width} ${radius/4}
                Q ${width} 0, ${width - radius/4} 0
                L ${radius/4} 0
                M ${width - radius/2} ${height}
                L ${width - radius/4} ${height + tailSize}
                L ${width - radius*0.8} ${height}
                Z`;

    return new fabric.Path(path, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createChevron(options: any) {
    const radius = options.radius;
    const gap = radius * 0.2;  // Gap between the two symbols
    
    // First ">" symbol
    const firstSymbol = `M 0 0 
                      L ${radius/2} ${radius/2} 
                      L 0 ${radius}`;
                      
    // Second ">" symbol (shifted right)
    const secondSymbol = `M ${radius/2 + gap} 0 
                       L ${radius + gap} ${radius/2} 
                       L ${radius/2 + gap} ${radius}`;

    // Connecting lines at top and bottom
    const topLine = `M 0 0 L ${radius/2 + gap} 0`;
    const bottomLine = `M 0 ${radius} L ${radius/2 + gap} ${radius}`;

    // Combine all paths
    const path = `${firstSymbol} ${secondSymbol} ${topLine} ${bottomLine}`;

    return new fabric.Path(path, {
      left: options.left || 100,
      top: options.top || 100,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      objectCaching: false,
      selectable: true
    });
  }

  private createHalfFrame(options: any) {
    const size = options.size;
    const thickness = size * 0.2;
    const path = `M 0 0
                  L ${size} 0
                  L ${size} ${thickness}
                  L ${thickness} ${thickness}
                  L ${thickness} ${size}
                  L 0 ${size}
                  Z`;

    return new fabric.Path(path, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createFrame(options: any) {
    const size = options.size;
    const thickness = size * 0.2;
    const outer = new fabric.Rect({
      width: size,
      height: size,
      fill: 'transparent',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1
    });
    
    const inner = new fabric.Rect({
      width: size - thickness * 2,
      height: size - thickness * 2,
      left: thickness,
      top: thickness,
      fill: 'transparent',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1
    });

    return new fabric.Group([outer, inner], {
      left: options.left || 100,
      top: options.top || 100,
      selectable: true
    });
  }

  private createDonut(options: any) {
    const radius = options.radius;
    const smallCircleRadius = radius * 0.6;  // Smaller circle
    
    // Main circle
    const mainCircle = new fabric.Circle({
      radius: radius,
      fill: '#ffffff',  // Solid black fill
      stroke: '#000000',
      strokeWidth: 3,
      left: 0,
      top: 0
    });
    
    // Small circle positioned at the center
    const smallCircle = new fabric.Circle({
      radius: smallCircleRadius,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 3,
      left: radius - smallCircleRadius,  // Position to center
      top: radius - smallCircleRadius    // Position to center
    });

    return new fabric.Group([mainCircle, smallCircle], {
      left: options.left || 100,
      top: options.top || 100,
      selectable: true
    });
  }

  private createBlockArc(options: any) {
    const radius = options.radius;
    const path = `M ${-radius} 0
                  A ${radius} ${radius} 0 0 1 ${radius} 0
                  L ${radius-10} 0
                  A ${radius-10} ${radius-10} 0 0 0 ${-radius+10} 0
                  Z`;

    return new fabric.Path(path, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true
    });
  }

  private createForwardArrow(options: any) {
    const width = options.width || 100;
    const height = options.height || 6;    // Even thinner height
    const triangleWidth = height * 2;      // Triangle proportion
    
    // Create the arrow as a single path
    const path = new fabric.Path(
      `M 0 ${height/2}                     
       L ${width - triangleWidth} ${height/2}
       L ${width - triangleWidth} 0
       L ${width} ${height}
       L ${width - triangleWidth} ${height * 2}
       L ${width - triangleWidth} ${height * 1.5}
       L 0 ${height * 1.5}
       Z`,
      {
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        strokeLineJoin: 'miter',
        strokeMiterLimit: 10
      }
    );

    return new fabric.Group([path], {
      left: options.left || 100,
      top: options.top || 100,
      selectable: true,
      evented: true,
      hasBorders: true,
      hasControls: true,
      perPixelTargetFind: true
    });
  }






  private setupTextSelectionHandler() {
    this.canvas.on('text:selection:changed', (e: fabric.IEvent) => {
      const textObject = e.target as fabric.IText;
      if (textObject) {
        this.selectedTextObject = textObject;
        this.showTextToolbar = true;  // Show toolbar when text is selected
        this.updateTextPropertiesFromSelection(textObject);
      }
    });

    this.canvas.on('selection:created', (e: fabric.IEvent) => {
      const textObject = e.target as fabric.IText;
      if (textObject && textObject.type === 'i-text') {
        this.selectedTextObject = textObject;
        this.showTextToolbar = true;  // Show toolbar when text is selected
        this.updateTextPropertiesFromSelection(textObject);
      } else {
        this.showTextToolbar = false;  // Hide toolbar for non-text objects
        this.selectedTextObject = null;
      }
    });

    this.canvas.on('selection:cleared', () => {
      this.showTextToolbar = false;  // Hide toolbar when nothing is selected
      this.selectedTextObject = null;
    });

    // Handle clicking outside text
    this.canvas.on('mouse:down', (options) => {
      const target = options.target;
      if (target && (target.type === 'textbox' || target.type === 'i-text')) {
        // If text is part of a group, bring it to front for editing
        if (target.group) {
          target.group.bringToFront();
        }
        this.selectedTextObject = target as fabric.IText;
        this.showTextToolbar = true;
        this.updateTextPropertiesFromSelection(this.selectedTextObject);
      } else {
        if (!options.target || (options.target.type !== 'textbox' && options.target.type !== 'i-text')) {
          this.showTextToolbar = false;
          this.selectedTextObject = null;
        }
      }
    });
  }

  private updateTextPropertiesFromSelection(textObject: fabric.IText) {

    this.positionToolbar();
    
    const start = textObject.selectionStart || 0;
    const end = textObject.selectionEnd || 0;

    // Get default object-level properties
    const defaultFontFamily = textObject.get('fontFamily') as string || 'Arial';
    const defaultFontSize = textObject.get('fontSize') as number || 14;
    const defaultColor = textObject.get('fill') as string || '#000000';
    const defaultBold = textObject.get('fontWeight') === 'bold';
    const defaultItalic = textObject.get('fontStyle') === 'italic';
    const defaultUnderline = textObject.get('underline') || false;
    const defaultStrike = textObject.get('linethrough') || false;
    const defaultAlignment = textObject.get('textAlign') as string || 'left';

    // Update alignment icon
    this.currentAlignment = defaultAlignment;
    this.currentAlignmentIcon = `/assets/multimedia-icons/multimedia-text-align-${defaultAlignment}.svg`;

    if (start !== end) {
      const styles = textObject.getSelectionStyles(start, end);
      if (styles.length > 0) {
        // Update font family - use specific style if exists, otherwise use default
        const sameFontFamily = styles.every(style => 
          (style.fontFamily || defaultFontFamily) === (styles[0].fontFamily || defaultFontFamily));
        this.currentFontFamily = sameFontFamily ? 
          (styles[0].fontFamily as string || defaultFontFamily) : defaultFontFamily;

        // Update font size - use specific style if exists, otherwise use default
        const sameFontSize = styles.every(style => 
          (style.fontSize || defaultFontSize) === (styles[0].fontSize || defaultFontSize));
        this.currentFontSize = sameFontSize ? 
          (styles[0].fontSize as number || defaultFontSize) : defaultFontSize;

        // Update bold status
        const sameBold = styles.every(style => 
          (style.fontWeight === 'bold' || (style.fontWeight === undefined && defaultBold)));
        this.currentBold = sameBold;

        // Update italic status
        const sameItalic = styles.every(style => 
          (style.fontStyle === 'italic' || (style.fontStyle === undefined && defaultItalic)));
        this.currentItalic = sameItalic;

        // Update underline status
        const sameUnderline = styles.every(style => 
          (style.underline === true || (style.underline === undefined && defaultUnderline)));
        this.currentUnderline = sameUnderline;

        // Update strike-through status
        const sameStrike = styles.every(style => 
          (style.linethrough === true || (style.linethrough === undefined && defaultStrike)));
        this.currentStrike = sameStrike;

        // Update text color
        const sameColor = styles.every(style => 
          (style.fill || defaultColor) === (styles[0].fill || defaultColor));
        this.currentColor = sameColor ? 
          (styles[0].fill as string || defaultColor) : defaultColor;
      }
    } else {
      // If no selection, use the default object properties
      this.currentBold = defaultBold;
      this.currentItalic = defaultItalic;
      this.currentUnderline = defaultUnderline;
      this.currentStrike = defaultStrike;
    }

    this.changeDetectorRef.detectChanges();
  }

  // Update existing style application methods
  setFontFamily(fontFamily: string) {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;
      
      if (start === end) {
        // No selection, set for the whole object
        this.selectedTextObject.set('fontFamily', fontFamily);
      } else {
        // Apply to selection only
        this.selectedTextObject.setSelectionStyles({ fontFamily }, start, end);
      }
      this.canvas.renderAll();
      this.currentFontFamily = fontFamily;
    }
  }

  setFontSize(size: number) {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;
      
      if (start === end) {
        // No selection, set for the whole object
        this.selectedTextObject.set('fontSize', size);
      } else {
        // Apply to selection only
        this.selectedTextObject.setSelectionStyles({ fontSize: size }, start, end);
      }
      this.canvas.renderAll();
      this.currentFontSize = size;
    }
  }

  setTextColor(color: string) {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        this.selectedTextObject.set('fill', color);
        this.selectedTextObject.set('stroke', color);
      } else {
        this.selectedTextObject.setSelectionStyles({ fill: color, stroke: color }, start, end);
      }
      this.canvas.renderAll();
    }
  }

  toggleBold() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        const currentWeight = this.selectedTextObject.get('fontWeight');
        this.selectedTextObject.set('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
      } else {
        const currentStyles = this.selectedTextObject.getSelectionStyles(start, end);
        const isBold = currentStyles[0]?.fontWeight === 'bold';
        this.selectedTextObject.setSelectionStyles(
          { fontWeight: isBold ? 'normal' : 'bold' },
          start,
          end
        );
      }
      this.canvas.renderAll();
    }
  }

  toggleItalic() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        const currentStyle = this.selectedTextObject.get('fontStyle');
        this.selectedTextObject.set('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
      } else {
        const currentStyles = this.selectedTextObject.getSelectionStyles(start, end);
        const isItalic = currentStyles[0]?.fontStyle === 'italic';
        this.selectedTextObject.setSelectionStyles(
          { fontStyle: isItalic ? 'normal' : 'italic' },
          start,
          end
        );
      }
      this.canvas.renderAll();
    }
  }

  toggleUnderline() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        const currentUnderline = this.selectedTextObject.get('underline');
        this.selectedTextObject.set('underline', !currentUnderline);
      } else {
        const currentStyles = this.selectedTextObject.getSelectionStyles(start, end);
        const isUnderline = currentStyles[0]?.underline;
        this.selectedTextObject.setSelectionStyles(
          { underline: !isUnderline },
          start,
          end
        );
      }
      this.canvas.renderAll();
    }
  }

  toggleStrikethrough() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        const currentStrike = this.selectedTextObject.get('linethrough');
        this.selectedTextObject.set('linethrough', !currentStrike);
      } else {
        const currentStyles = this.selectedTextObject.getSelectionStyles(start, end);
        const isStrike = currentStyles[0]?.linethrough;
        this.selectedTextObject.setSelectionStyles(
          { linethrough: !isStrike },
          start,
          end
        );
      }
      this.canvas.renderAll();
    }
  }

  setTextAlign(align: string): void {
    if (this.selectedTextObject && (align === 'left' || align === 'center' || align === 'right' || align === 'justify')) {
      this.selectedTextObject.set('textAlign', align as fabric.TextAlign);
      this.currentAlignment = align;
      this.currentAlignmentIcon = `/assets/multimedia-icons/multimedia-text-align-${align}.svg`;
      this.showAlignmentDropdown = false;
      this.canvas.renderAll();
    }
  }

  createBulletList(type: string) {
    if (!this.selectedTextObject) return;

    const text = this.selectedTextObject.text;
    const lines = text.split('\n');
    let bulletedLines: string[];

    switch (type) {
      case 'bullet':
        bulletedLines = lines.map(line => `• ${line}`);
        break;
      case 'number':
        bulletedLines = lines.map((line, index) => `${index + 1}. ${line}`);
        break;
      case 'letter':
        bulletedLines = lines.map((line, index) => 
          `${String.fromCharCode(97 + index)}. ${line}`);
        break;
      case 'roman':
        bulletedLines = lines.map((line, index) => 
          `${this.toRoman(index + 1)}. ${line}`);
        break;
      case 'arrow':
        bulletedLines = lines.map(line => `→ ${line}`);
        break;
      case 'check':
        bulletedLines = lines.map(line => `✓ ${line}`);
        break;
      default:
        return;
    }

    this.selectedTextObject.text = bulletedLines.join('\n');
    this.canvas.renderAll();
  }

  private toRoman(num: number): string {
    const romanNumerals = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];

    let result = '';
    let remaining = num;

    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }

    return result;
  }

  addEmoji(emoji: string) {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const text = this.selectedTextObject.text;
      this.selectedTextObject.text = text.slice(0, start) + emoji + text.slice(start);
      this.canvas.renderAll();
    }
  }

  toggleAlignmentDropdown(event: Event) {
    event.stopPropagation();
    this.showAlignmentDropdown = !this.showAlignmentDropdown;
  }

  // Add click handler to close dropdown when clicking outside
  @HostListener('document:click')
  closeDropdown() {
    this.showAlignmentDropdown = false;
    this.showContextMenu = false;
  }

  positionToolbar() {
    if (!this.selectedTextObject || !this.textToolbar) return;

    const toolbarElement = this.textToolbar.nativeElement;
    const canvasElement = this.canvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    const objectRect = this.selectedTextObject.getBoundingRect();
    
    // Convert object coordinates from canvas space to window space
    const zoom = this.canvas.getZoom();
    const objectTop = canvasRect.top + (objectRect.top * zoom);
    const objectLeft = canvasRect.left + (objectRect.left * zoom);
    
    // Get toolbar dimensions
    const toolbarHeight = toolbarElement.offsetHeight;
    const toolbarWidth = toolbarElement.offsetWidth;
    const dropdownHeight = 150; // Approximate height of the largest dropdown
    
    // Calculate available space above and below
    const spaceAbove = objectTop - window.scrollY;
    const spaceBelow = window.innerHeight - (objectTop + objectRect.height * zoom);
    
    // Position horizontally - center align with object
    let left = objectLeft + (objectRect.width * zoom / 2) - (toolbarWidth / 2);
    
    // Ensure toolbar doesn't go off-screen horizontally
    if (left + toolbarWidth > window.innerWidth) {
      left = window.innerWidth - toolbarWidth - 8;
    }
    if (left < 8) left = 8;
    
    // Position vertically based on available space
    let top;
    const gap = 3; // Reduced gap between object and toolbar

    if (spaceBelow >= toolbarHeight + dropdownHeight + gap) {
      // Position below the object if there's space for toolbar + dropdown
      top = objectTop + (objectRect.height * zoom) + gap;
      toolbarElement.classList.remove('position-top');
      toolbarElement.classList.add('position-bottom');
    } else if (spaceAbove >= toolbarHeight + dropdownHeight + gap) {
      // Position above the object if there's space for toolbar + dropdown
      top = objectTop - toolbarHeight - gap;
      toolbarElement.classList.remove('position-bottom');
      toolbarElement.classList.add('position-top');
    } else {
      // If no ideal space for dropdowns, position based on maximum available space
      if (spaceBelow > spaceAbove) {
        top = Math.min(
          objectTop + (objectRect.height * zoom) + gap,
          window.innerHeight - toolbarHeight - dropdownHeight - 8
        );
        toolbarElement.classList.remove('position-top');
        toolbarElement.classList.add('position-bottom');
      } else {
        top = Math.max(8, objectTop - toolbarHeight - gap);
        toolbarElement.classList.remove('position-bottom');
        toolbarElement.classList.add('position-top');
      }
    }

    // Apply positions
    toolbarElement.style.left = `${left}px`;
    toolbarElement.style.top = `${top}px`;
  }

  // Add window resize handler
  @HostListener('window:resize')
  onWindowResize() {
    if (this.selectedTextObject) {
      this.positionToolbar();
    }
    /*
    if (this.canvas) {
      const parentElement = this.canvasRef.nativeElement.parentElement;
      this.scaleCanvasContainer(parentElement);
      this.canvas.renderAll();
    }
    */
  }

  // Add scroll handler
  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.selectedTextObject) {
      this.positionToolbar();
    }
  }

  // Add getters for template binding
  get isBold(): boolean {
    return this.currentBold;
  }

  get isItalic(): boolean {
    return this.currentItalic;
  }

  get isUnderline(): boolean {
    return this.currentUnderline;
  }

  get isStrike(): boolean {
    return this.currentStrike;
  }

  // Method to handle image URL input
  addImageFromUrl(url: string) {
    fabric.Image.fromURL(url, (img) => {
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = this.canvas.width!;
      const canvasHeight = this.canvas.height!;
      const scale = Math.min(
        (canvasWidth * 0.5) / img.width!,
        (canvasHeight * 0.5) / img.height!
      );

      img.set({
        left: 50,
        top: 50,
        scaleX: scale,
        scaleY: scale,
        cornerStyle: 'circle',
        cornerColor: '#44aaff',
        borderColor: '#44aaff',
        cornerSize: 12,
        transparentCorners: false,
        lockUniScaling: false,
      });

      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.canvas.renderAll();
      this.recordHistory();
    }, (error) => {
      console.error('Error loading image:', error);
      alert('Failed to load image from URL');
    });
  }

  // Add a new method to handle font changes
  onFontFamilyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentFontFamily = select.value;
    this.setFontFamily(select.value);
  }

  // Add handler for font size changes
  onFontSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.currentFontSize = newSize;
    this.setFontSize(newSize);
  }

  // Add shape toolbar visibility handler
  private setupShapeSelectionHandler() {
    this.canvas.on('selection:created', (e) => this.handleShapeSelection(e));
    this.canvas.on('selection:updated', (e) => this.handleShapeSelection(e));
    this.canvas.on('selection:cleared', () => {
      this.showShapeToolbar = false;
      this.selectedShape = null;
    });
  }

  private handleShapeSelection(e: any) {
    const selectedObject = e.selected[0];
    if (selectedObject && 
        !['textbox', 'i-text', 'image'].includes(selectedObject.type)) {
      this.showShapeToolbar = true;
      this.selectedShape = selectedObject;
    } else {
      this.showShapeToolbar = false;
      this.selectedShape = null;
    }
  }

  // Shape modification methods
  updateBorderStyleAndWidth(style: string, width: number) {
    if (!this.selectedShape) return;
    
    if (style === 'none') {
      this.selectedShape.set('stroke', null);
    } else {
      this.selectedShape.set('stroke', this.selectedShape.stroke || '#000000');
      this.selectedShape.set('strokeWidth', width);
      
      switch(style) {
        case 'solid':
          this.selectedShape.set('strokeDashArray', null);
          break;
        case 'dashed':
          this.selectedShape.set('strokeDashArray', [width * 2, width]);
          break;
        case 'dotted':
          this.selectedShape.set('strokeDashArray', [width, width]);
          break;
      }
    }
    
    this.canvas.renderAll();
    this.recordHistory();
  }

  updateCornerRadius(event: Event) {
    const input = event.target as HTMLInputElement;
    const radius = parseInt(input.value, 10);
    
    if (!this.selectedShape) return;

    switch(this.selectedShape.type) {
      // Native support shapes
      case 'rect':
      case 'textbox':
        this.selectedShape.set({
          rx: radius,
          ry: radius
        });
        break;

      // Custom implementation for triangle
      case 'triangle':
        this.applyRadiusToTriangle(this.selectedShape as fabric.Triangle, radius);
        break;

      // Other custom shapes
      case 'pentagon':
      case 'hexagon':
      case 'diamond':
      case 'parallelogram':
      case 'trapezoid':
        this.applyRadiusToPolygon(this.selectedShape as fabric.Polygon, radius);
        break;
    }

    this.canvas.renderAll();
    this.recordHistory();
  }

  private applyRadiusToTriangle(triangle: fabric.Triangle, radius: number) {
    const width = triangle.width || 0;
    const height = triangle.height || 0;
    
    // Calculate the points for a triangle with rounded corners
    const path = this.createRoundedTrianglePath(width, height, radius);
    
    // Update the triangle's path
    triangle.set({
      path: path,
      customCornerRadius: radius
    });
  }

  private createRoundedTrianglePath(width: number, height: number, radius: number): any[] {
    // Ensure radius isn't too large for the shape
    radius = Math.min(radius, Math.min(width, height) / 3);

    const path = [];
    const points = [
      { x: width / 2, y: 0 },           // top
      { x: width, y: height },          // bottom right
      { x: 0, y: height }               // bottom left
    ];

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const prev = points[(i - 1 + points.length) % points.length];

      if (radius === 0) {
        if (i === 0) path.push(['M', current.x, current.y]);
        else path.push(['L', current.x, current.y]);
        continue;
      }

      // Calculate the vectors
      const vec1 = {
        x: prev.x - current.x,
        y: prev.y - current.y
      };
      const vec2 = {
        x: next.x - current.x,
        y: next.y - current.y
      };

      // Normalize vectors
      const len1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
      const len2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

      const normVec1 = {
        x: vec1.x / len1,
        y: vec1.y / len1
      };
      const normVec2 = {
        x: vec2.x / len2,
        y: vec2.y / len2
      };

      // Calculate corner points
      const cornerPoint1 = {
        x: current.x + normVec1.x * radius,
        y: current.y + normVec1.y * radius
      };
      const cornerPoint2 = {
        x: current.x + normVec2.x * radius,
        y: current.y + normVec2.y * radius
      };

      // Add to path
      if (i === 0) path.push(['M', cornerPoint1.x, cornerPoint1.y]);
      else path.push(['L', cornerPoint1.x, cornerPoint1.y]);

      // Add the arc
      path.push([
        'Q',
        current.x,
        current.y,
        cornerPoint2.x,
        cornerPoint2.y
      ]);
    }

    // Close the path
    path.push(['Z']);
    return path;
  }

  private applyRadiusToPolygon(polygon: fabric.Polygon, radius: number) {
    // Get the original points of the polygon
    const points = polygon.points || [];
    if (points.length < 3) return;

    const path = this.createRoundedPolygonPath(points, radius);
    
    polygon.set({
      path: path,
      customCornerRadius: radius
    });
  }

  private createRoundedPolygonPath(points: any[], radius: number): any[] {
    const path = [];
    const len = points.length;

    for (let i = 0; i < len; i++) {
      const curr = points[i];
      const next = points[(i + 1) % len];
      const prev = points[(i - 1 + len) % len];

      if (radius === 0) {
        if (i === 0) path.push(['M', curr.x, curr.y]);
        else path.push(['L', curr.x, curr.y]);
        continue;
      }

      // Calculate vectors
      const vec1 = {
        x: prev.x - curr.x,
        y: prev.y - curr.y
      };
      const vec2 = {
        x: next.x - curr.x,
        y: next.y - curr.y
      };

      // Normalize vectors
      const len1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
      const len2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

      const normVec1 = {
        x: vec1.x / len1,
        y: vec1.y / len1
      };
      const normVec2 = {
        x: vec2.x / len2,
        y: vec2.y / len2
      };

      // Calculate corner points
      const cornerPoint1 = {
        x: curr.x + normVec1.x * radius,
        y: curr.y + normVec1.y * radius
      };
      const cornerPoint2 = {
        x: curr.x + normVec2.x * radius,
        y: curr.y + normVec2.y * radius
      };

      // Add to path
      if (i === 0) path.push(['M', cornerPoint1.x, cornerPoint1.y]);
      else path.push(['L', cornerPoint1.x, cornerPoint1.y]);

      // Add the arc
      path.push([
        'Q',
        curr.x,
        curr.y,
        cornerPoint2.x,
        cornerPoint2.y
      ]);
    }

    // Close the path
    path.push(['Z']);
    return path;
  }

  getCurrentRadius(): number {
    if (!this.selectedShape) return 0;
    
    switch(this.selectedShape.type) {
      case 'rect':
      case 'textbox':
        return (this.selectedShape as fabric.Rect).rx || 0;
      case 'triangle':
      case 'pentagon':
      case 'hexagon':
      case 'diamond':
      case 'parallelogram':
      case 'trapezoid':
        return (this.selectedShape as any).customCornerRadius || 0;
      default:
        return 0;
    }
  }

  canApplyRadius(shape: fabric.Object): boolean {
    if (!shape) return false;
    return this.shapesWithRadius.includes(shape.type as string);
  }

  isCornerRadiusActive(): boolean {
    if (!this.selectedShape) return false;
    if (!this.canApplyRadius(this.selectedShape)) return false;
    return this.getCurrentRadius() > 0;
  }

  shouldShowRadiusButton(): boolean {
    return this.selectedShape && this.canApplyRadius(this.selectedShape);
  }

  // Add this method to initialize custom shapes with radius support
  initializeCustomShape(shape: fabric.Object) {
    if (this.shapesWithRadius.includes(shape.type as string)) {
      // Add radius support to custom shapes
      shape.set({
        cornerRadius: 0,
        customCornerRadius: 0
      });
    }
  }

  updateBorderWidth(event: Event) {
    const input = event.target as HTMLInputElement;
    const width = parseInt(input.value, 10);
    if (this.selectedShape) {
      this.selectedShape.set('strokeWidth', width);
      this.canvas.renderAll();
      this.recordHistory();
    }
  }

  updateFillColor(color: string) {
    if (!this.selectedShape) return;
    this.selectedShape.set('fill', color);
    this.canvas.renderAll();
    this.recordHistory();
  }

  updateOpacity(opacity: string | number) {
    if (!this.selectedShape) return;
    this.selectedShape.set('opacity', Number(opacity) / 100);
    this.canvas.renderAll();
    this.recordHistory();
  }

  applyGradient(colors: string[]) {
    if (!this.selectedShape) return;
    
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: this.selectedShape.width,
        y2: this.selectedShape.height
      },
      colorStops: [
        { offset: 0, color: colors[0] },
        { offset: 1, color: colors[1] }
      ]
    });
    
    this.selectedShape.set('fill', gradient);
    this.canvas.renderAll();
    this.recordHistory();
  }

  replaceShape(newShapeType: string) {
    if (!this.selectedShape) return;

    // Get current shape properties
    const props = {
      left: this.selectedShape.left,
      top: this.selectedShape.top,
      width: this.selectedShape.width,
      height: this.selectedShape.height,
      fill: this.selectedShape.fill,
      stroke: this.selectedShape.stroke,
      strokeWidth: this.selectedShape.strokeWidth,
      strokeDashArray: this.selectedShape.strokeDashArray,
      opacity: this.selectedShape.opacity,
      angle: this.selectedShape.angle
    };

    // Create new shape
    let newShape;
    switch (newShapeType) {
      case 'rectangle':
        newShape = new fabric.Rect(props);
        break;
      case 'circle':
        newShape = new fabric.Circle({
          ...props,
          radius: Math.min(props.width!, props.height!) / 2
        });
        break;
      case 'triangle':
        newShape = new fabric.Triangle(props);
        break;
      // Add more shape types as needed
    }

    if (newShape) {
      this.canvas.remove(this.selectedShape);
      this.canvas.add(newShape);
      this.canvas.setActiveObject(newShape);
      this.selectedShape = newShape;
      this.canvas.renderAll();
      this.recordHistory();
    }
  }

  toggleShapeSelector() {
    // Implement your shape selector logic here
    console.log('Toggle shape selector');
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns, event: MouseEvent) {
    // Close all other dropdowns
    Object.keys(this.dropdowns).forEach(key => {
      if (key !== dropdown) {
        this.dropdowns[key as keyof typeof this.dropdowns].isOpen = false;
      }
    });

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const toolbarRect = button.closest('.shape-toolbar')?.getBoundingClientRect();

    if (!toolbarRect) return;
    
    this.dropdowns[dropdown].isOpen = !this.dropdowns[dropdown].isOpen;
    this.dropdowns[dropdown].position = {
      x: rect.left - 410,
      y: toolbarRect.bottom - 75
    };
  }

  updateSliderValue(event: MouseEvent, sliderElement: HTMLElement, callback: (value: number) => void) {
    const slider = sliderElement;
    const sliderRect = slider.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((event.clientX - sliderRect.left) / sliderRect.width) * 100));
    
    // Update the slider fill
    const fill = slider.querySelector('.slider-fill') as HTMLElement;
    fill.style.width = `${percentage}%`;
    
    // Update the thumb position
    const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
    thumb.style.left = `${percentage}%`;
    
    // Call the callback with the new value
    callback(Math.round(percentage));
  }

  initSliderDrag(callback: (value: number) => void) {
    return (event: MouseEvent) => {
      const slider = event.currentTarget as HTMLElement;
      
      const onMouseMove = (moveEvent: MouseEvent) => {
        this.updateSliderValue(moveEvent, slider, callback);
      };
      
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      // Initial update
      this.updateSliderValue(event, slider, callback);
    };
  }

  handleSliderMouseDown(event: MouseEvent) {
    const slider = event.currentTarget as HTMLElement;
    const sliderRect = slider.getBoundingClientRect();
    
    const updateValue = (moveEvent: MouseEvent) => {
      const percentage = Math.max(0, Math.min(100, ((moveEvent.clientX - sliderRect.left) / sliderRect.width) * 100));
      this.updateOpacity(percentage);
      
      // Update visual elements
      const fill = slider.querySelector('.slider-fill') as HTMLElement;
      const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
      fill.style.width = `${percentage}%`;
      thumb.style.left = `${percentage}%`;
    };
    
    const cleanup = () => {
      document.removeEventListener('mousemove', updateValue);
      document.removeEventListener('mouseup', cleanup);
    };
    
    document.addEventListener('mousemove', updateValue);
    document.addEventListener('mouseup', cleanup);
    
    // Initial update
    updateValue(event);
  }

  // Add getter for fill preview
  get currentFillPreview(): string {
    if (!this.selectedShape) return 'transparent';
    
    const fill = this.selectedShape.fill;
    
    // Handle gradient fill
    if (fill instanceof fabric.Gradient) {
      // Create CSS gradient from fabric gradient
      const colorStops = fill.colorStops;
      return `linear-gradient(90deg, ${colorStops[0].color} 0%, ${colorStops[1].color} 100%)`;
    }
    
    // Handle solid fill
    return fill as string || 'transparent';
  }

  getBorderStyle(): string {
    if (!this.selectedShape || !this.selectedShape.stroke) {
      return 'none';
    }
    
    const dashArray = this.selectedShape.strokeDashArray;
    if (!dashArray) {
      return 'solid';
    }
    
    // Convert fabric dash array to CSS border style
    const [dash, gap] = dashArray;
    if (dash === gap) {
      return 'dotted';
    }
    return 'dashed';
  }

  updateBorderColor(color: string) {
    if (this.selectedShape) {
      this.selectedShape.set('stroke', color);
      this.canvas.renderAll();
      this.recordHistory();
    }
  }

  // Helper method to get current border color
  getCurrentBorderColor(): string {
    return this.selectedShape?.stroke || '#000000';
  }

  updateBorderOpacity(opacity: number) {
    if (this.selectedShape) {
      this.selectedShape.set('strokeOpacity', opacity / 100);
      this.canvas.renderAll();
      this.recordHistory();
    }
  }

  handleBorderOpacitySliderMouseDown(event: MouseEvent) {
    const slider = event.currentTarget as HTMLElement;
    const sliderRect = slider.getBoundingClientRect();
    
    const updateValue = (moveEvent: MouseEvent) => {
      const percentage = Math.max(0, Math.min(100, ((moveEvent.clientX - sliderRect.left) / sliderRect.width) * 100));
      this.updateBorderOpacity(percentage);
      
      // Update visual elements
      const fill = slider.querySelector('.slider-fill') as HTMLElement;
      const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
      fill.style.width = `${percentage}%`;
      thumb.style.left = `${percentage}%`;
    };
    
    const cleanup = () => {
      document.removeEventListener('mousemove', updateValue);
      document.removeEventListener('mouseup', cleanup);
    };
    
    document.addEventListener('mousemove', updateValue);
    document.addEventListener('mouseup', cleanup);
    
    // Initial update
    updateValue(event);
  }

  // Add method to handle shape operations
  mergeShapes(operation: 'union' | 'intersect' | 'subtract' | 'combine' | 'fragment') {
    const activeObjects = this.canvas.getActiveObjects();
    if (!activeObjects || activeObjects.length < 2) return;

    // Create and setup Paper.js canvas with same dimensions as Fabric canvas
    const paperCanvas = document.createElement('canvas');
    paperCanvas.width = this.canvas.width!;
    paperCanvas.height = this.canvas.height!;
    paper.setup(paperCanvas);

    try {
      switch (operation) {
        case 'union':
          this.unionShapes(activeObjects);
          break;
        case 'intersect':
          this.intersectShapes(activeObjects);
          break;
        case 'subtract':
          this.subtractShapes(activeObjects);
          break;
        case 'combine':
          this.combineShapes(activeObjects);
          break;
        case 'fragment':
          this.fragmentShapes(activeObjects);
          break;
      }
    } catch (error) {
      console.error('Shape operation failed:', error);
    }
  }

  private unionShapes(objects: fabric.Object[]) {
    // Calculate the bounding box of all selected objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objects.forEach(obj => {
      const objBounds = obj.getBoundingRect(true, true);
      minX = Math.min(minX, objBounds.left);
      minY = Math.min(minY, objBounds.top);
      maxX = Math.max(maxX, objBounds.left + objBounds.width);
      maxY = Math.max(maxY, objBounds.top + objBounds.height);
    });

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    
    let unitedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      unitedPath = unitedPath.unite(paths[i]) as paper.PathItem;
    }

    if (unitedPath) {
      const fabricPath = this.paperToFabricPath(unitedPath as paper.PathItem);
      
      // Set the position to the center of the original bounding box
      /*fabricPath.set({
        left: minX,
        top: minY,
        originX: 'left',
        originY: 'top'
      });*/

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

  private intersectShapes(objects: fabric.Object[]) {
    // Calculate bounding box
    let minX = Infinity, minY = Infinity;
    objects.forEach(obj => {
      const objBounds = obj.getBoundingRect(true, true);
      minX = Math.min(minX, objBounds.left);
      minY = Math.min(minY, objBounds.top);
    });

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    
    let intersectedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      intersectedPath = intersectedPath.intersect(paths[i]) as paper.Path;
    }

    if (intersectedPath) {
      const fabricPath = this.paperToFabricPath(intersectedPath);
      /*fabricPath.set({
        left: minX,
        top: minY,
        originX: 'left',
        originY: 'top'
      });*/

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

  private subtractShapes(objects: fabric.Object[]) {
    // Calculate bounding box
    let minX = Infinity, minY = Infinity;
    objects.forEach(obj => {
      const objBounds = obj.getBoundingRect(true, true);
      minX = Math.min(minX, objBounds.left);
      minY = Math.min(minY, objBounds.top);
    });

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    
    let subtractedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      subtractedPath = subtractedPath.subtract(paths[i]) as paper.Path;
    }

    if (subtractedPath) {
      const fabricPath = this.paperToFabricPath(subtractedPath);
      /*fabricPath.set({
        left: minX,
        top: minY,
        originX: 'left',
        originY: 'top'
      });*/

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

  private combineShapes(objects: fabric.Object[]) {
    // Calculate bounding box
    let minX = Infinity, minY = Infinity;
    objects.forEach(obj => {
      const objBounds = obj.getBoundingRect(true, true);
      minX = Math.min(minX, objBounds.left);
      minY = Math.min(minY, objBounds.top);
    });

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    
    let combinedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      combinedPath = combinedPath.exclude(paths[i]) as paper.Path;
    }

    if (combinedPath) {
      const fabricPath = this.paperToFabricPath(combinedPath);
      /*fabricPath.set({
        left: minX,
        top: minY,
        originX: 'left',
        originY: 'top'
      });*/ 

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

  private fragmentShapes(objects: fabric.Object[]) {
    if (objects.length < 2) return;
    
    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    let results: paper.PathItem[] = [];
    
    // First, get all possible intersections
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        // Get pieces from each pair of shapes
        const path1 = paths[i];
        const path2 = paths[j];
        
        // 1. First shape minus second shape
        const piece1 = path1.subtract(path2);
        if (piece1) results.push(piece1);
        
        // 2. Second shape minus first shape
        const piece2 = path2.subtract(path1);
        if (piece2) results.push(piece2);
        
        // 3. Intersection of both shapes
        const intersection = path1.intersect(path2);
        if (intersection) results.push(intersection);
      }
    }
    
    // If no results were generated, use original paths
    if (results.length === 0) {
      results = paths;
    }
    
    // Convert all unique pieces to Fabric objects and add to canvas
    results.forEach(piece => {
      if (piece instanceof paper.CompoundPath) {
        // Handle compound paths by converting each child path
        piece.children.forEach(child => {
          if (child instanceof paper.Path) {
            const fabricPath = this.paperToFabricPath(child);
            this.addMergedShapeToCanvas(fabricPath, objects);
          }
        });
      } else {
        const fabricPath = this.paperToFabricPath(piece as paper.PathItem);
        this.addMergedShapeToCanvas(fabricPath, objects);
      }
    });
  }

  private fabricToPaperPath(fabricObj: fabric.Object): paper.PathItem {
    // Get the object's absolute position and dimensions
    const matrix = fabricObj.calcTransformMatrix();
    const bbox = fabricObj.getBoundingRect();
    
    let path: paper.PathItem;

    if (fabricObj instanceof fabric.Polygon) {
      path = new paper.Path();
      const points = fabricObj.points!;
      
      points.forEach((point, i) => {
        // Transform each point using the object's matrix
        const transformedPoint = fabric.util.transformPoint({
          x: point.x,
          y: point.y
        }, matrix);
        
        if (i === 0) {
          path.moveTo(new paper.Point(transformedPoint.x, transformedPoint.y));
        } else {
          path.lineTo(new paper.Point(transformedPoint.x, transformedPoint.y));
        }
      });
      (path as paper.Path).closed = true;
    } 
    else if (fabricObj instanceof fabric.Rect) {
      const points = [
        { x: 0, y: 0 },
        { x: fabricObj.width!, y: 0 },
        { x: fabricObj.width!, y: fabricObj.height! },
        { x: 0, y: fabricObj.height! }
      ];
      
      path = new paper.Path();
      points.forEach((point, i) => {
        const transformedPoint = fabric.util.transformPoint(point, matrix);
        if (i === 0) {
          path.moveTo(new paper.Point(transformedPoint.x, transformedPoint.y));
        } else {
          path.lineTo(new paper.Point(transformedPoint.x, transformedPoint.y));
        }
      });
      (path as paper.Path).closed = true;
    }
    else if (fabricObj instanceof fabric.Circle) {
      const center = fabric.util.transformPoint({
        x: fabricObj.left! + fabricObj.radius!,
        y: fabricObj.top! + fabricObj.radius!
      }, matrix);
      
      path = new paper.Path.Circle({
        center: new paper.Point(center.x, center.y),
        radius: fabricObj.radius! * (fabricObj.scaleX || 1)
      });
    }
    else {
      // Fallback for other shapes
      path = new paper.Path();
      const points = fabricObj.toSVG().match(/points="([^"]+)"/)?.[1]?.split(' ') || [];
      points.forEach((point, i) => {
        const [x, y] = point.split(',').map(Number);
        const transformedPoint = fabric.util.transformPoint({ x, y }, matrix);
        
        if (i === 0) {
          path.moveTo(new paper.Point(transformedPoint.x, transformedPoint.y));
        } else {
          path.lineTo(new paper.Point(transformedPoint.x, transformedPoint.y));
        }
      });
      (path as paper.Path).closed = true;
    }

    return path;
  }

  private paperToFabricPath(paperPath: paper.PathItem): fabric.Path {
    const svgString = paperPath.exportSVG({ asString: true }) as string;
    const pathData = svgString.match(/d="([^"]+)"/)?.[1] || '';
    const bounds = paperPath.bounds;

    return new fabric.Path(pathData, {
      left: bounds.x,
      top: bounds.y,
      fill: this.getCommonFill(this.canvas.getActiveObjects()),
      stroke: this.getCommonStroke(this.canvas.getActiveObjects()),
      strokeWidth: 2,
      objectCaching: false,
      originX: 'left',
      originY: 'top'
    });
  }

  private addMergedShapeToCanvas(shape: fabric.Path, originalObjects: fabric.Object[]) {
    // Calculate the bounding box of original objects
    let minX = Infinity, minY = Infinity;
    originalObjects.forEach(obj => {
      const bounds = obj.getBoundingRect(true, true);
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
    });

    // Position the merged shape at the correct location
    /*shape.set({
      left: minX,
      top: minY,
      originX: 'left',
      originY: 'top'
    });*/

    // Remove original objects
    originalObjects.forEach(obj => this.canvas.remove(obj));

    // Add new merged shape
    this.canvas.add(shape);
    this.canvas.setActiveObject(shape);
    this.canvas.renderAll();
    this.recordHistory();
  }

  private getCommonFill(objects: fabric.Object[]): string {
    return objects[0].fill as string || '#000000';
  }

  private getCommonStroke(objects: fabric.Object[]): string {
    return objects[0].stroke as string || '#000000';
  }




}
