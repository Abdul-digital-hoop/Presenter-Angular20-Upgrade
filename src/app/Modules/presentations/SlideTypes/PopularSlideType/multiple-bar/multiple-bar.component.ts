import { DecimalPipe } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';

@Component({
    selector: 'app-multiple-bar',
    templateUrl: './multiple-bar.component.html',
    styleUrls: ['./multiple-bar.component.scss'],
    standalone: false
})
export class MultipleBarComponent implements OnInit {
  @Input() multipleChoiceData: any[] = [];
  @Input('IndexForMultiChoice') public MultiIndex: string;
  @Input() slideTheme: any;
  // lineColor: string = "black";
  private highestValue: string;
  private showCorrectAnswer: boolean = false;
  private svg;
  private margin = 100;
  private width = 1100 - this.margin * 2;
  private height = 450 - this.margin * 2;
  lineNumber:number =0;
  barChartData: any[] = [];
  changeBarChartData: any;
  constructor(private _workspaceservice: WorkspaceService) {
    
    this.multipleChoiceData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.slideTheme = this._workspaceservice.resetThemes ? this._workspaceservice.slidesTheme: this._workspaceservice.presentationTheme;
    this.barChartData.forEach((data: any, i) => {
      if (data.name.trimStart().endsWith(i + ' ' + 'P')) {

      } else if (data.name.trimStart().endsWith(this.MultiIndex + ' ' + 'P')) {

      }
      else {
        data.name = data?.name + i + ' ' + 'P'
      }
    });
    this.barChartData = [];
    this.barChartData = this.multipleChoiceData;
  }
  ngOnInit(): void {
    this.initializeData();
    this.applyConditions(this.barChartData);
    this.createCharts(this.changeBarChartData || this.barChartData);
    this.createBar(this.changeBarChartData || this.barChartData);
  }
  private initializeData(): void {
    let highestCurrentValue = 0;
    let tableLength = this.multipleChoiceData.length;

    this.multipleChoiceData.forEach((data, i) => {
      const barValue = Number(data.value);
      if (barValue > highestCurrentValue) {
        highestCurrentValue = barValue;
      }
      if (tableLength === i + 1) {
        this.highestValue = highestCurrentValue.toString();
      }
    });

    this.barChartData.forEach((data: any, i) => {
      if (!data.name.trimStart().endsWith(i + ' P') && !data.name.trimStart().endsWith(this.MultiIndex + ' P')) {
        data.name = data?.name.trimStart() + i + ' P';
      }
    });

    this.barChartData = [...this.multipleChoiceData];
  }

