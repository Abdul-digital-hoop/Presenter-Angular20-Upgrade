import { Component, Input, OnInit, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';

@Component({
    selector: 'app-multiple-donut',
    templateUrl: './multiple-donut.component.html',
    styleUrls: ['./multiple-donut.component.scss'],
    standalone: false
})
export class MultipleDonutComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  private margin = { top: 10, right: 40, bottom: 30, left: 300 };
  private width = 1000;
  private height = 1000;
  private svg: any;
  private colors: any;
  private radius = Math.min(this.width, this.height) / 2 - this.margin.left;
  filterData: any;
  optionValueInPercentage: number;
  isShowLongerDescription = false;
  @Input() slideTheme: any;
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any;
  @Input() viewfrom:string='';
  @Input() presentationMode:boolean;
  private showCorrectAnswer: boolean = false;
  labelData: Promise<any[]>;
  defaultsvg:boolean=false;
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  formatedOptions: any;
  slideLayout:string='';
  chooseCorrectAnswers:any;
  multiplechoicepresenterEnterClick:any;
  isAnimation: boolean = false;
  constructor(private _commanservice: CommanService,private _workspaceservice: WorkspaceService) {
  }
  ngOnInit(): void {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.slideTheme = this.slideDetails?.design?.slideResetTheme ? this.slidesTheme: this.presentationTheme;
    this.formatedOptions = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.data = this._workspaceservice.dynamicChartData(this.formatedOptions);
    var slideLayout = this._workspaceservice.getMasterLayoutData(this.slideDetails?.design?.slideLayoutId);
    this.slideLayout = slideLayout?.layoutType;
    this.chooseCorrectAnswers = this._workspaceservice.changeChooseCorrectAnswerFormat(this.slideDetails?.slideContentData);
    this.multiplechoicepresenterEnterClick = this._workspaceservice.changeCorrectAnswerFormat(this.slideDetails?.slideContentData);
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

  ngOnChanges() {
  }
  ngAfterViewInit() {
    this.transformData(this.data);
  }
  transformData(data: any) {
    this.applyConditions(data);
    this.filterData = data.filter((s: any) => s.value != 0);
    const dataLength = this.filterData.length;
  
    // Calculate percentages if slideResponseAsPercentage is true
      const totalValue = this.filterData.reduce((sum: number, item: any) => sum + item.value, 0);
      this.filterData = this.filterData.map((item: any) => ({
        ...item,
        percentage: (item.value / totalValue) * 100
      }));
    
    this.createColors(this.filterData);
  
    if (dataLength === 0 || !this.slideDetails.settings.showInResults) {
      this.filterData = this.data;
      this.createDefaultSvg();
      this.createColors(this.filterData); 
      this.defaultChart();
    } else {
      this.createSvg();
      this.createColors(this.filterData);
      this.drawChart();
    }
  
    this.PresentageCalculation(this.data);
  }

  updateBar(data:any){
    this.applyConditions(data);
    this.filterData = data.filter((s: any) => s.value != 0);
    const dataLength = this.filterData.length;
      const totalValue = this.filterData.reduce((sum: number, item: any) => sum + item.value, 0);
      this.filterData = this.filterData.map((item: any) => ({
        ...item,
        percentage: (item.value / totalValue) * 100
      }));
    if (dataLength === 0 || !this.slideDetails.settings.showInResults) {
      this.filterData = this.data;
      this.createDefaultSvg();
      this.createColors(this.filterData); 
      this.defaultChart();
    }
    else if(this.defaultsvg  || !this.slideDetails.settings.showInResults){
      this.defaultsvg = false;
      this.createSvg();
      this.createColors(this.filterData);
      this.drawChart();
    }
    else{
      this.createColors(this.filterData);
      this.drawChart();
    }

  }
  
  PresentageCalculation(options: any) {
    let optionTotalValue = 0;
    for (let option of options) {
      optionTotalValue += option?.value;
    }
    this.optionValueInPercentage = optionTotalValue > 0 ? 100 / optionTotalValue : 0;
  }
  private createDefaultSvg(): void {
    d3.select(`div#multiple-donut-chart-${this.slideDetails?.slideId}-${this.viewfrom}`).select("svg").remove();
    this.svg = d3.select(`div#multiple-donut-chart-${this.slideDetails?.slideId}-${this.viewfrom}`)
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('viewBox', '0 0 960 540')
      .append('g')
      .attr('transform', 'translate(220, 250),scale(1.1)');
      this.defaultsvg = true;
  }
  private createSvg(): void {
    d3.select(`div#multiple-donut-chart-${this.slideDetails?.slideId}-${this.viewfrom}`).select("svg").remove();
    if(this.slideLayout=='Default' || this.slideLayout=='Full Image'){
      this._workspaceservice.slideLayoutActive = false;
    }
    else{
      this._workspaceservice.slideLayoutActive = true;
    }
    const slideLayoutActive = this._workspaceservice.slideLayoutActive;
    const presentationMode = this.presentationMode;

    const viewBox = presentationMode 
        ? "0 0 960 690" 
        : slideLayoutActive 
            ? "0 0 960 850" 
            : "0 0 960 690";

    const transform = presentationMode 
        ? "translate(480, 270),scale(1.2)" 
        : slideLayoutActive 
            ? "translate(480, 270),scale(1)" 
            : "translate(480, 270),scale(1.2)";

    this.svg = d3
      .select(`div#multiple-donut-chart-${this.slideDetails?.slideId}-${this.viewfrom}`)
      .append("svg")
      .attr('height', '100%')
      .attr('width', '100%')
      .attr("viewBox", viewBox)
      .append("g")
      .attr("transform", transform);
}

  private createColors(data): void {
    const colorsRange = [];
    this.filterData.forEach(element => {
      if (element?.color) {
        colorsRange.push(element?.color);
      }
    });
    this.colors = d3.scaleOrdinal().domain(data.map((d: any) => d?.id)).range(colorsRange);
  }

  private drawChart(): void {
    const donut = d3.pie().sort(null).value((d: any) => d.value);
    const data_ready = donut(this.filterData);

    const arc = d3.arc().innerRadius(this.radius * 0.5).outerRadius(this.radius * 0.8);

    this.animatePieSlices(data_ready, arc);
  }
  private animatePieSlices(data_ready: any, arc: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const outerArc = d3.arc().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);
      const arcGenerator = d3.arc().innerRadius(this.radius * 0.5).outerRadius(this.radius * 0.8);
      const labelData = this.prepareLabelData(data_ready, arcGenerator, outerArc);

      const slices = this.svg.selectAll(".slice").data(data_ready, (d: any) => d.data.id);

      slices.exit()
        .transition()
        .duration(2000)
        .style("opacity", 0)
        .remove();

      slices.attr("fill", (d: { data: { color: string } }) => this.colors(d.data.color))
        .transition()
        .duration(2000)
        .ease(d3.easeLinear) 
        .attrTween("d", function (d: { startAngle: number, endAngle: number }) {
          const previous = (this as any).__previous || d;
          const interpolate = d3.interpolateObject(previous, d);
          (this as any).__previous = interpolate(1);

          return function (t) {
            const interpolatedData = interpolate(t);
            return arc(interpolatedData);
          };
        });

      slices.enter()
        .append("path")
        .attr("class", "slice")
        .attr("fill", (d: { data: { color: string } }) => this.colors(d.data.color))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        // .style("opacity", 0)
        .attr("d", d => arcGenerator({
          startAngle: d.startAngle,
          endAngle: d.startAngle,
          innerRadius: this.radius * 0.2,
          outerRadius: this.radius * 0.2
        }))
        .transition()
        .duration(1000) 
        .ease(d3.easeLinear) 
        .style("opacity", 1)
        .attrTween("d", function (d) {
          const interpolate = d3.interpolateObject(
            {
              startAngle: d.startAngle,
              endAngle: d.startAngle,
              innerRadius: this.radius * 0.2,
              outerRadius: this.radius * 0.2
            }, 
            d 
          );
          return function (t) {
            return arcGenerator(interpolate(t));
          };
        })
        .on("end", resolve);
      setTimeout(() => {
        this.updatelabels(data_ready, labelData, arcGenerator);
      }, 1000);
    });
  }

  async updatelabels(data_ready:any,Data:any,arc:any){
    const hasLowPercentage = data_ready.some(d => d.data.percentage <= 12);

    if (hasLowPercentage) {
        this.svg.selectAll('.polis').remove();
        this.svg.selectAll('.label-text').remove();
        this.svg.selectAll("circle").remove();
        this.svg.selectAll(".label-value").remove();
        this.svg.selectAll(".icon-container").remove();
        this.dataReachedChart(data_ready);
        this.animateValueLabels(data_ready, arc);
    }
    else{
      this.svg.selectAll('.legend').remove();
      this.svg.selectAll('.slice-value').remove();
      this.labelData = this.applyForceSimulation(Data);
      this.animatePolylines( await this.labelData);
          this.animateLabels(data_ready, await this.labelData);
          this.animateDots( await this.labelData);
          this.animateValueLabels(data_ready, arc);
    }
    const slideLayoutActive = this._workspaceservice.slideLayoutActive;
  const presentationMode = this.presentationMode;
  if (hasLowPercentage) {
      this.svg.transition().duration(500)
          .attr("transform", `translate(250, 340),scale(1.3)`);
  }else{
    const transform = presentationMode
    ? slideLayoutActive
        ? "translate(480, 270),scale(1)"
        : "translate(480, 270),scale(1.3)"
    : slideLayoutActive
        ? "translate(480, 270),scale(1)"
        : "translate(480, 270),scale(1)";

this.svg.transition().duration(500)
    .attr("transform", transform);
  }
  }
  private prepareLabelData(data_ready: any, arc: any, outerArc: any): any[] {
    return data_ready.map((d: any) => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        const xPos = this.radius * 1 * (midangle < Math.PI ? 1 : -1);
        return {
            label: d.data.name,
            isCorrect: d.data.isCorrect,
            x: pos[0],
            y: pos[1],
            xPos: xPos,
            color:d.data.color,
            polyline: [arc.centroid(d), outerArc.centroid(d), [xPos, pos[1]]]
        };
    }).filter(d => d !== null); 
  }
  private applyForceSimulation(labelData: any[]): Promise<any[]> {
    const nodes = labelData.map(d => Object.create({ x: d.xPos, y: d.y }));

    const simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX((d: any) => d.x).strength(1))
        .force('y', d3.forceY((d: any) => d.y).strength(1))
        .force('collide', d3.forceCollide(30)) // Increased collide radius for better spacing
        .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    labelData.forEach((d, i) => {
        d.x = nodes[i].x;
        d.y = nodes[i].y;
        d.polyline[2][0] = d.x;
        d.polyline[2][1] = d.y;
    });

    return Promise.resolve(labelData);
  }
  private animatePolylines(labelData: any[]): void {
    const polies = this.svg.selectAll(".polis").data(labelData, (d: any) => d.id); // Key function for data binding

    // Update existing polylines (transition opacity)
    polies.transition()
        .duration(2000)
        .style('opacity', 1)
        .attr("stroke", (d: any) => this.colors(d.color))
        .attr("points", d => d.polyline); // Update positions if needed

    // Handle new polylines (enter selection)
    polies.enter()
        .append("polyline")
        .attr("class", "polis")
        .attr("stroke", (d: any) => this.colors(d.color))
        .style("fill", "none")
        .attr("stroke-width", 1)
        .style('opacity', 0)
        .attr("points", d => d.polyline)
        .transition()
        .duration(1000)
        .style('opacity', 1);

    // Handle removed polylines (exit selection)
    polies.exit().transition().duration(500).style('opacity', 0).remove();
}

