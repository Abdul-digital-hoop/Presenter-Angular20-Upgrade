import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AnnotationService, AnnotationTool, AnnotationSettings } from 'src/app/core/Sevices/Presentation/annotation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-annotation-toolbar',
  templateUrl: './annotation-toolbar.component.html',
  styleUrls: ['./annotation-toolbar.component.scss']
})
export class AnnotationToolbarComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() position: { x: number; y: number } = { x: 50, y: 50 };
  @Output() close = new EventEmitter<void>();

  private readonly toolbarWidth = 280;
  private readonly toolbarHeight = 200;



  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Component state
  currentTool: string = 'pen';
  settings: AnnotationSettings;
  tools: AnnotationTool[] = [];
  
  // UI state
  showColorPicker: boolean = false;
  showSizePicker: boolean = false;
  showSettingsPanel: boolean = false;
  isDragging: boolean = false;
  dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private animationFrameId?: number;

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
      defaultTool: 'pen',
      penColor: '#ff0000',
      penWidth: 3,
      highlighterColor: '#ffff00',
      highlighterWidth: 20,
      textColor: '#000000',
      textSize: 16
    };
  }

  ngOnInit(): void {
    this.subscribeToAnnotationService();
    this.centerToolbar();
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
    const toolSubscription = this.annotationService.currentTool$.subscribe(
      tool => this.currentTool = tool
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
    }

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
    switch (this.currentTool) {
      case 'pen':
        return this.settings.penColor;
      case 'highlighter':
        return this.settings.highlighterColor;
      case 'text':
        return this.settings.textColor;
      default:
        return '#000000';
    }
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
      
      // For right positioning, we need to calculate offset differently
      // Convert right position to left position for calculation
      const windowWidth = window.innerWidth;
      const leftPosition = windowWidth - this.position.x - this.toolbarWidth;
      
      this.dragOffset = {
        x: event.clientX - leftPosition,
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
      // Cancel previous animation frame if exists
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Use requestAnimationFrame for smooth dragging
      this.animationFrameId = requestAnimationFrame(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate new left position
        const newLeftX = event.clientX - this.dragOffset.x;
        const newY = event.clientY - this.dragOffset.y;
        
        // Convert left position back to right position
        const newRightX = windowWidth - newLeftX - this.toolbarWidth;
        
        // Apply boundary constraints to keep toolbar visible
        this.position = {
          x: Math.max(0, Math.min(newRightX, windowWidth - this.toolbarWidth)),
          y: Math.max(0, Math.min(newY, windowHeight - this.toolbarHeight))
        };
      });
      
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
      
      // Cancel any pending animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = undefined;
      }
      
      // Restore cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }

  /**
   * Clean up on component destroy
   */
  ngOnDestroy(): void {
    // Cancel animation frame if component is destroyed while dragging
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
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
    return ['pen', 'highlighter', 'text', 'arrow', 'rectangle', 'circle'].includes(toolId);
  }

  /**
   * Check if tool supports size
   */
  toolSupportsSize(toolId: string): boolean {
    return ['pen', 'highlighter', 'text'].includes(toolId);
  }




}