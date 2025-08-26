import { Component, Input, OnInit, OnChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit, OnChanges {
  @Input('themesChartColor') public themesChartColor: any[];
  @Input('aboutTheSlides') public aboutTheSlideValue: any;
  @Input('questions') public questionsValue: any;
  @Input('longDescription') public longDescriptionValue: any;
  @Input('slidDetails') public slideData: any;
  @Input('slideThemes') public slideThemes: any;
  @Input('screenOptions') public screenOptions: string;
  isShowLongerDescription = false;
  private barHeight = 50;
  private marginTop = 30;
  private marginRight = 50;
  private marginBottom = 10;
  private marginLeft = 50;
  private width = 700;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  x: any;
  y: any;
  height: number;
  rankingData: any[] = [];
  @Input() rankingOptionData: any[] = [];
  @Input() slideTheme:any;
  existingdata:any;
  isTransitioning:boolean = false;
  constructor(private workSpaceService: WorkspaceService,public cdr: ChangeDetectorRef) {
    this.rankingOptionData = this.workSpaceService.dynamicChartData(this.workSpaceService.options);
    this.slideTheme = this.workSpaceService.presentationTheme;
  }
  
  ngOnInit() {
    this.generateRankingSVG();
  }
  ngOnChanges() {
    this.rankingOptionData = this.workSpaceService.dynamicChartData(this.workSpaceService.options);
  }
  generaterankingOptionData() {
    this.rankingData =[];

    if (this.workSpaceService.slideShowInResults) {
      this.rankingOptionData.forEach((options, i) => {
        var optionArrangement = this.positionTransform(i + 1);
        this.rankingData.push({ Opt: optionArrangement, opVal: options.position, name: options.name,color: options.color,index:i});
      });
      this.rankingData.sort((a, b) => {
        return b.opVal - a.opVal
      }).forEach((row, i) => {
        var optionArrangement = this.positionTransform(i + 1);
        row.Opt = optionArrangement;
      });
    }else{
      this.rankingOptionData.forEach((options, i) => {
        var optionArrangement = this.positionTransform(i + 1);
        this.rankingData.push({ Opt: optionArrangement,   opVal: this.rankingOptionData.length - i, name: options.name,color: options.color,index:i});
      });
      this.rankingData.sort((a, b) => {
        return b.opVal - a.opVal
      }).forEach((row, i) => {
        var optionArrangement = this.positionTransform(i + 1);
        row.Opt = optionArrangement;
      });
    }
    this.height = Math.ceil((this.rankingData?.length) * this.barHeight) + this.marginTop + this.marginBottom;
    if(this.rankingData.length === this.existingdata.length){
      this.generateBars();
    }else{
      this.generateRankingSVG();
    }
  }
  positionTransform(numericValue: number): string {
    switch (numericValue % 10) {
      case 1:
        return numericValue + 'st';
      case 2:
        return numericValue + 'nd';
      case 3:
        return numericValue + 'rd';
      default:
        return numericValue + 'th';
    }
  }
  generateRankingSVG() {
    d3.select('div#Ranking_charts').select("svg").remove();

    const maxValue = d3.max(this.rankingData, d => d.opVal);
    this.x = d3.scaleLinear()
      .domain([0, maxValue])
      .range([this.marginLeft, this.width - this.marginRight]);

    this.y = d3.scaleBand()
      .domain(this.rankingData.map((d, i) => i.toString()))
      .rangeRound([this.marginTop, this.height - this.marginBottom])
      .padding(0.2);
      const svgviewset = this.rankingData.every(d => d.opVal === 0);
      if(svgviewset){
        this.svg = d3.select('div#Ranking_charts')
        .append('svg')
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('viewBox', `0 0 340 300`);
      }else{
        this.svg = d3.select('div#Ranking_charts')
        .append('svg')
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('viewBox', `0 0 620 300`);
      }
    this.generateBars();
  }
  generateBars() {
    if (this.isTransitioning) {
      return;
    }
    this.isTransitioning = true;
    const maxBarWidth = 330;
    const minBarWidth = 3;
    const maxOpVal = Math.max(...this.rankingData.map(d => d.opVal), 1);
    this.rankingData.sort((a, b) => a.rank - b.rank);
    const svgviewset = this.rankingData.every(d => d.opVal === 0);
    if (!svgviewset) {
      this.svg.transition().duration(500)
        .attr('viewBox', `0 0 620 300`);
    }
    this.svg.selectAll("rect").interrupt();
    this.existingdata = JSON.parse(JSON.stringify(this.rankingData));
    const bars = this.svg.selectAll("rect")
      .data(this.rankingData, (d: any) => d.index);
    const updateTransition = bars.transition()
      .duration(2000)
      .ease(d3.easeCubicInOut)
      .attr("width", (d) =>
        this.workSpaceService.slideShowInResults
          ? Math.max((d.opVal / maxOpVal) * maxBarWidth, minBarWidth)
          : minBarWidth
      )
      .attr("fill", (d) => d.color)
      .transition()
      .duration(1200)
      .attr("fill", (d) => d.color)
      .attr("y", (d, i) => this.y(i.toString()));
    const enterSelection = bars.enter()
      .append("rect")
      .attr("x", this.marginLeft)
      .attr("y", (d, i) => this.y(i.toString()))
      .attr("width", 0)
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => d.color)
      .attr("opacity", 0);
    const enterTransition = enterSelection.transition()
      .duration(2000)
      .ease(d3.easeExpOut)
      .attr("fill", (d) => d.color)
      .attr("width", (d) =>
        this.workSpaceService.slideShowInResults
          ? Math.max((d.opVal / maxOpVal) * maxBarWidth, minBarWidth)
          : minBarWidth
      )
      .attr("opacity", 1)
      .transition()
      .duration(1200)
      .attr("fill", (d) => d.color)
      .attr("y", (d, i) => this.y(i.toString()));
    const exitTransition = bars.exit()
      .transition()
      .duration(1200)
      .attr("opacity", 0)
      .remove();
    this.ranksPositionupdate();
    this.ranksTextupdate();
    Promise.all([
      updateTransition.end(),
      enterTransition.end(),
      exitTransition.end()
    ]).then(() => {
      this.isTransitioning = false;
      if (!this.areDataEqual(this.existingdata, this.rankingData)) {
        this.generateBars();
      }
    }).catch(() => {
      this.isTransitioning = false;
    });
  }
  
  areDataEqual(oldData, newData) {
    if (oldData.length !== newData.length) return false;
    for (let i = 0; i < oldData.length; i++) {
      if (
        oldData[i].index !== newData[i].index ||
        oldData[i].opVal !== newData[i].opVal ||
        oldData[i].color !== newData[i].color ||
        oldData[i].rank !== newData[i].rank
      ) {
        return false;
      }
    }
    return true;
  }
  
  
  private ranksPositionupdate(){
    const ranks = this.svg.selectAll(".rank-label")
    .data(this.rankingData, (d: any) => d.index);
  
  
  ranks.transition()
    .duration(2000)
    .text((d) => d.Opt)
    .attr("fill", this.slideTheme?.ThemeTextColor)
    .transition()
    .duration(1200)
    .attr("y", (d, i) => this.y(i.toString()) + this.y.bandwidth() / 2);
  
    const ranksenter =ranks.enter()
    .append("text")
    .attr("class", "rank-label")
    .attr("x", this.marginLeft - 10)
    .attr("y", (d, i) => this.y(i.toString()) + this.y.bandwidth() / 2)
    .attr("fill", this.slideTheme?.ThemeTextColor)
    .attr("font-size", "14px")
    .attr("text-anchor", "end")
    .attr("opacity", 0)
    .text((d) => d.Opt)
    .transition()
    .duration(2000)
    .attr("opacity", 1)
    .transition()
    .duration(1200)
    .attr("y", (d, i) => this.y(i.toString()) + this.y.bandwidth() / 2);
  
  ranks.exit()
    .transition()
    .duration(1200)
    .attr("opacity", 0)
    .remove();
   }
   private ranksTextupdate() {
    const maxBarWidth = 330;
    const minBarWidth = 3;
    const maxOpVal = Math.max(...this.rankingData.map(d => d.opVal), 1);
    this.rankingData.sort((a, b) => a.rank - b.rank);
  
    // Determine the minimum font size applied
    let minFontSize = Infinity;
    this.rankingData.forEach((d) => {
      const fontSize = parseInt(this.getFontSize(d.name.length, d.opVal), 10);
      if (fontSize < minFontSize) {
        minFontSize = fontSize;
      }
    });
  
    const labels = this.svg.selectAll(".movie-label")
      .data(this.rankingData, (d: any) => d.index);
  
    labels.transition()
      .duration(2000)
      .attr("x", (d) =>
        this.workSpaceService.slideShowInResults
          ? this.marginLeft + Math.max((d.opVal / maxOpVal) * maxBarWidth, minBarWidth) + 10
          : 63
      )
      .attr("font-size", `${minFontSize}px`) // Apply minimum font size to all labels
      .attr("fill", this.slideTheme?.ThemeTextColor)
      .tween("text", this.wrapText)
      .transition()
      .duration(1200)
      .attr("y", (d, i) =>
        this.y(i.toString()) + this.y.bandwidth() / 2 - (d.name.length >= 100 ? 10 : 0)
      );
  
    const labelsEnter = labels.enter()
      .append("text")
      .attr("class", "movie-label")
      .attr("x", (d) =>
        this.workSpaceService.slideShowInResults
          ? this.marginLeft + Math.max((d.opVal / maxOpVal) * maxBarWidth, minBarWidth) + 10
          : 63
      )
      .attr("y", (d, i) =>
        this.y(i.toString()) + this.y.bandwidth() / 2 - (d.name.length >= 100 ? 10 : 0)
      )
      .attr("fill", this.slideTheme?.ThemeTextColor)
      .attr("font-size", `${minFontSize}px`) // Apply minimum font size to all labels
      .attr("text-anchor", "start")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .transition()
      .duration(800)
      .attr("y", (d, i) =>
        this.y(i.toString()) + this.y.bandwidth() / 2 - (d.name.length >= 100 ? 10 : 0)
      )
      .tween("text", this.wrapText);
  
    labels.exit()
      .transition()
      .duration(1200)
      .attr("opacity", 0)
      .remove();
  }
  
  // Function to wrap text
  private wrapText(d) {
    return function () {
      const textElement = d3.select(this);
      const words = d.name.split(" ");
      const maxCharsPerLine = 50;
      let lines: string[] = [];
      let currentLine = "";
  
      words.forEach((word) => {
        if ((currentLine + word).length <= maxCharsPerLine) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });
  
      if (currentLine) lines.push(currentLine);
  
      textElement.text("");
      lines.forEach((line, index) => {
        textElement.append("tspan")
          .attr("x", textElement.attr("x"))
          .attr("dy", index === 0 ? "0em" : "1.2em")
          .text(line);
      });
    };
  }
  
   getFontSize(titleLength: number, value: any): string {
    if (titleLength >= 101) {
      return '8px';
    }
    else if (titleLength >= 45 && titleLength <= 100) {
      return '8px';
    }
     else if (titleLength >= 30 && titleLength <= 45) {
      return '10px';
    } else {
      return '14px';
    }
  }
  

  showLongerDescription() {
    if (this.screenOptions === 'presentationScreen') {
      this.isShowLongerDescription = true;
    }
  }
  hideLongerDescription() {
    if (this.screenOptions === 'presentationScreen') {
      this.isShowLongerDescription = false;
    }
  }
  private dynamicChartResponseLoad(){
    this.updateChart();
  }
  updateChart() {
    this.rankingOptionData = this.workSpaceService.dynamicChartData(this.workSpaceService.options);
    this.generaterankingOptionData();
  }
  updateTheme(data: any) {
    this.slideTheme = data;
    if(!this.workSpaceService.resetThemes){
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.workSpaceService.options.forEach((option, index) => {
      if (colors[index]) {
        option.visualizationColor = colors[index];
      }
    });
  }
    this.rankingOptionData = this.workSpaceService.dynamicChartData(this.workSpaceService.options);
    this.generaterankingOptionData();
    
  }
}
