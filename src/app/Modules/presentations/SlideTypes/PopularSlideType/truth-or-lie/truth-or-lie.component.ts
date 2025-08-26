import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';


@Component({
  selector: 'app-truth-or-lie',
  templateUrl: './truth-or-lie.component.html',
  styleUrls: ['./truth-or-lie.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TruthOrLieComponent implements OnInit {

  @Input() truthorLieData: any[] = [];
  @Input('truthOrLieEntered') public truthOrLieEntered: any;
  @Input('aboutTheSlides') public aboutTheSlideValue: any;
  @Input('questions') public questionsValue: any;
  @Input('longDescription') public longDescriptionValue: any;
  @Input('themesBackgroundcolor') public themesBackgroundcolor: any;
  @Input('presentation') public presentation: any;
  @Input('slideThemes') public slideThemes: any;
  @Input('screenOptions') public screenOptions: string;
  isShowLongerDescription = false;
  @Output() valueChange = new EventEmitter();
  firstrun: any = 0;
  private data: any[] = [];
  private margin = { top: 10, right: 30, bottom: 30, left: 40 };
  private width = 150;
  private height = 150;
  public svg: any;
  private colors: any;
  private radius = Math.min(this.width, this.height) / 2 - this.margin.left;
  contrastColorforTick: string;
  contrastColorforWrong: string;
  slideData = {
    "isShowResults":true,
    "slideThemes" : {
      "themesFonts": "Kanit,sans-serif",
      "linecolor": "#2a60c2",
      "themesBackgroundColor":"#2a60c2",
      "themesFontColor" : "#498dde",
      "themesChartColor": [
        {"height": 25, "color": "#498dde"},
        {"height": 40, "color": "#ff007e"},
        {"height": 80, "color": "#ff007e"},
        {"height": 40, "color": "#ff5d91"},
        {"height": 25, "color": "#7e6abf"}
      ]
    }
  };
  private staticColors: string[] = ["hsl(30.3,65%,55%)", "hsl(174.1,65%,55%)", "hsl(45.5,65%,55%)",      "hsl(261.1,65%,55%)",   "hsl(277.4,65%,55%)", "hsl(293.8,65%,55%)",  "hsl(315.6,65%,55%)",  "hsl(326.4,65%,55%)",  "hsl(50, 100%, 50%)",    "hsl(198.6,65%,55%)",  "hsl(236.6,65%,55%)",   "hsl(269.3,65%,55%)"];

  
  themesFontColor:any ;
  @Input() slideTheme:any;
  showCorrectAnswer: boolean = false;
  private existingData: any[] = [];
  constructor(   private _workspaceservice: WorkspaceService,private _commanservice:CommanService) {
    this.truthorLieData = this._workspaceservice.options;
    this.slideTheme = this._workspaceservice.presentationTheme;
    this.shuffleColors();
   }

  ngOnInit(): void {
    this.assignOptions();
    this.existingData = this.truthorLieData
  }
  ngOnChanges() {
    this.assignOptions();
  }
  assignOptions() {
 //  d3.selectAll("div#pie svg > *").remove();
   this.truthorLieData.forEach((value, index) => {
      this.data = [];
      if ((value.truthCount == 0 && value.falseCount == 0) || !this._workspaceservice.slideShowInResults) {
        this.data.push({ id: value.optionId, 'name': value.OptionTitle, 'value': 0, 'color': "#252B36", 'isCorrect': value.isCorrect,'index':index })
       // this.createSvg(index, this.truthorLieData.length - 1);
        //this.createColors(this.data);
        //this.defaultChart();
      } else if (value.truthCount > 0 || value.falseCount > 0) {
        if(this._workspaceservice.truthorliepresenterEnterClick || !this._workspaceservice.presentationMode){
          if (value.truthCount > 0) {
            this.data.push({ id: value.OptionId, 'name': value.OptionTitle, 'value': value.truthCount, 'color': 'rgb(0, 219, 145)', 'isCorrect': value.isCorrect,'index':index ,'currentpath':'truth'})
          }
          if (value.falseCount > 0) {
            this.data.push({ id: value.OptionId, 'name': value.OptionTitle, 'value': value.falseCount, 'color': 'rgb(219, 55, 52)', 'isCorrect': value.isCorrect,'index':index ,'currentpath':'false'})
          }
        }
        else{
          if (value.truthCount > 0) {
            this.data.push({ id: value.OptionId, 'name': value.OptionTitle, 'value': value.truthCount, 'color': this.getDynamicColor(index,'truth'), 'isCorrect': value.isCorrect,'index':index ,'currentpath':'truth'})
          }
          if (value.falseCount > 0) {
            this.data.push({ id: value.OptionId, 'name': value.OptionTitle, 'value': value.falseCount, 'color':  this.getDynamicColor(index,'false'), 'isCorrect': value.isCorrect ,'index':index,'currentpath':'false'})
          }
        }

this.createSvg(index, this.truthorLieData.length - 1);
        this.createColors(this.data);
        this.drawChart();
      }
    });
  }
  private createSvg(index: any, Count: any): void {
    this.svg = d3
      .selectAll("div#pie")
      .select("svg")
      .attr("width", "100%")
      .attr(
        "viewBox",
        Count === 3
          ? `0 75 ${Count * 120 + 140} ${(this.height - 80) * 2}`
          : Count === 4
          ? `0 60 ${Count * 110 + 160} ${(this.height - 65) * 2}`
          : Count > 0
          ? `0 60 ${Count * 130 + 170} ${(this.height - 80) * 2}`
          : `0 60 200 ${(this.height - 80) * 2}`
      )
      .append("g")
      .attr("class", "pie-group-" + index)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr(
        "transform",
        "translate(" + (index + 1) * 100 + "," + (this.height - 50) + ")"
      );
  }
  

  private createColors(data): void {
    this.colors = d3
      .scaleOrdinal()
      .domain(data.map(d => d.value.toString()))
      .range(data.map(d => d.color.toString()))
  }
  private drawChart(): void {
    this.showCorrectAnswer = !this._workspaceservice.presentationMode || this._workspaceservice.truthorliepresenterEnterClick;

    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value);

    const data_ready = pie(this.data.map((d, i) => ({ ...d, index: i })));

    const arc = d3.arc()
      .innerRadius(this.radius * 0.5)
      .outerRadius(this.radius * 1.0);

    const outerArc = d3.arc()
      .innerRadius(this.radius * 1.0)
      .outerRadius(this.radius * 0.4);

      let currentIndex = 0;
      if (this.data.length > 0) {
          const firstDataId = this.data[0].id;
          currentIndex = this.truthorLieData.findIndex(option => option.OptionId === firstDataId);
      }

    this.updatePaths(data_ready, arc,currentIndex);
    this.updateText(data_ready,currentIndex);
    this.updateCorrectAnswerIndicator(data_ready,currentIndex);

   this.data = [];

  }
  private updatePaths(data_ready: any, arc: any, index: any): void {
    const group = d3.select(`.pie-group-${index}`);
    const paths = group.selectAll("path")
        .data(data_ready, (d: any) => `${d.data.currentpath}-${d.data.id}`);

    // Remove old paths
    paths.exit()
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

    // Update existing paths
    paths
      .transition()
      .duration(2000)
      .attr("fill", (d: { data: { color: string } }) => this.colors(d.data.color))
      .attrTween("d", function(d: { startAngle: number, endAngle: number }) {
        const previous = (this as any).__previous || d;
        const interpolate = d3.interpolateObject(previous, d);
        (this as any).__previous = interpolate(1); 

        return function(t) {
          const interpolatedData = interpolate(t);
          const padding = 0.015; 
          interpolatedData.startAngle += padding;
          interpolatedData.endAngle -= padding;
          return arc(interpolatedData);
        };
      });

    // Enter selection (new paths)
    paths.enter()
      .append("path")
      .attr("fill", (d: { data: { color: string } }) => this.colors(d.data.color))
      .attr("class", (d: { data: { currentpath: string, id: string } }) => `${d.data.currentpath}-${d.data.id}`)
      .transition()
      .duration(1000)
      .attrTween("d", function(d: { startAngle: number, endAngle: number }) {
        const previous = (this as any).__previous || d;
        const interpolate = d3.interpolateObject(previous, d);
        (this as any).__previous = interpolate(1); 

        return function(t) {
          const interpolatedData = interpolate(t);
          const padding = 0.015; 
          interpolatedData.startAngle += padding;
          interpolatedData.endAngle -= padding;
          return arc(interpolatedData);
        };
      });


        this.updateLabels(data_ready, arc, index);
}

private updateLabels(data_ready: any, outerArc: any, index: any): void {

  const group = d3.select(`.pie-group-${index}`);
  const labels = group.selectAll("text")
    .data(data_ready, (d: any) => {
      return d?.data ? `${d.data.currentpath}-${d.data.id}` : "invalid";
    });

  labels.exit()
    .transition()
    .duration(500)
    .style("opacity", 0)
    .remove();

  labels
    .transition()
    .duration(2000)
    .attr("fill", this.calculateContrastColor(this.slideTheme?.ThemeVisualizationColor[0].color))
    .attr("class", (d: any) => `${d.data.currentpath}-${d.data.id}`)
    .text((d: { data: { value: any } }) => d.data.value)
    .attr("transform", (d: any) => {
      var pos = outerArc.centroid(d);
      return `translate(${pos[0] - 3}, ${pos[1]})`;
    });

  labels.enter()
    .append("text")
    .attr("class", (d: { data: { currentpath: string, id: string } }) => `${d.data.currentpath}-${d.data.id}`)
    .attr("style", "font-family:Ubuntu")
    .attr("font-size", "10")
    .attr("fill", this.calculateContrastColor(this.slideTheme?.ThemeVisualizationColor[0].color))
    .style("opacity", 1)
    .text((d: { data: { value: any } }) => d.data.value)
    .attr("transform", (d: any) => {
      var pos = outerArc.centroid(d);
      return `translate(${pos[0] - 3}, ${pos[1]})`;
    })
    .transition()
    .duration(500)
    .style("opacity", 1);
}




  
private updateText(data_ready: any, index: any): void {
  const commonFontSize = this.getCommonFontSizeFromTruthorLieData();
  const group = d3.select(`.pie-group-${index}`);
  const textPlace = group.selectAll("foreignObject")
      .data(data_ready);
      
  textPlace.exit()
    .transition()
    .duration(500)
    .style("opacity", 0)
    .remove();
    
  const enterText = textPlace.enter()
    .append("foreignObject")
    .attr('x', -38)
    .attr('y', 40)
    .attr('width', 80)
    .attr('height', 100)
    .style("opacity", 0);
    
  enterText.append('xhtml:div')
    .style('width', '100%')
    .style('height', '100%')
    .style('overflow-wrap', 'break-word')
    .style('word-wrap', 'break-word')
    .style('text-align', 'center')
    .style('font-weight', '400')
    .style('font-size', commonFontSize)
    .style("color", this.slideTheme.ThemeTextColor)
    .text((d: any) => d.data.name);
    
  enterText.transition()
    .duration(500)
    .style("opacity", 1);
    
  textPlace.select("div")
    .transition()
    .duration(500)
    .text((d: any) => d.data.name)
    .style("color", this.slideTheme.ThemeTextColor)
    .style("font-size", commonFontSize);
}

  
private updateCorrectAnswerIndicator(data_ready: any, updatedIndex: number): void {
  const correct = this.data[0]?.isCorrect;
  let color = this.slideTheme.ThemeBackgroundColor;
  let text = "?";

  if (this.showCorrectAnswer) {
      if (correct) {
          color = 'rgb(0, 219, 145)';
          text = "✔";
      } else {
          color = 'rgb(219, 55, 52)';
          text = "✘";
      }
  }

  const group = d3.select(`.pie-group-${updatedIndex}`);

  let circle = group.selectAll(".answer-indicator").data([text]);

  circle.exit()
      .transition()
      .duration(500)
      .style("opacity", 0)
      .remove();

  let enterCircle = circle.enter()
      .append("circle")
      .attr("class", "answer-indicator")
      .attr("cy", "0em")
      .attr("cx", "0em")
      .attr("r", "0")
      .attr("fill", color)
      .style("opacity", 0); 

  circle.merge(enterCircle) 
      .transition()
      .duration(500)
      .attr("r", 14)
      .attr("fill", color)
      .style("opacity", 1);

  let answerText = group.selectAll(".answer-text").data([text]);

  answerText.exit()
      .transition()
      .duration(500)
      .style("opacity", 0)
      .remove();

  let enterText = answerText.enter()
      .append("text")
      .attr("class", "answer-text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .attr("style", "font-family: Ubuntu")
      .attr("font-size", "7")
      .attr("fill", this.calculateContrastColor(color))
      .text(text)
      .style("opacity", 0);

  answerText.merge(enterText) 
      .transition()
      .duration(500)
      .text(text)
      .attr("fill", this.calculateContrastColor(color))
      .style("opacity", 1);
}


  
private defaultChart(): void {
  if ( !this._workspaceservice.presentationMode || this._workspaceservice.truthorliepresenterEnterClick) {
    this.showCorrectAnswer = true;
  }else{
    this.showCorrectAnswer = false;
  }
  const commonFontSize = this.getCommonFontSizeFromTruthorLieData();
  var pie = d3.pie()
    .sort(null) 
    .value((d: any) => {
      return d.value == 0 ? 1 : d.value;
    });
  var data_ready = pie(this.data);

  var arc = d3.arc()
    .innerRadius(this.radius * 0.5) 
    .outerRadius(this.radius * 1.0);

  var outerArc = d3.arc()
    .innerRadius(this.radius * 1.0)
    .outerRadius(this.radius * 0.4);
  this.svg
    .selectAll("allSlices")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr('fill', this._commanservice.getContrastColor(this.slideTheme?.ThemeBackgroundColor))
    .style('opacity', 0.05)
 

  this.svg.selectAll("allLabels").remove();

  const textPlace = this.svg
    .selectAll("allLabels")
    .data(this.data)
    .enter()
    .append("foreignObject")
    .attr("font-size", "7")
    .attr('x', -38)
    .attr('y', 40)
    .attr('width', 80)
    .attr('height', 100);

  const div = textPlace.append('xhtml:div')
    .style('width', '100%')
    .style('height', '100%')
    .style('overflow-wrap', 'break-word') 
    .style('word-wrap', 'break-word')  
    .style('text-align', 'center')  
    .style('font-weight', '400')
    .style("font-size", commonFontSize)
    .text(d => {
      return d.name;
    });

  if (this.showCorrectAnswer) {
    if (this.data[0]?.isCorrect) {
      this.svg.append("svg:circle")
        .attr("cy", "0em")
        .attr("cx", "0em")
        .attr("r", "14")
        .attr("text-anchor", "middle")
        .attr("fill", 'rgb(0, 219, 145)')
        .transition()
        .duration(500)
        .attr("r", 14)

      this.svg.append("svg:text")
        .attr("dy", ".3em")
        .attr("text-anchor", "middle")
        .attr("style", "font-family:Ubuntu")
        .attr("font-size", "7")
        .attr("fill", this.calculateContrastColor(this.slideTheme?.ThemeVisualizationColor[0].color))
        .text("✔");
    } else {
      this.svg.append("svg:circle")
        .attr("cy", "0em")
        .attr("cx", "0em")
        .attr("r", "14")
        .attr("text-anchor", "middle")
        .attr("fill", 'rgb(219, 55, 52)')
        .transition()
        .duration(500)
        .attr("r", 14); 

      this.svg.append("svg:text")
        .attr("dy", ".3em")
        .attr("text-anchor", "middle")
        .attr("style", "font-family:Ubuntu")
        .attr("font-size", "7")
        .attr("fill", this.calculateContrastColor('rgb(219, 55, 52)'))
        .text("✘");
    }
  } else if (!this.showCorrectAnswer) {
    this.svg.append("svg:circle")
      .attr("cy", "0em")
      .attr("cx", "0em")
      .attr("r", "14")
      .attr("text-anchor", "middle")
      .attr("fill",this.slideTheme.ThemeBackgroundColor)
      .transition()
      .duration(500)
      .attr("r", 14); 

    this.svg.append("svg:text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .attr("style", "font-family:Ubuntu")
      .attr("font-size", "7")
      .attr("fill", this.slideTheme.ThemeTextColor)
      .text("?");
  }
  this.data =[];
}

private getCommonFontSizeFromTruthorLieData(): string {
  if (this.truthorLieData.length <= 2) {
    return this.truthorLieData.some(d => d.OptionTitle.length >= 50) ? '4px' :
           this.truthorLieData.some(d => d.OptionTitle.length >= 101) ? '4px' :
           '10px';
  }
  
  else if (this.truthorLieData.length <= 3) {
    return this.truthorLieData.some(d => d.OptionTitle.length >= 50) ? '4px' :
           this.truthorLieData.some(d => d.OptionTitle.length >= 101) ? '4px' :
           '10px';
  }

  if (this.truthorLieData.some(d => d.OptionTitle.length >= 101)) {
    return '6px';
  } else if (this.truthorLieData.some(d => d.OptionTitle.length >= 30 && d.OptionTitle.length <= 50)) {
    return '8px';
  } else if (this.truthorLieData.some(d => d.OptionTitle.length >= 50 && d.OptionTitle.length <= 100)) {
    return '6px';
  }

  return '10px';
}

  wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        tspan = text.text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
  calculateContrastColor(colorCode: any): any {
    if (colorCode.includes('#')) {
      var hex = colorCode.replace(/^#/, '');
      // Parse the hex values
      const bigint = parseInt(hex, 16);
      // Extract RGB components
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      var rgbColor = `rgb(${r}, ${g}, ${b})`;
      const rgb = rgbColor.substring(4, rgbColor.length - 1)
        .replace(/ /g, '')
        .split(',');

      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

      return this.contrastColorforTick = brightness >= 128 ? 'black' : 'white';
    }
    else {
      const rgb = colorCode.substring(4, colorCode.length - 1)
        .replace(/ /g, '')
        .split(',');

      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

      return this.contrastColorforTick = brightness >= 128 ? 'black' : 'white';
    }
  }
  calculateContrastColorWrong(colorCode: any): any {
    if (colorCode.includes('#')) {
      var hex = colorCode.replace(/^#/, '');
      // Parse the hex values
      const bigint = parseInt(hex, 16);
      // Extract RGB components
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      var rgbColor = `rgb(${r}, ${g}, ${b})`;
      const rgb = rgbColor.substring(4, rgbColor.length - 1)
        .replace(/ /g, '')
        .split(',');

      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

      return this.contrastColorforWrong = brightness >= 128 ? 'black' : 'white';
    }
    else {
      const rgb = colorCode.substring(4, colorCode.length - 1)
        .replace(/ /g, '')
        .split(',');

      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;

      return this.contrastColorforWrong = brightness >= 128 ? 'black' : 'white';
    }

  }
  showLongerDescription(){
    if(this.screenOptions == 'presentationScreen')
    {
      this.isShowLongerDescription = true;
    }
  }
  hideLongerDescription(){
    if(this.screenOptions == 'presentationScreen')
    {
      this.isShowLongerDescription = false;
    }
  }
  private dynamicChartResponseLoad(){
    this.updateChart( this.truthorLieData);
  }
  updateChart(value: any) {
    this.truthorLieData = this._workspaceservice.options;
    const missingIndexes: number[] = [];

    this.existingData.forEach((item, index) => {
      const found = this.truthorLieData.some(data => data.OptionId === item.OptionId);
      if (!found) {
        missingIndexes.push(index);
      }
    });
    if(missingIndexes.length === 1){
      d3.selectAll("g").remove();
    }
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);
  
    this.data = [];

    this.truthorLieData.forEach((option, index) => {
      option.visualizationColor = colors[index % 2];

      if ((option.truthCount === 0 && option.falseCount === 0) || !this._workspaceservice.slideShowInResults) {
        this.data.push({ 
          id: option.OptionId, 
          name: option.OptionTitle, 
          value: 0, 
          color: "#252B36", 
          isCorrect: option.isCorrect,
          index: index 
        });
        
        d3.select(`.pie-group-${index}`).remove();
        this.createSvg(index, this.truthorLieData.length - 1);
        
        this.createColors(this.data);
        this.defaultChart();
      } else {
        if (this._workspaceservice.truthorliepresenterEnterClick || !this._workspaceservice.presentationMode) {
          if (option.truthCount > 0) {
            this.data.push({
              id: option.OptionId, 
              name: option.OptionTitle, 
              value: option.truthCount,
              color: 'rgb(0, 219, 145)', 
              isCorrect: option.isCorrect, 
              index: index, 
              truthCount: option.truthCount, 
              currentpath: 'truth'
            });
          }
          if (option.falseCount > 0) {
            this.data.push({
              id: option.OptionId, 
              name: option.OptionTitle, 
              value: option.falseCount,
              color: 'rgb(219, 55, 52)', 
              isCorrect: option.isCorrect, 
              index: index, 
              falseCount: option.falseCount, 
              currentpath: 'false'
            });
          }
        } else {
          if (option.truthCount > 0) {
            this.data.push({
              id: option.OptionId, 
              name: option.OptionTitle, 
              value: option.truthCount,
              color: this.getDynamicColor(index, 'truth'), 
              isCorrect: option.isCorrect, 
              index: index, 
              truthCount: option.truthCount, 
              currentpath: 'truth'
            });
          }
          if (option.falseCount > 0) {
            this.data.push({
              id: option.OptionId, 
              name: option.OptionTitle, 
              value: option.falseCount,
              color: this.getDynamicColor(index, 'false'), 
              isCorrect: option.isCorrect, 
              index: index, 
              falseCount: option.falseCount, 
              currentpath: 'false'
            });
          }
        }
        this.createColors(this.data);
        this.drawChart();
      }
    });
    this.existingData = this.truthorLieData
}
private shuffleColors(): void {
  for (let i = this.staticColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this.staticColors[i], this.staticColors[j]] = [this.staticColors[j], this.staticColors[i]];
  }
}

// Returns a dynamic color based on the provided index and current path.
public getDynamicColor(index: number, currentpath: string): string {
  const adjustedIndex = currentpath === 'truth' ? index + 1 : index + 101;
  return this.staticColors[adjustedIndex % this.staticColors.length];
}


  
  
  updateTheme(data:any){
    this.slideTheme = data;
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.truthorLieData.forEach((option, index) => {
      if (option.isCorrect) {
        option.visualizationColor = colors[0]; 
      } else {
        option.visualizationColor = colors[1];
      }
    });
    this.updateChart( this.truthorLieData);
  }
}