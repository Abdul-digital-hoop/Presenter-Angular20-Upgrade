import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { AnnotationService, AnnotationTool, AnnotationSettings } from 'src/app/core/Sevices/Presentation/annotation.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-annotation-toolbar',
    templateUrl: './annotation-toolbar.component.html',
    styleUrls: ['./annotation-toolbar.component.scss'],
    standalone: false
})
export class AnnotationToolbarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() position: { x: number; y: number } = { x: 50, y: 50 };
  @Output() close = new EventEmitter<void>();
  @ViewChild('annotationToolbar') AnnotationToolbar: ElementRef<HTMLImageElement>;
  
  private toolbarWidth = 280;
  private toolbarHeight = 200;



  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Component state
  currentTool: string = 'none';
  settings: AnnotationSettings;
  tools: AnnotationTool[] = [];
  
  // UI state
  showColorPicker: boolean = false;
  showSizePicker: boolean = false;
  showSettingsPanel: boolean = false;
  isDragging: boolean = false;
  dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  // Color options
  colors: string[] = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#000000', '#ffffff', '#808080', '#ffa500', '#800080', '#008000'
  ];

  // Size options
  sizes: { value: number; label: string }[] = [
    { value: 3, label: 'S' },
    { value: 8, label: 'M' },
    { value: 12, label: 'L' },
    { value: 20, label: 'XL' }
  ];

  constructor(private annotationService: AnnotationService) {
    this.tools = this.annotationService.tools;
    this.settings = {
      persistAcrossSlides: true,
      defaultTool: 'none',
      penColor: '#ff0000',
      penWidth: 3,
      highlighterColor: '#ffff00',
      highlighterWidth: 20,
      textColor: '#000000',
      textSize: 16,
      shapeWidth: 8,
      arrowWidth: 8
    };
  }

  ngOnInit(): void {
    this.currentTool = 'none';
    this.subscribeToAnnotationService();
    this.centerToolbar();
  }

  ngOnChanges(): void {
    if (this.isVisible) {
      this.currentTool = 'none';
    }
  }

  ngAfterViewInit(): void {
    const rect = this.AnnotationToolbar.nativeElement.getBoundingClientRect();
    this.toolbarWidth = rect.width;
    this.toolbarHeight = rect.height;
  }
  private centerToolbar(): void {
    const windowHeight = window.innerHeight;
    
    const centerY = (windowHeight - this.toolbarHeight) / 2;
    
    this.position = {
      x: 20,      
      y: centerY   
    };
  }


  /**
   * Subscribe to annotation service observables
   */
  private subscribeToAnnotationService(): void {
    const toolSubscription = this.annotationService.currentTool$.pipe(
      distinctUntilChanged()
    ).subscribe(
      tool => {
        this.currentTool = tool;
        console.log('Annotation toolbar received tool:', tool, 'isVisible:', this.isVisible);
      }
    );

    const settingsSubscription = this.annotationService.annotationSettings$.subscribe(
      settings => this.settings = settings
    );

    this.subscriptions.push(toolSubscription, settingsSubscription);
  }

  /**
   * Handle tool selection
   */
  selectTool(toolId: string): void {
    this.annotationService.setCurrentTool(toolId);
    this.hideAllPickers();
  }



  /**
   * Handle color selection
   */
  selectColor(color: string): void {
    const updates: Partial<AnnotationSettings> = {};
    
    switch (this.currentTool) {
      case 'pen':
        updates.penColor = color;
        break;
      case 'highlighter':
        updates.highlighterColor = color;
        break;
      case 'text':
        updates.textColor = color;
        break;
      case 'rectangle':
      case 'circle':
      case 'triangle':
        updates.penColor = color; // Use penColor for shapes
        console.log('Setting shape color to penColor:', color);
        break;
      case 'arrow':
        updates.penColor = color; // Use penColor for arrows
        console.log('Setting arrow color to penColor:', color);
        break;
    }

    console.log('Updating annotation settings with:', updates);
    this.annotationService.updateSettings(updates);
    this.showColorPicker = false;
  }

  /**
   * Handle size selection
   */
  selectSize(size: number): void {
    const updates: Partial<AnnotationSettings> = {};
    
    switch (this.currentTool) {
      case 'pen':
        updates.penWidth = size;
        break;
      case 'highlighter':
        updates.highlighterWidth = size * 3; // Highlighter is typically wider
        break;
      case 'text':
        updates.textSize = size + 10; // Text size offset
        break;
      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'arrow':
        return;
    }

    this.annotationService.updateSettings(updates);
    this.showSizePicker = false;
  }

  /**
   * Clear all annotations
   */
  clearAnnotations(): void {
    this.annotationService.clearAnnotations();
  }

  /**
   * Toggle persistence setting
   */
  togglePersistence(): void {
    this.annotationService.updateSettings({
      persistAcrossSlides: !this.settings.persistAcrossSlides
    });
  }

  /**
   * Get current color for active tool
   */
  getCurrentColor(): string {
    let color: string;
    
    switch (this.currentTool) {
      case 'pen':
        color = this.settings.penColor;
        break;
      case 'highlighter':
        color = this.settings.highlighterColor;
        break;
      case 'text':
        color = this.settings.textColor;
        break;
      case 'rectangle':
      case 'circle':
      case 'triangle':
        color = this.settings.penColor; // Use penColor for shapes
        break;
      case 'arrow':
        color = this.settings.penColor; // Use penColor for arrows
        break;
      case 'none':
      default:
        color = '#000000';
    }    
    return color;
  }

  /**
   * Get current size for active tool
   */
  getCurrentSize(): number {
    switch (this.currentTool) {
      case 'pen':
        return this.settings.penWidth;
      case 'highlighter':
        return this.settings.highlighterWidth;
      case 'text':
        return this.settings.textSize;
      case 'rectangle':
      case 'circle':
      case 'triangle':
        return 8;
      case 'arrow':
        return 8;
      case 'none':
      default:
        return 3;
    }
  }

  /**
   * Hide all picker panels
   */
  hideAllPickers(): void {
    this.showColorPicker = false;
    this.showSizePicker = false;
    this.showSettingsPanel = false;
  }

  /**
   * Toggle color picker
   */
  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
    this.showSizePicker = false;
    this.showSettingsPanel = false;
  }

  /**
   * Toggle size picker
   */
  toggleSizePicker(): void {
    this.showSizePicker = !this.showSizePicker;
    this.showColorPicker = false;
    this.showSettingsPanel = false;
  }

  /**
   * Toggle settings panel
   */
  toggleSettingsPanel(): void {
    this.showSettingsPanel = !this.showSettingsPanel;
    this.showColorPicker = false;
    this.showSizePicker = false;
  }


  /**
   * Close toolbar
   */
  closeToolbar(): void {
    this.hideAllPickers();
    this.annotationService.forceResetTool();
    
    // Emit the close event - let the parent component handle the annotation mode
    this.close.emit();
    // Clear annotation data when toolbar is closed
    this.annotationService.clearAnnotations();
  }

  /**
   * Handle mouse down for dragging
   */
  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Don't start dragging if clicking on close button or its children
    if (target.classList.contains('close-btn') || 
        target.closest('.close-btn')) {
      return;
    }
    
    // Check if click is on header or header elements
    if (target.classList.contains('toolbar-header') || 
        target.classList.contains('toolbar-title') ||
        target.closest('.toolbar-header')) {
      
      this.isDragging = true;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const toolbarRightEdge = windowWidth - this.position.x;
      
      this.dragOffset = {
        x: event.clientX - toolbarRightEdge,  
        y: event.clientY - this.position.y    
      };
      
      // Prevent text selection and default behavior
      event.preventDefault();
      event.stopPropagation();
      
      // Add cursor style to body for smooth dragging
      document.body.style.cursor = 'move';
      document.body.style.userSelect = 'none';
    }
  }

  /**
   * Handle mouse move for dragging
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const newRightEdge = event.clientX - this.dragOffset.x;
      const newY = event.clientY - this.dragOffset.y;
      
      const constrainedRightEdge = Math.max(-75, Math.min(newRightEdge, windowWidth));
      const constrainedY = Math.max(0, Math.min(newY, windowHeight - this.toolbarHeight));
      
      const newRightPosition = windowWidth - constrainedRightEdge;
      
      this.position = {
        x: newRightPosition,
        y: constrainedY
      };
      
      event.preventDefault();
    }
  }

  /**
   * Handle mouse up for dragging
   */
  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      
      // Restore cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }

  /**
   * Clean up on component destroy
   */
  ngOnDestroy(): void {
    // Restore cursor styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  getToolIcon(toolId: string): string {
    const tool = this.tools.find(t => t.id === toolId);
    return tool ? tool.icon : '🔧';
  }

  /**
   * Get tool name
   */
  getToolName(toolId: string): string {
    const tool = this.tools.find(t => t.id === toolId);
    return tool ? tool.name : 'Unknown';
  }

  /**
   * Check if tool supports color
   */
  toolSupportsColor(toolId: string): boolean {
    const supportsColor = ['pen', 'highlighter', 'text', 'arrow', 'rectangle', 'circle', 'triangle'].includes(toolId);
    return supportsColor && toolId !== 'none';
  }

  /**
   * Check if tool supports size
   */
  toolSupportsSize(toolId: string): boolean {
    return ['pen', 'highlighter'].includes(toolId) && toolId !== 'none';
  }




}