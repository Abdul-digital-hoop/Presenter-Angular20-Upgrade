import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, ChangeDetectorRef, Input } from '@angular/core';
import { fabric } from 'fabric';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Subscription, Subject, filter, take, distinctUntilChanged, finalize } from 'rxjs';
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
  position: { x: number; y: 0; };
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
    styleUrls: ['./multimedia.component.scss'],
    standalone: false
})
export class MultimediaComponent implements OnInit, OnDestroy {

  // Canvas References
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;
  @ViewChild('textToolbar') textToolbar!: ElementRef;
  canvas!: fabric.Canvas;
  @Input() slideDetails:any;
  @Input() viewfrom:string='';
  @Input() presentationMode:any;

  // Subscriptions and State Management
  private actionSubscription!: Subscription;
  private imageUploadActionSubscription!: Subscription;
  private history: string[] = [];  
  private historyIndex: number = -1;
  private saveSubject = new Subject<string>();
  private lastSavedJson = '';
  private existingJson: any;
  private lastActionId: string | null = null;
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
  currentBackgroundColor: string = '#ffffff'; // Add separate property for background color
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
    'Haettenschweiler'
  ];
  fontSizes: number[] = [12, 14, 16, 18, 20, 24, 28, 32, 40, 50, 60, 70, 80,90];

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
  currentListIcon = '/assets/multimedia-icons/multimedia-bullet-list.svg';

  // Add property to control toolbar visibility
  showTextToolbar: boolean = false;

  // Add these properties to your component
  showShapeToolbar = false;
  selectedShape: fabric.Object | null = null;
  selectedShapes: fabric.Object[] = []; // Array to store all selected shapes
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
  defaultJson: string;

  // Add these properties to your class
  private clipboard: fabric.Object | null = null;
  private copiedObjects: fabric.Object[] = [];

  // Add these properties to your component class
  showTableDialog = false;
  tableConfig = {
    rows: 3,
    columns: 3
  };
  tableErrors = {
    rows: '',
    columns: ''
  };
  showListDropdown = false;
  showLetterSpaceDropdown = false;
  currentLetterSpacing: number = 0; // Add this property to track letter spacing
  currentLineSpacing: number = 0.5; // Add this property to track line spacing
  private lastUngroupedObjects: fabric.Object[] = [];
  private lastGroupName: string = '';
  private lastGroupLeft: number = 0;
  private lastGroupTop: number = 0;
  private lastGroupAngle: number = 0;
  private lastGroupScaleX: number = 1;
  private lastGroupScaleY: number = 1;
  private lastGroupFlipX: boolean = false;
  private lastGroupFlipY: boolean = false;
  private currentListInfo: { type: string; prefix: string } | null = null;
  private selectedStyles: any = null;  // Add this property to store selected styles
  private lastRegroupedObject: fabric.Group | null = null;
  private currentActiveTextbox: fabric.IText | null = null;

  // Drag alignment properties
  private isDragging = false;
  private dragAlignmentGuides = {
    vertical: { show: false, x: 0 },
    horizontal: { show: false, y: 0 }
  };
  private snapThreshold = 10; // pixels
  private alignmentGuides: fabric.Line[] = [];
  public dragAlignmentEnabled = true; // Toggle for drag alignment feature
  imageLoaded: boolean = false;
  private recordHistorySubject = new Subject<void>();
  ungroub: boolean=false;
  rect: any;

  constructor(
    public presentationService: PresentationService,
    public workspaceService: WorkspaceService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    //this.existingJson = this.workspaceService.options;
  }

  /**
   * LIFECYCLE HOOKS
   */
  ngOnInit(): void {
    this.recordHistorySubject
    .pipe(debounceTime(500)) // Adjust the delay as needed
    .subscribe(() => {
      this.triggerSave();
    });
    const contentData = this.slideDetails?.slideContentData?.find(item => item.name === 'contentData');
    const jsonData = contentData?.value?.[0]?.value;
    this.existingJson = jsonData;
    this.hideAlignmentGuides();
    if (!this.presentationMode && this.viewfrom == 'editPresentation' ) {
      this.initializeCanvas(this.existingJson);
      this.subscribeToActions();
      this.imageUploadAction();
      this.setupAutoSave();
      this.initializeStateTracking();
      this.setupTextSelectionHandler();
      this.setupShapeSelectionHandler();
      this.setupGroupEventHandlers();
    } else {
      this.renderCanvas(this.existingJson);
    }
    fabric.Object.prototype.controls.mtr.cursorStyle = 'alias'; // or your custom cursor
  }

  ngAfterViewInit() {

  }
  ngOnDestroy() {
    // if (!this.workspaceService.presentationMode) {
    //   this.actionSubscription.unsubscribe();
    //   this.saveSubject.unsubscribe();
    // }
    this.actionSubscription?.unsubscribe();
    this.imageUploadActionSubscription?.unsubscribe();
    
    // Clean up any remaining text keyboard event listeners
    if (this.canvas) {
      this.canvas.getObjects().forEach((obj: any) => {
        if (obj.type === 'i-text' || obj.type === 'textbox') {
          this.cleanupTextKeyboardEvents(obj);
        }
      });
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



    // Setup drag alignment events
    this.setupDragAlignment();
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
     if(this.viewfrom == 'IndividualTemplatePreview'){
      canvasEl.style.top = `${0}px`;
    }else{
      canvasEl.style.top = `${top}px`;
    }
    canvasEl.style.position = 'absolute';
    
    // Update upper canvas position and style
    const upperCanvas = this.canvas.upperCanvasEl;
    upperCanvas.style.left = `${left}px`;
    if(this.viewfrom == 'IndividualTemplatePreview'){
      upperCanvas.style.top = `${0}px`;
    }else{
      upperCanvas.style.top = `${top}px`;
    }
    upperCanvas.style.transform = `scale(${scale})`;
    upperCanvas.style.transformOrigin = 'top left';
    
    this.setCanvasScale();
  }

  setCanvasScale() {
    const scale = this.canvas.getZoom();
    document.documentElement.style.setProperty('--canvas-scale', scale.toString());
  }
  private presentCanvasContainer(parentElement: HTMLElement) {
    const canvasEl = this.canvas.getElement();
    const upperCanvas = this.canvas.upperCanvasEl;
    const containerWidth = parentElement.clientWidth || parentElement.offsetWidth;
    const containerHeight = parentElement.clientHeight || parentElement.offsetHeight;
    
    // Get device pixel ratio for crisp rendering
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calculate scale to fit canvas in container while maintaining aspect ratio
    const scaleX = containerWidth / this.canvas.width!;
    const scaleY = containerHeight / this.canvas.height!;
    const scale = Math.min(scaleX, scaleY);
    
    // Set canvas dimensions with proper scaling
    const scaledWidth = this.canvas.width! * scale;
    const scaledHeight = this.canvas.height! * scale;
    
    // Center the canvas in container
    const left = (containerWidth - scaledWidth) / 2;
    const top = this.viewfrom === 'IndividualTemplatePreview' ? 0 : (containerHeight - scaledHeight) / 2;
    
    // Apply proper canvas scaling instead of CSS transform
    this.canvas.setDimensions({
      width: scaledWidth,
      height: scaledHeight
    });
    
    // Set canvas position
    canvasEl.style.position = 'absolute';
    canvasEl.style.left = `${left}px`;
    canvasEl.style.top = `${top}px`;
    canvasEl.style.transform = 'none'; // Remove CSS transform
    
    // Set upper canvas position and remove CSS transform
    upperCanvas.style.position = 'absolute';
    upperCanvas.style.left = `${left}px`;
    upperCanvas.style.top = `${top}px`;
    upperCanvas.style.transform = 'none'; // Remove CSS transform
    
    // Update canvas scale for proper rendering
    this.canvas.setZoom(scale);
    
    // Ensure crisp text rendering
    this.canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
    this.canvas.renderAll();
    
    this.setCanvasScale();
  }

  subscribeToActions() {
    this.actionSubscription = this.workspaceService.multimediaActionSubject$.pipe(
      filter(action =>
        action !== null &&
        action.presentationId === this.workspaceService.presentationId &&
        action.slideId === this.workspaceService.activeSlideId &&
        action.id !== this.lastActionId // skip if same action
      )
    ).subscribe((action) => {
      this.lastActionId = action.id; // mark this action as handled
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

       // case 'addImageUrl': this.addImageFromUrl(action.imageUrl); break;

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
        // Use subscribe() instead of next() since multimediaActionSubject$ is an Observable
        this.workspaceService.multimediaActionSubject.next(null);
    });
  }

  imageUploadAction(){
    this.imageUploadActionSubscription = this.workspaceService.multimediaImageActionSubject$.pipe(
      filter(action =>
        action !== null &&
        action.presentationId === this.workspaceService.presentationId &&
        action.slideId === this.workspaceService.activeSlideId &&
        action.id !== this.lastActionId // skip if same action
      )
    ).subscribe((action) => {
      this.lastActionId = action.id; // mark this action as handled
      this.addImageFromUrl(action.imageUrl);
    });
  }  
  

 
  addDefaultText() {
    // Heading Border and Text
    const headingBorder = new fabric.Rect({
      left: 15,
      right: 15,
      top: 15,
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      height: 60,
      fill: 'transparent',
      name: 'headingBorder',
      stroke: '#ccc',
      strokeWidth: 1
    });
    const heading = new fabric.Textbox("Click to add heading", {
      left:15,
      right: 15,
      top: 25,
      fontSize: 32,
      fontWeight: 'bold',
      name: 'heading',
      fill: '#333',
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      textAlign: 'center',
      hasBorders: false,
      hasControls: false
    });

    const headingGroup = new fabric.Group([headingBorder, heading], {
      left: 15,
      top: 15,
      hasControls: true,
      hasBorders: true,
      name: 'headingGroup',
      lockScalingY: true
    });
  
    // Content Border and Text
    const contentBorder = new fabric.Rect({
      left: 15,
      right: 15,
      top: 90,
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 30,
      height: this.canvasRef.nativeElement.parentElement.offsetHeight - 120,
      fill: 'transparent',
      name: 'contentBorder',
      stroke: '#ccc',
      strokeWidth: 1
    });
    const content = new fabric.Textbox("Click to add content", {
      left: 30, // 15px gap from left border
      right: 15,
      top: 105,
      fontSize: 24,
      name: 'content',
      fontWeight: 500,
      fill: '#000000',
      width: this.canvasRef.nativeElement.parentElement.offsetWidth - 60, // 15px gap on both sides
      textAlign: 'left',
      hasBorders: false,
      hasControls: false
    });
  
    const contentGroup = new fabric.Group([contentBorder, content], {
      left: 15,
      top: 90,
      hasControls: true,
      hasBorders: true,
      name: 'contentGroup',
      lockScalingY: true
    });

    this.canvas.add(headingGroup, contentGroup);
    this.canvas.renderAll();
    this.recordHistory();
  }
  renderCanvas(existingJson?: string) {
    const parentElement = this.canvasRef.nativeElement.parentElement;
    
    const EDITOR_WIDTH = 1024;
    const EDITOR_HEIGHT = 576;
    
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      width: EDITOR_WIDTH,
      height: EDITOR_HEIGHT
    });

    this.presentCanvasContainer(parentElement);

    fabric.Object.prototype.set({
      selectable: false,
      evented: false
    });

    if (existingJson) {
      const parsedJson = JSON.parse(existingJson);
      
      // Process objects to hide default elements
      if (parsedJson.objects) {
        parsedJson.objects.forEach((obj: any) => {
          if (obj.type === 'group') {
            // For group objects, process their child objects
            obj.objects?.forEach((groupObj: any) => {
              if (groupObj.type === 'textbox' && 
                 (groupObj.text === 'Click to add heading' || 
                  groupObj.text === 'Click to add content')) {
                groupObj.visible = false; // Hide default text
              }
              if (groupObj.type === 'rect' && 
                  groupObj.fill === 'transparent' && 
                  groupObj.stroke === '#ccc' && 
                  groupObj.strokeWidth === 1) {
                groupObj.visible = false; // Hide default border
              }
            });
          } else {
            // For non-group objects
            if (obj.type === 'textbox' && 
               (obj.text === 'Click to add heading' || 
                obj.text === 'Click to add content')) {
              obj.visible = false; // Hide default text
            }
            if (obj.type === 'rect' && 
                obj.fill === 'transparent' && 
                obj.stroke === '#ccc' && 
                obj.strokeWidth === 1) {
              obj.visible = false; // Hide default border
            }
          }
        });
      }

      // Load the modified JSON
      this.canvas.loadFromJSON(parsedJson, () => {
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

    // Don't record if the state hasn't changed
    if (this.history[this.historyIndex] === currentJson) {
      return;
    }

    // Remove redo steps if we add a new action
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add new state
    this.history.push(currentJson);
    this.historyIndex++;

    // Limit history size
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }

    this.triggerSave(); // Auto-save after recording history
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
      this.hideAlignmentGuides(); // Hide alignment guides on undo
      this.recordHistorySubject.next(); // Debounced call
    }
  }
  

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
      this.hideAlignmentGuides(); // Hide alignment guides on redo
    }
  }

  private restoreFromHistory() {
    const state = this.history[this.historyIndex];
    if (state) {
      // Parse the state and filter out alignment guides
      const parsedState = JSON.parse(state);
      
      // Remove alignment guides from the state before restoring
      if (parsedState.objects) {
        parsedState.objects = parsedState.objects.filter((obj: any) => {
          // Filter out alignment guide lines
          return !(obj.type === 'line' && 
                  obj.stroke === '#ff6b6b' && 
                  obj.strokeDashArray && 
                  obj.strokeDashArray.length === 2 &&
                  obj.strokeDashArray[0] === 5 && 
                  obj.strokeDashArray[1] === 5);
        });
      }

      // Temporarily disable history tracking during restoration
      this.canvas.off('object:modified');
      this.canvas.off('object:added');
      this.canvas.off('object:removed');
      this.canvas.off('object:moved');
      this.canvas.off('object:rotated');
      this.canvas.off('object:scaled');
      this.canvas.off('object:skewed');
      this.canvas.off('text:changed');
      this.canvas.off('path:created');

      this.canvas.loadFromJSON(parsedState, () => {
        this.canvas.renderAll();
        
        // Clear alignment guides array after restoration
        this.alignmentGuides = [];
        
        // Re-enable history tracking
      });
    }
  }


  /*** AUTO-SAVE ***/
  private triggerSave() {
    // Get canvas JSON and filter out alignment guides
    const canvasJson = this.canvas.toJSON();
    
    // Remove alignment guides from the JSON before saving
    if (canvasJson.objects) {
      canvasJson.objects = canvasJson.objects.filter((obj: any) => {
        // Filter out alignment guide lines
        return !(obj.type === 'line' && 
                obj.stroke === '#ff6b6b' && 
                obj.strokeDashArray && 
                obj.strokeDashArray.length === 2 &&
                obj.strokeDashArray[0] === 5 && 
                obj.strokeDashArray[1] === 5);
      });
    }
    
    const currentJson = JSON.stringify(canvasJson);

    if (currentJson !== this.lastSavedJson) {
      this.lastSavedJson = currentJson;
      this.saveSubject.next(currentJson); // Trigger debounced save
    }
  }

  private setupAutoSave() {
    this.saveSubject
      .subscribe((json) => this.saveToDatabase(json));
  }

  private saveToDatabase(json: string) {
      let multimediaContentDTO = {
      presentationId: this.workspaceService.presentationId,
      slideId: this.workspaceService.activeSlideId,
      Json: json,
      isTemplate: this.workspaceService.isTemplate
      
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
    // Always get the actual objects to align
    let objectsToAlign: fabric.Object[] = [];
    const activeSelection = this.canvas.getActiveObject();
    if (activeSelection) {
      if (activeSelection.type === 'activeSelection') {
        objectsToAlign = (activeSelection as fabric.ActiveSelection).getObjects();
      } else {
        objectsToAlign = [activeSelection];
      }
    } else {
      // Nothing selected, do nothing
      return;
    }

    if (objectsToAlign.length > 1) {
      const value = this.getExtremeValue(objectsToAlign, alignType);
      this.setObjectsPosition(objectsToAlign, alignType, value);
      // Reselect the objects after alignment
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(new fabric.ActiveSelection(objectsToAlign, { canvas: this.canvas }));
    } else if (objectsToAlign.length === 1) {
      const targetValue = this.getCanvasEdgeValue(alignType);
      this.setObjectPosition(objectsToAlign[0], alignType, targetValue);
    }

    this.canvas.renderAll();
    this.recordHistory();
    this.lastRegroupedObject = null;
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
      // Get objects to distribute (similar to alignObjects)
      let objectsToDistribute: fabric.Object[] = [];
      const activeSelection = this.canvas.getActiveObject();
      if (activeSelection) {
        if (activeSelection.type === 'activeSelection') {
          objectsToDistribute = (activeSelection as fabric.ActiveSelection).getObjects();
        } else {
          objectsToDistribute = [activeSelection];
        }
      } else {
        return; // Nothing selected
      }

      // PowerPoint behavior: need at least 3 objects to distribute
      if (objectsToDistribute.length < 3) {
        return;
      }

      // Sort objects by their center position for better distribution
      const sortedObjects = [...objectsToDistribute].sort((a, b) => {
        const aCenter = a.left! + (a.width! * a.scaleX! / 2);
        const bCenter = b.left! + (b.width! * b.scaleX! / 2);
        return aCenter - bCenter;
      });

      // Get the leftmost and rightmost object centers
      const leftmostCenter = sortedObjects[0].left! + (sortedObjects[0].width! * sortedObjects[0].scaleX! / 2);
      const rightmostCenter = sortedObjects[sortedObjects.length - 1].left! + 
                             (sortedObjects[sortedObjects.length - 1].width! * sortedObjects[sortedObjects.length - 1].scaleX! / 2);
      
      // Calculate total space between centers
      const totalSpace = rightmostCenter - leftmostCenter;
      
      // Calculate spacing between centers
      const spacing = totalSpace / (sortedObjects.length - 1);

      // Distribute objects (keep first and last in place, distribute the middle ones)
      sortedObjects.forEach((obj, index) => {
        if (index === 0 || index === sortedObjects.length - 1) {
          // Keep first and last objects in their original positions
          return;
        }
        
        // Calculate new center position for middle objects
        const newCenter = leftmostCenter + (spacing * index);
        
        // Calculate new left position based on center
        const newLeft = newCenter - (obj.width! * obj.scaleX! / 2);
        
        obj.set({
          left: newLeft,
          top: obj.top // maintain vertical position
        });
      });

      // Update canvas and record history
      this.canvas.renderAll();
      this.recordHistory();
    }
  
    private distributeVertically() {
      // Get objects to distribute (similar to alignObjects)
      let objectsToDistribute: fabric.Object[] = [];
      const activeSelection = this.canvas.getActiveObject();
      if (activeSelection) {
        if (activeSelection.type === 'activeSelection') {
          objectsToDistribute = (activeSelection as fabric.ActiveSelection).getObjects();
        } else {
          objectsToDistribute = [activeSelection];
        }
      } else {
        return; // Nothing selected
      }

      // PowerPoint behavior: need at least 3 objects to distribute
      if (objectsToDistribute.length < 3) {
        return;
      }

      // Sort objects by their center position for better distribution
      const sortedObjects = [...objectsToDistribute].sort((a, b) => {
        const aCenter = a.top! + (a.height! * a.scaleY! / 2);
        const bCenter = b.top! + (b.height! * b.scaleY! / 2);
        return aCenter - bCenter;
      });

      // Get the topmost and bottommost object centers
      const topmostCenter = sortedObjects[0].top! + (sortedObjects[0].height! * sortedObjects[0].scaleY! / 2);
      const bottommostCenter = sortedObjects[sortedObjects.length - 1].top! + 
                              (sortedObjects[sortedObjects.length - 1].height! * sortedObjects[sortedObjects.length - 1].scaleY! / 2);
      
      // Calculate total space between centers
      const totalSpace = bottommostCenter - topmostCenter;
      
      // Calculate spacing between centers
      const spacing = totalSpace / (sortedObjects.length - 1);

      // Distribute objects (keep first and last in place, distribute the middle ones)
      sortedObjects.forEach((obj, index) => {
        if (index === 0 || index === sortedObjects.length - 1) {
          // Keep first and last objects in their original positions
          return;
        }
        
        // Calculate new center position for middle objects
        const newCenter = topmostCenter + (spacing * index);
        
        // Calculate new top position based on center
        const newTop = newCenter - (obj.height! * obj.scaleY! / 2);
        
        obj.set({
          top: newTop,
          left: obj.left // maintain horizontal position
        });
      });

      // Update canvas and record history
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

    // Prevent all keyboard shortcuts in presentation mode
    if (this.presentationMode || this.viewfrom !== 'editPresentation') {
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
      this.duplicateSelectedObjects();
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

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
      event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      event.preventDefault();
      
      // Determine movement amount (use shift for larger movements)
      const moveAmount = event.shiftKey ? 10 : 1;
      
      // Move the object based on the arrow key pressed
      switch (event.key) {
        case 'ArrowLeft':
          activeObject.set('left', activeObject.left! - moveAmount);
          break;
        case 'ArrowRight':
          activeObject.set('left', activeObject.left! + moveAmount);
          break;
        case 'ArrowUp':
          activeObject.set('top', activeObject.top! - moveAmount);
          break;
        case 'ArrowDown':
          activeObject.set('top', activeObject.top! + moveAmount);
          break;
      }
      
      
      this.canvas.renderAll();
      this.recordHistory();
    }
  }
    // Copy - Ctrl+C
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      this.copySelectedObjects();
    }

    // Cut - Ctrl+X
    if (event.ctrlKey && event.key === 'x') {
      event.preventDefault();
      this.copySelectedObjects();
      this.deleteSelected();
    }

    // Paste - Ctrl+V
    if (event.ctrlKey && event.key === 'v') {
      event.preventDefault();
      this.pasteSelectedObjects();
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
    this.canvas.on('object:added', (e: fabric.IEvent) => {
      this.saveState();
      
      // Initialize height tracking for new textboxes
      if (e.target && e.target.type === 'textbox') {
        const textbox = e.target as fabric.Textbox;
        const currentHeight = textbox.height || 50;
        
        (textbox as any).expandedHeight = currentHeight;
        (textbox as any).editStartHeight = currentHeight;
        (textbox as any).preEditHeight = currentHeight;
        
        console.log('Height tracking initialized for new textbox:', currentHeight);
      }
    });
    this.canvas.on('object:removed', () => this.saveState());
  }

  addShape(shapeConfig: ShapeConfig) {
    let shape;
    const commonProps = {
      left: 100,
      top: 100,
      fill: '#ffffff', // Changed from 'transparent' to white
      stroke: '#000',
      strokeWidth: 2,
      strokeUniform: true,
      objectCaching: false
    };

    switch (shapeConfig.type) {
      case 'text':
        const textboxWidth = 200;
        const textboxHeight = 50;
        shape = new fabric.Textbox('Enter Text', {
          left: (this.canvas.width! - textboxWidth) / 2,
          top: (this.canvas.height! - textboxHeight) / 2,
          fontSize: 24,
          width: textboxWidth,
          fontFamily: 'Arial',
          fill: '#333',
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          editable: true,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          splitByGrapheme: false,
          charSpacing: 0,
          lineHeight: 1,
          textAlign: 'left',
          breakWords: true,
          wordWrap: true
        });

        // Add custom scaling handler to prevent text distortion
        shape.on('scaling', (e: fabric.IEvent) => {
          const target = e.target as fabric.Textbox;
          if (target && target.type === 'textbox') {
            // Use Y-only scaling to prevent text distortion while allowing X scaling
            this.handleTextboxScalingYOnly(target);
          }
        });

        // Add handler for when scaling starts
        shape.on('scaling', (e: fabric.IEvent) => {
          const target = e.target as fabric.Textbox;
          if (target && target.type === 'textbox') {
            // Prevent text distortion during scaling
            target.set({
              lockScalingX: false,
              lockScalingY: false
            });
          }
        });


        // Add handler for text editing to preserve height
        shape.on('editing:entered', (e: fabric.IEvent) => {
          const target = e.target as fabric.Textbox;
          if (target && target.type === 'textbox') {
            // Store current height when entering edit mode
            (target as any).editStartHeight = target.height || 50;
          }
        });

   

        // Initialize height tracking properties for new textboxes
        (shape as any).expandedHeight = 50;
        (shape as any).editStartHeight = 50;
        (shape as any).preEditHeight = 50;

 

        // Add handler for keydown to catch all text changes
        shape.on('keydown', (e: fabric.IEvent) => {
          const target = e.target as fabric.Textbox;
          if (target && target.type === 'textbox') {
            // Store height before any text changes
            (target as any).preEditHeight = target.height || 50;
          }
        });


        // Add handler for when scaling is completed
        shape.on('scaled', (e: fabric.IEvent) => {
          const target = e.target as fabric.Textbox;
          if (target && target.type === 'textbox') {
            this.handleTextboxScalingYOnly(target);
          }
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
        shape = new fabric.Line([0, 0, 200, 0], {
          ...commonProps,
          strokeWidth: 2,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          perPixelTargetFind: false,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          strokeUniform: true,
          padding: 10,
          cornerSize: 10,
          borderScaleFactor: 2
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
    this.workspaceService.multimediaAlighment = false;
    if (shape) {
      this.canvas.add(shape);
      this.canvas.setActiveObject(shape);
      this.canvas.renderAll();
      // Enter editing mode and select all text
      if (shape instanceof fabric.Textbox) {
        shape.enterEditing();
        shape.selectAll();
      }
      const dropdownKeys = Object.keys(this.dropdowns);
      dropdownKeys.forEach((key) => {
        (this.dropdowns as any)[key].isOpen = false;
      });
      this.closeDropdowns();
      this.saveState();
      this.recordHistory();
    }
  }

  // Helper methods for shapes
  addText() {
    const text = new fabric.Textbox("Enter Text", { 
      left: 150, 
      top: 150, 
      fontSize: 24,
      width: 200,
      height: 50
    });
    
    // Initialize height tracking properties for new textboxes
    (text as any).expandedHeight = 50;
    (text as any).editStartHeight = 50;
    (text as any).preEditHeight = 50;
    
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
    this.showTableDialog = true;
    this.tableConfig = {
      rows: 3,
      columns: 3
    };
  }

  cancelTableDialog() {
    this.showTableDialog = false;
    this.tableErrors = {
      rows: '',
      columns: ''
    };
  }

  validateTableInput(field: 'rows' | 'columns', event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
      this.tableErrors[field] = 'Please enter a valid number';
      return;
    }

    if (value < 1) {
      this.tableErrors[field] = field.charAt(0).toUpperCase() + field.slice(1) +  ' values must be at least 1';
    } else if (value > 10) {
      this.tableErrors[field] = field.charAt(0).toUpperCase() + field.slice(1) + ' values can\'t exceed 10';
    } else {
      this.tableErrors[field] = '';
    }
  }

  hasTableErrors(): boolean {
    return !!this.tableErrors.rows || !!this.tableErrors.columns;
  }

  confirmTableDialog() {
    if (this.hasTableErrors()) {
      return;
    }
    const rows = Math.min(Math.max(this.tableConfig.rows, 1), 10);
    const columns = Math.min(Math.max(this.tableConfig.columns, 1), 10);

    const table = this.createTable({
      rows,
      columns,
      cellWidth: 100,
      cellHeight: 50,
      backgroundColor: 'white',
      borderColor: '#000'
    });

    this.canvas.add(table);
    this.canvas.renderAll();
    this.recordHistory();
    this.showTableDialog = false;
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

    // For pentagon, rotate so base is at the bottom (point at the top)
    let angleOffset = 0;
    if (sides === 5) {
      angleOffset = Math.PI / 2 - Math.PI / 5;
    }

    for (let i = 0; i < sides; i++) {
      const angle = angleOffset + (i * 2 * Math.PI) / sides;
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
    const radius = options.radius || 40;
  
    // Teardrop original points
    const points = [
      { x: 0, y: radius },
      { x: radius, y: radius },
      { x: radius, y: -radius / 2 },
      { x: 0, y: -radius },
      { x: -radius, y: -radius / 2 },
      { x: -radius, y: radius },
      { x: 0, y: radius }
    ];
  
    // Rotation helper
    const rotatePoint = (x: number, y: number, angleDeg: number) => {
      const angle = (angleDeg * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
      };
    };
  
    // Rotate all points
    const rotated = points.map(p => rotatePoint(p.x, p.y, 40)); 
  
    // Construct path string
    const path = `
      M ${rotated[0].x} ${rotated[0].y}
      C ${rotated[1].x} ${rotated[1].y}, ${rotated[2].x} ${rotated[2].y}, ${rotated[3].x} ${rotated[3].y}
      C ${rotated[4].x} ${rotated[4].y}, ${rotated[5].x} ${rotated[5].y}, ${rotated[6].x} ${rotated[6].y}
      Z
    `;
  
    return new fabric.Path(path, {
      left: options.left || 100,
      top: (options.top || 100) + 80,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true,
      hasRotatingPoint: false
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
      left: options.left +50|| 100,
      top: options.top + 100 || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
      objectCaching: false,
      selectable: true,
      angle: 210 
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
                Z`; // Ensure this path is closed by adding a Z at the end
  
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
    const width = 120;
    const height =  70;
    const thickness = options.thickness || width * 0.4;
  
    // Define chevron points (right-facing ">" shape)
    const pathData = `
      M 0 0
      L ${width - thickness} 0
      L ${width} ${height / 2}
      L ${width - thickness} ${height}
      L 0 ${height}
      L ${thickness} ${height / 2}
      Z
    `;
  
    return new fabric.Path(pathData, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 1,
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
        fill: options.fill || '#ffffff',
        stroke: options.stroke || '#000000',
        strokeWidth: options.strokeWidth || 2,
        strokeLineJoin: 'miter',
        strokeMiterLimit: 10,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        perPixelTargetFind: true
      }
    );

    // Create a group with the path
    const group = new fabric.Group([path], {
      left: options.left || 100,
      top: options.top || 100,
      selectable: true,
      evented: true,
      hasBorders: true,
      hasControls: true,
      perPixelTargetFind: true,
      originX: 'left',
      originY: 'top'
    });

    // Ensure the group is properly interactive
    group.setControlsVisibility({
      mt: true, // middle top
      mb: true, // middle bottom
      ml: true, // middle left
      mr: true, // middle right
      bl: true, // bottom left
      br: true, // bottom right
      tl: true, // top left
      tr: true  // top right
    });

    return group;
  }






  private setupTextSelectionHandler() {
    
    this.canvas.on('text:selection:changed', (e: fabric.IEvent) => {
      this.workspaceService.multimediaAlighment = true;
      const textObject = e.target as fabric.IText;
      if (textObject) {
        const start = textObject.selectionStart || 0;
        const end = textObject.selectionEnd || 0;
        
        // Store the selected styles
        if (start !== end) {
          const styles = textObject.getSelectionStyles(start, end);
          if (styles.length > 0) {
            this.selectedStyles = styles[0];
          }
        }
        this.selectedTextObject = textObject;
        this.showTextToolbar = true;
        this.updateTextPropertiesFromSelection(textObject);
        
        // If the text object is part of a group, let the group handle the selection
        if (textObject.group) {
          textObject.set({
            hasBorders: false,
            hasControls: false,
            selectable: true,
            evented: true
          });
        } else {
          // For standalone text objects, show the selection outline
          textObject.set({
            hasBorders: true,
            hasControls: true,
            selectable: true,
            evented: true,
            borderColor: '#44aaff',
            borderScaleFactor: 2,
            cornerColor: '#44aaff',
            cornerSize: 12,
            cornerStyle: 'circle',
            transparentCorners: false
          });
        }
        this.canvas.renderAll();
      }
    });
    this.canvas.on('selection:created', (e: fabric.IEvent) => {
      const textObject = e.target as fabric.IText;
      if (textObject && textObject.type === 'i-text') {
        // Ensure visible outline
        this.selectedTextObject = textObject;
        this.showTextToolbar = true;  // Show toolbar when text is selected
        this.updateTextPropertiesFromSelection(textObject);
      } else {
        this.showTextToolbar = false;  // Hide toolbar for non-text objects
        this.selectedTextObject = null;
      }
    });

    this.canvas.on('selection:cleared', () => {
      // Check if we need to call updateContent for the current textbox
      if (this.currentActiveTextbox && (this.currentActiveTextbox as any).needsUpdateContent) {
        this.updateContent();
        (this.currentActiveTextbox as any).needsUpdateContent = false;
      }
      
      this.showTextToolbar = false;  // Hide toolbar when nothing is selected
      this.selectedTextObject = null;
      this.currentActiveTextbox = null;
    });

    // Handle clicking outside text
    this.canvas.on('mouse:down', (options) => {
      this.hideAlignmentGuides(); 
      this.workspaceService.multimediaAlighment = false;
      const target = options.target;
      
      // Check if we need to call updateContent for the previous textbox

      
      if (target && (target.type === 'textbox' || target.type === 'i-text')) {
        // If text is part of a group, bring it to front for editing
        if (target.group) {
          target.group.bringToFront();
        }
        
        // Update current active textbox
        this.currentActiveTextbox = target as fabric.IText;
        this.selectedTextObject = target as fabric.IText;
        this.showTextToolbar = true;
        this.updateTextPropertiesFromSelection(this.selectedTextObject);
      } else {
        if (!options.target || (options.target.type !== 'textbox' && options.target.type !== 'i-text')) {
          
          this.showTextToolbar = false;
          this.selectedTextObject = null;
          this.currentActiveTextbox = null;
        }
      }
      this.recordHistory();
    });
    // Add event listener for text:changed event
    this.canvas.on('text:changed', (e: fabric.IEvent) => {
      const textObject = e.target as fabric.IText;
      if (textObject) {
        this.handleTextDeletion(textObject);
        
        // Preserve height during text changes for textboxes
        if (textObject.type === 'textbox') {
          const currentHeight = textObject.height || 50;
          const editStartHeight = (textObject as any).editStartHeight || currentHeight;
          
          // Always preserve the higher height during editing
          const preservedHeight = Math.max(currentHeight, editStartHeight);
          
          if (preservedHeight > 50) {
            (textObject as any).expandedHeight = preservedHeight;
            
            // Update height if it's different to maintain consistency
            if (textObject.height !== preservedHeight) {
              textObject.set({ height: preservedHeight });
              textObject.setCoords();
              this.canvas.requestRenderAll();
            }
          }
        }
      }
    });

    // Add event listener for text:editing:entered to ensure proper cursor handling
    this.canvas.on('text:editing:entered', (e: fabric.IEvent) => {
      const textObject = e.target as fabric.IText;
      if (textObject) {
        // Set current active textbox when editing starts
        this.currentActiveTextbox = textObject;
        
        // Restore list type if it exists in the text content
        this.restoreListTypeFromText(textObject);
        
        // Store the height when editing starts to preserve it
        if (textObject.type === 'textbox') {
          const currentHeight = textObject.height || 50;
          (textObject as any).editStartHeight = currentHeight;
          (textObject as any).preEditHeight = currentHeight;
          
          // If we have an expanded height, use that instead
          if ((textObject as any).expandedHeight && (textObject as any).expandedHeight > currentHeight) {
            (textObject as any).editStartHeight = (textObject as any).expandedHeight;
            (textObject as any).preEditHeight = (textObject as any).expandedHeight;
          }
          
          console.log('Editing started - Height preserved:', (textObject as any).editStartHeight);
        }
        
        // Ensure cursor position is properly set
        const currentPos = textObject.selectionStart || 0;
        textObject.selectionStart = Math.min(currentPos, textObject.text.length);
        textObject.selectionEnd = Math.min(currentPos, textObject.text.length);
        
        // Add keyboard event listener for Enter key handling in lists
        this.setupTextKeyboardEvents(textObject);
      }
    });

    // Add event listener for text:editing:exited to cleanup event listeners
    this.canvas.on('text:editing:exited', (e: fabric.IEvent) => {
      const textObject = e.target as fabric.IText;
      if (textObject) {
        // Preserve the final height when editing ends
        if (textObject.type === 'textbox') {
          const finalHeight = textObject.height || 50;
          const editStartHeight = (textObject as any).editStartHeight || finalHeight;
          
          // Use the higher of the two heights to preserve expansion
          const preservedHeight = Math.max(finalHeight, editStartHeight);
          
          if (preservedHeight > 50) {
            (textObject as any).expandedHeight = preservedHeight;
            (textObject as any).preEditHeight = preservedHeight;
            
            // Ensure the height is set to the preserved value
            if (textObject.height !== preservedHeight) {
              textObject.set({ height: preservedHeight });
              textObject.setCoords();
              this.canvas.requestRenderAll();
            }
            
            console.log('Editing ended - Final height preserved:', preservedHeight);
          }
        }
        
        this.cleanupTextKeyboardEvents(textObject);
      }
    });
  }

  private handleTextDeletion(textObject: fabric.IText) {
    const text = textObject.text;
    const cursorPosition = textObject.selectionStart || 0;
    const selectionLength = (textObject.selectionEnd || 0) - cursorPosition;

    if (textObject._textBeforeEdit && textObject._textBeforeEdit.length > text.length) {
      
      // If we have stored selected styles, preserve them more efficiently
      if (this.selectedStyles) {
        
        // Store the current styles before applying new ones
        const currentStyles = textObject.styles ? { ...textObject.styles } : null;
        
        // Apply the stored styles to the entire text object (object level)
        textObject.set({
          fill: this.selectedStyles.fill,
          stroke: this.selectedStyles.stroke,
          fontSize: textObject.get('fontSize'), // Keep existing font size
          fontFamily: textObject.get('fontFamily'), // Keep existing font family
          fontWeight: this.selectedStyles.fontWeight || 'normal',
          fontStyle: this.selectedStyles.fontStyle || 'normal',
          underline: this.selectedStyles.underline || false,
          linethrough: this.selectedStyles.linethrough || false,
          textAlign: textObject.get('textAlign') // Keep existing alignment
        });

        // Restore character-level styles if they exist, otherwise apply stored styles
        if (currentStyles && Object.keys(currentStyles).length > 0) {
          // Preserve existing character styles
          textObject.styles = currentStyles;
        } else {
          // Only apply to first character to avoid performance issues
          textObject.setSelectionStyles(this.selectedStyles, 0, 1);
        }
        
        this.canvas.renderAll();
      }
    }
  }

  private setupTextKeyboardEvents(textObject: fabric.IText) {
    // Get the hidden input element that Fabric.js uses for text editing
    const hiddenInput = textObject.hiddenTextarea;
    
    if (hiddenInput) {
      // Remove any existing event listeners to prevent duplicates
      hiddenInput.removeEventListener('keydown', this.handleTextKeyDown);
      
      // Add new event listener for keydown
      hiddenInput.addEventListener('keydown', this.handleTextKeyDown.bind(this, textObject));
    } else {
      // If hiddenTextarea is not immediately available, try again after a short delay
      setTimeout(() => {
        const delayedInput = textObject.hiddenTextarea;
        if (delayedInput) {
          delayedInput.removeEventListener('keydown', this.handleTextKeyDown);
          delayedInput.addEventListener('keydown', this.handleTextKeyDown.bind(this, textObject));
        }
      }, 100);
    }
  }

  private cleanupTextKeyboardEvents(textObject: fabric.IText) {
    // Remove keyboard event listener when text editing ends
    const hiddenInput = textObject.hiddenTextarea;
    if (hiddenInput) {
      hiddenInput.removeEventListener('keydown', this.handleTextKeyDown);
    }
  }

  private handleTextKeyDown(textObject: fabric.IText, e: KeyboardEvent) {
    const listType = textObject.get('listType');
    const listPrefix = textObject.get('listPrefix') || '';
    
    if (!listType || !listPrefix) {
      return; // Not a list type, no special handling
    }
    
  
    
    // Check if backspace was pressed and list prefix was removed
    if (e.key === 'Backspace') {
     if (textObject.text.trim().length === 0) {
      textObject.set('listType', null);
      textObject.set('listPrefix', '');
      return;
    }
    }
    
    // Handle Enter key for list formatting
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const cursorPos = textObject.selectionStart || 0;
      const textBeforeCursor = textObject.text.slice(0, cursorPos);
      const textAfterCursor = textObject.text.slice(cursorPos);
      
              // Count existing lines to determine the next number/letter
        const lines = textObject.text.split('\n');
        const currentLineIndex = this.getCurrentLineIndex(textObject.text, cursorPos);
        
        // Generate next prefix based on the current line count and type
        let nextPrefix = '';
        if (listType === 'number') {
          // For numbered lists, use the line count + 1
          const nextNumber = currentLineIndex + 1;
          nextPrefix = `${nextNumber}. `;
        } else if (listType === 'letter') {
          // For letter lists, calculate the next letter based on line count
          const nextLetter = String.fromCharCode(97 + currentLineIndex); // 97 = 'a' in ASCII
          nextPrefix = `${nextLetter}. `;
        } else if (listType === 'roman') {
          // For Roman numeral lists, convert line count to Roman
          const nextNumber = currentLineIndex + 1;
          nextPrefix = `${this.toRoman(nextNumber)}. `;
        } else if (listType === 'bullet') {
          // For bullet lists, just use the bullet symbol
          nextPrefix = '• ';
        }
        
        // Build new text with prefix
        const newText = textBeforeCursor + '\n' + nextPrefix + textAfterCursor;
        
        // Renumber all subsequent lines if this is a numbered list
        if (listType === 'number' || listType === 'letter' || listType === 'roman') {
          const allLines = newText.split('\n');
          let currentNumber = 1;
          
          for (let i = 0; i < allLines.length; i++) {
            const line = allLines[i];
            if (line.trim() && (line.includes('. ') || line.includes('• '))) {
              // This is a list item line
              if (listType === 'number') {
                allLines[i] = line.replace(/^\d+\.\s*/, `${currentNumber}. `);
              } else if (listType === 'letter') {
                const letter = String.fromCharCode(96 + currentNumber); // 96 = 'a' - 1
                allLines[i] = line.replace(/^[a-zA-Z]\.\s*/, `${letter}. `);
              } else if (listType === 'roman') {
                const roman = this.toRoman(currentNumber);
                allLines[i] = line.replace(/^[IVXLCDM]+\.\s*/, `${roman}. `);
              }
              currentNumber++;
            }
          }
          
          // Update the text with renumbered lines
          const renumberedText = allLines.join('\n');
          textObject.set('text', renumberedText);
          
          // Adjust cursor position for the new text length
          const cursorOffset = renumberedText.length - newText.length;
          const adjustedCursorPos = cursorPos + 1 + nextPrefix.length + cursorOffset;
          textObject.selectionStart = adjustedCursorPos;
          textObject.selectionEnd = adjustedCursorPos;
        } else {
          // For bullet lists, just set the text normally
          textObject.set('text', newText);
          
          // Move cursor after prefix
          const newCursorPos = cursorPos + 1 + nextPrefix.length;
          textObject.selectionStart = newCursorPos;
          textObject.selectionEnd = newCursorPos;
        }
        
        // Apply current text properties to the new line (prefix + text after cursor)
        const newLineStart = cursorPos + 1; // Start of new line
        const newLineEnd = textObject.text.length; // End of new line
        
        // Get styles from the current line (if it exists)
        let currentLineStyles = null;
        if (textObject.styles && textObject.styles[currentLineIndex]) {
          // Get the first character style from current line as reference
          const firstCharIndex = Object.keys(textObject.styles[currentLineIndex])[0];
          if (firstCharIndex) {
            currentLineStyles = textObject.styles[currentLineIndex][firstCharIndex];
          }
        }
        
        // If no current line styles, try to get from previous line
        if (!currentLineStyles && currentLineIndex > 0 && textObject.styles && textObject.styles[currentLineIndex - 1]) {
          const prevLineFirstChar = Object.keys(textObject.styles[currentLineIndex - 1])[0];
          if (prevLineFirstChar) {
            currentLineStyles = textObject.styles[currentLineIndex - 1][prevLineFirstChar];
          }
        }
        
        // Fallback to text object properties if no styles found
        if (!currentLineStyles) {
          currentLineStyles = {
            fontSize: textObject.get('fontSize') || this.currentFontSize,
            fontFamily: textObject.get('fontFamily') || this.currentFontFamily,
            fill: textObject.get('fill') || this.currentColor,
            fontWeight: textObject.get('fontWeight') || 'normal',
            fontStyle: textObject.get('fontStyle') || 'normal',
            underline: textObject.get('underline') || false,
            linethrough: textObject.get('linethrough') || false
          };
        }
        
        // Apply complete styles to maintain full consistency
        if (textObject.styles && textObject.styles[currentLineIndex - 1]) {
          // Get styles from the previous line to maintain consistency
          const prevLineStyles = textObject.styles[currentLineIndex - 1];
          const firstCharKey = Object.keys(prevLineStyles)[0];
          if (firstCharKey && prevLineStyles[firstCharKey]) {
            const prevStyles = prevLineStyles[firstCharKey];
            // Apply all style properties to maintain complete consistency
            textObject.setSelectionStyles({
              fontSize: prevStyles.fontSize || textObject.get('fontSize'),
              fontFamily: prevStyles.fontFamily || textObject.get('fontFamily'),
              fill: prevStyles.fill || textObject.get('fill'),
              fontWeight: prevStyles.fontWeight || textObject.get('fontWeight'),
              fontStyle: prevStyles.fontStyle || textObject.get('fontStyle'),
              underline: prevStyles.underline || textObject.get('underline'),
              linethrough: prevStyles.linethrough || textObject.get('linethrough'),
              textAlign: textObject.get('textAlign')
            }, newLineStart, newLineStart + nextPrefix.length);
          }
        }
      
      textObject.canvas?.renderAll();
      
      // Update the hidden input value to match
      if (textObject.hiddenTextarea) {
        textObject.hiddenTextarea.value = textObject.text;
        const currentCursorPos = textObject.selectionStart || 0;
        textObject.hiddenTextarea.setSelectionRange(currentCursorPos, currentCursorPos);
      }
    }
  }

  private getCurrentLineIndex(text: string, cursorPosition: number): number {
    // Count the number of lines before the cursor position
    const textBeforeCursor = text.slice(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    return lines.length;
  }
  
  private restoreListTypeFromText(textObject: fabric.IText) {
    // Check if text object already has list type set
    if (textObject.get('listType')) {
      return; // Already has list type, no need to restore
    }
    
    const text = textObject.text;
    if (!text || text.trim().length === 0) {
      return; // No text to analyze
    }
    
    const lines = text.split('\n');
    const firstLine = lines[0].trim();
    
    // Detect list type from the first line
    if (firstLine.match(/^\d+\.\s/)) {
      // Numbered list (e.g., "1. ", "2. ", etc.)
      textObject.set('listType', 'number');
      textObject.set('listPrefix', firstLine.match(/^(\d+\.\s)/)?.[1] || '1. ');
    } else if (firstLine.match(/^[a-zA-Z]\.\s/)) {
      // Letter list (e.g., "a. ", "b. ", etc.)
      textObject.set('listType', 'letter');
      textObject.set('listPrefix', firstLine.match(/^([a-zA-Z]\.\s)/)?.[1] || 'a. ');
    } else if (firstLine.match(/^[IVXLCDM]+\.\s/)) {
      // Roman numeral list (e.g., "I. ", "II. ", etc.)
      textObject.set('listType', 'roman');
      textObject.set('listPrefix', firstLine.match(/^([IVXLCDM]+\.\s)/)?.[1] || 'I. ');
    } else if (firstLine.match(/^[•\-\*]\s/)) {
      // Bullet list (e.g., "• ", "- ", "* ")
      textObject.set('listType', 'bullet');
      textObject.set('listPrefix', firstLine.match(/^([•\-\*]\s)/)?.[1] || '• ');
    }
  }
  
  private handleTextChange(textObject: fabric.IText, e?: KeyboardEvent) {
    const listType = textObject.get('listType'); // e.g. 'bullet', 'number', 'letter', etc.
    const listPrefix = textObject.get('listPrefix') || ''; // e.g. '• ', '1. ', 'a. '
  
    if (!listType || !listPrefix) {
      return; // Not a list type, no special handling
    }
  
    // Only handle Enter key
    if (e && e.key === 'Enter') {
      e.preventDefault();
  
      const cursorPos = textObject.selectionStart || 0;
      const textBeforeCursor = textObject.text.slice(0, cursorPos);
      const textAfterCursor = textObject.text.slice(cursorPos);
  
      // Find start of current line
      const lastNewLineIndex = textBeforeCursor.lastIndexOf('\n');
      const lineStart = lastNewLineIndex === -1 ? 0 : lastNewLineIndex + 1;
      const currentLineText = textBeforeCursor.slice(lineStart);
  
      // Generate next prefix for numbered/letter lists
      let nextPrefix = listPrefix;
      if (listType === 'number') {
        const currentNumber = parseInt(listPrefix.replace(/\D/g, ''), 10) || 1;
        nextPrefix = `${currentNumber + 1}. `;
      }
      if (listType === 'letter') {
        const currentLetter = listPrefix.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
        nextPrefix = `${nextLetter}. `;
      }
  
      // Build new text with prefix
      const newText =
        textBeforeCursor +
        '\n' +
        nextPrefix +
        textAfterCursor;
  
      textObject.set('text', newText);
  
      // Move cursor after prefix
      const newCursorPos = cursorPos + 1 + nextPrefix.length;
      textObject.selectionStart = newCursorPos;
      textObject.selectionEnd = newCursorPos;
  
      textObject.canvas?.renderAll();
    }
  }
  
  
  // Helper method to convert Roman numerals to numbers
  private fromRoman(roman: string): number {
    const romanNumerals: { [key: string]: number } = {
      'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
    };
    
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
      const current = romanNumerals[roman[i]];
      const next = romanNumerals[roman[i + 1]];
      
      if (next && current < next) {
        result -= current;
      } else {
        result += current;
      }
    }
    return result;
  }

  private updateTextPropertiesFromSelection(textObject: fabric.IText) {
    const start = textObject.selectionStart || 0;
    const end = textObject.selectionEnd || 0;


    // Get default object-level properties
    const defaultFontFamily = textObject.get('fontFamily') as string || 'Arial';
    const defaultFontSize = textObject.get('fontSize') as number || 14;
    const defaultColor = textObject.get('fill') as string || '#000000';
    const defaultBackgroundColor = textObject.get('backgroundColor') as string || '#ffffff';
    const defaultBold = textObject.get('fontWeight') === 'bold';
    const defaultItalic = textObject.get('fontStyle') === 'italic';
    const defaultUnderline = textObject.get('underline') || false;
    const defaultStrike = textObject.get('linethrough') || false;
    var defaultAlignment = textObject.get('textAlign') as string || 'left';

    // Update alignment icon
    this.currentAlignment = defaultAlignment;
    if(defaultAlignment === 'justify-left'){
      defaultAlignment = 'justify';
    }
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

        // Update background color
        const sameBackgroundColor = styles.every(style => 
          (style.backgroundColor || defaultBackgroundColor) === (styles[0].backgroundColor || defaultBackgroundColor));
        this.currentBackgroundColor = sameBackgroundColor ? 
          (styles[0].backgroundColor as string || defaultBackgroundColor) : defaultBackgroundColor;
      }
    } else {
      // If no selection, use the default object properties
      this.currentBold = defaultBold;
      this.currentItalic = defaultItalic;
      this.currentUnderline = defaultUnderline;
      this.currentStrike = defaultStrike;
      this.currentBackgroundColor = defaultBackgroundColor;
    }

    // Update selectedStyles to ensure new text inherits the current styles
    this.selectedStyles = {
      fontFamily: this.currentFontFamily,
      fontSize: this.currentFontSize,
      fill: this.currentColor,
      backgroundColor: this.currentBackgroundColor,
      fontWeight: this.currentBold ? 'bold' : 'normal',
      fontStyle: this.currentItalic ? 'italic' : 'normal',
      underline: this.currentUnderline,
      linethrough: this.currentStrike
    };

    this.changeDetectorRef.detectChanges();
    this.positionToolbar();
    this.closeDropdowns();
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
    
    // Update selectedStyles to ensure new text inherits the current font family
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.fontFamily = fontFamily;
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
    
    // Update selectedStyles to ensure new text inherits the current font size
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.fontSize = size;
  }

  setTextColor(color: string) {
    this.currentColor = color;
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        // No selection, set for the whole object
        this.selectedTextObject.set('fill', color);
        this.selectedTextObject.set('stroke', color);
      } else {
        // Apply to selection only
        this.selectedTextObject.setSelectionStyles({ fill: color, stroke: color }, start, end);
      }
      this.canvas.renderAll();
    }
    
    // Update selectedStyles to ensure new text inherits the current color
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.fill = color;
    this.selectedStyles.stroke = color;
  }

  toggleBold() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        // No selection, set for the whole object
        const currentWeight = this.selectedTextObject.get('fontWeight');
        this.selectedTextObject.set('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
      } else {
        // Apply to selection only
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
    
    // Update selectedStyles to ensure new text inherits the current bold state
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.fontWeight = this.currentBold ? 'bold' : 'normal';
  }

  toggleItalic() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        // No selection, set for the whole object
        const currentStyle = this.selectedTextObject.get('fontStyle');
        this.selectedTextObject.set('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
      } else {
        // Apply to selection only
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
    
    // Update selectedStyles to ensure new text inherits the current italic state
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.fontStyle = this.currentItalic ? 'italic' : 'normal';
  }

  toggleUnderline() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        // No selection, set for the whole object
        const currentUnderline = this.selectedTextObject.get('underline');
        this.selectedTextObject.set('underline', !currentUnderline);
      } else {
        // Apply to selection only
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
    
    // Update selectedStyles to ensure new text inherits the current underline state
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.underline = this.currentUnderline;
  }

  toggleStrikethrough() {
    if (this.selectedTextObject) {
      const start = this.selectedTextObject.selectionStart || 0;
      const end = this.selectedTextObject.selectionEnd || 0;

      if (start === end) {
        // No selection, set for the whole object
        const currentStrike = this.selectedTextObject.get('linethrough');
        this.selectedTextObject.set('linethrough', !currentStrike);
      } else {
        // Apply to selection only
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
    
    // Update selectedStyles to ensure new text inherits the current strikethrough state
    if (!this.selectedStyles) {
      this.selectedStyles = {};
    }
    this.selectedStyles.linethrough = this.currentStrike;
  }

  setTextAlign(align: string): void {
    if (this.selectedTextObject && (align === 'left' || align === 'center' || align === 'right' || align === 'justify-left')) {
      this.selectedTextObject.set('textAlign', align as fabric.TextAlign);
      this.currentAlignment = align;
      if(align === 'justify-left'){
        align = 'justify';
      }
      this.currentAlignmentIcon = `/assets/multimedia-icons/multimedia-text-align-${align}.svg`;
      this.showAlignmentDropdown = false;
      this.canvas.renderAll();
    }
  }

  createBulletList(type: string) {
    if (!this.selectedTextObject) return;

    const text = this.selectedTextObject.text;
    const lines = text.split('\n');

    // All possible list prefix patterns
    const allPrefixPatterns = [
      /^\s*•\s*/,
      /^\s*\d+\.\s*/,
      /^\s*[a-zA-Z]\.\s*/,
      /^\s*[IVXLCDM]+\.\s*/,
      /^\s*→\s*/,
      /^\s*✓\s*/
    ];

    // Current type's pattern
    const prefixPattern = {
      bullet: /^\s*•\s*/,
      number: /^\s*\d+\.\s*/,
      letter: /^\s*[a-zA-Z]\.\s*/,
      roman: /^\s*[IVXLCDM]+\.\s*/,
      arrow: /^\s*→\s*/,
      check: /^\s*✓\s*/
    }[type];

    // Remove any existing list prefix from all lines
    const cleanedLines = lines.map(line => {
      let cleaned = line;
      allPrefixPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
      });
      return cleaned;
    });

    // Detect if all lines already have the current list prefix
    const allHaveCurrentPrefix = lines.every(line => prefixPattern.test(line));

    let newLines: string[];

    if (allHaveCurrentPrefix) {
      // REMOVE the list formatting
      newLines = cleanedLines;
      this.selectedTextObject.set('listType', null);
      this.selectedTextObject.set('listPrefix', null);
    } else {
      // APPLY the new list formatting
      switch (type) {
        case 'bullet':
          newLines = cleanedLines.map(line => `• ${line}`);
          break;
        case 'number':
          newLines = cleanedLines.map((line, i) => `${i + 1}. ${line}`);
          break;
        case 'letter':
          newLines = cleanedLines.map((line, i) => `${String.fromCharCode(97 + i)}. ${line}`);
          break;
        case 'roman':
          newLines = cleanedLines.map((line, i) => `${this.toRoman(i + 1)}. ${line}`);
          break;
        case 'arrow':
          newLines = cleanedLines.map(line => `→ ${line}`);
          break;
        case 'check':
          newLines = cleanedLines.map(line => `✓ ${line}`);
          break;
        default:
          return;
      }
      this.selectedTextObject.set('listType', type);
      this.selectedTextObject.set('listPrefix', this.getPrefixForType(type));
    }

    // Save styles for each line before changing text
    const lineStyles: any[][] = lines.map((line, lineIdx) => {
      const startIdx = lines.slice(0, lineIdx).reduce((sum, l) => sum + l.length + 1, 0); // +1 for \n
      return Array.from({ length: line.length }, (_, i) =>
        this.selectedTextObject.getSelectionStyles(startIdx + i, startIdx + i + 1)[0] || {}
      );
    });

    this.selectedTextObject.text = newLines.join('\n');


    // Re-apply styles to each line after prefix
    let charIdx = 0;
    for (let lineIdx = 0; lineIdx < newLines.length; lineIdx++) {
      const prefixLen = newLines[lineIdx].length - cleanedLines[lineIdx].length;
      // Apply style to prefix (use first char style of original line)
      for (let i = 0; i < prefixLen; i++) {
        this.selectedTextObject.setSelectionStyles(lineStyles[lineIdx][0] || {}, charIdx + i, charIdx + i + 1);
      }
      // Apply original styles to the rest of the line, or extend with last style if needed
      const originalStyles = lineStyles[lineIdx];
      const newContentLen = newLines[lineIdx].length - prefixLen;
      for (let i = 0; i < newContentLen; i++) {
        let style = originalStyles[i] || originalStyles[originalStyles.length - 1] || lineStyles[lineIdx][0] || {};
        this.selectedTextObject.setSelectionStyles(style, charIdx + prefixLen + i, charIdx + prefixLen + i + 1);
      }

      charIdx += newLines[lineIdx].length + 1; // +1 for \n
    }

    // Ensure Fabric.js styles object is filled for every line and every character
    const linesArr = this.selectedTextObject.text.split('\n');
    if (!this.selectedTextObject.styles) this.selectedTextObject.styles = {};
    for (let lineIdx = 0; lineIdx < linesArr.length; lineIdx++) {
      if (!this.selectedTextObject.styles[lineIdx]) this.selectedTextObject.styles[lineIdx] = {};
      for (let charIdx = 0; charIdx < linesArr[lineIdx].length; charIdx++) {
        // If style is missing, use last known style or fallback
        let style = this.selectedTextObject.getSelectionStyles(
          this.selectedTextObject.text
            .split('\n')
            .slice(0, lineIdx)
            .reduce((sum, l) => sum + l.length + 1, 0) + charIdx,
          this.selectedTextObject.text
            .split('\n')
            .slice(0, lineIdx)
            .reduce((sum, l) => sum + l.length + 1, 0) + charIdx + 1
        )[0];
        if (!style || Object.keys(style).length === 0) {
          // fallback to first style or default
          style = lineStyles[lineIdx]?.[0] || { fill: this.selectedTextObject.fill, stroke: this.selectedTextObject.stroke };
        }
        this.selectedTextObject.styles[lineIdx][charIdx] = style;
      }
    }

    this.canvas.setActiveObject(this.selectedTextObject);
    // if(this.currentFontSize !==this.selectedTextObject.get('fontSize')){
    //   this.selectedTextObject.set('fontSize', this.currentFontSize); // Or your default
    // }

    this.selectedTextObject.exitEditing();
    this.canvas.renderAll();
  }

  private getPrefixForType(type: string): string {
    switch (type) {
      case 'bullet':
        return '• ';
      case 'number':
        return '1. ';
      case 'letter':
        return 'a. ';
      case 'roman':
        return 'I. ';
      case 'arrow':
        return '→ ';
      case 'check':
        return '✓ ';
      default:
        return '';
    }
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
    this.showListDropdown = false;
    this.showLetterSpaceDropdown = false;
  }
  toggleListDropdown(event: Event) {
    event.stopPropagation();
    this.showListDropdown = !this.showListDropdown;
    this.showAlignmentDropdown = false;
    this.showLetterSpaceDropdown = false;
  }
  toggleLetterSpaceDropdown(event: Event) {
    event.stopPropagation();
    this.showLetterSpaceDropdown = !this.showLetterSpaceDropdown;
    this.showAlignmentDropdown = false;
    this.showListDropdown = false;
  }
  closeDropdowns() {
    this.showAlignmentDropdown = false;
    this.showListDropdown = false;
    this.showLetterSpaceDropdown = false;
  }
  // Add click handler to close dropdown when clicking outside
  @HostListener('document:click')
  closeDropdown() {
    this.showAlignmentDropdown = false;
    this.showContextMenu = false;
  }

  positionToolbar() {
    if (!this.selectedTextObject || !this.textToolbar) {
      // Default position at top if no object is selected
      const toolbarElement = this.textToolbar.nativeElement;
      toolbarElement.style.left = '10px';
      toolbarElement.style.top = '0px';
      return;
    }

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
    
    // Calculate available space above and below
    const spaceAbove = objectTop - window.scrollY;
    var spaceBelow = window.innerHeight - (objectTop + objectRect.height * zoom);
    
    // Position horizontally
    let left = 10; // Fixed left position
    
    // Position vertically based on available space
    let top;
    const gap = 3; // Gap between object and toolbar

 

    // Check if the text object is a heading (you can adjust this condition based on your heading criteria)
    const isHeading = this.selectedTextObject.fontSize && this.selectedTextObject.fontSize >= 24;

    if (isHeading) {
      // Position below the object for headings
      top = objectTop + (objectRect.height * zoom) + gap;
      toolbarElement.classList.remove('position-top');
      toolbarElement.classList.add('position-bottom');
      top = Math.max(0, Math.min(top, window.innerHeight - toolbarHeight - 8));
    } else {
      // Position above the object for non-headings
      top = Math.max(0, objectTop - toolbarHeight - gap);
      toolbarElement.classList.remove('position-bottom');
      toolbarElement.classList.add('position-top');
    }
    const space = 400;
    if(spaceBelow<=space){
      top = 0;
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
    this.imageLoaded = true;
    const isGif = url.toLowerCase().includes('.gif') || url.toLowerCase().includes('media.tenor.com');
    if (isGif) {
      const gif1 = new Image();      
      // Set source to the GIF URLs
      gif1.src = url;  // Replace with your actual GIF path
      
      // Once loaded, add them to the canvas as Fabric.Image
      gif1.onload = () => {
        const fabricGif1 = new fabric.Image(gif1, {
          left: 50,
          top: 50,
          originX: 'center',
          originY: 'center',
          objectCaching: false,
          selectable: true
        });
        this.canvas.add(fabricGif1);
        this.canvas.setActiveObject(fabricGif1);
        this.canvas.renderAll();
        this.recordHistory();
        this.imageLoaded = false;
      };
    } else {
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
        this.imageLoaded = false;
      }, (error) => {
        console.error('Error loading image:', error);
        alert('Failed to load image from URL');
      });
    }
   
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
      this.selectedShapes = []; // Clear the selected shapes array
    });
  }

  private handleShapeSelection(e: any) {
    // Get all currently selected objects from canvas, not just the newly selected ones
    const allSelectedObjects = this.canvas.getActiveObjects() || [];
    
    // Restrict selection for default heading/content groups by rect/textbox containment, not text or name
    const isDefaultHeadingOrContentGroup = (obj: any) => {
      if (obj.type !== 'group' || !obj._objects || obj._objects.length !== 2) return false;
      const [a, b] = obj._objects;
      // Find the rect and textbox, regardless of order
      const rect = a.type === 'rect' ? a : b.type === 'rect' ? b : null;
      const textbox = a.type === 'textbox' ? a : b.type === 'textbox' ? b : null;
      if (!rect || !textbox) return false;
      // Check if the textbox is inside the rect (by position and size)
      return (
        textbox.left >= rect.left &&
        textbox.top >= rect.top &&
        textbox.left + textbox.width <= rect.left + rect.width &&
        textbox.top + textbox.height <= rect.top + rect.height
      );
    };

    // Filter out non-shape objects and default heading/content groups
    const validShapes = allSelectedObjects.filter((obj: any) => {
      return !['textbox', 'i-text', 'image'].includes(obj.type) && 
             !isDefaultHeadingOrContentGroup(obj);
    });

    // Update the selected shapes array with all currently selected shapes
    if(validShapes.length != 1){
      var shapesArray = validShapes;
      
      // Check if any shapes from shapesArray already exist in this.selectedShapes
      const existingShapes = this.selectedShapes;
      
      // Get new shapes that don't exist in this.selectedShapes
      const newShapes = shapesArray.filter(shape => 
        !this.selectedShapes.some(selectedShape => selectedShape === shape)
      );
      
      // Reorder: put existing shapes first (at index 0), then add new shapes
      this.selectedShapes = [...existingShapes, ...newShapes];
    }else{
      this.selectedShapes = validShapes;
    }

    if (validShapes.length > 0) {
      // Check if any of the selected shapes are contentGroup or headingGroup
      const hasContentOrHeadingGroup = validShapes.some(shape => 
        (shape.group && shape.group.name === 'contentGroup') || 
        (shape.group && shape.group.name === 'headingGroup') ||
        (shape.group && shape.group.name === '') 
      );
      
      // Hide shape toolbar for contentGroup or headingGroup
      this.showShapeToolbar = !hasContentOrHeadingGroup;
      
      const dropdownKeys = Object.keys(this.dropdowns);
      dropdownKeys.forEach((key) => {
        (this.dropdowns as any)[key].isOpen = false;
      });
      this.selectedShape = validShapes[0]; // Keep the first selected shape for backward compatibility
    } else {
      this.showShapeToolbar = false;
      this.selectedShape = null;
    }
  }

  // Shape modification methods
  updateBorderStyleAndWidth(style: string, width: number) {
    if (!this.selectedShape) return;
    
    const applyStyleToObject = (obj: fabric.Object) => {
      if (style === 'none') {
        obj.set('stroke', null);
      } else {
        obj.set('stroke', obj.stroke || '#000000');
        obj.set('strokeWidth', width);
        
        switch(style) {
          case 'solid':
            obj.set('strokeDashArray', null);
            break;
          case 'dashed':
            obj.set('strokeDashArray', [width * 2, width]);
            break;
          case 'dotted':
            obj.set('strokeDashArray', [width, width]);
            break;
        }
      }
    };

    if (this.selectedShape.type === 'group') {
      const group = this.selectedShape as fabric.Group;
      group.forEachObject(applyStyleToObject);
    } else {
      applyStyleToObject(this.selectedShape);
    }
    
    this.canvas.renderAll();
    this.recordHistory();
  }

  updateBorderWidth(event: Event) {
    const input = event.target as HTMLInputElement;
    const width = parseInt(input.value, 10);
    if (!this.selectedShape) return;

    const applyWidthToObject = (obj: fabric.Object) => {
      obj.set('strokeWidth', width);

      // Check current dash style and update dash array accordingly
      let dashArray = obj.strokeDashArray;
      if (dashArray) {
        // If dash and gap are equal, it's dotted
        if (dashArray[0] === dashArray[1]) {
          obj.set('strokeDashArray', [width, width]);
        } else {
          // Otherwise, it's dashed
          obj.set('strokeDashArray', [width * 2, width]);
        }
      }
    };

    if (this.selectedShape.type === 'group') {
      const group = this.selectedShape as fabric.Group;
      group.forEachObject(applyWidthToObject);
    } else {
      applyWidthToObject(this.selectedShape);
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
    if (!this.selectedShape) return false;
    
    // Don't show radius button for triangles
    if (this.selectedShape.type === 'triangle') return false;
    
    return this.canApplyRadius(this.selectedShape);
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

  updateFillColor(color: string) {
    if (!this.selectedShape) return;

    if (this.selectedShape.type === 'group') {
      const group = this.selectedShape as fabric.Group;

      // If group has exactly two objects, treat as frame (outer + inner)
      if (group._objects.length === 2) {
        // Fill the outer shape
        group._objects[0].set('fill', color);
        // Set the inner shape to white or transparent
        group._objects[1].set('fill', '#fff'); // or 'transparent'
      } else {
        // Default: apply to all
        group.forEachObject((obj) => {
          if (obj.type === 'path') {
            obj.set({ fill: color, objectCaching: false });
          } else {
            obj.set('fill', color);
          }
        });
      }
    } else if (this.selectedShape.type === 'path') {
      this.selectedShape.set({ fill: color, objectCaching: false });
    } else if (this.selectedShape.type === 'text') {
      this.selectedShape.set('fill', color);
    } else {
      this.selectedShape.set('fill', color);
    }

    this.canvas.requestRenderAll();
    this.recordHistory();
  }

  updateOpacity(opacity: string | number) {
    if (!this.selectedShape) return;
    
    // Convert the opacity value to a number between 0 and 1
    const opacityValue = Number(opacity) / 100;
    
    // Get the current fill color
    const currentFill = this.selectedShape.fill;
    
    // If the fill is a gradient, we need to handle it differently
    if (currentFill instanceof fabric.Gradient) {
      // Create a new gradient with the same colors but with opacity
      const newGradient = new fabric.Gradient({
        type: currentFill.type,
        coords: currentFill.coords,
        colorStops: currentFill.colorStops.map(stop => ({
          offset: stop.offset,
          color: this.addOpacityToColor(stop.color, opacityValue)
        }))
      });
      this.selectedShape.set('fill', newGradient);
    } else {
      // For solid colors, add opacity to the color
      const newColor = this.addOpacityToColor(currentFill as string, opacityValue);
      this.selectedShape.set('fill', newColor);
    }
    
    this.canvas.renderAll();
    this.recordHistory();
  }

  // Helper method to add opacity to a color
  private addOpacityToColor(color: string, opacity: number): string {
    // If the color is already in rgba format, update the alpha value
    if (color.startsWith('rgba')) {
      const rgba = color.match(/[\d.]+/g);
      if (rgba && rgba.length >= 3) {
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${opacity})`;
      }
    }
    
    // If the color is in hex format, convert to rgba
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // If the color is in rgb format, convert to rgba
    if (color.startsWith('rgb')) {
      const rgb = color.match(/[\d.]+/g);
      if (rgb && rgb.length >= 3) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
      }
    }
    
    // Return the original color if we can't parse it
    return color;
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
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns, event: MouseEvent) {
    // Close all other dropdowns
    const dropdownKeys = Object.keys(this.dropdowns);
    dropdownKeys.forEach((key) => {
      if (key !== dropdown) {
        (this.dropdowns as any)[key].isOpen = false;
      }
    });

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const toolbarRect = button.closest('.shape-toolbar')?.getBoundingClientRect();

    if (!toolbarRect) return;
    
    (this.dropdowns as any)[dropdown].isOpen = !this.dropdowns[dropdown].isOpen;
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
      
      if (this.selectedShape) {
        let targetShape = this.selectedShape;
        
        // If it's a group, get the first object
        if (targetShape.type === 'group') {
          const group = targetShape as fabric.Group;
          if (group._objects && group._objects.length > 0) {
            targetShape = group._objects[0];
          }
        }
        
        // Update opacity for the target shape
        const opacityValue = percentage / 100;
        const currentFill = targetShape.fill;
        
        // If the fill is a gradient, we need to handle it differently
        if (currentFill instanceof fabric.Gradient) {
          // Create a new gradient with the same colors but with opacity
          const newGradient = new fabric.Gradient({
            type: currentFill.type,
            coords: currentFill.coords,
            colorStops: currentFill.colorStops.map(stop => ({
              offset: stop.offset,
              color: this.addOpacityToColor(stop.color, opacityValue)
            }))
          });
          targetShape.set('fill', newGradient);
        } else {
          // For solid colors, add opacity to the color
          const newColor = this.addOpacityToColor(currentFill as string, opacityValue);
          targetShape.set('fill', newColor);
        }
        
        // Update visual elements
        const fill = slider.querySelector('.slider-fill') as HTMLElement;
        const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
        if (fill && thumb) {
          fill.style.width = `${percentage}%`;
          thumb.style.left = `${percentage}%`;
        }
        
        this.canvas.renderAll();
        this.recordHistory();
      }
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
    if (!this.selectedShape) return 'none';
    
    let shape = this.selectedShape;
    
    // If it's a group, get the first object's border style
    if (shape.type === 'group') {
      const group = shape as fabric.Group;
      if (group._objects && group._objects.length > 0) {
        shape = group._objects[0];
      }
    }
    
    if (!shape.stroke) {
      return 'none';
    }
    
    const dashArray = shape.strokeDashArray;
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
    if (!this.selectedShape) return;

    if (this.selectedShape.type === 'group') {
      const group = this.selectedShape as fabric.Group;

      // If group has exactly two objects, treat as frame (outer + inner)
      if (group._objects.length === 2) {
        // Border color for outer shape
        group._objects[0].set('stroke', color);
        // Optionally, set inner shape border to none or keep as is
        group._objects[1].set('stroke', color);
      } else {
        // Default: apply to all
        group.forEachObject((obj) => {
          obj.set('stroke', color);
        });
      }
    } else {
      this.selectedShape.set('stroke', color);
    }

    this.canvas.renderAll();
    this.recordHistory();
  }

  // Helper method to get current border color
  getCurrentBorderColor(): string {
    return this.selectedShape?.stroke || '#000000';
  }

  updateBorderOpacity(opacity: number) {
    if (!this.selectedShape) return;
    
    const opacityValue = opacity / 100;
    
    const applyOpacityToObject = (obj: fabric.Object) => {
      // Ensure stroke exists and is properly initialized
      if (!obj.stroke) {
        obj.set('stroke', '#000000');
      }

      // Get current stroke color
      const currentColor = obj.stroke as string;
      
      // Convert hex color to RGBA
      let rgbaColor = currentColor;
      if (currentColor.startsWith('#')) {
        const r = parseInt(currentColor.slice(1, 3), 16);
        const g = parseInt(currentColor.slice(3, 5), 16);
        const b = parseInt(currentColor.slice(5, 7), 16);
        rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
      } else if (currentColor.startsWith('rgb')) {
        // If it's already in rgb format, convert to rgba
        const rgbValues = currentColor.match(/\d+/g);
        if (rgbValues && rgbValues.length >= 3) {
          rgbaColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacityValue})`;
        }
      }
      
      // Set the stroke with opacity
      obj.set('stroke', rgbaColor);
    };

    if (this.selectedShape.type === 'group') {
      const group = this.selectedShape as fabric.Group;
      group.forEachObject(applyOpacityToObject);
    } else {
      applyOpacityToObject(this.selectedShape);
    }
    
    // Force canvas to update
    this.canvas.requestRenderAll();
    this.recordHistory();
  }

  handleBorderOpacitySliderMouseDown(event: MouseEvent) {
    const slider = event.currentTarget as HTMLElement;
    const sliderRect = slider.getBoundingClientRect();
    
    const updateValue = (moveEvent: MouseEvent) => {
      const percentage = Math.max(0, Math.min(100, ((moveEvent.clientX - sliderRect.left) / sliderRect.width) * 100));
      
      if (this.selectedShape) {
        const opacityValue = percentage / 100;
        
        const applyOpacityToObject = (obj: fabric.Object) => {
          // Ensure stroke exists and is properly initialized
          if (!obj.stroke) {
            obj.set('stroke', '#000000');
          }

          // Get current stroke color
          const currentColor = obj.stroke as string;
          
          // Convert hex color to RGBA
          let rgbaColor = currentColor;
          if (currentColor.startsWith('#')) {
            const r = parseInt(currentColor.slice(1, 3), 16);
            const g = parseInt(currentColor.slice(3, 5), 16);
            const b = parseInt(currentColor.slice(5, 7), 16);
            rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
          } else if (currentColor.startsWith('rgb')) {
            // If it's already in rgb format, convert to rgba
            const rgbValues = currentColor.match(/\d+/g);
            if (rgbValues && rgbValues.length >= 3) {
              rgbaColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacityValue})`;
            }
          }
          
          // Set the stroke with opacity
          obj.set('stroke', rgbaColor);
        };

        // Apply opacity to all objects in group or single object
        if (this.selectedShape.type === 'group') {
          const group = this.selectedShape as fabric.Group;
          group.forEachObject(applyOpacityToObject);
        } else {
          applyOpacityToObject(this.selectedShape);
        }
        
        // Update visual elements
        const fill = slider.querySelector('.slider-fill') as HTMLElement;
        const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
        const value = slider.querySelector('.slider-value') as HTMLElement;
        
        if (fill && thumb && value) {
          fill.style.width = `${percentage}%`;
          thumb.style.left = `${percentage}%`;
          value.textContent = Math.round(percentage).toString();
        }
        
        this.canvas.renderAll();
        this.recordHistory();
      }
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

    // Record state before merge
    this.recordHistory();

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
      // Record state after merge
      this.recordHistory();
    } catch (error) {
      console.error('Shape operation failed:', error);
    }
  }

  private unionShapes(objects: fabric.Object[]) {
    const paths: paper.Path[] = [];
    
    for (const obj of objects) {
      try {
        const path = this.fabricToPaperPath(obj);
        paths.push(path);
      } catch (e) {
        console.error('Error converting object:', obj, e);
      }
    }
  
    if (paths.length < 2) return;
  
    let unitedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      unitedPath = unitedPath.unite(paths[i]) as paper.Path;
    }
  
    const fabricPath = this.paperToFabricPath(unitedPath);
  
    // Set center
    const bounds = unitedPath.bounds;
    fabricPath.set({
      left: bounds.x + bounds.width / 2,
      top: bounds.y + bounds.height / 2,
      originX: 'center',
      originY: 'center'
    });
  
    this.addMergedShapeToCanvas(fabricPath, objects);
  
    // Cleanup
    paths.forEach(p => p.remove());
  }
  

  private intersectShapes(objects: fabric.Object[]) {
    if (objects.length < 2) return;

    // Get the position of the first object as reference
    const firstObj = objects[0];
    const firstObjBounds = firstObj.getBoundingRect(true, true);

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    let bounds = new paper.Rectangle(0, 0, 0, 0);
    paths.forEach(path => {
      bounds = bounds.unite(path.bounds);
    });
    let intersectedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      intersectedPath = intersectedPath.intersect(paths[i]) as paper.Path;
    }

    if (intersectedPath) {
      const fabricPath = this.paperToFabricPath(intersectedPath);      
      
      // Position the result at the same position as the first object
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      fabricPath.set({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center'
      });

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

  private subtractShapes(objects: fabric.Object[]) {
    if (objects.length < 2) return;

    // Get the position of the first object as reference
    const firstObj = objects[0];
    const firstObjBounds = firstObj.getBoundingRect(true, true);

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    let bounds = new paper.Rectangle(0, 0, 0, 0);
    paths.forEach(path => {
      bounds = bounds.unite(path.bounds);
    });
    let subtractedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      subtractedPath = subtractedPath.subtract(paths[i]) as paper.Path;
    }

    if (subtractedPath) {
      const fabricPath = this.paperToFabricPath(subtractedPath);      
      
      // Position the result at the same position as the first object
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      fabricPath.set({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center'
      });

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

  private combineShapes(objects: fabric.Object[]) {
    if (objects.length < 2) return;

    // Get the position of the first object as reference
    const firstObj = objects[0];
    const firstObjBounds = firstObj.getBoundingRect(true, true);

    const paths = objects.map(obj => this.fabricToPaperPath(obj));
    let bounds = new paper.Rectangle(0, 0, 0, 0);
    paths.forEach(path => {
      bounds = bounds.unite(path.bounds);
    });
    let combinedPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      combinedPath = combinedPath.exclude(paths[i]) as paper.Path;
    }

    if (combinedPath) {
      const fabricPath = this.paperToFabricPath(combinedPath);      
      
      // Position the result at the same position as the first object
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      fabricPath.set({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center'
      });

      this.addMergedShapeToCanvas(fabricPath, objects);
    }
  }

 
  fragmentShapes(objects: fabric.Object[]) {
    if (objects.length < 2) return;
  
    const paths = objects.map(obj => this.fabricToPaperPath(obj));
  
    let results: paper.PathItem[] = [];
  
    // Boolean operations on all pairs
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const path1 = paths[i].clone();
        const path2 = paths[j].clone();
  
        const minus1 = path1.subtract(path2);
        const minus2 = path2.subtract(path1);
        const intersection = paths[i].intersect(paths[j]);
  
        if (minus1 && !minus1.isEmpty()) results.push(minus1);
        if (minus2 && !minus2.isEmpty()) results.push(minus2);
        if (intersection && !intersection.isEmpty()) results.push(intersection);
      }
    }
  
    // Optional: add original shapes if no intersection fragments found
    if (results.length === 0) {
      results = paths.map(p => p.clone());
    }
  
    // Remove original objects from Fabric canvas
    objects.forEach(obj => this.canvas.remove(obj));
  
    // Add fragmented results back to Fabric
    const bounds = this.getSelectionBounds(objects);

    results.forEach((piece, index) => {
      piece.flatten(0.5);
    
      const isValidPiece =
        (piece instanceof paper.Path && piece.length > 0) ||
        (piece instanceof paper.CompoundPath && piece.children.length > 0);
    
      if (isValidPiece && piece.pathData && piece.pathData.length > 0) {
        const fabricPath = this.paperToFabricPath(piece);
    
        const commonFill = this.getCommonFill(objects);
        const commonStroke = this.getCommonStroke(objects);
        const commonStrokeWidth = this.getCommonStrokeWidth(objects);
        const commonOpacity = objects.find(obj => obj.opacity !== undefined && obj.opacity > 0)?.opacity || 1;
    
        const positionOffset = 50;  // Small static offset to prevent exact overlap of fragments
  
        // Use dynamic bounds.left and bounds.top for setting position
        let leftPosition = bounds.left + positionOffset * (index + 1);  // Adjust the X-position
        let topPosition = bounds.top + positionOffset * (index + 1);    // Adjust the Y-position
  
        // Get styling properties from the first selected shape, handling group shapes
        let firstShapeFill = '#000000';
        let firstShapeStroke = 'transparent';
        let firstShapeStrokeWidth = 1;
        let firstShapeOpacity = 1;
        let firstShapeStrokeOpacity = 1;
        let firstShapeStrokeDashArray: number[] | null = null;

        if (this.selectedShapes.length > 0) {
          const firstShape = this.selectedShapes[0];
          
          // Check if the first shape is a group
          if (firstShape.type === 'group' && firstShape._objects && firstShape._objects.length > 0) {
            // Get the first object from the group
            const firstGroupObject = firstShape._objects[0];
            firstShapeFill = firstGroupObject.fill as string || '#000000';
            firstShapeStroke = firstGroupObject.stroke as string || 'transparent';
            firstShapeStrokeWidth = firstGroupObject.strokeWidth as number || 1;
            firstShapeOpacity = firstGroupObject.opacity as number || 1;
            firstShapeStrokeOpacity = firstGroupObject.strokeOpacity as number || 1;
            firstShapeStrokeDashArray = firstGroupObject.strokeDashArray as number[] || null;
          } else {
            // Handle non-group shapes as before
            firstShapeFill = firstShape.fill as string || '#000000';
            firstShapeStroke = firstShape.stroke as string || 'transparent';
            firstShapeStrokeWidth = firstShape.strokeWidth as number || 1;
            firstShapeOpacity = firstShape.opacity as number || 1;
            firstShapeStrokeOpacity = firstShape.strokeOpacity as number || 1;
            firstShapeStrokeDashArray = firstShape.strokeDashArray as number[] || null;
          }
        }

        // Position fragment relative to original group bounds
        fabricPath.set({
          fill: firstShapeFill,
          stroke: firstShapeStroke,
          strokeWidth: firstShapeStrokeWidth,
          opacity: firstShapeOpacity,
          strokeOpacity: firstShapeStrokeOpacity,
          strokeDashArray: firstShapeStrokeDashArray,
          left: leftPosition,
          top: topPosition,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          hoverCursor: 'move',
          perPixelTargetFind: true,
        });
    
        this.canvas.add(fabricPath);
      }
    });
    
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    
    
  
    this.canvas.renderAll();
    this.recordHistory();
  }
  
  

  private getSelectionBounds(objects: fabric.Object[]): { left: number; top: number; width: number; height: number } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    objects.forEach(obj => {
      const matrix = obj.calcTransformMatrix();
      const points = [
        { x: 0, y: 0 },
        { x: obj.width! * obj.scaleX!, y: 0 },
        { x: obj.width! * obj.scaleX!, y: obj.height! * obj.scaleY! },
        { x: 0, y: obj.height! * obj.scaleY! }
      ];

      points.forEach(point => {
        const transformedPoint = fabric.util.transformPoint(point, matrix);
        minX = Math.min(minX, transformedPoint.x);
        minY = Math.min(minY, transformedPoint.y);
        maxX = Math.max(maxX, transformedPoint.x);
        maxY = Math.max(maxY, transformedPoint.y);
      });
    });

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
 

  private fabricToPaperPath(obj: fabric.Object): paper.Path {
  
    const svg = obj.toSVG();
  
    const imported = paper.project.importSVG(svg, { expandShapes: true });
  
    let outerPath: paper.Path | null = null;
    let holePaths: paper.Path[] = [];
  
    const extractPaths = (item: paper.Item | null): void => {
      if (!item) return;
  
      if (item instanceof paper.Group) {
        item.children.forEach(extractPaths);
      } else if (item instanceof paper.CompoundPath) {
        // Treat entire CompoundPath as outerPath
        if (!outerPath) {
          outerPath = item as paper.Path; // Use the compound path directly
        } else {
          holePaths.push(item as paper.Path);
        }
      } else if (item instanceof paper.Path) {
        if (!outerPath) {
          outerPath = item;
        } else {
          holePaths.push(item);
        }
      }
    };
  
    extractPaths(imported);
  
    if (!outerPath) {
      throw new Error('No outer path found for shape');
    }
  
    let finalPath = outerPath.clone({ insert: false });
  
    // If holes are needed:
    for (const hole of holePaths) {
      finalPath = finalPath.subtract(hole) as paper.Path;
    }
  
    finalPath.flatten(0.5);
    finalPath.closePath();
  
    return finalPath;
  }

  private paperToFabricPath(paperPath: paper.PathItem): fabric.Path {
    let pathData = '';
    if (paperPath instanceof paper.Path) {
      pathData = paperPath.pathData;
    } else if (paperPath instanceof paper.CompoundPath) {
      const childPaths = paperPath.children
        .filter(child => child instanceof paper.Path)
        .map(child => (child as paper.Path).pathData);
      pathData = childPaths.join(' ');
    }
    const fabricPath = new fabric.Path(pathData, {
      fill: paperPath.fillColor ? paperPath.fillColor.toCSS(true) : 'transparent',
      stroke: paperPath.strokeColor ? paperPath.strokeColor.toCSS(true) : 'transparent',
      strokeWidth: paperPath.strokeWidth || 0,
      opacity: paperPath.fillColor ? paperPath.fillColor.alpha : 1,
      strokeOpacity: paperPath.strokeColor ? paperPath.strokeColor.alpha : 1,
      selectable: true,
      evented: true,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top'
    });
    return fabricPath;
  }

  private getCommonFill(objects: fabric.Object[]): string {
    // If any object is a group, get fills from group objects
    const getAllFills = (obj: fabric.Object): string[] => {
      if (obj instanceof fabric.Group) {
        return obj.getObjects().flatMap(groupObj => getAllFills(groupObj));
      }
      return [obj.fill as string];
    };

    // Get all fills including those from group objects
    const fills = objects.flatMap(obj => getAllFills(obj));
    
    // Filter out null/undefined fills
    const validFills = fills.filter(fill => fill != null && fill !== '');
    
    if (validFills.length === 0) {
      return '#ffffff'; // Default to white if no valid fills found
    }

    // If all fills are the same, use that fill
    if (validFills.every(fill => fill === validFills[0])) {
      return validFills[0];
    }

    // If we have any non-black fills, use the first non-black fill
    const nonBlackFill = validFills.find(fill => fill !== '#000000' && fill !== 'rgb(0,0,0)');
    if (nonBlackFill) {
      return nonBlackFill;
    }

    // Default to white instead of black
    return '#ffffff';
  }

  private getCommonStroke(objects: fabric.Object[]): string {
    // If any object is a group, get strokes from group objects
    const getAllStrokes = (obj: fabric.Object): string[] => {
      if (obj instanceof fabric.Group) {
        return obj.getObjects().flatMap(groupObj => getAllStrokes(groupObj));
      }
      return [obj.stroke as string];
    };

    // Get all strokes including those from group objects
    const strokes = objects.flatMap(obj => getAllStrokes(obj));
    
    // Filter out null/undefined strokes
    const validStrokes = strokes.filter(stroke => stroke != null && stroke !== '');
    
    if (validStrokes.length === 0) {
      return '#000000'; // Default to black if no valid strokes found
    }

    // If all strokes are the same, use that stroke
    if (validStrokes.every(stroke => stroke === validStrokes[0])) {
      return validStrokes[0];
    }

    // Default to black
    return '#000000';
  }

  private getCommonStrokeWidth(objects: fabric.Object[]): number {
    // If any object is a group, get stroke widths from group objects
    const getAllStrokeWidths = (obj: fabric.Object): number[] => {
      if (obj instanceof fabric.Group) {
        return obj.getObjects().flatMap(groupObj => getAllStrokeWidths(groupObj));
      }
      return [obj.strokeWidth || 0];
    };

    // Get all stroke widths including those from group objects
    const strokeWidths = objects.flatMap(obj => getAllStrokeWidths(obj));
    
    // Filter out undefined stroke widths
    const validStrokeWidths = strokeWidths.filter(width => width != null && width > 0);
    
    if (validStrokeWidths.length === 0) {
      return 1; // Default stroke width
    }

    // If all stroke widths are the same, use that width
    if (validStrokeWidths.every(width => width === validStrokeWidths[0])) {
      return validStrokeWidths[0];
    }

    // Return the maximum stroke width found
    return Math.max(...validStrokeWidths);
  }
  
  private addMergedShapeToCanvas(shape: fabric.Path, originalObjects: fabric.Object[]) {
    // Calculate the bounding box of original objects using their absolute coordinates
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    originalObjects.forEach(obj => {
      const matrix = obj.calcTransformMatrix();
      const bounds = obj.getBoundingRect(true, true);
      
      // Get corners with transformation
      const corners = [
        { x: bounds.left, y: bounds.top },
        { x: bounds.left + bounds.width, y: bounds.top },
        { x: bounds.left + bounds.width, y: bounds.top + bounds.height },
        { x: bounds.left, y: bounds.top + bounds.height }
      ];
      
      // Transform each corner and update bounds
      corners.forEach(corner => {
        const transformed = fabric.util.transformPoint(corner, matrix);
        minX = Math.min(minX, transformed.x);
        minY = Math.min(minY, transformed.y);
        maxX = Math.max(maxX, transformed.x);
        maxY = Math.max(maxY, transformed.y);
      });
    });

    // Get dimensions of the merged shape
    const shapeBounds = shape.getBoundingRect(true, true);
    const shapeWidth = shapeBounds.width;
    const shapeHeight = shapeBounds.height;

    // Calculate the exact position where the shape should be placed
    const targetLeft = minX;
    const targetTop = minY;

    // Get the first shape's colors from selectedShapes array
    let firstShapeFill = '#000000';
    let firstShapeStroke = 'transparent';
    let firstShapeStrokeWidth = 1;
    let firstShapeOpacity = 1;
    let firstShapeStrokeOpacity = 1;
    let firstShapeStrokeDashArray: number[] | null = null;

    if (this.selectedShapes.length > 0) {
      const firstShape = this.selectedShapes[0];
      
      // Check if the first shape is a group
      if (firstShape.type === 'group' && firstShape._objects && firstShape._objects.length > 0) {
        // Get the first object from the group
        const firstGroupObject = firstShape._objects[0];
        firstShapeFill = firstGroupObject.fill as string || '#000000';
        firstShapeStroke = firstGroupObject.stroke as string || 'transparent';
        firstShapeStrokeWidth = firstGroupObject.strokeWidth as number || 1;
        firstShapeOpacity = firstGroupObject.opacity as number || 1;
        firstShapeStrokeOpacity = firstGroupObject.strokeOpacity as number || 1;
        firstShapeStrokeDashArray = firstGroupObject.strokeDashArray as number[] || null;
      } else {
        // Handle non-group shapes as before
        firstShapeFill = firstShape.fill as string || '#000000';
        firstShapeStroke = firstShape.stroke as string || 'transparent';
        firstShapeStrokeWidth = firstShape.strokeWidth as number || 1;
        firstShapeOpacity = firstShape.opacity as number || 1;
        firstShapeStrokeOpacity = firstShape.strokeOpacity as number || 1;
        firstShapeStrokeDashArray = firstShape.strokeDashArray as number[] || null;
      }
    }
    
    // Set the style properties and position
    shape.set({
      fill: firstShapeFill,
      stroke: firstShapeStroke,
      strokeWidth: firstShapeStrokeWidth,
      strokeDashArray: firstShapeStrokeDashArray,
      opacity: firstShapeOpacity,
      strokeOpacity: firstShapeStrokeOpacity,
      originX: 'left',
      originY: 'top',
      left: targetLeft,
      top: targetTop,
      width: maxX - minX,
      height: maxY - minY
    });

    // Remove original objects
    originalObjects.forEach(obj => this.canvas.remove(obj));

    // Add new merged shape
    this.canvas.add(shape);
    this.canvas.setActiveObject(shape);
    this.canvas.renderAll();
    this.recordHistory();
  }

  private setupGroupEventHandlers() {
    this.canvas.on('mouse:dblclick', (opt) => {
      const target = opt.target;
      if (!target) return;
  
      const makeEditableWithoutOutline = (textbox: fabric.Textbox) => {
        textbox.set({
          editable: true,
          evented: true,
          hasBorders: false,
          hasControls: false,
          transparentCorners: true,
          selectionBackgroundColor: '',
          perPixelTargetFind: true
        });
      
        // Prevent selection outline
        textbox.renderControls = () => {};
        textbox._renderControls = () => {};
        this.canvas.selection = false;
      
        // Store original text before editing
        (textbox as any).originalText = textbox.text;
      
        this.canvas.setActiveObject(textbox);
      
        setTimeout(() => {
          textbox.enterEditing();
          textbox.selectAll();
        }, 0);
      
        // Debounce function
        let typingTimer: any;
        const DEBOUNCE_MS = 500; // Adjust to taste
      

      
        textbox.off('editing:exited');
        textbox.on('editing:exited', () => {
          textbox.set({ editable: false });
          this.canvas.selection = true;
          clearTimeout(typingTimer);
          (textbox as any).needsUpdateContent = true;
      
          this.canvas.discardActiveObject();
          this.canvas.requestRenderAll();
        });
      
        this.canvas.requestRenderAll();
      };
      
      
  
      // Handle group double-click
      if (target.type === 'group' && target._objects?.length === 2) {
        const group = target as fabric.Group;
        const [a, b] = target._objects;
       this.rect = a.type === 'rect' ? a : b.type === 'rect' ? b : null;
        // Save group position/scale/rotation/flips
        this.lastGroupLeft = group.left;
        this.lastGroupTop = group.top;
        this.lastGroupAngle = group.angle || 0;
        this.lastGroupScaleX = group.scaleX || 1;
        this.lastGroupScaleY = group.scaleY || 1;
        this.lastGroupFlipX = group.flipX || false;
        this.lastGroupFlipY = group.flipY || false;
        this.lastGroupName = group.name || '';
      
        // Restore objects and store them
        group._restoreObjectsState();
        this.lastUngroupedObjects = target._objects;
      
        // Remove old group
        this.canvas.remove(group);
      
        // Add objects individually to canvas
        this.lastUngroupedObjects.forEach(obj => {
          this.canvas.add(obj);
          if (obj.type === 'textbox') {
            makeEditableWithoutOutline(obj as fabric.Textbox);
          }
        });
      
        this.canvas.renderAll();
      }
      
      // Handle direct textbox double-click
      else if (target.type === 'textbox') {
     // Enable selection and controls explicitly
     target.set({
      selectable: true,
      hasControls: false,
      hasBorders: false,
      editable: true,     // make sure editable is true
      evented: true,
    });
  
    this.canvas.setActiveObject(target);
  
    // Enter editing mode properly
    setTimeout(() => {
      target.enterEditing();
      target.selectAll();
      this.canvas.requestRenderAll();
    }, 0);
  
    this.canvas.renderAll();
      }
    });
  }
  
  

