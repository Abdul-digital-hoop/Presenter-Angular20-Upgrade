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
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any;
  @Input() viewfrom:string='';
  @Input() presentationMode:any;
  private showCorrectAnswer: boolean = false;
  private svg;
  private margin = 100;
  private width = 1100 - this.margin * 2;
  private height = 450 - this.margin * 2;
  lineNumber:number =0;
  barChartData: any[] = [];
  changeBarChartData: any;
  formatedOptions: any[]=[];
  chooseCorrectAnswers:any;
  multiplechoicepresenterEnterClick:any;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  highestValue: string;
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean;
  constructor(private _workspaceservice: WorkspaceService) {
  }
  ngOnInit(): void {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.assignMultipleChoiceData();
  }
  ngAfterViewInit(): void {
    this.initializeData();
    this.applyConditions(this.barChartData);
    this.createCharts(this.changeBarChartData || this.barChartData);
    this.createBar(this.changeBarChartData || this.barChartData);
    // this.startRandomDataUpdates();
  }
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
  assignMultipleChoiceData(){
    this.formatedOptions = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.multipleChoiceData = this._workspaceservice.dynamicChartData(this.formatedOptions);
    this.chooseCorrectAnswers = this._workspaceservice.changeChooseCorrectAnswerFormat(this.slideDetails?.slideContentData);
    this.multiplechoicepresenterEnterClick = this._workspaceservice.changeCorrectAnswerFormat(this.slideDetails?.slideContentData);
    this.slideTheme = this.slideDetails?.design?.slideResetTheme ? this.slidesTheme: this.presentationTheme;
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

    if (this.chooseCorrectAnswers && !this.presentationMode || this.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    } else {
      this.showCorrectAnswer = false;
    }
    if (!this.slideDetails.settings.showInResults) {
      this.changeBarChartData.forEach(item => {
        item.value = 0;
      });
    } else {
      this.barChartData = this.changeBarChartData;
      this.formatedOptions = this.barChartData;
      this.multipleChoiceData = this.formatedOptions;
      this.multipleChoiceData.forEach(multipleChoiceItem => {
        const changeBarItem = this.changeBarChartData.find(item => item.id === multipleChoiceItem.id);
        if (changeBarItem) {
          changeBarItem.value = multipleChoiceItem.value;
        }
      });
    }
    if (this.slideDetails?.design?.slideResponseAsPercentage) {
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
    d3.select('div#multiple-bar-chart-'+this.slideDetails?.slideId+'-'+this.viewfrom).select('svg').remove();
  
    this.svg = d3
      .select('div#multiple-bar-chart-'+this.slideDetails?.slideId+'-'+this.viewfrom)
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
      .call((selection) => {
        selection.each((d, i, nodes) => {
          // Get the bar width for this tick
          const barWidth = x.bandwidth();
          this.wrap.call(this, d3.select(nodes[i]), barWidth);
        });
      })
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
    function splitLongWord(word, tspan, width) {
      let chars = word.split("");
      let part = "";
      let parts = [];
      for (let i = 0; i < chars.length; i++) {
        part += chars[i];
        tspan.text(part);
        if (tspan.node().getComputedTextLength() > width) {
          if (part.length === 1) {
            // If a single character is too wide, just push it
            parts.push(part);
            part = "";
          } else {
            parts.push(part.slice(0, -1));
            part = chars[i];
          }
        }
      }
      if (part) parts.push(part);
      return parts;
    }

    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy")) || 0;
      let fontSize = parseInt(text.style("font-size")) || 12;
      let tspan = text.text(null).append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          // If the word itself is too long, split it
          if (line.length === 1) {
            // Remove the long word from current line
            line.pop();
            tspan.text(line.join(" "));
            // Split the long word and add each part as a new line
            const parts = splitLongWord(word, tspan, width);
            parts.forEach((part, idx) => {
              if (idx === 0) {
                // Use the existing tspan for the first part
                tspan.text(part);
              } else {
                // Create new tspan for subsequent parts
                tspan = text.append("tspan")
                  .attr("x", 0)
                  .attr("y", y)
                  .attr("dy", (++lineNumber * lineHeight + dy) + "em")
                  .text(part);
              }
            });
            line = [];
          } else {
            // Normal wrap - move the last word to a new line
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", (++lineNumber * lineHeight + dy) + "em")
              .text(word);
          }
        }
      }

      // Adjust font size if text is too tall
      const textHeight = (lineNumber + 1) * lineHeight * fontSize;
      const maxHeight = 60; // Maximum allowed height for text
      if (textHeight > maxHeight) {
        const scale = maxHeight / textHeight;
        fontSize = Math.max(Math.floor(fontSize * scale), 12); // Ensure minimum font size of 8px
        text.style("font-size", `${fontSize}px`);
      } else {
        // If text fits, use default size but ensure it's not too small
        fontSize = Math.max(fontSize, 10); // Ensure minimum font size of 10px for readable text
        text.style("font-size", `${fontSize}px`);
      }
    });
  }

  private dynamicChartResponseLoad(){
    this.updateChart(this.formatedOptions);
  }

  updateChart(value: any) {
    var valueData:any[] = [];
    const isDynamicChartData = Array.isArray(value) && value.every(item => 
      item.id !== undefined && 
      item.name !== undefined && 
      item.value !== undefined && 
      item.color !== undefined
    );
    valueData = isDynamicChartData ? value : this._workspaceservice.dynamicChartData(value);
    valueData.forEach((data: any, i) => {
      if (data.name.trimStart().endsWith(i + ' ' + 'P')) {

      } else if (data.name.trimStart().endsWith(this.MultiIndex + ' ' + 'P')) {

      }
      else {
        data.name = data?.name.trimStart() + i + ' ' + 'P'
      }
    });
    if (valueData.length !== this.changeBarChartData.length) {
      this.applyConditions(valueData);
      this.createSvg();
      this.drawBars(this.changeBarChartData);
      this.createBar(this.changeBarChartData);
    } else {
      this.applyConditions(valueData);
      this.drawBars(this.changeBarChartData);
      this.createBar(this.changeBarChartData);
    }
  }
  updateResult(value:any){
    this.formatedOptions = value;
    this.barChartData = value;
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
    this.slideTheme = data;
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);
    this.changeBarChartData.forEach((option, index) => {
      if (colors[index]) {
        option.color = colors[index];
      }
    });
  
    this.updateChart(this.changeBarChartData);
 
  }
  updateChartWithRandomData(): void {
    try {
      let changeBarChartData;
      if (this.isFirstUpdate) {
        changeBarChartData = this.changeBarChartData.map(option => ({
          id: option.id,
          name: option.name,
          value: 0,
          color: option.color,
          isCorrect: option.isCorrect
        }));
        this.isFirstUpdate = false;
      }
      else {
        let randomIndex: number;
        do {
          randomIndex = Math.floor(Math.random() * this.changeBarChartData.length);
        } while (randomIndex === this.previousIndex);
        this.previousIndex = randomIndex;

        changeBarChartData = this.changeBarChartData.map((option, index) => {
          if (index === randomIndex) {
            return {
              id: option.id,
              name: option.name,
              value: option.value+1,
              color: option.color,
              isCorrect: option.isCorrect
            };
          }
          return option;
        });
      }
      this.barChartData = changeBarChartData;
      this.updateChart(changeBarChartData);
    } catch (error) {
      console.error('Error updating chart data:', error);
      this.stopRandomDataUpdates();
    }
  }
  private getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  resetChart(): void {
    this.isFirstUpdate = true;
    this.previousIndex = -1;
  }
  startRandomDataUpdates(): void {
    this.resetChart();
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
    }

    this.chartUpdateInterval = setInterval(() => {
      this.updateChartWithRandomData();
    }, 1000);
  }
  stopRandomDataUpdates(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval);
      this.chartUpdateInterval = null;
      this.barChartData = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData, 'Options');
      this.formatedOptions = this.barChartData;
      this.multipleChoiceData = this._workspaceservice.dynamicChartData(this.formatedOptions);
      this.updateChart(this.multipleChoiceData);
    }
  }
  updatePresentationTheme(data: any) {
    if (!this.slideDetails?.design?.slideResetTheme) {
      this.slideTheme = data;
      const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);
      this.changeBarChartData.forEach((option, index) => {
        if (colors[index]) {
          option.color = colors[index];
        }
      });

      this.updateChart(this.changeBarChartData);
    } else {
      this.updateChart(this.changeBarChartData);
    }
  }
}
