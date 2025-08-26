import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { settingVariables } from 'src/app/utility/SettingVariables';

interface DataPoint {
  date: string;
  value: number;
}

@Component({
  selector: 'app-guess-the-number',
  templateUrl: './guess-the-number.component.html',
  styleUrls: ['./guess-the-number.component.scss']
})
export class GuessTheNumberComponent implements OnInit {
   @Input() guesstheNumberData: any;
   @Input() slideTheme:any;
  screenOptions = 'presentationScreen';
  isShowLongerDescription = false;
  slidData = {
    "isShowResults":true,
    "slideThemes" : {
      "ThemeLineColor": "#252b36",
      "ThemeBackgroundColor":"#000",
      "ThemeTextColor" : "#000",
      "ThemeVisualizationColor": [
        {"height": 25, "color": "#498dde"},
        {"height": 40, "color": "#ffcc00"},
        {"height": 80, "color": "#ff007e"},
        {"height": 40, "color": "#ff5d91"},
        {"height": 25, "color": "#7e6abf"}
      ]
    }
  };
  private margin = { top: 30, right: 20, bottom: 30, left: 20 };
  private width: number;
  private height: number;

  private x: any;
  private y: any;
  private svg: any;

  guessTheNumberDetails: any[] = [];
  guessTheNumberResults: any[] = [];
  maxValue: any;
  guesstheanswerStatusMsg: string = "show";
  showCorrectAnswer: boolean = false;
  modifiedResults: any[] = [];
  contrastColor: any;
  isHover: boolean = false;
  isShowResults: boolean = true;
  percentageStart: number;
  percentageEnd: number;
  gradientData: { offset: string; color: any; }[];
  gradientStaticData: { offset: string; color: any; }[];
  ErrorMarginStart: any = 0;
  ErrorMarginEnd: any = 0;
  contrast:any;
  ResultLength: any= false;
  currentRouter: string;
  settingVariable = settingVariables;
  CorrectAnswers: number;
  errorMarginValue: number;
  StartAnswer: number;
  EndAnswer: number;
  errorMarginMaxValue: number;
  nextSequenceValue: number;
  startValueForGuess: number;
  addValue: number;
  subValue: number;
  endValueForGuess: number;
  scaleErrorForGuess: boolean = false;
  presentationMode: boolean ;
  correctAnsweColor:any;
  chartColor:any;
  existingIndex: boolean = false;
    constructor(
    private _commanService: CommanService,
    private _activateRouter: ActivatedRoute,
    private _workspaceservice: WorkspaceService,
  ) { 
    const currentRoute = this._activateRouter.snapshot.url;
    this.currentRouter = currentRoute.slice(0, 1).map(segment => segment.path)[0];
    this.guesstheNumberData = this._workspaceservice.dynamicGuesstheNumberData(this._workspaceservice.guesstheNumberoptions)
    this.slideTheme = this._workspaceservice.presentationTheme;
    this.presentationMode = this._workspaceservice.presentationMode;
  }

  ngOnInit() {
    if ( !this._workspaceservice.presentationMode || this._workspaceservice.guessthenumberpresenterEnterClick) {
      this.showCorrectAnswer = true;
    }else{
      this.showCorrectAnswer = false;
    }
    this.contrastColor = this._commanService.getContrastColor(this.slideTheme?.ThemeLineColor);
    this.correctAnswerArrayCreate();
    this.presentationMode = this._workspaceservice.presentationMode;
       if (this.guesstheNumberData?.IsErrorMargin) {
      this.ErrorMarginStart = (this.guesstheNumberData?.CorrectAnswer + this.guesstheNumberData?.ErrorMarginNumber);
      this.ErrorMarginEnd = (this.guesstheNumberData?.CorrectAnswer - this.guesstheNumberData?.ErrorMarginNumber);
    }
    this.createChart(this.guesstheNumberData);

  }
  ngOnChanges() {
    if (this.guesstheNumberData?.IsErrorMargin) {
      this.ErrorMarginStart = (this.guesstheNumberData?.CorrectAnswer + this.guesstheNumberData?.ErrorMarginNumber);
      this.ErrorMarginEnd = (this.guesstheNumberData?.CorrectAnswer - this.guesstheNumberData?.ErrorMarginNumber);
    }
  }

