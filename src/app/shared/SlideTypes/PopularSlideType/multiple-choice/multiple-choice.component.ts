import { DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';

@Component({
    selector: 'app-multiple-choice',
    templateUrl: './multiple-choice.component.html',
    styleUrls: ['./multiple-choice.component.scss'],
    standalone: false
})
export class MultipleChoiceComponent implements OnInit {
  // @Input('barData') public multipleChoiceData: any[];
  // @Input('themesFontColor') public themesFontColor: any[];
  // @Input('lineColor') public lineColor: any;
  // @Input('slidDetails') public slidData: any;
  // @Input('aboutTheSlides') public aboutTheSlideValue: any;
  // @Input('questions') public questionsValue: any;
  // @Input('longDescription') public longDescriptionValue: any;
  // @Input('slideThemes') public slideThemes: any;
  // @Input('correctAnswerDisplay') public correctAnswerDisplay: boolean = false;
  // @Input('screenOptions') public screenOptions: string;
  // @Input('IndexForMultiChoice') public MultiIndex: string;
  @Input() multipleChoiceData: any[] = [];

  // multipleChoiceData:any[]=[];
  lineColor: string = "black";
  private highestValue: string;
  private svg;
  private margin = 100;
  private width = 750 - this.margin * 2;
  private height = 450 - this.margin * 2;
  public optionValueInPercentage: number;
  isCorrectAnswer: Boolean;
  isCorrect: Boolean;
  option: boolean;
  isShowLongerDescription = false;
  barChartData: any[] = [];
  constructor(
    private _decimalPipe: DecimalPipe,
    private _commanService: CommanService,
    private _workspaceservice: WorkspaceService,
  ) {
    this.multipleChoiceData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    if(this.multipleChoiceData?.length == 0){
      this._workspaceservice.storeActiveSlideDetails();
    }
  }

  ngOnInit(): void {
    let highestCurrentValue = 0;
    let tableLength = this.multipleChoiceData.length;
    this.multipleChoiceData.forEach((data, i) => {
      const barValue = Number(data.value);
      if (barValue > highestCurrentValue) {
        highestCurrentValue = barValue;
      }
      if (tableLength == i + 1) {
        this.highestValue = highestCurrentValue.toString();
      }
      // if (!this.slidData?.isShowResults) {
      //   this.multipleChoiceData.forEach((data, i) => {
      //     data.value = 0;
      //   });
      //   this.createCharts();
      // }
      // else {
      this.createCharts(this.multipleChoiceData);
      // }
    });
    this.barChartData = [];
    this.barChartData = this.multipleChoiceData;
    // Presentage Calculation
    this.PresentageCalculation(this.multipleChoiceData);
  }

  ngOnChanges() {
    this.barChartData = [];
    this.barChartData = this.multipleChoiceData;
    // this.barChartData.forEach((data:any,i)=>{
    //   if(data.name.endsWith(i+' '+'P')){

    //   }else if(data.name.endsWith(i+' '+'P')){

    //   }
    //   else{
    //     data.name = data?.name+ i+' '+'P'
    //   }
    // });
    // Presentage Calculation
    this.PresentageCalculation(this.multipleChoiceData);
    let highestCurrentValue = 0;
    let tableLength = this.multipleChoiceData.length;

    // if(this.multipleChoiceData.length > 0){
    //   this.multipleChoiceData.forEach((data, i) => {
    //     const barValue = Number(data.value);
    //     this.isCorrectAnswer = this.slidData?.isCorrectAnswer;
    //     this.isCorrect = this.slidData?.options[i]?.isCorrect;
    //     // const answerCorrect = this.slidData?.options;
    //     // const result = answerCorrect.every(element => element.isCorrect);
    //     // console.log("cvcv",result); 
    //     //  this.option = this.slidData?.options[i]?.isCorrect;
    //     if (barValue > highestCurrentValue) {
    //       highestCurrentValue = barValue;
    //     }
    //     if (tableLength == i + 1) {
    //       this.highestValue = highestCurrentValue.toString();
    //     }
    //     // if (!this.slidData?.isShowResults) {
    //     //   this.multipleChoiceData.forEach((data, i) => {
    //     //     data.value = 0;
    //     //   });
    //     //   this.createCharts();
    //     // }
    //     // else {

    //     // }
    //   });
    //   this.createCharts();
    // }
    // else{
    //   this.createCharts();
    // }
    this.createCharts(this.multipleChoiceData);

  }
  // #region BarChart
  PresentageCalculation(options: any) {
    var optionTotalValue = 0;
    for (let option of options) {
      optionTotalValue = optionTotalValue + option?.value;
    }
    if (optionTotalValue > 0) {
      this.optionValueInPercentage = 100 / optionTotalValue;
    }
    else {
      this.optionValueInPercentage = 0;
    }
  }

  createCharts(value:any) {
    // this.isCorrectAnswer = this.slidData?.isCorrectAnswer;
    this.createSvg();
    this.drawBars(value);
  }

  // private wrap(text, width): void {
  //   text.each(function () {
  //     const text = d3.select(this);
  //     const words = text.text().split(/\s+/).reverse();
  //     let word;
  //     let line = [];
  //     let lineNumber = 0;
  //     const lineHeight = 1.1; // ems
  //     const y = text.attr('y');
  //     const dy = parseFloat(text.attr('dy'));
  //     let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

  //     while ((word = words.pop())) {
  //       line.push(word);
  //       tspan.text(line.join(' '));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(' '));
  //         line = [word];
  //         tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
  //       }
  //     }
  //   });
  // }
  private wrap(text, width): void {
    text.each(function () {
      const textElement = d3.select(this);
      const words = textElement.text().split(/\s+/);
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1;
      let y = parseFloat(textElement.attr('y')) || 0;
      const dy = parseFloat(text.attr('dy'));
      let tspan = textElement.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      let wordCount = 0;

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
  private createSvg(): void {
    d3.select('div#chart').select("svg").remove();
    this.svg = d3
      .select('div#chart')
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100' + '%')
      .attr('viewBox', '0 0 1000 500')
      .append('g')
      .attr('transform', 'translate(200, 100)');
  }
  private drawBars(data: any[]): void {
    // Creating X-axis band scale
    const x = d3
      .scaleBand()
      .range([0, this.width])
      .domain(data.map((d) => d.name))
      .padding(0.2);

    // Drawing X-axis on the DOM
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('font-size', '14px')
      .attr('y', '5')
      .attr("fill", "black")
      .each(function (d) {
        const tickText = d3.select(this);
        const textContent = tickText.text();
        const lastLetter = textContent.slice(-3);
        const remainingLetters = textContent.slice(0, -3);
        tickText.text("");
        tickText.append("tspan")
          .text(remainingLetters)
          .attr("fill-opacity", 1);
      })
      .call(this.wrap, x.bandwidth());
    this.svg.select("path").attr("d", "M0,0V0H550V0");
    this.svg.select("path").attr("stroke-width", "2");
    this.svg.select("path").attr("stroke", this.lineColor);

    // Creaate Y-axis band scale
    const y = d3
      .scaleLinear()
      .domain([0, Number(this.highestValue) + 0.8])
      .range([this.height, 0]);

    // Create and fill the bars with transitions
    const bars = this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.name))
      .attr('y', this.height)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', (d) => d.color)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => this.height - y(d.value));

    bars.transition()
      .duration(500)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => this.height - y(d.value));


    this.svg.selectAll("text.bar")
      .data(data)
      .enter()
      .append("text")
      .attr("text-anchor", "start")
      .attr("fill", "black")
      .attr("x", d => x(d.name) + (180 / this.multipleChoiceData?.length))
      .attr("y", d => this.height) // Start labels from the bottom
      .text((d: any) => d.value)
      //  {

      //     if (this.slidData?.isShowResults) {
      //         return this.slidData?.showResultsPercentage ? this._commanService.transformDecimal(this.optionValueInPercentage * d.value) + "%" : d.value;
      //     } else {
      //         return this.slidData?.showResultsPercentage ? 0 + '%' : 0;
      //     }
      // })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", d => y(d.value) - 5);

    // if (this.isCorrectAnswer && this.correctAnswerDisplay) {
    //   this.svg.selectAll('tick-icon')
    //     .data(data)
    //     .enter()
    //     .append('svg')
    //     .attr('width', '100px')
    //     .attr('height', '100px')
    //     .attr('x', d => x(d.name) + 35)
    //     .attr('y', d => this.height - 50)
    //     .append('g')
    //     .attr('opacity', d => d.isCorrect ? 1 : 0)
    //     .attr('transform', 'scale(0.65)')
    //     .append('path')
    //     .attr('class', 'bar')
    //     .attr('d', 'M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z')
    //     .attr('fill', '#00DB91');


    //     this.svg.selectAll('wrong-icon')
    //         .data(data)
    //         .enter()
    //         .append('svg')
    //         .attr('width', '100px')
    //         .attr('height', '100px')
    //         .attr('x', d => x(d.name) + 35)
    //         .attr('y', d => this.height - 50)
    //         .append('g')
    //         .attr('opacity', d => !d.isCorrect ? 1 : 0)
    //         .attr('transform', 'scale(0.65)')
    //         .append('path')
    //         .attr('class', 'bar')
    //         .attr('d', 'M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z')
    //         .attr('fill', '#DB3734');
    //       }
    // else {
    //   return;
    // }
  }
  // #endregion BarChart
  // showLongerDescription(){
  //   if(this.screenOptions == 'presentationScreen')
  //   {
  //     this.isShowLongerDescription = true;
  //   }
  // }
  // hideLongerDescription(){
  //   if(this.screenOptions == 'presentationScreen')
  //   {
  //     this.isShowLongerDescription = false;
  //   }
  // }
  updateChart(value:any){
    this.createCharts(value);
    //this.drawBars(value);
  }
}