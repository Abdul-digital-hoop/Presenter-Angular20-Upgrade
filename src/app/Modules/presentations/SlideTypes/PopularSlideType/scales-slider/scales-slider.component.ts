import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
interface Score {
  X: number;
  Y: number;
}

interface DataPoint {
  name: string;
  value: number;
  color: string;
  scores: Score[];
}
@Component({
  selector: 'app-scales-slider',
  templateUrl: './scales-slider.component.html',
  styleUrls: ['./scales-slider.component.scss']
})
export class ScalesSliderComponent implements OnInit {
  currentUrl: string;
  @ViewChild('scalessliderchart', { static: true }) private chartContainer: ElementRef;

  // Define the data array with inline scores
  data: DataPoint[] = [
    {
      name: 'The eedar2aceter Co3unter Tool helps you to streamline your post content perfectly for all your social media accounts. To ensure the optimal engagemen',
      value: 4.6,
      color: '#4F9AF1',
      scores: [
        { X: 1, Y: 20 },
        { X: 2, Y: 60 },
        { X: 3, Y: 0 },
        { X: 4, Y: 80 },
        { X: 5, Y: 100 }
      ]
    },
    {
      name: 'Statement 2',
      value: 3.7,
      color: '#FC0',
      scores: [
        { X: 1, Y: 10 },
        { X: 2, Y: 5 },
        { X: 3, Y: 0 },
        { X: 4, Y: 15 },
        { X: 5, Y: 18 }
      ]
    },
    {
      name: 'Statement 3',
      value: 2.6,
      color: '#FF007E',
      scores: [
        { X: 1, Y: 2 },
        { X: 2, Y: 10 },
        { X: 3, Y: 0 },
        { X: 4, Y: 0 },
        { X: 5, Y: 1 }
      ]
    },
    {
      name: 'Statement 4',
      value: 5,
      color: '#FC0',
      scores: [
        { X: 1, Y: 0 },
        { X: 2, Y: 6 },
        { X: 3, Y: 0 },
        { X: 4, Y: 8 },
        { X: 5, Y: 0 }
      ]
    },
    {
      name: 'Statement 5',
      value: 1.7,
      color: '#4F9AF1',
      scores: [
        { X: 1, Y: 32 },
        { X: 2, Y: 12 },
        { X: 3, Y: 0 },
        { X: 4, Y: 29 },
        { X: 5, Y: 8 }
      ]
    }
  ];