  correctAnswerArrayCreate() {
    this.correctAnsweColor="#00D941";
    this.chartColor = "#26A4F2";
    this.gradientStaticData = [
      { offset: '10%', color:this.chartColor },
      { offset: '100%', color:this.chartColor },
    ]
    this.guessTheNumberDetails = [];
    this.guessTheNumberResults  = [];
    if (!this._workspaceservice.slideShowInResults) {
      this.guessTheNumberResults = this._workspaceservice.guessTheNumberResults?.Score?.map(item => ({
        ...item,
        y: 0
    })) || [];
    }else{
      this.guessTheNumberResults = [...this._workspaceservice.guessTheNumberResults?.Score];
    }
    var originalLeght = this.guessTheNumberResults?.length;
    this.guessTheNumberResults.splice(0, 0, { x: 0, y: 0 });
    this.guessTheNumberResults.splice(originalLeght + 1, 0, { x: this.guessTheNumberResults[originalLeght]?.x, y: 0 });
    this.modifiedResults = this.guessTheNumberResults;
    this.maxValue = Math.max(...this.modifiedResults.map(o => o.x));
    this.guessTheNumberDetails.push(this.modifiedResults.find((res: any) => res?.x == (this._workspaceservice.guesstheNumberoptions?.CorrectAnswer - this._workspaceservice.guesstheNumberoptions?.Start) / this._workspaceservice.guesstheNumberoptions.ScaleIncrement));
    var parcentTageCalculation = [];
    this.guessTheNumberResults.forEach((element: any, index: any) => {
      if (index != 0 && index != this.guessTheNumberResults[this.guessTheNumberResults?.length - 1]) {
        var percentage = (element?.x / this.maxValue) * 100;
        parcentTageCalculation.push(percentage + '%');
      }
    });
    if (!this._workspaceservice.guesstheNumberoptions?.IsErrorMargin) {
      this.percentageEnd = ((this._workspaceservice.guesstheNumberoptions?.CorrectAnswer - this._workspaceservice.guesstheNumberoptions?.Start) / (this._workspaceservice.guesstheNumberoptions?.End - this._workspaceservice.guesstheNumberoptions?.Start)) * 100;
      this.percentageStart = this.percentageEnd - 4;
          var obj = [{ offset: (this.percentageStart) + "%", color:  this.chartColor },
      { offset: (this.percentageStart) + "%", color: this.correctAnsweColor },
      { offset: (this.percentageEnd + 1) + "%", color: this.correctAnsweColor },
      { offset: (this.percentageEnd + 1) + "%", color:  this.chartColor },]
      this.gradientData = obj;
    }
    else {
      this.percentageStart = (((this._workspaceservice.guesstheNumberoptions?.CorrectAnswer - this._workspaceservice.guesstheNumberoptions?.ErrorMarginNumber) - this._workspaceservice.guesstheNumberoptions?.Start) / (this._workspaceservice.guesstheNumberoptions.End - this._workspaceservice.guesstheNumberoptions?.Start)) * 100;
      this.percentageEnd = (((this._workspaceservice.guesstheNumberoptions?.CorrectAnswer + this._workspaceservice.guesstheNumberoptions.ErrorMarginNumber) - this._workspaceservice.guesstheNumberoptions?.Start) / (this._workspaceservice.guesstheNumberoptions?.End - this._workspaceservice.guesstheNumberoptions?.Start)) * 100;
           var obj = [{ offset: (this.percentageStart) + "%", color:  this.chartColor },
      { offset: (this.percentageStart) + "%", color: this.correctAnsweColor },
      { offset: (this.percentageEnd + 1) + "%", color: this.correctAnsweColor },
      { offset: (this.percentageEnd + 1) + "%", color:  this.chartColor },]
      this.gradientData = obj;
    }

  }
  private createChart(value:any):void{
    this.createSvg();
    this.guessTheNumberChartValues(value);
  }
  private createSvg(): void {

    d3.select('div#guess-the-number-chart').select("svg").remove();
    this.width = 440 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;
    this.x = d3.scaleLinear().range([20, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.svg = d3.select("div#guess-the-number-chart")
   
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 750 350')
        .append('g')
        .attr('transform', 'translate(' + 150 + ',' + 40 + ')');
  }



  private guessTheNumberChartValues(value: any): void {
    this.setCorrectAnswerVisibility();
    this.updateGradientData();
    if (value.IsErrorMargin) {
      this.setErrorMargin(value);
    }
    this.setupScales();   
    this.renderAxesAndLabels(value);
    this.renderDataLine();
        

    const circleGroup = this.renderDataPoints(value);
    this.renderCorrectAnswerMarkers(value);
      this.renderGradient();
    
  }
  
  private setCorrectAnswerVisibility(): void {
    if (!this._workspaceservice.presentationMode || this._workspaceservice.guessthenumberpresenterEnterClick) {
      this.showCorrectAnswer = true;
    } else {
      this.showCorrectAnswer = false;
    }
  }

  private updateGradientData(): void {
    if (this.showCorrectAnswer) {
      const staticDataForGradient = this.gradientStaticData;
      staticDataForGradient.splice(1, 0, ...this.gradientData);
      this.gradientStaticData = [];
      this.gradientStaticData = staticDataForGradient;
    } else {
      this.gradientStaticData.splice(1, this.gradientStaticData?.length - 2);
    }
  }
  
  private setErrorMargin(value: any): void {
    this.ErrorMarginStart = value.CorrectAnswer + value.ErrorMarginNumber;
    this.ErrorMarginEnd = value.CorrectAnswer - value.ErrorMarginNumber;
  }
  

  private setupScales(): void {
    this.x = d3.scaleLinear().range([20, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.x.domain(d3.extent(this.modifiedResults, (d: any) => d.x));
    this.y.domain([0, d3.max(this.modifiedResults, (d: any) => d.y)]);
  }
  
  private renderAxesAndLabels(data: any): void {
    const xAxis = this.svg?.selectAll('.x.axis')
      .data([null]); 
  
    xAxis.enter()
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x).tickFormat(() => '').tickSize(0))
      .attr('stroke-width', '2')
      .attr('opacity', 0) 
      .transition().duration(500)
      .attr('opacity', 1); 
  
    const labelGroup = this.svg?.selectAll('.axis-labels')
    .data([null]);
  
  const newLabelGroup = labelGroup.enter()
    .append('g')
    .attr('class', 'axis-labels')
    .attr('opacity', 1); 
  
  const mergedLabels = labelGroup.merge(newLabelGroup);

  const startLabel = mergedLabels.selectAll('.start-label')
    .data([data.Start]);
  
  startLabel.enter()
    .append('text')
    .attr('class', 'start-label')
    .attr('x', 0)
    .attr('y', this.height + 5)
    .attr('text-anchor', 'end')
    .style('fill', this.slideTheme?.ThemeTextColor)
    .merge(startLabel)
    .text(d => Math.round(d)) 
    .transition().duration(500)
    .attr('opacity', 1); 
  
  const endLabel = mergedLabels.selectAll('.end-label')
    .data([data.End]);
  
  endLabel.enter()
    .append('text')
    .attr('class', 'end-label')
    .attr('x', this.width + 20)
    .attr('y', this.height + 5)
    .attr('text-anchor', 'start')
    .style('fill', this.slideTheme?.ThemeTextColor)
    .merge(endLabel) 
    .text(d => Math.round(d)) 
    .transition().duration(500)
    .attr('opacity', 1);
  
  
    d3.select('.domain')
      .transition().duration(500)
      .attr('stroke', this.slideTheme?.ThemeLineColor);
  
    const yAxis = this.svg?.selectAll('.y.axis')
      .data([null]);
  
    yAxis.enter()
      .append('g')
      .attr('class', 'y axis')
      .attr('opacity', '0')
      .call(d3.axisLeft(this.y).ticks(5))
      .transition().duration(500)
      .attr('opacity', '0'); 
  }
  
  private renderDataLine(): void {
     // **Count how many times y === 1 appears**
     const oneCount = this.modifiedResults.filter(d => d.y === 1).length;
     // **Condition: Apply transition only if there is exactly one `y === 1`**
     let oneTimeExists = false;
     const applyTransition = oneCount === 1;
     if(this.existingIndex){
      oneTimeExists= false;
     }
     if(this.modifiedResults[1]?.y && !this.existingIndex){
        oneTimeExists=this.modifiedResults[1]?.y === 1;
        this.existingIndex = true;
     }

    const valueline = d3.line()
      .x((d: any) => this.x(d.x))
      .y((d: any) => this.y(d.y))
      .curve(d3.curveMonotoneX);

    const baseline = d3.line()
      .x((d: any) => this.x(d.x))
      .y(() => this.y.range()[0]) // Start from bottom
      .curve(d3.curveMonotoneX);

    const path = this.svg?.selectAll('.area')
      .data([this.modifiedResults]); 
    // **Enter Selection: Create New Paths**
    const newPath = path.enter()
      .append('path')
      .attr('class', 'area')
      .attr('fill', 'url(#graph-gradient)')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 3)
      .attr('opacity', 1)
      .attr('d', baseline) // Start from bottom
      .attr('d', valueline);

   
    // **Update Selection: Apply Animation Only If There is Exactly One `y === 1`**
    if (!applyTransition && !oneTimeExists) {
        path.transition()
            .duration(2000)
            .ease(d3.easeElasticOut.amplitude(1).period(0.6))
            .attr('d', valueline);
            
    } else {
      path.attr('d', valueline).transition()
      .duration(600)
      .ease(d3.easeLinear);
    
 // Direct update, no animation
    }

    // **Exit Selection: Remove Unneeded Paths**
    path.exit()
    .transition()
    .duration(500)
    .attr('opacity', 0)
    .remove();
    
}

  
  
  
  private renderDataPoints(value: any): void {
    const validData = this.modifiedResults.filter((d: any) => d.y > 0);
  
    const circleGroup = this.svg?.selectAll('.data-point-group')
      .data(validData, (d: any) => d.x); 
  
    const newCircleGroup = circleGroup.enter()
      .append('g')
      .attr('class', 'data-point-group')
      .attr('opacity', 1 );
  
    newCircleGroup.append('circle')
      .merge(circleGroup.select('circle'))
      .transition().duration(2000)
      .ease(d3.easeElasticOut.amplitude(1).period(0.5)) // Bounce effect
      .attr('cx', (d: any) => this.x(d.x))
      .attr('cy', (d: any) => this.y(d.y))
      .attr('opacity', this.showCorrectAnswer ? 1 : 0)
      .attr('r', 10)
      .attr('fill', (d: any) => {
        if (this.showCorrectAnswer) {
          if (value.IsErrorMargin) {
            return (d.selectedValue <= this.ErrorMarginStart && d.selectedValue >= this.ErrorMarginEnd)
              ? this.correctAnsweColor
              :  this.chartColor;
          } else {
            return (value.CorrectAnswer === d.selectedValue)
              ? this.correctAnsweColor
              :  this.chartColor;
          }
        }
        return  this.chartColor;
      });
  
    newCircleGroup.append('text')
      .merge(circleGroup.select('text'))
      .transition().duration(2000)
      .ease(d3.easeElasticOut.amplitude(1).period(0.5)) // Bounce effect
      .attr('x', (d: any) => this.x(d.x) - 2)
      .attr('y', (d: any) => this.y(d.y) + 3)
      .attr('opacity', this.showCorrectAnswer ? 1 : 0)
      .attr('font-size', '10')
      .attr('fill', '#ffffff')
      .text((d: any) => d.y);
  
    circleGroup.exit().transition().duration(500).attr('opacity', 0).remove();
  
    return newCircleGroup;
  }
  
  
  private renderCorrectAnswerMarkers(data: any): void {
    const correctAnswers = this.svg?.selectAll('.crt-answer-group')
        .data(this.guessTheNumberDetails, (d: any) => d.id); 

    const crtAnswer = correctAnswers.enter()
        .append('g')
        .attr('class', 'crt-answer-group')
        .attr('opacity', 0);
    const mergedAnswers = crtAnswer.merge(correctAnswers);

    const correctAnswerLength = data.CorrectAnswer.toString().length;
    const fontSize = correctAnswerLength <= 2 ? '14' : correctAnswerLength <= 4 ? '12' : '10';
    const rectWidth = correctAnswerLength <= 2 ? '45' : correctAnswerLength <= 4 ? '55' : '65';
    const textYPosition = correctAnswerLength <= 2 ? '245' : '243';
    mergedAnswers.selectAll('.crt-answer-rect')
        .data(d => [d])
        .join(
            enter => enter.append('rect')
                .attr('class', 'crt-answer-rect')
                .attr('x', d => this.x(d.x) - 20)
                .attr('y', 230)
                .attr('height', '20')
                .attr('width', rectWidth)
                .attr('rx', 10)
                .attr('fill', this.slideTheme?.ThemeLineColor)
                .attr('opacity', 0)
                .call(enter => enter.transition().duration(1000).attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)),
            update => update.transition().duration(500)
                .attr('x', d => this.x(d.x) - 20)
                .attr('width', rectWidth)
                .attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)
        );

