import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, Renderer2, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import * as cloud from 'd3-cloud';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

const LAYOUT = {
  width: 960,
  height: 540,
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
const MAX_LENGTH_VERTICAL_WORD = 8;
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

  constructor(private el: ElementRef, private renderer: Renderer2, private _commanservice: CommanService, public _workspaceservice: WorkspaceService) {
    this.WordCloudData = this._workspaceservice.options.filter(x => x.ModerateAnswer === false);
    this.WordCloudData = this._workspaceservice.profanityWordsChecksForWord(this.WordCloudData);
  }

  ngOnInit(): void {
    if( this.WordCloudData.length === 0 && !this._workspaceservice.presentationMode){
      this.defaultChart();
    }else{
      this.wordCloud = this.createWordCloud('#WordCloud');
      this.showNewWords();
    }
  }

  ngAfterViewInit(): void {
    this.resizeSvg();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resizeSvg();
  }

  ngOnDestroy(): void { }

  private resizeSvg() {
    d3.select('#WordCloud svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${LAYOUT.width},${LAYOUT.height}`);
  }
  private showNewWords() {
    const words = this.getWords();
    this.calculateWordBounds(words);  // Calculate word bounds with dynamic font size
    const filteredWords = words.filter(word => word.value > 0);
    this.wordCloud.update(filteredWords);
    //this.applyScale();
  }

  private createWordCloud(selector: string) {
    const customColors = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];
    const fill = d3.scaleOrdinal(customColors);

    const svg = d3.select(selector).append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    this.mainGroup = svg.append('g') // Store in class property
        .attr('class', 'gelement')
        .attr('transform', `translate(${LAYOUT.width / 2},${LAYOUT.height / 2})`);

    this.scaleGroup = this.mainGroup.append('g') // Store in class property
        .attr('class', `scale`);

    return {
        update: (words: any[]) => {
            const totalWords = words.length;
            this.calculateWallSize(words);

            cloud()
                .size([this.width, this.height])
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
                .style('display', this._workspaceservice.slideShowInResults ? 'none' : 'block');

            enter.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .attr('font-family', 'Lexend Deca')
                .attr('fill', (d, i) => fill(String(i)))
                .attr('text-anchor', 'middle')
                .attr('font-size', (d: any) => `${d.size}px`)
                .text((d: any) => d.text)
                .attr('transform', (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .style('display', this._workspaceservice.slideShowInResults ? 'block' : 'none');

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
                .style('display', this._workspaceservice.slideShowInResults ? 'block' : 'none');

            elements.select('rect')
                .transition()
                .duration(1500)
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y)
                .attr('width', (d: any) => d.size * 5)
                .attr('height', (d: any) => d.size)
                .attr('rx', (d: any) => `${d.size - 8}px`)
                .attr('fill', (d, i) => fill(String(i)))
                .style('display', this._workspaceservice.slideShowInResults ? 'none' : 'block');

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

    const scale = this.getScale({ width: this.width, height: this.height, bounds });

    this.scaleGroup.transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr('transform', `scale(${scale})`);

    const boundsCenter = this.scaleGroup.node()?.getBBox() as DOMRect;
    const translateX = (LAYOUT.width - boundsCenter.width) / 2 - boundsCenter.x;
    const translateY = (LAYOUT.height - boundsCenter.height) / 2 - boundsCenter.y;

    this.mainGroup.transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr('transform', `translate(${translateX}, ${translateY})`)
      .attr('width', this.width)
      .attr('height',this.height);
  });
}

  private getScale = ({ width, height, bounds }: Scale): number => {
    const commonwidth = LAYOUT.width - MARGIN.left - MARGIN.right;
    const commonheight = LAYOUT.height - MARGIN.top - MARGIN.bottom;
    if (width >= 864 && height >= 456) {
      // Calculate scale based on adjusted dimensions
      const scaleWidth = width / bounds.width;
      const scaleHeight = height / bounds.height;

      return Math.min(scaleWidth, scaleHeight);
    }
    else if (this._workspaceservice.presentationMode || (width !== commonwidth || height !== commonheight)) {
      const adjustedWidth = Math.max(width, Svg_Width);
      const adjustedHeight = Math.max(height, Svg_Height);

      // Calculate scale based on adjusted dimensions
      const scaleWidth = adjustedWidth / bounds.width;
      const scaleHeight = adjustedHeight / bounds.height;
      if (this._workspaceservice.slideLayoutType != 'Default') {
        return Math.min(scaleWidth+0.6, scaleHeight+0.6);
      }
      else {
       
       if (width <= 580) {
        return Math.min(scaleWidth + 0.8, scaleHeight + 0.8);
    }
    else if (width <= 700) {
      return Math.min(scaleWidth + 0.6, scaleHeight + 0.6);
  }  else if (width <= 850) {
          return Math.min(scaleWidth + 0.5, scaleHeight + 0.5);
      } else {
          return Math.min(scaleWidth, scaleHeight);
      }
      
      }


    }

    // Ensure minimum width and height thresholds

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
    const svgDimension = this.getSvgGroupWidthHeight('#WordCloud');
    const availableSpace = svgDimension.width * svgDimension.height;

    const fontSize = FONT_BASE_SIZE * Math.log(value * FONT_SIZE_SCALE);

    let adjustedFontSize = fontSize;
    if (totalWords < 10) {
        adjustedFontSize *= 2.5;
    }else if (totalWords < 30) {
      adjustedFontSize *= 1.7;
  }
  else if (totalWords < 60) {
    // If there are many words, reduce font size to fit within space
    adjustedFontSize *= 1.5;
}
     else if (totalWords < 80) {
        // If there are many words, reduce font size to fit within space
        adjustedFontSize *= 1.3;
    }
    else if(totalWords > 80){
      adjustedFontSize *= 0.9;
    }
    else if(totalWords > 120){
      adjustedFontSize = fontSize;
    }

    // Ensure font size does not exceed the available space
    const maxFontSize = Math.min(adjustedFontSize, availableSpace / totalWords);

    return maxFontSize;
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

  // If total height exceeds the available space, scale down the words
  if (totalWidth > Svg_Width) {
    const scaleX = Svg_Width / totalWidth;
    const scaleY = Svg_Height / totalHeight;
    const scale = Math.min(scaleX, scaleY); // Choose the smaller scale to fit the entire content
 
    words.forEach(word => {
      word.wordsWidth *= scale;
      word.wordsHeight *= scale;
    });
    // Update the chart dimensions to fit the scaled content
    this.width = totalWidth + 100;
   
    if(totalWidth < totalHeight ){
      this.height = totalHeight;
    }else{
      this.height = totalWidth;
    } 
    var dimensions= totalWidth*totalHeight;
    dimensions = dimensions / 100;
    if(dimensions < 100){
      this.height = 100;
    }
    if(!this._workspaceservice.presentationMode){
      this.width= LAYOUT.width - MARGIN.left - MARGIN.right;
      this.height =LAYOUT.height - MARGIN.top - MARGIN.bottom;;
     }
  } 
  else if(totalHeight > Svg_Height){
    const scaleX = Svg_Width / totalWidth;
    const scaleY = Svg_Height / totalHeight;
    const scale = Math.min(scaleX, scaleY); // Choose the smaller scale to fit the entire content
 
    words.forEach(word => {
      word.wordsWidth *= scale;
      word.wordsHeight *= scale;
    });
    if(totalWidth < totalHeight ){
      this.width =  totalHeight +160;
    }else{
      this.width = totalWidth +150;
    } 
    if(this.width < Svg_Width){
      this.height = Svg_Height + 50;
    }else{
      this.height = Svg_Height + 100;
    }
    var dimensions= totalWidth*totalHeight;
    dimensions = dimensions / 100;
    if(dimensions < 100){
      this.width = 100;
    }
    if(!this._workspaceservice.presentationMode){
      this.width= LAYOUT.width - MARGIN.left - MARGIN.right;
      this.height =LAYOUT.height - MARGIN.top - MARGIN.bottom;
     }
  }
  else {
    // If content fits,
        if(totalWidth < totalHeight ){
      this.width = totalHeight + 50;
      this.height = totalHeight + 50;
    }else{
      this.width = totalWidth +100;
      this.height = totalWidth;
//       if(totalHeight<totalWidth){
// this.height =  this.width;
//       }else{
//       this.height = totalHeight + 50;
//       }
    } 
    var dimensions= totalWidth*totalHeight;
    dimensions = dimensions / 100;
    if(dimensions < 100){
      this.width = 300;
      this.height = 100;
    }



  }
   if(words.length >=400){
    this.width= 1000;
    this.height =700;
   }
   else if(words.length >=150){

    this.width= LAYOUT.width - MARGIN.left - MARGIN.right;
    this.height =LAYOUT.height - MARGIN.top - MARGIN.bottom;
     }

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
  d3.select('#WordCloud').select('svg').remove();
  const svg = d3.select('#WordCloud')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${480},${250}) scale(1.3)`);


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
    if( this.WordCloudData.length === 0 && !this._workspaceservice.presentationMode){
      const opacityValue = this._workspaceservice.presentationTheme?.ThemeName === 'Slid Light' ? 0.2 : 0.4;
      d3.select('#WordCloud svg')
      .selectAll('text')
      .transition()
      .duration(500)
      .attr('opacity',opacityValue);
    }
  }
}