  private applyConditions(barChartData: any): void {
    this.changeBarChartData = JSON.parse(JSON.stringify(barChartData));

    if (this._workspaceservice.chooseCorrectAnswers && !this._workspaceservice.presentationMode || this._workspaceservice.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    } else {
      this.showCorrectAnswer = false;
    }
    if (!this._workspaceservice.slideShowInResults) {
      this.changeBarChartData.forEach(item => {
        item.value = 0;
      });
    } else {
      this._workspaceservice.dynamicChartData(this._workspaceservice.options).forEach(multipleChoiceItem => {
        const changeBarItem = this.changeBarChartData.find(item => item.id === multipleChoiceItem.id);
        if (changeBarItem) {
          changeBarItem.value = multipleChoiceItem.value;
        }
      });
    }
    if (this._workspaceservice.slideResponseAsPercentage) {
      const totalValue = this.changeBarChartData.reduce((sum, item) => sum + item.value, 0);
      if (totalValue > 0) {
        this.changeBarChartData.forEach(item => {
          const percentage = (item.value / totalValue) * 100;
          item.displayValue = percentage.toFixed() + '%';
          item.value = item.value;
        });
      } else {
        this.changeBarChartData.forEach(item => {
          item.displayValue = '0%';
          item.value = 0;
        });
      }
    }
    else{
      const totalValue = this.changeBarChartData.reduce((sum, item) => sum + item.value, 0);
      if (totalValue > 0) {
        this.changeBarChartData.forEach(item => {
          item.displayValue =  item.value;
          item.value = item.value;
        });
      } else {
        this.changeBarChartData.forEach(item => {
          item.displayValue = 0;
          item.value = 0;
        });
      }
    }
    

  }
  createCharts(value: any) {
    this.createSvg();
    this.drawBars(value);
  }
  private createSvg(): void {
    d3.select('div#multiple-bar-chart').select('svg').remove();
  
    this.svg = d3
      .select('div#multiple-bar-chart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width + this.margin * 2} ${this.height + this.margin * 2}`)
      .append('g')
      .attr(
        'transform',
        `translate(100 ,55)` // Center horizontally by adding margin offset
      );
  }

  private drawBars(data: any[]): void {
    const x = d3
      .scaleBand()
      .range([0, this.width])
      .domain(data.map((d) => d.name))
      .padding(0.2);

    let xAxisGroup = this.svg.select('.x-axis');
    if (xAxisGroup.empty()) {
      xAxisGroup = this.svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${this.height})`);
    }

    xAxisGroup.call(d3.axisBottom(x)
      .tickSize(0))
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('y', '5')
      .attr("fill", this.slideTheme?.ThemeTextColor)
      .attr("font-family", this.slideTheme?.ThemeFontFamily)
      .each(function (d) {
        const tickText = d3.select(this);
        const textContent = tickText.text();
        const lastLetter = textContent.slice(-3);
        const remainingLetters = textContent.slice(0, -3);
        tickText.text('');
        tickText.append('tspan')
          .text(remainingLetters)
      })
      .call(this.wrap, 150)
      .attr('opacity', d => 1);

    this.svg.select('path').attr('d', 'M0,0V0H900V0');
    this.svg.select('path').attr('stroke-width', '2');
    this.svg.select('path').attr('stroke', this.slideTheme?.ThemeLineColor);
  }

  private createBar(value: any) {
    const data = value;
    const highestValue = Math.max(...data.map(d => d.value));
    const x = d3.scaleBand().range([0, this.width]).domain(data.map(d => d.name)).padding(0.2);
    const y = d3.scaleLinear().domain([0, highestValue + 0.8]).range([this.height, 0]);

    const bars = this.svg.selectAll('.chartbar').data(data, d => d.name);

    bars.exit().remove();

    const barsEnter = bars.enter().append('g').attr('class', 'chartbar');

    barsEnter.append('rect')
      .attr('x', d => x(d.name))
      .attr('y', this.height)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', d =>(d.color))
      .attr('opacity', d => 1);

    const barsUpdate = barsEnter.merge(bars);

    barsUpdate.select('rect')
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value))
      .attr('height', d => this.height - y(d.value))
      .attr('fill', d =>(d.color))
      .attr('opacity', d => 1);

    const barValues = this.svg.selectAll('.barValue').data(data, d => d.name);
    barValues.exit().remove();

    const barValuesEnter = barValues.enter()
      .append('g')
      .attr('class', 'barValue');

    barValuesEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('x', d => x(d.name) + (x.bandwidth() / 2))
      .attr('y', this.height);

    const barValuesUpdate = barValuesEnter.merge(barValues);

    barValuesUpdate.select('text')
      .transition()
      .duration(1000)
      .attr('fill', this.slideTheme?.ThemeTextColor)
      .delay((d, i) => i * 100)
      .attr('x', d => x(d.name) + (x.bandwidth() / 2))
      .attr('y', d => y(d.value) - 5)
      .text(d => d.displayValue ? d.displayValue : d.value)
      .attr('opacity', d => 1);

    const icons = this.svg.selectAll('.icons').data(data, d => d.name);
    icons.exit().remove();

    const iconsEnter = icons.enter().append('g').attr('class', 'icons');

    iconsEnter.append("path")
      .attr("d", d => d.isCorrect ?
        "M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z" :
        "M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z")
      .attr("fill", d => d.isCorrect ? "#00DB91" : "#DB3734")
      .attr("opacity", this.showCorrectAnswer ? 1 : 0)
      .attr("transform", d => {
        const xPosition = x(d.name) + (x.bandwidth() / 2) - 15;
        const yPosition = y(d.value) - 60;
        return `translate(${xPosition},${yPosition})`;
      });

    const iconsUpdate = iconsEnter.merge(icons);

    iconsUpdate.select("path")
      .transition()
      .duration(1000)
      .attr("d", d => d.isCorrect ?
        "M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z" :
        "M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z")
      .attr("fill", d => d.isCorrect ? "#00DB91" : "#DB3734")
      .attr("opacity", this.showCorrectAnswer ? 1 : 0)
      .attr("transform", d => {
        const xPosition = x(d.name) + (x.bandwidth() / 2) - 15;
        const yPosition = y(d.value) - 60;
        return `translate(${xPosition},${yPosition})`;
      });
  }

  private wrap(text, width): void {
    text.each(function () {
      const textElement = d3.select(this);
      const words = textElement.text().split(/\s+/).reverse();
      let line = [];
      this.lineNumber = 0;
      const lineHeight = 1.1;
      const y = textElement.attr('y');
      const dy = parseFloat(textElement.attr('dy')) || 0;
      let tspan = textElement.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
    let word;
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = textElement.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++this.lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
    if (this.lineNumber >= 4) {
      textElement.attr('font-size', '12px');
    } else {
      textElement.attr('font-size', '16px');
    }
  });
}

private dynamicChartResponseLoad(){
  this.updateChart(this.changeBarChartData);
}

  updateChart(value: any) {
    value.forEach((data: any, i) => {
      if (data.name.trimStart().endsWith(i + ' ' + 'P')) {

      } else if (data.name.trimStart().endsWith(this.MultiIndex + ' ' + 'P')) {

      }
      else {
        data.name = data?.name.trimStart() + i + ' ' + 'P'
      }
    });
    if (value.length !== this.changeBarChartData.length) {
      this.applyConditions(value);
      this.createSvg();
      this.drawBars(this.changeBarChartData);
      this.createBar(this.changeBarChartData);
  } else {
      this.applyConditions(value);
      this.drawBars(this.changeBarChartData);
      this.createBar(this.changeBarChartData);
  }  
  }
  updateTheme(data: any) {
    if(!this._workspaceservice.resetThemes){
    this.slideTheme = data;

    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.changeBarChartData.forEach((option, index) => {
      if (colors[index]) {
        option.color = colors[index];
      }
    });
  
    this.updateChart(this.changeBarChartData);
  }else{
    this.updateChart(this.changeBarChartData);
  }
    // this.createCharts(this.changeBarChartData || this.barChartData)
  }
}