  private svg: any;
  private margin = { top: 20, right: 20, bottom: 30, left: 40 };
  private width: number;
  private height: number;
  scalesResult: any;
  scaleChartData: any[];
  mergedScalesOptions:DataPoint[];
  copiedResultsArray: any[];
  slideTheme: { ThemeName: string; ThemeLogo: string; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number; };
  isPresenterEditorScreen: boolean;
  scalesDimensions: any[];
  constructor( private _workspaceservice: WorkspaceService,private viewContainerRef: ViewContainerRef) {
   this.slideTheme = this._workspaceservice.presentationTheme;
   this.generateMergedOptions();
   const url = new URL(window.location.href);
   const pathSegments = url.pathname.split('/');
   this.currentUrl = pathSegments[pathSegments.length - 1];
   if(this.currentUrl == 'presentation')
   {
    this.isPresenterEditorScreen = false;
   }
   else
   {
    this.isPresenterEditorScreen = true;
   }

  }
  generateMergedOptions(){
    this.copiedResultsArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));
    this.scalesResult = this._workspaceservice.scalesResult;
    this.scalesDimensions = this._workspaceservice.scalesDimensions;
    this.scaleChartData = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.mergedScalesOptions = this.scalesResult.map((item,index)=>{
      const scores = item.Score;
      const filteredScores = scores.filter((score:any) => score?.Y > 0);
      const averageX = item.ResponseCount == 0 ? 0: filteredScores.reduce((acc, current) => acc + (current.X*current.Y), 0) /  item.ResponseCount;
      // const averageY = item.ResponseCount == 0 ? 0:scores.reduce((acc, current) => acc + current.X, 0) / item.ResponseCount;
      return{
        name: item.OptionTitle,
        value: averageX,
        color: this.slideTheme.ThemeVisualizationColor[index].color,
        scores: item.Score.map((score) => {
            return { X: score.X, Y: score.Y };
        }),
        responseCount:item.ResponseCount
      }
    });
  }
  ngOnInit(): void {
    this.createChart();
  }
  private createChart(): void {
    const self = this;
    const element = this.chartContainer.nativeElement;
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 540 - this.margin.top - this.margin.bottom;
  
    const barHeight = 13.8;
    const padding = 10; // Adjust padding as necessary to fit above the rect bar
    d3.select('div#scales-slider-chart').select('svg').remove();
    this.svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 960 540`)
      .attr('preserveAspectRatio', 'xMidYMid')
      .style('overflow', 'visible')
      .append('g')
      .attr('transform', `translate(${this.margin.left+160},${this.margin.top+30})scale(0.8)`);
  
    const x = d3.scaleLinear()
      .domain([0, 5])
      .range([0, this.width - 2 * this.margin.left]);
  
    const y = d3.scaleBand()
      .domain(this.mergedScalesOptions.map(d => d.name))
      .range([0, this.height - 2 * this.margin.top])
      .padding(0.5);
  
    const scalesGroup = this.svg.selectAll('.scales-group')
      .data(this.mergedScalesOptions)
      .enter().append('g')
      .attr('class', 'scales-group')
      .attr('transform', (d, i) => `translate(0, ${i * (this.height / this.mergedScalesOptions.length)})`)
      .attr('opacity', 1)
      .on('mouseover', function() {
        if(!self.isPresenterEditorScreen){
          d3.select(this).selectAll('.score-path-circle, .score-path-text')
          .style('visibility', 'visible');
        }
      })
      .on('mouseout', function() {
        if(!self.isPresenterEditorScreen){
            d3.select(this).selectAll('.score-path-circle, .score-path-text')
          .style('visibility', 'hidden');
        }
      
      });
    scalesGroup.append('path')
      .attr('class', 'distribution-graph')
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0) 
      .attr('d', d => this.generatePath(x, d.scores, this.height / this.mergedScalesOptions.length - barHeight - padding))
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .attr('opacity', 0.3);
  
      scalesGroup.append('text')
      .attr('class', 'alternative-text')
      .attr('fill', '#252B36')
      .attr('dy', '1.1em')
      .attr('font-size', '22px')
      .attr('y', padding*5)
      .text(d => d.name)
      .call(this.wrap, 800); // Call the wrap function with the desired width
  
    scalesGroup.append('rect')
      .attr('class', 'background-bar')
      .attr('width', x(4))
      .attr('y', this.height / this.mergedScalesOptions.length - barHeight - padding) // Adjust Y position to fit the rect bar
      .attr('height', barHeight)
      .attr('fill', '#252B36')
      .attr('fill-opacity', 0.1);
  
    // Bind rectangles one by one with a delay
    scalesGroup.append('rect')
      .attr('class', 'score-bar')
      .attr('fill', d => d.color)
      .attr('y', this.height / this.mergedScalesOptions.length - barHeight - padding) // Adjust Y position to fit the rect bar
      .attr('x', 0)
      .attr('width', 0)
      .attr('height', barHeight)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('width', d =>  d.value == 0 ?  x(0) : x(d.value-1));

    scalesGroup.append('circle')
      .attr('class', 'score-circle')
      .attr('cx', 0)
      .attr('cy', this.height / this.mergedScalesOptions.length - barHeight - padding) // Adjust Y position to fit the circle
      .attr('r', 23)
      .attr('fill', d => d.color)
      .attr('opacity', d=>d.responseCount > 0 ? 1 : 0)
      .transition()
      .duration(1000)
      .attr('cx', d => d.value == 0 ?  x(0) : x(d.value-1))
      .ease(d3.easeCubicInOut);
  
    scalesGroup.append('text')
      .attr('class', 'score-circle-text')
      .attr('opacity', 1)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('x', 0)
      .attr('y', this.height / this.mergedScalesOptions.length - barHeight - padding) // Adjust Y position to fit the text inside the circle
      .attr('fill', '#000000')
      .attr('font-weight', '600')
      .style('font-size', '23px')
      .attr('opacity', d=>d.responseCount > 0 ? 1 : 0)
      .text(d => d.value.toFixed(1))
      .transition()
      .duration(1000)
      .attr('x', d => d.value == 0 ?  x(0) : x(d.value-1))
      .ease(d3.easeCubicInOut);
  
    // Append circles and text elements for each score along the path
    scalesGroup.each((d, i, nodes) => {
      const group = d3.select(nodes[i]);
      d.scores.forEach(score => {
        group.append('circle')
          .attr('class', 'score-path-circle')
          .attr('cx', x(score.X-1))
          .attr('cy', this.height / this.mergedScalesOptions.length - barHeight - padding - (score.Y*100))
          .attr('r', 15)
          .attr('fill', d.color)
          .attr('opacity', 1)
          .style('visibility', 'hidden');
        
        group.append('text')
          .attr('class', 'score-path-text')
          .attr('x', x(score.X-1))
          .attr('y', this.height / this.mergedScalesOptions.length - barHeight - padding - (score.Y*100))
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .attr('fill', '#000')
          .text(score.Y)
          .style('visibility', 'hidden');
      });
    });
  
    // Vertical axis lines with animation
    this.svg.append('g').attr('class', 'vertical-axis-line')
      .append('rect')
      .attr('y', 0)
      .attr('x', -30)
      .attr('height', 0)
      .attr('width', 3)
      .attr('fill', '#252B36')
      .transition()
      .duration(1000)
      .attr('height', this.height);
  
    this.svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '32')
      .attr('transform', `translate(-45,${this.height / 2})rotate(-90)`)
      .attr('dy', '-0.65em')
      .attr('fill', '#252B36')
      .text(this.scalesDimensions[0]?.Name)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);
  
    this.svg.append('g').attr('class', 'vertical-axis-line')
      .append('rect')
      .attr('y', 0)
      .attr('x', this.width - this.margin.left -160)
      .attr('height', 0)
      .attr('width', 3)
      .attr('fill', '#252B36')
      .transition()
      .duration(1000)
      .attr('height', this.height);
  
    this.svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '32')
      .attr('transform', `translate(${this.width - this.margin.left - 110},${this.height / 2})rotate(-90)`)
      .attr('dy', '0.35em')
      .attr('fill', '#252B36')
      .text(this.scalesDimensions[this.scalesDimensions?.length - 1]?.Name)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);
  }
  
  private generatePath(x: any, scores: Score[], yOffset: number) {
    const line = d3.line<Score>()
      .x(d => x(d.X-1))
      .y(d => yOffset - d.Y)
      .curve(d3.curveBasis);
  
    const area = d3.area<Score>()
      .x(d => x(d.X-1))
      .y0(yOffset)
      .y1(d => yOffset - d.Y*100)
      .curve(d3.curveBasis);
  
    return area(scores);
  }
  
  private wrap(text, width): void {
    text.each(function() {
      const textElement = d3.select(this);
      const words = textElement.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = textElement.attr('y');
      const dy = parseFloat(textElement.attr('dy'));
      let tspan = textElement.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
  
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = textElement.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  }
  hideResults() {
    this.copiedResultsArray.forEach(option => {
      option.Score.forEach(score => {
        score.Y = 0;
      });
    });
    return this.copiedResultsArray;
  }
  updateChart(value: any) {
   this.generateMergedOptions();
    this.createChart();
  }
  updateTheme(data: any) {
    this.generateMergedOptions();
    this.createChart();
   // this.slideTheme = data;
  }
  dynamicChartResponseLoad() {
    this.generateMergedOptions();
    this.createChart();
  }

}