private animateLabels(data_ready: any, labelData: any[]): void {
  const texts = this.svg.selectAll(".label-text").data(labelData, (d: any) => d.id); // Key function for data binding

  // Update existing labels smoothly
  texts.transition()
      .duration(3000)
      .ease(d3.easeCubicOut) // Smooth easing function
      .attr("transform", d => `translate(${d.x + (d.xPos > 0 ? 10 : -10)},${d.y})`)
      .style("text-anchor", d => d.xPos > 0 ? "start" : "end")
      .attr('fill', this.slideTheme?.ThemeTextColor)
      .style('opacity', 1);

  // Handle new labels (enter selection)
  const newLabels = texts.enter()
      .append("text")
      .attr("class", "label-text")
      .attr('fill', this.slideTheme?.ThemeTextColor)
      .text(d => d.label)
      .attr("transform", d => `translate(${d.x},${d.y})`) // Start from center position
      .style("text-anchor", d => d.xPos > 0 ? "start" : "end")
      .style('opacity', 0)
      .call(this.wrap, 250);

  // Merge new and existing labels & apply smooth transition
  newLabels.merge(texts)
      .transition()
      .duration(3000)
      .ease(d3.easeCubicOut) // Smooth easing
      .style('opacity', 1)
      .attr("transform", d => `translate(${d.x + (d.xPos > 0 ? 10 : -10)},${d.y})`)
  ;

  // Remove old labels smoothly
  texts.exit()
      .transition()
      .duration(500)
      .ease(d3.easeCubicIn)
      .style('opacity', 0)
      .remove()

  // Animate icons near labels smoothly
  this.appendIconsNearLabels(data_ready, labelData);
}


    private appendIconsNearLabels(data_ready: any, labelData: any[]): void {
      // Remove existing icons before appending new ones
      this.svg.selectAll(".icon-container").remove();
    
      // Create a temporary text element to measure text width
      const tempText = this.svg.append("text")
          .attr("class", "temp-text")
          .attr('font-size', '14px')
          .style('opacity', 0);
    
      const iconSize = 16; // Define a fixed size for the icons
      const padding = 25; // Padding between text and icon
      const maxTextWidth = 240; // Maximum width of the text label before wrapping
    
      const iconContainer = this.svg.selectAll(".icon-container")
          .data(labelData)
          .enter()
          .append("g")
          .attr("class", "icon-container")
          .attr("transform", d => {
              // Set the text of the temporary text element to the label
              tempText.text(d.label);
    
              // Measure the width of the text
              const textWidth = Math.min(tempText.node().getBBox().width, maxTextWidth);
    
              // Calculate the x position of the icon based on text width and label position
              const iconXPos = d.x + (d.xPos > 0 ? textWidth + padding : -textWidth - iconSize - padding);
    
              // Return the transform attribute for the icon container
              return `translate(${iconXPos},${d.y - iconSize / 2})`;
          });
    
      // Append the icons based on the isCorrect property
      iconContainer.each((d, i, nodes) => {
          const iconGroup = d3.select(nodes[i]);
          const dataItem = data_ready[i].data; // Corresponding data item
    
          if (!dataItem.isCorrect) {
              iconGroup.append("path")
                  .attr("class", "correct-answer-icon")
                  .style('opacity', this.showCorrectAnswer ? 1 : 0)
                  .attr("d", "M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z")
                  .attr("fill", "#DB3734") // Adjust color as needed
                  .attr("transform", `scale(${iconSize / 22})`); // Scale the icon to fit the size
          } else {
              iconGroup.append("path")
                  .attr("class", "wrong-answer-icon")
                  .style('opacity', this.showCorrectAnswer ? 1 : 0)
                  .attr("d", "M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z")
                  .attr("fill", "#00DB91") // Adjust color as needed
                  .attr("transform", `scale(${iconSize / 26})`); // Scale the icon to fit the size
          }
      });
    
      // Remove the temporary text element
      tempText.remove();
    }
    




  private animateDots(labelData: any[]): void {
    this.svg.selectAll("circle").remove();
    this.svg
        .selectAll("dots-end")
        .data(labelData)
        .enter()
        .append("circle")
        .attr("r", 8)
        .attr("fill", (d: any) => this.colors(d.color))
        .style('opacity', 0)
        .transition()
        .duration(0)
        .style('opacity', d => {
          return 1;
      })
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  }
  private animateValueLabels(data_ready: any, arc: any): void {
    this.svg.selectAll(".label-value").remove();
    this.svg
        .selectAll("innerLabels")
        .data(data_ready)
        .enter()
        .append("text")
        .attr("class", "label-value")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr('font-size', '24px')
        .attr('fill', (d, i) => this._commanservice.getContrastColor(this.data[i].color))
        .style("text-anchor", "middle")
        .text(d => {
          if (this.slideDetails?.design?.slideResponseAsPercentage) {
            return `${Math.round(d.data.percentage)}%`;  // Round percentage to the nearest integer
          } else {
            return d.data.value;  // Show raw value
          }
        })
        .style('opacity', (d) => d.data.percentage < 5 ? 0 : 1)
        .transition()
        .duration(500)
        .style('opacity', (d) => d.data.percentage < 5 ? 0 : 1);
  }
  private dynamicChartResponseLoad(){
    this.updateChart(this.data);
  }
  updateChart(value:any){
    this.updateBar(value);
  }
  updateResult(value:any){
    this.formatedOptions = value;
    this.data = value;
    this.updateBar(value);
  }
  updateLayout(value:any,layout:boolean){
      this.transformData(value);
    
  }
  private dataReachedChart(data_ready: any) {
    const legend = this.svg.selectAll('.legend')
      .data(data_ready)
      .join(
        enter => enter.append('g')
          .attr('class', 'legend')
          .attr('transform', (d: any, i: number) => `translate(250, ${(i - (data_ready.length - 1) / 2) * 70})`),
        update => update.attr('transform', (d: any, i: number) => `translate(250, ${(i - (data_ready.length - 1) / 2) * 70})`),
        exit => exit.remove()
      );
  
    legend.selectAll('circle').remove();
    legend.selectAll('text').remove();
    legend.selectAll('path').remove();
  
    // Append legend color circle
    legend.append('circle')
      .attr('cx', -42)
      .attr('cy', -5)
      .attr('r', 8)
      .attr('fill', (d: any) => this.colors(d.data.id));
  
    // Append text for values
    legend.append('text')
      .attr('x', -30)
      .attr('y', 0)
      .attr('class', 'value')
      .style('fill', this.slideTheme?.ThemeTextColor)
      .style('font-size', '12px')
      .text((d: any) => this.slideDetails?.design?.slideResponseAsPercentage ? `${Math.round(d.data.percentage)}%` : d.data.value);
  
    // Append text for names
    const textElements = legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '0')
      .style('fill', this.slideTheme?.ThemeTextColor)
      .style('font-size', '12px')
      .text((d: any) => d.data.name)
      .call(this.wrap, 250);
  
    const self = this;
  
    // Add the correct/wrong answer icons
    textElements.each(function (d: { data: { isCorrect: boolean } }, i) {
      const textElement = d3.select(this);
      const textNode = textElement.node() as SVGGraphicsElement | null;
      const textWidth = textNode ? textNode.getBBox().width : 0;
  
      d3.select(this.parentNode).selectAll('path').remove(); // Remove old icons to prevent duplication
  
      d3.select(this.parentNode).append('path')
        .attr('class', (d: { data: { isCorrect: boolean } }) => !d.data.isCorrect ? 'wrong-answer-icon' : 'correct-answer-icon')
        .attr('d', (d: { data: { isCorrect: boolean } }) => !d.data.isCorrect
          ? 'M20 4.58579C20.78 5.36684 20.78 6.63317 20 7.41421L7.41421 20.4142C6.63317 21.1953 5.36684 21.1953 4.58579 20.4142C3.80474 19.6332 3.80474 18.3668 4.58579 17.5858L17.5858 4.58579C18.3668 3.80474 19.6332 3.80474 20 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L20 17.5858C20.78 18.3668 20.78 19.6332 20 20.4142C19.219 21.1953 17.9527 21.1953 17.1716 20.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z'
          : 'M25 5.58579C25.9753 6.56112 25.9753 7.83888 25 8.82843L10.8284 23L5 17.1716C4.19289 16.3645 4.19289 15.1355 5 14.3284C5.80711 13.5213 7.03668 13.5213 7.82843 14.3284L12 18.5L22.8284 7.58579C23.616 6.79823 24.8828 6.79823 25.5858 7.58579Z')
        .attr('fill', (d: { data: { isCorrect: boolean } }) => !d.data.isCorrect ? '#DB3734' : '#00DB91')
        .attr('transform', `translate(${textWidth + 10}, -13) scale(0.7)`)
        .style('opacity', self.showCorrectAnswer ? 1 : 0);
    });
  }
  //#region Chart Without Value
  private defaultChart(): void {
    const radius = Math.min(this.width, this.height) / 2;
    const donut = d3.pie()
      .sort(null)
      .value((d: any) => d.value === 0 ? 1 : d.value);
  
    const data_ready = donut(this.filterData);
    const arc = d3.arc()
      .innerRadius(this.radius * 0.5)
      .outerRadius(this.radius * 0.9);
  
    // Draw the pie slices
    this.svg.selectAll('.allSlices')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', this._commanservice.getContrastColor(this.slideTheme?.ThemeBackgroundColor))
      .style('opacity', 0.05);
  
    // Add the legend
    const legend = this.svg.selectAll('.legend')
      .data(data_ready)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d: any, i: number) => `translate(250, ${(i - (data_ready.length - 1) / 2) * 80})`);
  
    legend.append('circle')
      .attr('cx', '-12')
      .attr('cy', '-5')
      .attr('r', 8)
      .attr('fill', (d: any) => this.colors(d.data.id));
  
    const textElements = legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '0')
      .style('fill', this.slideTheme?.ThemeTextColor)
      .style('font-size', '14px')
      .text((d: any) => d.data.name)
      .call(this.wrap, 380);
      const self = this;
      // Add the correct or wrong answer icons to the legend
      textElements.each(function(d, i) {
        const textElement = d3.select(this);
        const textWidth = textElement.node().getBBox().width;
    
        legend.filter((data, index) => index === i).append('path')
          .attr('class', d => !d.data.isCorrect ? 'correct-answer-icon' : 'wrong-answer-icon')
          .attr('d', d => !d.data.isCorrect
            ? 'M20 4.58579C20.78 5.36684 20.78 6.63317 20 7.41421L7.41421 20.4142C6.63317 21.1953 5.36684 21.1953 4.58579 20.4142C3.80474 19.6332 3.80474 18.3668 4.58579 17.5858L17.5858 4.58579C18.3668 3.80474 19.6332 3.80474 20 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L20 17.5858C20.78 18.3668 20.78 19.6332 20 20.4142C19.219 21.1953 17.9527 21.1953 17.1716 20.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z'
            : 'M25 5.58579C25.9753 6.56112 25.9753 7.83888 25 8.82843L10.8284 23L5 17.1716C4.19289 16.3645 4.19289 15.1355 5 14.3284C5.80711 13.5213 7.03668 13.5213 7.82843 14.3284L12 18.5L22.8284 7.58579C23.616 6.79823 24.8828 6.79823 25.5858 7.58579Z')
          .attr('fill', d => !d.data.isCorrect ? '#DB3734' : '#00DB91') // Adjust color as needed
          .style('font-size', '12px') // Reduced font size
          .style('font-weight', '400') // Set font weight
          .attr('transform', `translate(${textWidth + 10}, -13) scale(0.7)`)
          .style('opacity', self.showCorrectAnswer ? 1 : 0);
      });
  }
  

  private wrap(text, width): void {
    text.each(function () {
      const textElement = d3.select(this);
      const words = textElement.text().split(/\s+/);
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1;
      let y = parseFloat(textElement.attr('y')) || 0;
      const dy = lineHeight * y;
      let tspan = textElement.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      let wordCount = 0;
  
      // Set font size based on the number of words
      const fontSize = words.length > 5 ? '12px' : '14px';
      textElement.style('font-size', fontSize);
  
      words.forEach(function (word) {
        if (word.length > width) {
          const segments = splitWord(word, width);
          segments.forEach(function (segment) {
            addWordToLine(segment);
          });
        } else {
          addWordToLine(word);
        }
      });
  
      function addWordToLine(word) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width || ++wordCount === 40) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = textElement.append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
          wordCount = 0;
        }
      }
  
      function splitWord(word, length) {
        const result = [];
        while (word.length > 20) {
          result.push(word.substr(0, 20));
          word = word.substr(20);
        }
        result.push(word);
        return result;
      }
    });
  }
  


  updateTheme(data:any){
    this.slideTheme = data;
    if(!this.slideDetails?.design.resetThemes){
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.data.forEach((option, index) => {
      if (colors[index]) {
        option.color = colors[index];
      }
    });
  }
    this.transformData(this.data);
  }
  updatePresentationTheme(data: any) {
    if (!this.slideDetails?.design?.slideResetTheme) {
      this.slideTheme = data;
      if(!this.slideDetails?.design.resetThemes){
      const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);
  
      this.data.forEach((option, index) => {
        if (colors[index]) {
          option.color = colors[index];
        }
      });
    }
      this.transformData(this.data);
    } else {
      this.transformData(this.data);
    }
  }

  private applyConditions(data:any): void {
    this.data = JSON.parse(JSON.stringify(data));
  
    if (this.chooseCorrectAnswers && !this.presentationMode || this.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    }else{
      this.showCorrectAnswer = false;
    }
  
   
  }

  updateChartWithRandomData(): void {
    try {
      let changeData;
      if (this.isFirstUpdate) {
        changeData = this.data.map(option => ({
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
          randomIndex = Math.floor(Math.random() * this.data.length);
        } while (randomIndex === this.previousIndex);
        this.previousIndex = randomIndex;

        changeData = this.data.map((option, index) => {
          if (index === randomIndex) {
            return {
              id: option.id,
              name: option.name,
              value: option.value + 1,
              color: option.color,
              isCorrect: option.isCorrect
            };
          }
          return option;
        });
      }
      this.data = changeData;
      this.updateChart(changeData);
    } catch (error) {
      console.error('Error updating chart data:', error);
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
  
      // First update after 1000ms
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
      this.data = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData, 'Options');
      this.formatedOptions = this.data;
      this.data = this._workspaceservice.dynamicChartData(this.formatedOptions);
      this.isAnimation = false;
      this.updateChart(this.data);
    }
  }
}
