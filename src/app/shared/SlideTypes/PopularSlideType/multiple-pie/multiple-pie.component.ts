import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';

@Component({
  selector: 'app-multiple-pie',
  templateUrl: './multiple-pie.component.html',
  styleUrls: ['./multiple-pie.component.scss']
})
export class MultiplePieComponent implements OnInit {
  @Input() barData: any[] = [];
  isShowLongerDescription = false;
  private margin = { top: 10, right: 40, bottom: 30, left: 300 };
  private width = 1000;
  private height = 1000;
  private svg: any;
  private colors: any;
  private radius = Math.min(this.width, this.height) / 2 - this.margin.left;
  filterData: any;
  optionValueInPercentage: number;
  @Input() slideTheme:any;
  @Input() slideDetails:any;
  @Input() presentationLevelTheme:any;
  @Input() viewfrom:string='';
  @Input() presentationMode:boolean;
  slideLayout:string='';
  chooseCorrectAnswers:any;
  multiplechoicepresenterEnterClick:any;
  private showCorrectAnswer: boolean = false;
  defaultsvg:boolean=false;
  chartUpdateInterval: any;
  previousIndex: number = -1;
  isFirstUpdate: boolean = true;
  presentationTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: any;  ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number,backgroundColorOpacity:any};
  slidesTheme: { ThemeName: string; ThemeLogo: any; ThemeBackgroundColor: string; ThemeBackgroundImage: string; ThemeTextColor: string; ThemeFontFamily: string; ThemeLineColor: string; ThemeVisualizationColor: any[]; slideTextBold: boolean; slideTextItalic: boolean; slideTextUnderLine: boolean; slideTextStrikeThrough: boolean; slidetextSize: number };
  formatedOptions: any;
  isAnimation: boolean = false;
  constructor(private _workspaceservice: WorkspaceService,private _commanservice: CommanService) {
    
  }

  ngOnInit(): void {
    this.presentationTheme = this.assignThemeProperties(this.presentationLevelTheme);
    this.slidesTheme = this.assignThemeProperties(this.presentationLevelTheme, this.slideDetails?.design,true);
    this.slideTheme = this.slideDetails?.design?.slideResetTheme ? this.slidesTheme: this.presentationTheme;
    this.formatedOptions = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData,'Options');
    this.barData = this._workspaceservice.dynamicChartData(this.formatedOptions);
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
    this.transformData(this.barData);
    this.updateBar(this.barData);
  }
  transformData(barData:any) {
    this.applyConditions(barData);
    this.filterData = [];
    this.filterData = barData.filter((s) => s.value != 0);
    var dataLength = this.filterData.length;
      const totalValue = this.filterData.reduce((sum: number, item: any) => sum + item.value, 0);
      this.filterData = this.filterData.map((item: any) => ({
        ...item,
        percentage: (item.value / totalValue) * 100
      }));
    
    if (dataLength === 0 || !this.slideDetails.settings.showInResults) {
      this.filterData = this.barData;
      this.createDefaultSvg();
      this.createColors(this.filterData);
      this.defaultChart();
    } else {
      this.createSvg();
      this.createColors(this.filterData);
      this.drawChart();
    }
    this.PresentageCalculation(this.barData)
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
      this.filterData = this.barData;
      this.createDefaultSvg();
      this.createColors(this.filterData); 
      this.defaultChart();
    }
    else if(this.defaultsvg || !this.slideDetails.settings.showInResults){
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
  private createDefaultSvg(): void {
    d3.select(`div#multiple-pie-chart-${this.slideDetails?.slideId}-${this.viewfrom}`).select("svg").remove();
    this.svg = d3.select(`div#multiple-pie-chart-${this.slideDetails?.slideId}-${this.viewfrom}`)
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('viewBox', '0 0 960 540')
      .append('g')
      .attr('transform', 'translate(200, 250),scale(1.1)');
      this.defaultsvg = true;
  }
  private createSvg(): void {
    if(this.slideLayout=='Default' || this.slideLayout=='Full Image'){
      this._workspaceservice.slideLayoutActive = false;
    }
    else{
      this._workspaceservice.slideLayoutActive = true;
    }
    const slideLayoutActive = this._workspaceservice.slideLayoutActive;
    const presentationMode = this.presentationMode;

    const viewBox = (presentationMode && slideLayoutActive)
        ? "0 0 960 750"
        : presentationMode
            ? "0 0 960 640"
            : slideLayoutActive
                ? "0 0 960 850"
                : "0 0 960 750";

    const transform = presentationMode 
        ? "translate(480, 270),scale(1.2)" 
        : slideLayoutActive 
            ? "translate(480, 270),scale(1)" 
            : "translate(480, 270),scale(1.2)";

    d3.select(`div#multiple-pie-chart-${this.slideDetails?.slideId}-${this.viewfrom}`).select("svg").remove();
    this.svg = d3.select(`div#multiple-pie-chart-${this.slideDetails?.slideId}-${this.viewfrom}`)
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('viewBox', viewBox)  
      .append('g')
      .attr('transform', transform);
}

  private createColors(data): void {
    const colorsRange = data.map(d => d.color ? d.color : '#000000'); // Default color if not provided
    this.colors = d3.scaleOrdinal()
      .domain(data.map((d) => d.id))
      .range(colorsRange);
  }
  //#region With Value
  private drawChart(): void {
    const pie = d3.pie().sort(null).value((d: any) => d.value);
    const data_ready = pie(this.filterData);

    const arc = d3.arc().innerRadius(0).outerRadius(this.radius * 0.8);
    const outerArc = d3.arc().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);

    // Bind Data
    const paths = this.svg.selectAll('.path').data(data_ready, (d: any) => d.data.id);

    // **Update existing paths smoothly**
    paths.transition()
        .duration(2000)
        .ease(d3.easeCubicOut)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate(this._current || { startAngle: 0, endAngle: 0 }, d);
            this._current = interpolate(1); // Save new state
            return function (t) {
                return arc(interpolate(t));
            };
        })
        .attr('fill', (d) => this.colors(d.data.color))
        .style('opacity', 1);

    // **Enter new paths smoothly**
    const newPaths = paths.enter()
        .append('path')
        .attr('class', 'path')
        .attr('fill', (d) => this.colors(d.data.color))
        .attr('stroke', 'white')
        .style('stroke-width', '3px')
        .style('opacity', 0)
        .attr('d', d3.arc().innerRadius(0).outerRadius(0)) // Start at center

    newPaths.transition()
        .duration(2000)
        .ease(d3.easeCubicOut)
        .style('opacity', 1)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) {
                return arc(interpolate(t));
            };
        });

    // **Exit: Fade out and remove old paths**
    paths.exit()
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

    // **Update labels after animation**
    setTimeout(() => {
        this.updatelabels(data_ready, arc, outerArc);
    }, 1000);
}


