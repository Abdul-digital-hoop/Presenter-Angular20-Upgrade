import { Component, ElementRef, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
@Component({
  selector: 'app-multiple-dot',
  templateUrl: './multiple-dot.component.html',
  styleUrls: ['./multiple-dot.component.scss']
})
export class MultipleDotComponent implements OnInit {
  @Input() barData: any[] = [];
  isShowLongerDescription = false;
  private svg;
  private margin = 150;
  private width = 650 - this.margin * 2;
  private height = 600 - this.margin * 2;
  private radius = 8;
  itemArray: any[];
  optionTitle: any;
  optionValue: any;
  isCorrectAnswer: boolean;
  isCorrect: boolean;
  optionValueInPercentage: number;
  @Input() slideTheme:any;
  private showCorrectAnswer: boolean = false;
  constructor(
    private elementRef: ElementRef,
    private _commanservice: CommanService,
    private _workspaceservice: WorkspaceService
  ) { 
    this.barData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.slideTheme = this._workspaceservice.presentationTheme;
  }

  ngOnInit(): void {
    this.initializeSVG();
    this.createChart(this.barData);
  }

  ngOnChanges(): void {
    this.createChart(this.barData);
  }
  ngAfterViewInit() {
  }
  initializeSVG(): void {
    d3.select('div#multiple-dot-chart').select("svg").remove();
    this.svg = d3
      .select('div#multiple-dot-chart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('overflow', 'visible')
      if (this._workspaceservice.presentationMode) {
        this.svg = this.svg.append('g')
          .attr('transform', 'translate(140, 60),scale(0.9)');
      } else {
        this.svg = this.svg.append('g')
        .attr('transform', 'translate(40, -10),scale(0.9)');
      }
  }
  createChart(barData: any): void {
    if (this._workspaceservice.chooseCorrectAnswers && !this._workspaceservice.presentationMode || this._workspaceservice.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    }else{
      this.showCorrectAnswer = false;
    }
    // Calculate the total value of options
    if (this._workspaceservice.slideResponseAsPercentage) {
      const optionTotalValue = barData.reduce((sum, option) => sum + (option?.value || 0), 0);
      this.optionValueInPercentage = optionTotalValue > 0 ? 100 / optionTotalValue : 0;
  
      // Calculate percentages for each option
      for (let option of barData) {
        option.percentage = optionTotalValue > 0 ? ((option?.value || 0) * this.optionValueInPercentage).toFixed(2) : '0.00';
      }
    }else{
      let optionTotalValue = 0;
      for (let option of barData) {
        optionTotalValue += option?.value;
      }
      this.optionValueInPercentage = optionTotalValue > 0 ? 100 / optionTotalValue : 0;
    }

  
    // Get the actual dimensions of the SVG container
    const svgElement = d3.select('div#multiple-dot-chart').select("svg").node() as HTMLElement;
    const svgRect = svgElement.getBoundingClientRect();
    var svgWidth = svgElement.clientWidth;
    var svgHeight = svgElement.clientHeight;
    if(svgWidth == 0){
      svgWidth = 890;
    }
    if(svgHeight == 0){
      svgHeight = 441;
    }
    // Define margins for spacing
    const margin = 20; // Margin or padding value
  
    // Dynamic calculation of columns and rows based on the number of options
    const columns = Math.min(3, barData.length); // Max 3 columns, or less if fewer options
    const rows = Math.ceil(barData.length / columns); // Calculate number of rows
  
    const colWidth = (svgWidth - margin * (columns + 1)) / columns;
    const rowHeight = (svgHeight - margin * (rows + 1)) / rows;
  
    // Data join for containers
    const container = this.svg.selectAll('.bucket')
      .data(barData, (d: any) => d.name);
  
    // Enter selection: Create new containers
    const containerEnter = container.enter().append('svg')
      .attr('class', 'bucket')
      .attr('width', colWidth)
      .attr('height', rowHeight)
      .style('overflow', 'visible');
  
    // Merge enter and update selections
    const containerMerge = containerEnter.merge(container);
  
    // Update positions of containers
    containerMerge.each((option, index, nodes) => {
      const rowIndex = Math.floor(index / columns);
      const colIndex = index % columns;
  
      // Calculate the starting x position to center the options within their row
      const actualColumns = rowIndex === rows - 1 ? barData.length % columns || columns : columns;
      const totalContentWidth = actualColumns * colWidth + (actualColumns - 1) * margin;
      const startX = (svgWidth - totalContentWidth) / 2;
  
      // Calculate the center for each group with margins
      const xTranslation = startX + colIndex * (colWidth + margin) + colWidth / 2;
      const yTranslation = margin + rowIndex * (rowHeight + margin) + rowHeight / 2;
  
      d3.select(nodes[index])
        .attr('x', xTranslation - colWidth / 2)
        .attr('y', yTranslation - rowHeight / 2);

          this.drawBucket(d3.select(nodes[index]), option, colWidth, rowHeight);
        
      // Draw or update the bucket content

    });
  
    // Exit selection: Remove old containers
    container.exit().remove();
  }
  
  
  // drawBucket(container, option, colWidth, rowHeight) {
  //   const circleRadius = Math.min(10, colWidth / 30);
  //   const circlePadding = 0.2; // Smaller padding to bring circles closer
  
  //   const circlesData = Array(option.value).fill(0).map((d, i) => ({ index: i, x: colWidth / 2, y: rowHeight / 2 }));
  
  //   const simulation = d3.forceSimulation(circlesData)
  //     .force('center', d3.forceCenter(colWidth / 2, rowHeight / 2))
  //     .force('charge', d3.forceManyBody().strength(-1)) // Slightly stronger charge to bring circles closer
  //     .force('collision', d3.forceCollide().radius(circleRadius + circlePadding))
  //     .force('x', d3.forceX().x(colWidth / 2).strength(0.05))
  //     .force('y', d3.forceY().y(rowHeight / 2).strength(0.05))
  //     .stop();
  
  //   // Run the simulation for a sufficient number of iterations
  //   for (let i = 0; i < 300; i++) simulation.tick();
  
  //   // Data join for circles
  //   const circleGroup = container.selectAll('g.value-circles').data([null]);
  
  //   // Enter selection: Create new circle groups
  //   const circleGroupEnter = circleGroup.enter().append('g')
  //     .attr('class', 'value-circles')
  //     .attr('opacity', 0.8);
  
  //   // Merge enter and update selections
  //   const circleGroupMerge = circleGroupEnter.merge(circleGroup);
  
  //   // Update circles
  //   const circles = circleGroupMerge.selectAll('circle')
  //     .data(circlesData, d => d.index);
  
  //   // Exit selection: Remove old circles
  //   circles.exit().remove();
  
  //   // Update existing circles
  //   circles.attr('cx', d => d.x)
  //          .attr('cy', d => d.y)
  //          .attr('r', circleRadius)
  //          .attr('fill', '#4545FF');
  
  //   // Enter selection: Animate new circles
  //   circles.enter().append('circle')
  //     .attr('r', circleRadius)
  //     .attr('fill', '#4545FF')
  //     .attr('cx', colWidth)  // Start at the bottom right corner
  //     .attr('cy', rowHeight) // Start at the bottom right corner
  //     .transition()
  //     .duration(1000) // Animation duration
  //     .attr('cx', d => d.x)
  //     .attr('cy', d => d.y);
  
  //   // Update the main option text and wrap it
  //   const text = container.select('text.bucket-text');
  //   if (text.empty()) {
  //     container.append('text')
  //       .attr('class', 'bucket-text')
  //       .attr('text-anchor', 'middle')
  //       .attr('fill', '#252B36')
  //       .attr('x', colWidth / 2)
  //       .attr('y', rowHeight / 2 + circleRadius * 2)
  //       .attr('font-size', '10px')
  //       .text(option.name)
  //       .call(this.wrap, colWidth - 10);
  //   } else {
  //     text.text(option.name)
  //         .call(this.wrap, colWidth - 10);
  //   }
  
  //   // Update the score text
  //   const scoreText = container.select('text.bucket-score');
  //   if (scoreText.empty()) {
  //     container.append('text')
  //       .attr('class', 'bucket-score')
  //       .attr('text-anchor', 'middle')
  //       .attr('font-weight', '600')
  //       .attr('fill', '#252B36')
  //       .attr('x', colWidth / 2)
  //       .attr('y', rowHeight / 4)
  //       .attr('font-size', '14px')
  //       .attr('transform', 'translate(0,5)')
  //       .text(option.value);
  //   } else {
  //     scoreText.text(option.value);
  //   }
  
  //   // Update the correct answer icon (hidden by default)
  //   const correctIcon = container.select('path.correct-answer-icon');
  //   debugger
  //   if (correctIcon.empty()) {
  //     if(option.isCorrect){
  //     container.append('path')
  //       .attr('class', 'correct-answer-icon')
  //       .attr('d', 'M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z')
  //       .attr('fill', '#00DB91')
  //       .attr('transform', 'translate(60, 60)')
  //       .attr('opacity', '1');
  //     }else{
  //     container.append('path')
  //       .attr('class', 'correct-answer-icon')
  //       .attr('d', 'M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z')
  //       .attr('fill', '#DB3734')
  //       .attr('transform', 'translate(60, 60)')
  //       .attr('opacity', '1');
  //     }
  //   }
  // }
  drawBucket(container, option, colWidth, rowHeight) {
    const circleRadius = Math.min(10, colWidth / 30);
    const circlePadding = 0.2; // Smaller padding to bring circles closer

    const circlesData = Array(option.value).fill(0).map((d, i) => ({ index: i, x: colWidth / 2, y: rowHeight / 2 }));

    const simulation = d3.forceSimulation(circlesData)
        .force('center', d3.forceCenter(colWidth / 2, rowHeight / 2))
        .force('charge', d3.forceManyBody().strength(-1)) // Slightly stronger charge to bring circles closer
        .force('collision', d3.forceCollide().radius(circleRadius + circlePadding))
        .force('x', d3.forceX().x(colWidth / 2).strength(0.05))
        .force('y', d3.forceY().y(rowHeight / 2).strength(0.05))
        .stop();
    // Run the simulation for a sufficient number of iterations
    for (let i = 0; i < 300; i++) simulation.tick();
    // Data join for circles

    const circleGroup = container.selectAll('g.value-circles').data([null]);

    // Enter selection: Create new circle groups
    const circleGroupEnter = circleGroup.enter().append('g')
        .attr('class', 'value-circles')
        .attr('opacity', 0.5);

    // Merge enter and update selections
    const circleGroupMerge = circleGroupEnter.merge(circleGroup);

    // Update circles
    const circles = circleGroupMerge.selectAll('circle')
        .data(circlesData, d => d.index);
        
    // Exit selection: Remove old circles
    circles.exit().remove();
        
    // Update existing circles
    circles.attr('cx', d => d.x)
           .attr('cy', d => d.y -40)
           .attr('r', circleRadius)
           .attr('opacity', this._workspaceservice.slideShowInResults ? 1 : 0)
           .attr('fill', this._workspaceservice.options[0]?.visualizationColor);
  
    // Enter selection: Animate new circles
    circles.enter().append('circle')
      .attr('r', circleRadius)
      .attr('fill', this._workspaceservice.options[0]?.visualizationColor)
      .attr('cx', colWidth)  // Start at the bottom right corner
      .attr('cy', rowHeight) // Start at the bottom right corner
      .transition()
      .duration(1000) // Animation duration
      .attr('opacity',this._workspaceservice.slideShowInResults ? 1 : 0)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y - 40);
   
    // Update the main option text and wrap it
    const text = container.select('text.bucket-text');
    if (text.empty()) {
      container.append('text')
        .attr('class', 'bucket-text')
        .attr('text-anchor', 'middle')
        .attr('fill',this.slideTheme.ThemeTextColor)
        .attr('x', colWidth / 2)
        .attr('y', rowHeight / 2 + circleRadius * 2)
        .attr('font-weight', this._workspaceservice.presentationMode ? '600' : '400')
        .attr('font-size', this._workspaceservice.presentationMode ?'14px':'10px')
        .text(option.name)
        .call(this.wrap, colWidth - 10)
        .attr('opacity', d => this.showCorrectAnswer ? (d.isCorrect ? 1 : 0.7) : 1);
    } else {
        text.text(option.name)
            .call(this.wrap, colWidth - 10)
            .attr('opacity', d => this.showCorrectAnswer ? (d.isCorrect ? 1 : 0.7) : 1);
    }

    // Update the score text
    const scoreText = container.select('text.bucket-score');
    const displayText = this._workspaceservice.slideResponseAsPercentage ? ` ${Math.round(option.percentage)}%` : ` ${option.value}`;

    // Remove existing text elements to avoid overlap
    container.selectAll('.bucket-score').remove();
        
    const optionsLength = this._workspaceservice.options.length;
    const yAdjustment = optionsLength <= 3 ? rowHeight / 2.2 : rowHeight /3;
    
    if (this._workspaceservice.slideResponseAsPercentage) {
      container.append('text')
        .attr('class', 'bucket-score')
        .attr('text-anchor', 'middle')
        .attr('font-weight', '600')
        .attr('fill', this.slideTheme.ThemeTextColor)
        .attr('x', colWidth / 2)
        .attr('y', yAdjustment)
        .attr('font-size', '18px')
        .attr('transform', 'translate(0,5)')
        .text(this._workspaceservice.slideShowInResults ? displayText : '0%');
    } else {
      container.append('text')
        .attr('class', 'bucket-score')
        .attr('text-anchor', 'middle')
        .attr('font-weight', '600')
        .attr('fill', this.slideTheme.ThemeTextColor)
        .attr('x', colWidth / 2)
        .attr('y', yAdjustment)
        .attr('font-size', '18px')
        .attr('transform', 'translate(0,5)')
        .text(this._workspaceservice.slideShowInResults ? option.value : 0);
    }
    
    if (this.showCorrectAnswer) {
      const correctIcon = container.select('path.correct-answer-icon');
      const columnWidth = this._workspaceservice.presentationModecolWidth ? colWidth / 2.3 : colWidth / 2.1;
      const scaleFactor = 0.5;
      const optionsLength = this._workspaceservice.optionslength;
      const rowHeightAdjustment = optionsLength <= 3 ? rowHeight - 140 : rowHeight - 25;
      const rowHeightAdjustmentImageLayout = optionsLength <= 3 ? rowHeight * 0.80 : rowHeight * 1.1;
      if (correctIcon.empty()) {
          container.append('path')
              .attr('class', 'correct-answer-icon')
              .attr('d', option.isCorrect ?
                  'M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z' :
                  'M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z')
              .attr('fill', option.isCorrect ? '#00DB91' : '#DB3734')
              .attr('opacity', '1')
              .attr('transform', `translate(${columnWidth}, ${ this._workspaceservice.slideLayoutActive ?rowHeightAdjustmentImageLayout : rowHeightAdjustment}) scale(${scaleFactor})`); // Adjust vertical position as needed
      } else {
          correctIcon.attr('d', option.isCorrect ?
                  'M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z' :
                  'M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z')
              .attr('fill', option.isCorrect ? '#00DB91' : '#DB3734')
              .attr('transform', `translate(${columnWidth}, ${ this._workspaceservice.slideLayoutActive ?rowHeightAdjustmentImageLayout : rowHeightAdjustment}) scale(${scaleFactor})`);
      }
  } else {
      container.selectAll('path.correct-answer-icon').remove();
  }
  
  
    // Update the correct answer icon

}
private dynamicChartResponseLoad(){
  if (this._workspaceservice.slideShowInResults) {
    this.barData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    if (this._workspaceservice.chooseCorrectAnswers && !this._workspaceservice.presentationMode || this._workspaceservice.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    }else{
      this.showCorrectAnswer = false;
    }
    this.updateChart(this.barData);
  }
  else{
    this.barData.forEach(item => {
      item.value = 0;
    });
    if (this._workspaceservice.chooseCorrectAnswers && !this._workspaceservice.presentationMode || this._workspaceservice.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    }else{
      this.showCorrectAnswer = false;
    }
    this.updateChart(this.barData);
  }

}
  updateChart(value:any){
    if (value.length !== this.barData) {
      this.initializeSVG();
      this.createChart(value);
    }else{
      this.createChart(value);
    }
  }
  private wrap(text, width): void {
    text.each(function() {
        const textElement = d3.select(this);
        const words = textElement.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.5; // ems
        const x = textElement.attr('x');
        const y = textElement.attr('y');
        const dy = parseFloat(textElement.attr('dy')) || 0;
        let tspan = textElement.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

        while (word = words.pop()) {
            // If word is too long, split it
            if (word.length > width / 9) { // Approximate chars per line based on font size
                const segments = splitWord(word, width);
                segments.forEach(segment => {
                    addWordToLine(segment);
                });
            } else {
                addWordToLine(word);
            }
        }

        function addWordToLine(word) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = textElement.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
            }
        }

        function splitWord(word, width) {
            const segmentLength = Math.floor(width / 9); // Approximate chars per line based on font size
            const result = [];
            let start = 0;
            while (start < word.length) {
                result.push(word.substring(start, start + segmentLength));
                start += segmentLength;
            }
            return result;
        }
    });
  }  
  updateTheme(data:any){
    this.slideTheme = data;
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.barData.forEach((option, index) => {
      if (colors[index]) {
        option.color = colors[index];
      }
    });
    this.initializeSVG();
    this.createChart(this.barData);
  }
}
