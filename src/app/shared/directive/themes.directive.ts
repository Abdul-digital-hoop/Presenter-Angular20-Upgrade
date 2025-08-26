import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, OnDestroy } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';

@Directive({
    selector: '[appThemes]',
    standalone: false
})
export class ThemesDirective implements OnInit, OnChanges, AfterViewChecked, AfterViewInit, OnDestroy {
  @Input('appThemes') themesData: any;
  private appliedTheme: string = '';
  private initialized = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    public workspaceService: WorkspaceService,
    private cdr: ChangeDetectorRef,
    private presentationService: PresentationService
  ) {
  }

  ngOnInit() {
    this.applyThemeStyles();
  }

  ngAfterViewInit() {
    this.initialized = true;
    // Wait for next tick to apply styles
    setTimeout(() => {
      this.applyThemeStyles();
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.themesData && changes.themesData.currentValue) {
      const newThemeSignature = this.createThemeSignature(changes.themesData.currentValue);
        this.appliedTheme = newThemeSignature;
        setTimeout(() => {
          this.applyThemeStyles();
          this.cdr.detectChanges();
        });
    }
  }

  private createThemeSignature(theme: any): string {
    return JSON.stringify({
      bg: theme?.ThemeBackgroundColor,
      text: theme?.ThemeTextColor,
      font: theme?.ThemeFontFamily,
      size: theme?.slidetextSize,
      styles: {
        bold: theme?.slideTextBold,
        italic: theme?.slideTextItalic,
        underline: theme?.slideTextUnderLine,
        strikethrough: theme?.slideTextStrikeThrough
      }
    });
  }

  private applyThemeStyles() {
    if (!this.themesData) return;
    
    // Apply base styles to the container
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.themesData?.ThemeBackgroundColor || '');
    this.renderer.setStyle(this.el.nativeElement, 'color', this.themesData?.ThemeTextColor || '');
    this.renderer.setStyle(this.el.nativeElement, 'fontFamily', this.themesData?.ThemeFontFamily || '');

    // Try multiple times with increasing delays
    this.tryApplyStyles();
  }

  private tryApplyStyles(attempt = 0) {
    const targetClass = 'font-styling-empty-class';
    const elements = Array.from(this.el.nativeElement.getElementsByClassName(targetClass)) as HTMLElement[];

    if (elements.length === 0 && attempt < 3) {
      // Retry with increasing delay if elements aren't found
      setTimeout(() => {
        this.tryApplyStyles(attempt + 1);
      }, 1000 * Math.pow(2, attempt)); // Exponential backoff
      return;
    }

    if (elements.length === 0) {
      // Final fallback to document query
      const allElements = Array.from(document.querySelectorAll(`.${targetClass}`)) as HTMLElement[];
      const relevantElements = allElements.filter(element => 
        this.el.nativeElement.contains(element)
      );
      this.applyStylesToElementsAndChildren(relevantElements);
      } else {
      this.applyStylesToElementsAndChildren(elements);
    }

    // Trigger change detection
    this.cdr.detectChanges();
  }

  private applyStylesToElementsAndChildren(elements: HTMLElement[]) {
    elements.forEach((element: HTMLElement) => {
      this.applyTextStyles(element);
    });
  }

  private applyTextStyles(element: HTMLElement) {
    if (!element) return;

    const styles = {
      'fontStyle': this.themesData?.slideTextItalic ? 'italic' : 'normal',
      'fontWeight': this.themesData?.slideTextBold ? 'bold' : 'normal',
      'fontSize': this.calculateFontSize() + 'px',
      'textDecoration': this.getTextDecoration(),
      'color': this.themesData?.ThemeTextColor || ''
    };

    Object.entries(styles).forEach(([property, value]) => {
      this.renderer.setStyle(element, property, value);
    });
    element.classList.remove('visibility-hidden');
  }

  private calculateFontSize(): number {
    if (this.workspaceService.presentationMode) {
      const baseSize = this.themesData?.slidetextSize || 0;
      return baseSize + (baseSize - 20) + 10;
    }
    return this.themesData?.slidetextSize || 0;
  }

  private getTextDecoration(): string {
    const decorations = [];
    if (this.themesData?.slideTextUnderLine) decorations.push('underline');
    if (this.themesData?.slideTextStrikeThrough) decorations.push('line-through');
    return decorations.length ? decorations.join(' ') : 'none';
  }

  ngAfterViewChecked() {
    // Only apply control styles if they haven't been applied yet
    if (this.themesData) {
      this.applyControlStyles();
    }
  }

  private applyControlStyles() {
    const controls = {
      '.position-absolute-menu-left': true,
      '.position-menu-bottom-first': true,
      '.position-menu-bottom-second': true,
      '.access-bar-contant': false,
      '.position-menu-bottom-last': false,
      '.position-absolute-menu-top': false,
      '.position-menu-bottom-info': false,
      '.position-menu-bottom-info-toolbar': false,
    };

    Object.entries(controls).forEach(([selector, isSingle]) => {
      if (isSingle) {
        const element = this.el.nativeElement.querySelector(selector);
        if (element) {
          this.renderer.setStyle(element, 'background', 
            this.getBackgroundColorWithOpacity(this.themesData?.ThemeBackgroundColor, 0.2));
        }
      } else {
        const elements = this.el.nativeElement.querySelectorAll(selector);
        elements?.forEach(element => {
          this.renderer.setStyle(element, 'background',
            this.getBackgroundColorWithOpacity(this.themesData?.ThemeBackgroundColor, 0.2));
        });
      }
    });
  }

  private getBackgroundColorWithOpacity(color: string, opacity: number): string {
    if (!color) return '';
    const rgb = this.getRgbValues(color);
    const contrast = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return contrast < 128 ? `rgba(0, 0, 0, 0.5)` : `rgba(0, 0, 0, 0.2)`;
  }

  private getRgbValues(color: string): number[] {
    if (!color) return [0, 0, 0];
    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    }
    return color.match(/\d+/g)?.map(Number) || [0, 0, 0];
  }

  private hexToRgb(hex: string): number[] {
    const hexValue = hex.replace(/^#/, '');
    return [
      parseInt(hexValue.substr(0, 2), 16),
      parseInt(hexValue.substr(2, 2), 16),
      parseInt(hexValue.substr(4, 2), 16)
    ];
  }

  ngOnDestroy() {
  }
}