updatelabels(data_ready: any, arc: any, outerArc: any) {
  const hasLowPercentage = data_ready.some(d => d.data.percentage <= 12);

  if (hasLowPercentage) {
      this.svg.selectAll('.polyline').remove();
      this.svg.selectAll('.polyline-circle').remove();
      this.svg.selectAll('.label').remove();
      this.dataReachedChart(data_ready);
      this.animateValues(data_ready, arc);
  } else {
      this.svg.selectAll('.legend').remove();
      this.svg.selectAll('.slice-value').remove();
      this.animatePolylines(data_ready, arc, outerArc);
      this.animateCircles(data_ready, outerArc);
      this.animateLabels(data_ready, outerArc);
      this.animateValues(data_ready, arc);
  }

  // ✅ Recalculate scale based on the existing conditions
  const slideLayoutActive = this._workspaceservice.slideLayoutActive;
  const presentationMode = this.presentationMode;

  // ✅ Update only the translate when hasLowPercentage is true
  if (hasLowPercentage) {
      this.svg.transition().duration(500)
          .attr("transform", `translate(250, 320),scale(1.3)`);
  }else{
    const transform = presentationMode
    ? slideLayoutActive
        ? "translate(480, 270),scale(1)"
        : "translate(480, 270),scale(1.2)"
    : slideLayoutActive
        ? "translate(480, 270),scale(0.9)"
        : "translate(480, 270),scale(1)"; // Added missing else case

this.svg.transition().duration(500)
    .attr("transform", transform);

  }
}


  private animatePolylines(data_ready: any, arc: any, outerArc: any): void {
    const polylines = this.svg.selectAll('.polyline').data(data_ready, (d: any) => d.data.id); // Key function for data binding
    
    // Exit selection: Remove old polylines smoothly
        polylines.exit()
            .transition()
            .duration(500)
            .ease(d3.easeCubicIn)
            .style('opacity', 0)
            .remove();
    
    // Enter selection: Add new polylines
        const newPolylines = polylines.enter()
            .append('polyline')
            .attr('class', 'polyline')
            .attr('points', (d) => {
            const pos = arc.centroid(d); // Start from the center
            return [pos, pos, pos]; // Initial position
            })
            .style('fill', 'none')
            .style('stroke', (d) => this.colors(d.data.color))
            .style('stroke-width', 1)
        .style('opacity', 1); // Start invisible
    
    // Merge new and existing polylines and apply transitions
        newPolylines.merge(polylines)
            .transition()
            .style('stroke', (d) => this.colors(d.data.color))
            .duration(1000)
        .ease(d3.easeCubicOut) // Smooth transition
            .attr('points', (d) => {
                const posA = arc.centroid(d);
                const posB = outerArc.centroid(d);
            const posC = [...posB]; // Copy posB to avoid mutation
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = this.radius * 0.9 * (midangle < Math.PI ? 1 : -1);
                return [posA, posB, posC];
            })
            .style('opacity', d => this.showCorrectAnswer ? (d.isCorrect ? 0.3 : 1) : 1);
    }
    

    private animateCircles(data_ready: any, outerArc: any): void {
    const polylineEndCircles = this.svg.selectAll('.polyline-circle').data(data_ready);
        polylineEndCircles.exit().remove();
    
        polylineEndCircles.enter().append('circle')
            .attr('class', 'polyline-circle')
            .merge(polylineEndCircles)
            .transition()
            .duration(this.showCorrectAnswer ? 0 : 1000)
            .attr('cx', (d) => {
                const posC = outerArc.centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = this.radius * 0.9 * (midangle < Math.PI ? 1 : -1);
                return posC[0];
            })
            .attr('cy', (d) => {
                const posC = outerArc.centroid(d);
                return posC[1];
            })
            .attr('r', 8)
            .style('fill', (d) => this.colors(d.data.color))
      .style('opacity', d => {
        return 1;
      })
    }
    

    private animateLabels(data_ready: any, outerArc: any): void {
      var labels = this.svg.selectAll('.label').data(data_ready);
  
      labels.exit().remove(); // Remove extra labels
  
      var labelsEnter = labels.enter()
          .append('g')
          .attr('class', 'label');
  
      // Append text elements inside each label group
      labelsEnter.append('text')
          .attr('font-size', '13px')
          .attr('fill', this.slideTheme?.ThemeTextColor)
          .attr('x', 0)
          .attr('dy', '.35em');
  
      const labelsGroup = labelsEnter.merge(labels);
  
      labelsGroup.select('text')
          .style('opacity', 1)
          .text(d => d.data.name)
          .transition()
          .duration(1000)
          .attr('transform', (d) => {
              var pos = outerArc.centroid(d);
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
  
              // Create a temporary text element to measure width
              var tempText = this.svg.append('text')
                  .attr('font-size', '13px')
                  .text(d.data.name)
                  .attr('visibility', 'hidden');
  
              var textWidth = tempText.node().getBBox().width;
              tempText.remove();
  
              pos[0] = this.radius * 0.9 * (midangle < Math.PI ? 1 : -1);
              pos[0] += (pos[0] > 0 ? 30 : -30); // Adjust position to make room for the icon
              return `translate(${pos[0]},${pos[1]})`;
          })
          .style('text-anchor', d => {
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
              return midangle < Math.PI ? 'start' : 'end';
          })
          .call(d3Selection => this.wrap(d3Selection, 270));
  
      // Bind data to the answer icons inside labelsGroup with composite key
      const icons = labelsGroup.selectAll('.answer-icon').data(d => [d], (d: any) => `${d.data.id}-${d.data.isCorrect}`);
  
      // Enter phase for new icons
      const iconsEnter = icons.enter()
          .append('path')
          .attr('class', 'answer-icon')
          .attr('fill', d => d.data.isCorrect ? "#00DB91" : "#DB3734") // Green for correct, Red for incorrect
          .style('opacity', this.showCorrectAnswer ? 1 : 0)
          .attr('d', d => d.data.isCorrect
              ? "M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z"
              : "M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z");
  
      // Exit phase for old icons
      icons.exit().remove();
  
      // Merge enter and update selections
      iconsEnter.merge(icons)

          .attr('fill', d => d.data.isCorrect ? "#00DB91" : "#DB3734") // Update fill color
          .attr('d', d => d.data.isCorrect
              ? "M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z"
              : "M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z")
          .attr('transform', (d, i, nodes) => {
              var textNode = d3.select(nodes[i].previousSibling); // Get the associated text element
              var textWidth = textNode.node()?.getBBox().width || 0; // Measure text width (fallback to 0)
  
              var pos = outerArc.centroid(d);
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
              const factor = 1.25;
              pos[0] = this.radius * factor * (midangle < Math.PI ? 1 : -1);
              pos[0] += (midangle < Math.PI ? textWidth + 5 : -textWidth - 5); // Adjust icon position dynamically
              pos[1] -= 15; // Move the icon above the text
  
              return `translate(${pos[0]},${pos[1]}) scale(0.8)`;
          })
          .style('opacity', this.showCorrectAnswer ? 1 : 0);
  }



 