    mergedAnswers.selectAll('.crt-checkmark')
        .data(d => [d])
        .join(
            enter => enter.append('text')
                .attr('class', 'crt-checkmark')
                .attr('x', d => this.x(d.x) - 12)
                .attr('y', textYPosition)
                .attr('fill', '#fff')
                .attr('font-size', fontSize)
                .attr('opacity', 0)
                .text('✔')
                .style('fill', this.contrastColor)
                .call(enter => enter.transition().duration(1000).attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)),
            update => update.transition().duration(500)
                .attr('x', d => this.x(d.x) - 12)
                .attr('font-size', fontSize)
                .attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)
        );

    mergedAnswers.selectAll('.crt-answer-text')
        .data(d => [d])
        .join(
            enter => enter.append('text')
                .attr('class', 'crt-answer-text')
                .attr('x', d => this.x(d.x) + (correctAnswerLength <= 2 ? 6 : correctAnswerLength <= 4 ? 4 : 2))
                .attr('y', textYPosition)
                .attr('font-size', fontSize)
                .attr('opacity', 0)
                .text(data.CorrectAnswer)
                .style('fill', this.contrastColor)
                .call(enter => enter.transition().duration(1000).attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)),
            update => update.transition().duration(500)
                .attr('x', d => this.x(d.x) + (correctAnswerLength <= 2 ? 6 : correctAnswerLength <= 4 ? 4 : 2)) // Ensure x is updated
                .text(data.CorrectAnswer)
                .attr('font-size', fontSize)
                .attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)
        );

    mergedAnswers.selectAll('.crt-accepted-label')
        .data(d => [d])
        .join(
            enter => enter.append('text')
                .attr('class', 'crt-accepted-label')
                .attr('x', d => this.x(d.x))
                .attr('y', 265)
                .attr('fill', this.slideTheme?.ThemeTextColor)
                .attr('text-anchor', 'middle')
                .attr('opacity', 0)
                .text(data?.IsErrorMargin ? 'Accepted answers:' : '')
                .call(enter => enter.transition().duration(1000).attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)),
            update => update.transition().duration(500)
                .attr('x', d => this.x(d.x))
                .text(data?.IsErrorMargin ? 'Accepted answers:' : '')
                .attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)
        );

    mergedAnswers.selectAll('.crt-accepted-range')
        .data(d => [d])
        .join(
            enter => enter.append('text')
                .attr('class', 'crt-accepted-range')
                .attr('x', d => this.x(d.x))
                .attr('y', 280)
                .attr('fill', this.slideTheme?.ThemeTextColor)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14')
                .attr('opacity', 0)
                .text(data?.IsErrorMargin ? this.getErrorMarginValues(data) : '')
                .call(enter => enter.transition().duration(1000).attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)),
            update => update.transition().duration(500)
                .attr('x', d => this.x(d.x)) 
                .text(data?.IsErrorMargin ? this.getErrorMarginValues(data) : '')
                .attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0)
        );

    mergedAnswers.transition().duration(1000)
        .attr('opacity', this.shouldShowCorrectAnswer() ? 1 : 0);
}


  
  private shouldShowCorrectAnswer(): boolean {
    return this._workspaceservice.presentationMode ? this.showCorrectAnswer : true;
  }
  
  private getErrorMarginValues(data: any): string {
    if (!data || !data.IsErrorMargin) {
        return '';
    }

    const startValue = Math.max(0, Number(data.Start) || 0);
    const endValue = Math.max(0, Number(data.End) || 0);
    const correctValue = (data.CorrectAnswer && !isNaN(data.CorrectAnswer)) ? Number(data.CorrectAnswer) : 0;

    let incrementValue = Number(data.ScaleIncrement);
    if (typeof data.ScaleIncrement === 'string' && data.ScaleIncrement.includes(':')) {
        incrementValue = Number(data.ScaleIncrement.split(':', 2)[1].trim());
    }
    
    const errorMarginValue = Math.max(0, Number(data.ErrorMarginNumber) || 0);

    this.CorrectAnswers = correctValue;
    this.errorMarginValue = errorMarginValue;
    this.StartAnswer = startValue;
    this.EndAnswer = endValue;
    this.errorMarginMaxValue = Math.abs(this.StartAnswer - this.EndAnswer);

    let startValueForGuess = Math.max(0, correctValue - errorMarginValue);
    let endValueForGuess = Math.min(this.EndAnswer, correctValue + errorMarginValue);

    if (correctValue > this.EndAnswer) {
        startValueForGuess = correctValue - errorMarginValue;
        endValueForGuess = correctValue + errorMarginValue;
    }

    return `${startValueForGuess} - ${endValueForGuess}`;
}


  private renderGradient(): void {
    const gradient = this.svg?.select('defs #graph-gradient');
  
    if (!gradient.empty()) {
        gradient.selectAll('stop')
            .data(this.gradientStaticData)
            .join(
                enter => enter.append('stop')
                    .attr('offset', (d: any) => d.offset)
                    .attr('stop-color', (d: any) => d.color),
                update => update
                    .transition().duration(500)
                    .attr('offset', (d: any) => d.offset)
                    .attr('stop-color', (d: any) => d.color),
                exit => exit.remove()
            );
    } else {
        const newGradient = this.svg?.append('defs')
            .append('linearGradient')
            .attr('id', 'graph-gradient');

        newGradient?.selectAll('stop')
            .data(this.gradientStaticData)
            .enter()
            .append('stop')
            .attr('offset', (d: any) => d.offset)
            .attr('stop-color', (d: any) => d.color);
    }
}

  
  private dynamicChartResponseLoad(){
    this.updateChart(this.guesstheNumberData);
  }
  updateChart(value: any){
    this.correctAnswerArrayCreate();
    this.guessTheNumberChartValues(value);
    
  }
  updateTheme(data:any){
    this.contrastColor = this._commanService.getContrastColor(this.slideTheme?.ThemeLineColor);
    this.correctAnswerArrayCreate();
    this.guessTheNumberChartValues(this.guesstheNumberData);
    this.slideTheme = data;    
  }
}

