import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, Renderer2, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import * as cloud from 'd3-cloud';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

const LAYOUT = {
  width: 1024,
  height: 640,
};
interface Scale {
  width: number;
  height: number;
  bounds: { width: number; height: number };
}
const MARGIN = {
  top: LAYOUT.height * 0.05,
  right: LAYOUT.width * 0.05,
  bottom: LAYOUT.height * 0.05,
  left: LAYOUT.width * 0.05,
};

const WORD_PADDING = 1;
const FONT_SIZE_SCALE = 3;
const FONT_BASE_SIZE = 5;
const MAX_FONT_SIZE = 100;
const MIN_FONT_SIZE = 20;
const ANIMATION_DURATION = 600;
const CENTER_RADIUS = 200;
const VERTICAL_WORDS_PROPORTION = 0.5;
const MAX_LENGTH_VERTICAL_WORD = 7;
const MIN_LENGTH_HORIZONTAL_WORD = 2;
const Svg_Width = 555;
const Svg_Height = 240;

@Component({
    selector: 'app-word-cloud',
    templateUrl: './word-cloud.component.html',
    styleUrls: ['./word-cloud.component.scss'],
    standalone: false
})
export class WordCloudComponent implements OnInit, OnDestroy, AfterViewInit {
  private wordCloud: any;
  private initialRender: boolean = true;
  @Input() slideTheme: any;
  hideResponse: boolean = true;
  WordCloudData: any[] = [];
  WordCloudchart: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  scaleValue: number = 1;
  width: number;
  height: number;
  words = [
    { text: 'revenue', size: 20 },
    { text: 'market reach', size: 60 },
    { text: 'customer', size: 24 },
    { text: 'satisfaction', size: 35 },
    { text: 'product quality', size: 40 },
    { text: 'costs', size: 28 },
    { text: 'brand', size: 25 },
    { text: 'productivity', size: 30 },
    { text: 'partnerships', size: 22 },
    { text: 'services goals', size: 20 },
  ];
  private scaleGroup: any;
  private mainGroup: any;
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any
  @Input() viewfrom:string='';
  @Input() presentationMode:any;
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  originalWordCloudData: any[] = [];
  slideLayoutType:any;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  isAnimation: boolean = false;
  constructor(private el: ElementRef, private renderer: Renderer2, private _commanservice: CommanService, public _workspaceservice: WorkspaceService) {
    
  }

  ngOnInit(): void {
    var wordCloudOptions= this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.WordCloudData = wordCloudOptions.filter(x => x.ModerateAnswer === false);
    this.WordCloudData = this._workspaceservice.profanityWordsChecksForWord(this.WordCloudData);
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.slideTheme = this.slideDetails?.design.resetThemes ? this.slidesTheme: this.presentationTheme;
    this.slideLayoutType = this._workspaceservice.getMasterLayoutData(this.slideDetails?.design?.slideLayoutId);
 
  }

  ngAfterViewInit(): void {
    if( this.WordCloudData.length === 0 && !this.presentationMode){
      this.defaultChart();
    }else{
      this.wordCloud = this.createWordCloud('#WordCloud-'+this.slideDetails?.slideId+'-'+this.viewfrom);
      this.showNewWords();
      this.originalWordCloudData = [...this.WordCloudData];
    }
    this.resizeSvg();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resizeSvg();
  }

  ngOnDestroy(): void {  this.stopRandomDataUpdates();}