copySelectedObjects() {
  const activeObject = this.canvas.getActiveObject();
  if (!activeObject) return;

  this.copiedObjects = [];

  if (activeObject instanceof fabric.ActiveSelection) {
    this.copiedObjects = activeObject.getObjects();
  } else {
    this.copiedObjects = [activeObject];
  }
}

pasteSelectedObjects() {
  if (!this.copiedObjects.length) {
    console.warn('No copied objects to paste.');
    return;
  }
  this.canvas.discardActiveObject();

  const newObjects: fabric.Object[] = [];
  const offset = 20; 

  const clonePromises = this.copiedObjects.map((obj, idx) => {
    return new Promise<fabric.Object>((resolve, reject) => {
      try {
        obj.clone((cloned: fabric.Object) => {
          if (!cloned) {
            console.error('Failed to clone object:', obj);
            reject('Clone failed');
            return;
          }
          cloned.set({
            left: (obj.left || 0) + offset,
            top: (obj.top || 0) + offset,
            evented: true,
            opacity: 1,
            visible: true,
          });
          this.canvas.add(cloned);
          this.canvas.bringToFront(cloned);
          newObjects.push(cloned);
          resolve(cloned);
        }, [ 'left', 'top', 'scaleX', 'scaleY', 'angle', 'width', 'height', 'fill', 'stroke', 'strokeWidth', 'opacity', 'src', 'visible', 'evented' ]);
      } catch (err) {
        console.error('Error during clone:', err);
        reject(err);
      }
    });
  });

  Promise.allSettled(clonePromises).then((results) => {
    const successful = results.filter(r => r.status === 'fulfilled').map(r => (r as any).value);
    if (successful.length > 1) {
      const selection = new fabric.ActiveSelection(successful, {
        canvas: this.canvas
      });
      this.canvas.setActiveObject(selection);
    } else if (successful.length === 1) {
      this.canvas.setActiveObject(successful[0]);
    } else {
      console.warn('No objects were successfully pasted.');
    }
    this.canvas.requestRenderAll();
    this.recordHistory();
  });
}