private animateValues(data_ready: any, arc: any): void {
  const sliceValues = this.svg.selectAll('.slice-value').data(data_ready);

  sliceValues.exit().remove();

  const newText = sliceValues.enter().append('text')
      .attr('class', 'slice-value')
      .text(d => {
          if (this.slideDetails?.design?.slideResponseAsPercentage) {
              return `${Math.round(d.data.percentage)}%`;
          } else {
              return d.data.value;
          }
      })
      .attr('font-size', '24px')
      .attr('fill', (d, i) => this._commanservice.getContrastColor(this.barData[i].color))
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('opacity', (d) => d.data.percentage < 7 ? 0 : 1);

  newText.merge(sliceValues)
      .attr('x', (d) => {
          const pos = arc.centroid(d);
          return pos[0];
      })
      .attr('y', (d) => {
          const pos = arc.centroid(d);
          return pos[1];
      })
      .text(d => {
        if (this.slideDetails?.design?.slideResponseAsPercentage) {
            return `${Math.round(d.data.percentage)}%`;
        } else {
            return d.data.value;
        }
    })
      .style('text-anchor', 'middle')
      .style('opacity', (d) => d.data.percentage < 7 ? 0 : 1);
}



  private adjustLabelPositions(selector: string): void {
    const labels = this.svg.selectAll(selector);
    const spacing = 2;
    labels.each(function() {
        const label = d3.select(this);
        const bbox = label.node().getBBox();
        let y = parseFloat(label.attr('y'));

        labels.each(function() {
            if (this !== label.node()) {
                const otherLabel = d3.select(this);
                const otherBBox = otherLabel.node().getBBox();
                if (bbox.x < otherBBox.x + otherBBox.width &&
                    bbox.x + bbox.width > otherBBox.x &&
                    bbox.y < otherBBox.y + otherBBox.height &&
                    bbox.y + bbox.height > otherBBox.y) {
                    y += spacing;
                    label.attr('y', y);
                }
            }
        });
    });
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
  
      
  //#region Without Value
  private defaultChart() {
    const radius = Math.min(this.width, this.height) / 2 ;
    const pie = d3
      .pie<any>()
      .sort(null)
      .value((d: any) => {
        return d.value == 0 ? 1 : d.value;
      });
    const data_ready = pie(this.filterData);
  
    const arc = d3
      .arc<any>()
      .innerRadius(this.radius * 0)
      .outerRadius(this.radius * 0.8);
  
    this.svg
      .selectAll('allSlices')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', this._commanservice.getContrastColor(this.slideTheme?.ThemeBackgroundColor))
      .style('opacity', 0.05);
  
    const legend = this.svg.selectAll('.legend')
      .data(data_ready)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d: any, i: any) => `translate(250, ${(i - (data_ready.length - 1) / 2) * 80})`);
    
    legend.append('circle')
      .attr('cx', -21)
      .attr('cy', -5)
      .attr('r', 8)
      .attr('fill', (d: any) => this.colors(d.data.id));
  
    const textElements = legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '0')
      .style('fill', this.slideTheme?.ThemeTextColor)
      .style('font-size', '14px')
      .text((d: any) => d.data.name)
      .call(this.wrap, 370);
  
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
  
      words.forEach(function (word) {
        // If the word is longer than the width, split it into smaller segments
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
          tspan = textElement.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
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
  
  private dynamicChartResponseLoad(){
    this.updateChart(this.barData);
  }
  updateChart(value:any){
    this.applyConditions(value);
    this.updateBar(value);
  }
  updateResult(value:any){
    this.formatedOptions = value;
    this.barData = value;
    this.applyConditions(value);
    this.updateBar(value);
  }
  updateLayout(value:any,layout:boolean){
    this.transformData(value);
  
}
  PresentageCalculation(options: any) {
    var optionTotalValue = 0;
    for (let option of options) {
      optionTotalValue = optionTotalValue + option?.value;
    }
    this.optionValueInPercentage = 100 / optionTotalValue;
  }
  updateTheme(data: any) {
    this.slideTheme = data;
    if (!this.slideDetails?.design.resetThemes) {
      const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

      this.barData.forEach((option, index) => {
        if (colors[index]) {
          option.color = colors[index];
        }
      });
    }
    this.transformData(this.barData);
  }
  private applyConditions(barChartData:any): void {
    this.barData = JSON.parse(JSON.stringify(barChartData));
  
    if (this.chooseCorrectAnswers && !this.presentationMode || this.multiplechoicepresenterEnterClick) {
      this.showCorrectAnswer = true;
    }else{
      this.showCorrectAnswer = false;
    }
  
   
  }
  updatePresentationTheme(data: any) {
    if (!this.slideDetails?.design?.slideResetTheme) {
      this.slideTheme = data;

      const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

      this.barData.forEach((option, index) => {
        if (colors[index]) {
          option.color = colors[index];
        }
      });

      this.transformData(this.barData);
    } else {
      this.transformData(this.barData);
    }
  }

  updateChartWithRandomData(): void {
    try {
      let changeData;
      if (this.isFirstUpdate) {
        changeData = this.barData.map(option => ({
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
          randomIndex = Math.floor(Math.random() * this.barData.length);
        } while (randomIndex === this.previousIndex);
        this.previousIndex = randomIndex;

        changeData = this.barData.map((option, index) => {
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
      this.barData = changeData;
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
      this.barData = this._workspaceservice.convertDataFormat(this.slideDetails?.slideContentData, 'Options');
      this.formatedOptions = this.barData;
      this.barData = this._workspaceservice.dynamicChartData(this.formatedOptions);
      this.isAnimation = false;
      this.updateChart(this.barData);
    }
  }
}