  private assignThemeProperties(presentationLevelTheme: any, slideDetails?: any, isSlideTheme: boolean=false): any {
    const themeProperties = {
      ThemeName: presentationLevelTheme?.themeName,
      ThemeLogo: presentationLevelTheme?.themesLogo,
      ThemeTextColor: isSlideTheme ? slideDetails?.slideTextColor : presentationLevelTheme?.themesFontColor,
      backgroundColorOpacity: presentationLevelTheme?.backgroundColorOpacity,
      ThemeFontFamily: isSlideTheme ? slideDetails?.slideTextFontFamily : presentationLevelTheme?.themesFonts,
      ThemeBackgroundImage: presentationLevelTheme?.themesBackgroundImage,
      ThemeLineColor: isSlideTheme ? slideDetails?.slideLineColor : presentationLevelTheme?.lineClour,
      ThemeBackgroundColor: isSlideTheme ? slideDetails?.slideBackgroundColor : presentationLevelTheme?.themesBackgroundColor,
      ThemeVisualizationColor: presentationLevelTheme?.themesChartColor,
      slideTextBold: isSlideTheme ? slideDetails?.slideTextBold : presentationLevelTheme?.textBold,
      slideTextItalic: isSlideTheme ? slideDetails?.slideTextItalic : presentationLevelTheme?.textItalic,
      slideTextUnderLine: isSlideTheme ? slideDetails?.slideTextUnderLine : presentationLevelTheme?.textUnderline,
      slideTextStrikeThrough: isSlideTheme ? slideDetails?.slideTextStrikeThrough : presentationLevelTheme?.textStrikeout,
      slidetextSize: isSlideTheme ? slideDetails?.slideTextFontSize : presentationLevelTheme?.fontSize
    };
    return themeProperties;
  }
  private resizeSvg() {
    d3.select(`#WordCloud-${this.slideDetails?.slideId}-${this.viewfrom} svg`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${LAYOUT.width},${LAYOUT.height}`);
  }
  private showNewWords() {
    const words = this.getWords();
    this.calculateWordBounds(words);  // Calculate word bounds with dynamic font size
    const filteredWords = words.filter(word => word.value > 0);
    this.wordCloud.update(filteredWords);
    this.applyScale();
  }

  private createWordCloud(selector: string) {
    const customColors = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];
    const fill = d3.scaleOrdinal(customColors);

    const svg = d3.select(selector).append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
        var translateY = LAYOUT.height / 2;
        var translateX = LAYOUT.width / 2;
       if (!this.presentationMode && this.viewfrom != 'editPresentation' ) {
        translateY = 230;
        }
    this.mainGroup = svg.append('g') // Store in class property
        .attr('class', 'gelement')
        .attr('transform', `translate(${translateX},${translateY})`);

    this.scaleGroup = this.mainGroup.append('g') // Store in class property
        .attr('class', `scale`);

    return {
        update: (words: any[]) => {
            const totalWords = words.length;
            this.calculateWallSize(words);

            cloud()
                .size([LAYOUT.width,LAYOUT.height])
                .font('Lexend Deca')
                .text((d) => d.text)
                .fontSize((d: any) => this.getFontSize({ value: d.value, totalWords }))
                .padding(WORD_PADDING)
                .spiral('archimedean')
                .rotate((d, i) => this.getRotation(d.key, i))
                .words(words)
                .start();

            if (words.length === 1) {
                words.forEach((word, index) => {
                    if (index === 0) {
                        word.x = 0;
                        word.y = 0;
                    }
                });
            }
            //this.scaleGroup.selectAll('*').remove();
            const elements = this.scaleGroup.selectAll('g') // Use class property
                .data(words, (d: any) => d.text);

            const enter = elements.enter()
                .append('g')
                .style('opacity', 0);

            enter.append('rect')
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y)
                .attr('width', (d: any) => d.size * 5)
                .attr('height', (d: any) => d.size)
                .attr('rx', (d: any) => `${d.size - 8}px`)
                .attr('fill', (d, i) => fill(String(i)))
                .style('display', this.slideDetails.settings.showInResults ? 'none' : 'block');

            enter.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .attr('font-family', 'Lexend Deca')
                .attr('fill', (d, i) => fill(String(i)))
                .attr('text-anchor', 'middle')
                .attr('font-size', (d: any) => `${d.size}px`)
                .text((d: any) => d.text)
                .attr('transform', (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .style('display', this.slideDetails.settings.showInResults ? 'block' : 'none');

            enter.transition()
                .duration(ANIMATION_DURATION)
                .style('opacity', 1);

            elements.select('text')
                .transition()
                .duration(1500)
                .attr('x', 0)
                .attr('y', 0)
                .attr('font-family', 'Lexend Deca')
                .attr('fill', (d, i) => fill(String(i)))
                .attr('font-size', (d: any) => `${d.size}px`)
                .text((d: any) => d.text)
                .attr('transform', (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .style('display', this.slideDetails.settings.showInResults ? 'block' : 'none');

            elements.select('rect')
                .transition()
                .duration(1500)
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y)
                .attr('width', (d: any) => d.size * 5)
                .attr('height', (d: any) => d.size)
                .attr('rx', (d: any) => `${d.size-2 }px`)
                .attr('fill', (d, i) => fill(String(i)))
                .style('display', this.slideDetails.settings.showInResults ? 'none' : 'block');

            elements.exit()
                .transition()
                .duration(200)
                .style('opacity', 0)
                .remove();

                 const delay = this.WordCloudData.length === 1 ? 0 : 1000;
                   requestAnimationFrame(() => {
        setTimeout(() => {
            this.applyScale(); 
        }, delay);
    });
        }
    };
}

applyScale() {
  if (!this.scaleGroup || !this.mainGroup) {
    console.error("scaleGroup or mainGroup is undefined");
    return;
  }

  requestAnimationFrame(() => {  // Ensure browser updates before calculation
    const bounds = this.scaleGroup.node()?.getBBox() ?? { width: 0, height: 0 };
    if (bounds.width === 0 || bounds.height === 0) {
      console.warn("Bounding box not correctly calculated, retrying...");
      return;
    }
    let scale: number;


      scale = this.getScale({ width: LAYOUT.width, height: LAYOUT.height, bounds });
    
    

    this.scaleGroup.transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr('transform', `scale(${scale})`);

    const boundsCenter = this.scaleGroup.node()?.getBBox() as DOMRect;
    const translateX = (LAYOUT.width - boundsCenter.width) / 2 - boundsCenter.x;
    const translateY = (LAYOUT.height - boundsCenter.height) / 2 - boundsCenter.y;
if(this._workspaceservice.presentationMode){
    this.mainGroup.transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr('transform', `translate(${translateX}, ${translateY})`);
}
  });
}

  private getScale = ({ width, height, bounds }: Scale): number => {
    const commonwidth = LAYOUT.width - MARGIN.left - MARGIN.right;
    const commonheight = LAYOUT.height - MARGIN.top - MARGIN.bottom;

    // Calculate base scale based on available space
    const baseScaleWidth = width / bounds.width;
    const baseScaleHeight = height / bounds.height;
    let baseScale = Math.min(baseScaleWidth, baseScaleHeight);

    // Calculate content density factor
    const contentArea = bounds.width * bounds.height;
    const availableArea = width * height;
    const densityFactor = Math.sqrt(contentArea / availableArea);

    // Calculate size factor based on available space
    const sizeFactor = Math.min(width / commonwidth, height / commonheight);
    
    // Adjust scale based on size - larger scale for smaller dimensions
    let adjustedScale = baseScale * densityFactor;
    
    // Apply inverse scaling - larger scale for smaller dimensions
    if (sizeFactor < 0.3) {
      adjustedScale *= 2.7; // Much larger scale for small dimensions
    }
    else if (sizeFactor < 0.4) {
      adjustedScale *= 2.4; // Larger scale for medium-small dimensions
    } else if (sizeFactor < 0.60) {
      adjustedScale *= 1.8; // Larger scale for medium-small dimensions
    }
      else if (sizeFactor < 0.85) {
      adjustedScale *= 1.2; // Larger scale for medium-small dimensions
    } else if (sizeFactor > 1.2) {
      adjustedScale *= 0.8; // Smaller scale for large dimensions
    }

    // Apply minimum and maximum scale limits
    const minScale = 0.8;  // Increased minimum scale
    const maxScale = 3.0;  // Increased maximum scale
    adjustedScale = Math.max(minScale, Math.min(maxScale, adjustedScale));

    // Additional adjustment for presentation mode
    if (this.presentationMode) {
      adjustedScale *= 1.2;
    }

    // Adjust for non-default layouts
    if (this.slideLayoutType?.layoutType !== 'Default') {
      adjustedScale *= 1.1;
    }

    return adjustedScale;
  };
   

  private getRotation(key: any, i: number): number {
    let rotation = 0;
    const wordShouldRotate = !(
      i < 3 ||
      key.length >= MAX_LENGTH_VERTICAL_WORD ||
      key.length <= MIN_LENGTH_HORIZONTAL_WORD
    );
    if (wordShouldRotate) {
      rotation = Math.random() < VERTICAL_WORDS_PROPORTION ? -90 : 0;
    }
    return rotation;
  }

  private getFontSize = ({ value, totalWords }: { value: number, totalWords: number }): number => {
    const { width, height } = this.getSvgGroupWidthHeight('#WordCloud-' + this.slideDetails?.slideId + '-' + this.viewfrom);
    const availableArea = width * height;
  
    const normalizedValue = Math.max(value, 1);
    const isLayoutActive = this._workspaceservice.slideLayoutActive;
  
    // Base font size using logarithmic scale
    let baseSize = 10 + Math.log(normalizedValue) * 9;
  
    // Handle both value and totalWords together
    let factor = 1;
  
    if (totalWords <= 3 && value <= 3) {
      factor = 4.8; // very few + small value → make it large
    } else if (totalWords <= 3 && value > 3) {
      factor = 3.5; // few words + high value
    } else if (totalWords <= 10 && value <= 3) {
      factor = 3.2; // low value, small list
    } else if (totalWords <= 10 && value > 3) {
      factor = 2.7;
    } else if (totalWords <= 20 && value <= 3) {
      factor = 2.5;
    } else if (totalWords <= 20 && value > 3) {
      factor = 2.2;
    } else if (totalWords <= 40 && value <= 3) {
      factor = 1.6;
    } else if (totalWords <= 40 && value > 3) {
      factor = 1.4;
    } else if (totalWords <= 80 && value <= 3) {
      factor = 1.2;
    } else if (totalWords <= 80 && value > 3) {
      factor = 1.0;
    } else {
      factor = 0.8; // 80+ total words → shrink
    }
  
    // Boost for slideLayoutInactive
    if (!isLayoutActive) {
      factor *= 1.2;
    }
  
    // Calculate final font size
    let fontSize = baseSize * factor;
  
    // Area-based max per word
    const areaBasedMax = Math.sqrt(availableArea / totalWords) * 0.45;
  
    // Clamp
    const MIN = 10;
    const MAX = 65;
    return Math.max(MIN, Math.min(fontSize, areaBasedMax, MAX));
  };
  
  
  

  private calculateWordBounds(words: any[]): void {
    const tempSvg = d3.select('body').append('svg').style('visibility', 'hidden');
   
    const tempText = tempSvg.append('text')
      .attr('font-family', 'Lexend Deca')
      .attr('fill', 'black')
      .attr('text-anchor', 'middle');
      const totalWords = words.length; 
    words.forEach((word: any, index: number) => {
      const fontSize = this.getFontSize({ value: word.value, totalWords});
      const rotation = this.getRotation(word.text, index);
     
      tempText
        .attr('font-size', `${fontSize}px`)
        .text(word.text);
     
      const bbox = tempText.node().getBBox();
 
      // Calculate rotated dimensions
      const angleInRadians = (Math.abs(rotation) * Math.PI) / 180;
      const rotatedWidth =
        Math.abs(bbox.width * Math.cos(angleInRadians)) +
        Math.abs(bbox.height * Math.sin(angleInRadians));
      const rotatedHeight =
        Math.abs(bbox.width * Math.sin(angleInRadians)) +
        Math.abs(bbox.height * Math.cos(angleInRadians));
     
      word.wordsWidth = rotatedWidth;
      word.wordsHeight = rotatedHeight;
      word.size1 = fontSize;
      word.rotation = rotation;
    });
 
    const svgBBox = tempSvg.node().getBBox();
    const svgWidth = svgBBox.width;
    const svgHeight = svgBBox.height;
 
    tempSvg.remove();
  }
 
  private getSvgGroupWidthHeight(selector: string): { width: number; height: number } {
    const element = this.el.nativeElement.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
      };
    }
    return { width: 0, height: 0 };
  }

  private getWords() {
    const wordCounts: { [key: string]: number } = {};

    this.WordCloudData.forEach(data => {
      const answers = data.Answer.split(/\s*,\s*/).map(a => a.trim().toLowerCase()).filter(a => a.length > 0);
      answers.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    const words = Object.entries(wordCounts).map(([word, count]) => ({
      text: word,
      key: word,
      value: count,
      bbox: 0
    }));

    const sortedWords = words.sort((a, b) => b.value - a.value);


    return sortedWords;
  }
 
private calculateWallSize(words: { wordsWidth: number; wordsHeight: number }[]): void {
  const spacing = 1; // Adjust spacing between words
  let totalWidth = 0;
  let totalHeight = 0;
  let rowWidth = 0;
  let rowHeight = 0;
 
  // Calculate the total room size row by row
  for (const word of words) {
    if (rowWidth + word.wordsWidth + spacing > totalWidth) {
      // Move to the next row
      totalHeight += rowHeight + spacing;
      rowWidth = 0;
      rowHeight = 0;
    }
 
    rowWidth += word.wordsWidth + spacing;
    rowHeight = Math.max(rowHeight, word.wordsHeight);
    totalWidth = Math.max(totalWidth, rowWidth);
  }
 
  // Account for the last row
  totalHeight += rowHeight;

  // Calculate base dimensions
  const baseWidth = Math.max(totalWidth, totalHeight);
  const baseHeight = Math.max(totalWidth, totalHeight);

  // Dynamic sizing based on word count
  if (words.length >= 400) {
    this.width = 1000;
    this.height = 700;
  } else if (words.length >= 150) {
    this.width = LAYOUT.width - MARGIN.left - MARGIN.right;
    this.height = LAYOUT.height - MARGIN.top - MARGIN.bottom;
  } else {
    // Calculate dimensions based on content density
    const contentArea = totalWidth * totalHeight;
    const densityFactor = Math.sqrt(contentArea / (Svg_Width * Svg_Height));
    
    if (contentArea > Svg_Width * Svg_Height) {
      // Content is too large, scale it down
      const scaleX = Svg_Width / totalWidth;
      const scaleY = Svg_Height / totalHeight;
      const scale = Math.min(scaleX, scaleY);
      
      words.forEach(word => {
        word.wordsWidth *= scale;
        word.wordsHeight *= scale;
      });
      
      this.width = Math.min(Svg_Width, totalWidth * scale) + 100;
      this.height = Math.min(Svg_Height, totalHeight * scale) + 50;
    } else {
      // Content fits, add padding
      this.width = baseWidth + (baseWidth * 0.2); // 20% padding
      this.height = baseHeight + (baseHeight * 0.2); // 20% padding
      
      // Ensure minimum dimensions
      this.width = Math.max(this.width, 300);
      this.height = Math.max(this.height, 100);
    }
  }

  // Adjust for presentation mode
  if (this.presentationMode) {
    this.width = LAYOUT.width - MARGIN.left - MARGIN.right;
    this.height = LAYOUT.height - MARGIN.top - MARGIN.bottom;
  }

  // Ensure dimensions don't exceed maximum bounds
  this.width = Math.min(this.width, LAYOUT.width);
  this.height = Math.min(this.height, LAYOUT.height);
}



defaultChart(){
  const width = 500;
  const height = 300;

  const layout = cloud()
    .size([width, height])
    .words(this.words.map(d => ({ text: d.text, size: d.size })))
    .padding(5)
    .rotate((d, i) => this.getRotation(d.text, i))
    .font('Lexend Deca')
    .fontSize(d => d.size)
    .on('end', (words) => this.draw(words, width, height));

  layout.start();
}
draw(words: { text: string; size: number; x: number; y: number; rotate: number }[], width: number, height: number) {
  const customColors = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];
  const opacityValue = this._workspaceservice.presentationTheme?.ThemeName === 'Slid Light' ? 0.2 : 0.4;
  d3.select('#WordCloud-'+this.slideDetails?.slideId+'-'+this.viewfrom).select('svg').remove();
  const questions = this._workspaceservice.questions;
  const questionsLength = questions?.length ?? 0;
  const isUndefinedOrZero = !questions || questionsLength === 0;
  const isNinetyOrAbove = questionsLength >= 90;
  const translateY =240;
  const scale = (isUndefinedOrZero || isNinetyOrAbove) ? 1 : 1.2;
  const svg = d3.select('#WordCloud-'+this.slideDetails?.slideId+'-'+this.viewfrom)
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${480},${translateY}) scale(${scale})`);


  svg.selectAll('text')
    .data(words as any)
    .enter().append('text')
    .style('font-family','Lexend Deca')
    .style('font-size', (d: any) => `${d.size}px`)
    .style('fill', (d: any, i: number) => customColors[i % customColors.length])
    .attr('text-anchor', 'middle')
    .attr('opacity',opacityValue)
    .attr('transform', (d: any) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
    .text((d: any) => d.text);
}

private dynamicChartResponseLoad() {
  this.updateChart(this.WordCloudData);
}

  updateChart(value: any) {
    this.WordCloudData = value.filter(item =>item.ModerateAnswer == false);
    this.WordCloudData = this._workspaceservice.profanityWordsChecksForWord(this.WordCloudData);
     this.resizeSvg();
    this.showNewWords();
  }

  updateTheme(data: any) {
    this.slideTheme = data;
    if( this.WordCloudData.length === 0 && !this.presentationMode){
      const opacityValue = this._workspaceservice.presentationTheme?.ThemeName === 'Slid Light' ? 0.2 : 0.4;
      d3.select(`#WordCloud-${this.slideDetails?.slideId}-${this.viewfrom} svg`)
      .selectAll('text')
      .transition()
      .duration(500)
      .attr('opacity',opacityValue);
    }
  }

  
  updateChartWithRandomData(): void {
    try {
      let updatedData;
      if (this.isFirstUpdate) {
        updatedData = this.WordCloudData.map(item => ({
          ...item,
          Answer: ''
        }));
        this.isFirstUpdate = false;
      } else {
        let randomIndex: number;
        do {
          randomIndex = Math.floor(Math.random() * this.originalWordCloudData.length);
        } while (randomIndex === this.previousIndex);
        this.previousIndex = randomIndex;

        updatedData = this.WordCloudData.map((item, index) => {
          if (index === randomIndex) {
            return {
              ...item,
              Answer: this.originalWordCloudData[index].Answer
            };
          }
          return item;
        });
      }
      this.WordCloudData = updatedData;
      this.showNewWords();
    } catch (error) {
      console.error('Error updating word cloud data:', error);
      this.stopRandomDataUpdates();
    }
  }

  resetChart(): void {
    this.isFirstUpdate = true;
    this.previousIndex = -1;
  }

  startRandomDataUpdates(): void {
    // Check if animation is already running
    if (!this.isAnimation) {
      this.isAnimation = true;
      this.resetChart();
      
      if (this.chartUpdateInterval) {
        clearInterval(this.chartUpdateInterval);
      }
  
      this.chartUpdateInterval = setInterval(() => {
        this.updateChartWithRandomData();
        if (!this.isFirstUpdate) {
          clearInterval(this.chartUpdateInterval);
          this.chartUpdateInterval = setInterval(() => {
            this.updateChartWithRandomData();
          }, 2000);
        }
      }, 1000);
    }
  }

  stopRandomDataUpdates(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = null;
      this.WordCloudData = [...this.originalWordCloudData];
      this.showNewWords();
      this.isAnimation = false;
    }
  }
}