duplicateSelectedObjects() {
  const activeObject = this.canvas.getActiveObject();
  if (!activeObject) return;

  // Store current selection
  this.copySelectedObjects();
  // Paste immediately
  this.pasteSelectedObjects();
}
textBringToFront(target:any){
    if (target) {
        this.canvas.bringToFront(target); // Ensure dragging works
    }
}     
updateContent() {
  this.hideAlignmentGuides();
 const currentJson = JSON.stringify(this.canvas.toJSON());
 this.workspaceService.multimediaAlighment = false;
  if (this.lastSavedJson && currentJson !== this.lastSavedJson) {
    this.lastSavedJson = currentJson;
    this.saveToDatabase(currentJson);
  }
  if (!this.lastUngroupedObjects || this.lastUngroupedObjects.length === 0) {
    return;
  }
  // Check if any textbox has been modified from default values
  let hasCustomContent = false;
  let textboxObject: fabric.Textbox | null = null;
  let borderObject: fabric.Rect | null = null;

  this.lastUngroupedObjects.forEach(obj => {
    if (obj.type === 'textbox') {
      textboxObject = obj as fabric.Textbox;
      // Check if text has been modified from default values
      if (textboxObject.text !== 'Click to add heading' && textboxObject.text !== 'Click to add content') {
        hasCustomContent = true;
      }
    } else if (obj.type === 'rect'|| (obj.name === 'headingBorder' || obj.name === 'contentBorder')) {
      if(obj.name != 'headingBorder' || obj.name != 'contentBorder'){
        obj.set({ stroke: '#ccc',  strokeWidth: 1 });

      }else{
        obj.set({ stroke: 'transparent',  strokeWidth: 0 });
      }
      borderObject = obj as fabric.Rect;
    }
  });


  // Make border transparent instead of removing it
  if (borderObject) {
    if (textboxObject.text !== 'Click to add heading' && textboxObject.text !== 'Click to add content') {
      borderObject.set({
        stroke: 'transparent',
        strokeWidth: 0
      });
    }
  }

  // Remove all ungrouped objects from canvas
  this.lastUngroupedObjects.forEach(obj => {
    obj.editable = false; 
    this.canvas.remove(obj);
  });

  // Create new group without the border
  const newGroup = new fabric.Group(this.lastUngroupedObjects, {
    left: this.lastGroupLeft,
    top: this.lastGroupTop,
    angle: this.lastGroupAngle,
    scaleX: this.lastGroupScaleX,
    scaleY: this.lastGroupScaleY,
    flipX: this.lastGroupFlipX,
    flipY: this.lastGroupFlipY,
    hasControls: true,
    hasBorders: true,
    name: this.lastGroupName,
    lockScalingY: true,
  });

  this.canvas.add(newGroup);
  this.canvas.sendBackwards(newGroup);
  this.canvas.setActiveObject(newGroup);
  this.canvas.renderAll();
  // Store the reference to the last regrouped object
  this.lastRegroupedObject = newGroup;
  
  this.recordHistory();
  this.lastUngroupedObjects = [];
  // Reset transformation properties
  this.lastGroupAngle = 0;
  this.lastGroupScaleX = 1;
  this.lastGroupScaleY = 1;
  this.lastGroupFlipX = false;
  this.lastGroupFlipY = false;
  setTimeout(() => {
    this.ungroub=false;
  }, 1000);
}


  letterSpaceSlider(event: MouseEvent) {
    const slider = event.target as HTMLElement;
    const container = slider.closest('.custom-letter-space-container');
    if (!container) return;

    const updateValue = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (x / width) * 100));
      
      // Convert percentage to letter spacing value (0 to 200)
      const letterSpacing = Math.round((percentage / 100) * 200);
      this.updateLetterSpacing(letterSpacing);
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateValue(moveEvent);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    updateValue(event);
  }

  updateLetterSpacing(spacing: number) {
    this.currentLetterSpacing = spacing;
    if (this.selectedTextObject) {
      this.selectedTextObject.set('charSpacing', spacing);
      this.canvas.renderAll();
    }
  }

  lineSpaceSlider(event: MouseEvent) {
    const slider = event.target as HTMLElement;
    const container = slider.closest('.custom-line-space-container');
    if (!container) return;

    const updateValue = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (x / width) * 100));
      
      // Convert percentage to line spacing value (0.5 to 3)
      const lineSpacing = Math.round((percentage / 100) * 2.5 * 10) / 10 + 0.5;
      this.updateLineSpacing(lineSpacing);
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateValue(moveEvent);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    updateValue(event);
  }

  updateLineSpacing(spacing: number) {
    this.currentLineSpacing = spacing;
    if (this.selectedTextObject) {
      this.selectedTextObject.set('lineHeight', spacing);
      this.canvas.renderAll();
    }
  }

  anchorTextBox(position: 'top' | 'middle' | 'bottom') {
    if (this.selectedTextObject) {
      const group = this.selectedTextObject.group;
      if (group) {
        // Get the group's height
        const groupHeight = group.getScaledHeight();
        const textHeight = this.selectedTextObject.getScaledHeight();
        
        // Calculate new top position based on anchor
        let newTop = 0;
        switch(position) {
          case 'top':
            newTop =-(groupHeight - textHeight +30) / 2;
            break;
          case 'middle':
            newTop = -(groupHeight - textHeight) / 2;
            break;
          case 'bottom':
            newTop = (groupHeight - textHeight -25) / 2;
            break;
        }
        
        // Update the text position within the group
        this.selectedTextObject.set('top', newTop);
        group.setCoords();
        this.canvas.renderAll();
      }
    }
  }

  setTextBackgroundColor(color: string) {
    this.currentBackgroundColor = color;
    if (this.selectedTextObject) {
      this.selectedTextObject.set('backgroundColor', color);
      this.canvas.renderAll();
    }
  }
  getFillOpacity(): number {
    if (!this.selectedShape) return 1;
    
    let shape = this.selectedShape;
    
    // If it's a group, get the first object's opacity
    if (shape.type === 'group') {
      const group = shape as fabric.Group;
      if (group._objects && group._objects.length > 0) {
        shape = group._objects[0];
      }
    }
    
    const fill = shape.fill;
    
    // If it's a gradient, get opacity from the first color stop
    if (fill instanceof fabric.Gradient) {
      const firstColor = fill.colorStops[0].color;
      return this.extractOpacityFromColor(firstColor);
    }
    
    // For solid colors
    return this.extractOpacityFromColor(fill as string);
  }

  private extractOpacityFromColor(color: string): number {
    // If the color is in rgba format, extract the alpha value
    if (color.startsWith('rgba')) {
      const rgba = color.match(/[\d.]+/g);
      if (rgba && rgba.length >= 4) {
        return parseFloat(rgba[3]);
      }
    }
    
    // For hex or rgb colors, return 1 (fully opaque)
    return 1;
  }

  // Helper method to extract opacity from RGBA color
  getStrokeOpacity(): number {
    if (!this.selectedShape?.stroke) return 1;
    
    let shape = this.selectedShape;
    
    // If it's a group, get the first object's opacity
    if (shape.type === 'group') {
      const group = shape as fabric.Group;
      if (group._objects && group._objects.length > 0) {
        shape = group._objects[0];
      }
    }
    
    if (!shape.stroke) return 1;
    
    const color = shape.stroke as string;
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match && match[4]) {
        return parseFloat(match[4]);
      }
    } else if (color.startsWith('rgb')) {
      // If it's rgb, convert to rgba with full opacity
      return 1;
    } else if (color.startsWith('#')) {
      // If it's hex, it has full opacity
      return 1;
    }
    
    return 1;
  }
   trimTextToFit(textbox: fabric.Textbox): void {
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${textbox.fontSize}px ${textbox.fontFamily}`;
    const maxWidth = textbox.width;

    let text = textbox.text || '';
    let trimmed = '';

    for (let i = 0; i < text.length; i++) {
      const sub = text.slice(0, i + 1);
      if (context.measureText(sub).width <= maxWidth) {
        trimmed = sub;
      } else {
        break;
      }
    }

    textbox.text = trimmed;
  }

  getCurrentFillColor(): string {
    if (!this.selectedShape) return 'transparent';
    
    if (this.selectedShape.type === 'group') {
      return this.getCommonFill([this.selectedShape]);
    }
    
    return this.selectedShape.fill as string || 'transparent';
  }

  getCurrentStrokeWidth(): number {
    if (!this.selectedShape) return 1;
    
    let shape = this.selectedShape;
    
    // If it's a group, get the first object's stroke width
    if (shape.type === 'group') {
      const group = shape as fabric.Group;
      if (group._objects && group._objects.length > 0) {
        shape = group._objects[0];
      }
    }
    
    return shape.strokeWidth || 1;
  }

  // Drag Alignment Methods
  private isClickingSameTextbox(target: fabric.Object): boolean {
    return this.currentActiveTextbox === target;
  }

  private setupDragAlignment() {
    // Handle object moving events
    this.canvas.on('object:moving', (e: fabric.IEvent) => {
      const target = e.target!;
      
      // Apply boundary constraints
      if(!this.ungroub){
       this.constrainObjectToCanvas(target);
      }
      
      if (!this.dragAlignmentEnabled) return;
      
      this.isDragging = true;
      this.showAlignmentGuides(target);
    });

    this.canvas.on('object:modified', (e: fabric.IEvent) => {
      this.isDragging = false;
      this.hideAlignmentGuides();
      
      // Handle textbox scaling after modification
      const target = e.target;
      if (target && target.type === 'textbox') {
        this.handleTextboxScalingYOnly(target as fabric.Textbox);
      }
    });

    this.canvas.on('selection:cleared', () => {
      this.isDragging = false;
      this.hideAlignmentGuides();
    });

    // Global handler for textbox scaling to prevent text distortion
    this.canvas.on('object:scaling', (e: fabric.IEvent) => {
      const target = e.target;
      if (target && target.type === 'textbox') {
        this.handleTextboxScalingYOnly(target as fabric.Textbox);
      }
    });



    // Global handler for textbox text changes
    this.canvas.on('text:changed', (e: fabric.IEvent) => {
      const target = e.target;
      if (target && target.type === 'textbox') {
        // Preserve height when text changes with immediate preservation
        
        // Also ensure height is maintained during typing
        const textbox = target as fabric.Textbox;
        const currentHeight = textbox.height || 50;
        const editStartHeight = (textbox as any).editStartHeight || currentHeight;
        
        if (editStartHeight > 50) {
          const preservedHeight = Math.max(currentHeight, editStartHeight);
          (textbox as any).expandedHeight = preservedHeight;
          
          if (textbox.height !== preservedHeight) {
            textbox.set({ height: preservedHeight });
            textbox.setCoords();
            this.canvas.requestRenderAll();
          }
        }
      }
    });

  }

  // Boundary constraint method
  private constrainObjectToCanvas(object: fabric.Object) {
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    
    // Get object dimensions
    const objectWidth = (object.width || 0) * (object.scaleX || 1);
    const objectHeight = (object.height || 0) * (object.scaleY || 1);
    
    // Define padding/margin from edges (decrease this value to make restrictions looser)
    const edgePadding = -15; // 5px padding from each edge
    
    // Calculate boundaries with padding
    const minX = edgePadding;
    const maxX = canvasWidth - objectWidth - edgePadding;
    const minY = edgePadding;
    const maxY = canvasHeight - objectHeight - edgePadding;
    
    // Constrain position
    let newLeft = object.left || 0;
    let newTop = object.top || 0;
    
    // Apply horizontal constraints
    if (newLeft < minX) {
      newLeft = minX;
    } else if (newLeft > maxX) {
      newLeft = maxX;
    }
    
    // Apply vertical constraints
    if (newTop < minY) {
      newTop = minY;
    } else if (newTop > maxY) {
      newTop = maxY;
    }
    
    // Update object position if it was outside boundaries
    if (newLeft !== object.left || newTop !== object.top) {
      object.set({
        left: newLeft,
        top: newTop
      });
    }
  }

  // Public method to toggle drag alignment
  public toggleDragAlignment() {
    this.dragAlignmentEnabled = !this.dragAlignmentEnabled;
    if (!this.dragAlignmentEnabled) {
      this.hideAlignmentGuides();
    }
  }

  private showAlignmentGuides(movingObject: fabric.Object) {
    this.hideAlignmentGuides();
    
    const movingCenterX = movingObject.left! + (movingObject.width! * movingObject.scaleX!) / 2;
    const movingCenterY = movingObject.top! + (movingObject.height! * movingObject.scaleY!) / 2;
    const movingLeft = movingObject.left!;
    const movingRight = movingObject.left! + (movingObject.width! * movingObject.scaleX!);
    const movingTop = movingObject.top!;
    const movingBottom = movingObject.top! + (movingObject.height! * movingObject.scaleY!);
    
    // Get all other objects on canvas
    const allObjects = this.canvas.getObjects();
    const otherObjects = allObjects.filter(obj => obj !== movingObject);
    
    let hasVerticalGuide = false;
    let hasHorizontalGuide = false;
    
    for (const obj of otherObjects) {
      const objCenterX = obj.left! + (obj.width! * obj.scaleX!) / 2;
      const objCenterY = obj.top! + (obj.height! * obj.scaleY!) / 2;
      const objLeft = obj.left!;
      const objRight = obj.left! + (obj.width! * obj.scaleX!);
      const objTop = obj.top!;
      const objBottom = obj.top! + (obj.height! * obj.scaleY!);
      
      // Center alignment (vertical)
      if (!hasVerticalGuide && Math.abs(movingCenterX - objCenterX) < this.snapThreshold) {
        this.createVerticalGuide(objCenterX);
        this.snapToVerticalGuide(movingObject, objCenterX);
        hasVerticalGuide = true;
      }
      
      // Center alignment (horizontal)
      if (!hasHorizontalGuide && Math.abs(movingCenterY - objCenterY) < this.snapThreshold) {
        this.createHorizontalGuide(objCenterY);
        this.snapToHorizontalGuide(movingObject, objCenterY);
        hasHorizontalGuide = true;
      }
      
      // Edge alignment (left to left)
      if (!hasVerticalGuide && Math.abs(movingLeft - objLeft) < this.snapThreshold) {
        this.createVerticalGuide(objLeft);
        this.snapToLeftEdge(movingObject, objLeft);
        hasVerticalGuide = true;
      }
      
      // Edge alignment (right to right)
      if (!hasVerticalGuide && Math.abs(movingRight - objRight) < this.snapThreshold) {
        this.createVerticalGuide(objRight);
        this.snapToRightEdge(movingObject, objRight);
        hasVerticalGuide = true;
      }
      
      // Edge alignment (top to top)
      if (!hasHorizontalGuide && Math.abs(movingTop - objTop) < this.snapThreshold) {
        this.createHorizontalGuide(objTop);
        this.snapToTopEdge(movingObject, objTop);
        hasHorizontalGuide = true;
      }
      
      // Edge alignment (bottom to bottom)
      if (!hasHorizontalGuide && Math.abs(movingBottom - objBottom) < this.snapThreshold) {
        this.createHorizontalGuide(objBottom);
        this.snapToBottomEdge(movingObject, objBottom);
        hasHorizontalGuide = true;
      }
    }
    
    this.canvas.renderAll();
  }

  private createVerticalGuide(x: number) {
    const guide = new fabric.Line([x, 0, x, this.canvas.height!], {
      stroke: '#ff6b6b',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      hoverCursor: 'default'
    });
    
    this.alignmentGuides.push(guide);
    this.canvas.add(guide);
    this.canvas.sendToBack(guide);
  }

  private createHorizontalGuide(y: number) {
    const guide = new fabric.Line([0, y, this.canvas.width!, y], {
      stroke: '#ff6b6b',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      hoverCursor: 'default'
    });
    
    this.alignmentGuides.push(guide);
    this.canvas.add(guide);
    this.canvas.sendToBack(guide);
  }

  private snapToVerticalGuide(object: fabric.Object, guideX: number) {
    const objectWidth = object.width! * object.scaleX!;
    object.set({ left: guideX - objectWidth / 2 });
  }

  private snapToHorizontalGuide(object: fabric.Object, guideY: number) {
    const objectHeight = object.height! * object.scaleY!;
    object.set({ top: guideY - objectHeight / 2 });
  }

  private snapToLeftEdge(object: fabric.Object, guideX: number) {
    object.set({ left: guideX });
  }

  private snapToRightEdge(object: fabric.Object, guideX: number) {
    const objectWidth = object.width! * object.scaleX!;
    object.set({ left: guideX - objectWidth });
  }

  private snapToTopEdge(object: fabric.Object, guideY: number) {
    object.set({ top: guideY });
  }

  private snapToBottomEdge(object: fabric.Object, guideY: number) {
    const objectHeight = object.height! * object.scaleY!;
    object.set({ top: guideY - objectHeight });
  }

  private hideAlignmentGuides() {
    // Remove all alignment guides
    this.alignmentGuides.forEach(guide => {
      this.canvas.remove(guide);
    });
    this.alignmentGuides = [];
  }

  /**
   * Method that only handles Y-axis scaling to prevent text distortion
   * X-axis scaling is allowed to work normally for width adjustments
   */
  private handleTextboxScalingYOnly(textbox: fabric.Textbox) {
    try {
      // Get current scaling values
      const currentScaleX = textbox.scaleX || 1;
      const currentScaleY = textbox.scaleY || 1;
      
      // Store original dimensions
      const originalWidth = textbox.width || 200;
      const originalHeight = textbox.height || 50;
      
      // For X-axis: allow normal scaling behavior
      // For Y-axis: reset scaling and update height to prevent text distortion
      
      if (currentScaleY !== 1) {
        // Calculate new height based on Y scaling
        const newHeight = originalHeight * currentScaleY;
        
        // Reset only Y scaling to prevent text distortion
        textbox.set({
          scaleY: 1
        });
        
        // Update only the height to match the scaled size
        textbox.set({
          height: newHeight
        });
        (textbox as any).expandedHeight = newHeight;
      }
      
      // Auto-adjust height based on text content
      this.adjustTextboxHeight(textbox);
      
      // Ensure proper text rendering
      textbox.setCoords();
      
      // Force immediate update
      this.canvas.requestRenderAll();
      
    } catch (error) {
      console.warn('Error in Y-only textbox scaling:', error);
    }
  }
  
  private adjustTextboxHeight(textbox: fabric.Textbox) {
    try {
      // Get the current text content
      const text = textbox.text || '';
      if (!text.trim()) return;
      
      // Calculate required height based on text content
      const lines = text.split('\n');
      const lineHeight = textbox.fontSize || 14;
      const lineSpacing = 1.2; // Standard line spacing multiplier
      
      // Calculate total height needed
      const requiredHeight = Math.max(10, lines.length * lineHeight * lineSpacing);
      
      // Get current height and expanded height
      const currentHeight = textbox.height || 50;
      const expandedHeight = (textbox as any).expandedHeight || currentHeight;
      
      // Use the larger of required height or expanded height
      const newHeight = Math.max(requiredHeight, expandedHeight);
      
      // Update height if it's different
      if (textbox.height !== newHeight) {
        textbox.set({ height: newHeight });
        (textbox as any).expandedHeight = newHeight;
      }
      
    } catch (error) {
      console.warn('Error adjusting textbox height:', error);
    }
  }
  

}
