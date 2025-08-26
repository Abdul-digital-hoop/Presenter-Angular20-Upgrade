import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import * as d3 from 'd3';
import { interval, throwIfEmpty } from 'rxjs';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { QuizTheme,staticPresentationTheme } from 'src/app/utility/MasterConstants';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-select-answers',
  templateUrl: './select-answers.component.html',
  styleUrls: ['./select-answers.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SelectAnswersComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() selectAnswerData: any[] = [];
  @Input('IndexForMultiChoice') public MultiIndex: string;
  @Input() slideTheme: any;
  @Input() screenState: any;
  @Input() isFastAnswerGetMorePoints: boolean = false;
  @Input() playersList: any[] = [];
  flashScreentimer: number = 5;
  private highestValue: string;
  private showCorrectAnswer: boolean = false;
  private svg;
  private margin = 100;
  private width = 750 - this.margin * 2;
  private height = 450 - this.margin * 2;
  barChartData: any[] = [];
  changeBarChartData: any[];
  currentUrl: string;
  isPresenterEditorScreen: boolean;
  startFlashScreenTimer: NodeJS.Timer;
  minutes: number = 0;
  seconds: number = 0;
  quizSeconds: NodeJS.Timer;
  respondPlayerCount: number = 0;
  showChart: boolean = false;
  isNonofOptionCorrect: boolean = false;
  quizTheme = QuizTheme;
  staticPresentationTheme = staticPresentationTheme;
  constructor(
    public _workspaceservice: WorkspaceService,
    public _workspaceSignalRService: WorkSignalRServiceService,
    public presentationService: PresentationService,
    private renderer: Renderer2,
    private _activateRouter: ActivatedRoute,) {
    this.selectAnswerData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.slideTheme = this.staticPresentationTheme;
    this.barChartData.forEach((data: any, i) => {
      if (data.name.trimStart().endsWith(i + ' ' + 'P')) {

      } else if (data.name.trimStart().endsWith(this.MultiIndex + ' ' + 'P')) {

      }
      else {
        data.name = data?.name.trimStart() + i + ' ' + 'P'
      }
    });
    this.barChartData = [];
    this.barChartData = this.selectAnswerData;
    if (this._workspaceservice.quizState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN) {
      this.screenState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
      this.createCharts(this.barChartData);
      this.createBar(this.barChartData);
    }
    else {
      // this.quizScreenState(this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS);
      this.screenState = this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS;
    }
    this.isFastAnswerGetMorePoints = this._workspaceservice.quizMorePointsforCorrectAnswers;
    this.getScreenName();
    this._activateRouter.queryParams.subscribe(params => {
      if ('isTemplate' in params) {
        this._workspaceservice.isTemplate = params['isTemplate'];
      }
    });
  }
  ngOnInit(): void {
    this.isNonofOptionCorrect = this._workspaceservice.isSelectSignleCorrentAnswers
  }
  ngOnChanges(changes: SimpleChanges) {
    // if(this._workspaceservice.quizState == this._workspaceservice.quizPresenterScreen.VOTING_SCREEN)
    // {
    //   this.initializeData();
    //   this.applyConditions(this.barChartData);
    //   this.createCharts(this.changeBarChartData || this.barChartData);
    //   this.createBar(this.changeBarChartData || this.barChartData);
    // }
  }

  ngAfterViewInit() {
    if ((this.screenState == this._workspaceservice?.quizPresenterScreen.VOTING_SCREEN || this.screenState == this._workspaceservice?.quizPresenterScreen.RESULT_SCREEN) || (this.screenState == this._workspaceservice?.quizPresenterScreen.EVERY_ONE_HAS_VOTED) || (this.isPresenterEditorScreen)) {
      this.initializeData();
      this.applyConditions(this.barChartData);
      this.createCharts(this.barChartData);
      this.createBar(this.barChartData);
    }
  }
  private initializeData(): void {
    let highestCurrentValue = 0;
    let tableLength = this.selectAnswerData.length;

    this.selectAnswerData.forEach((data, i) => {
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

    this.barChartData = [...this.selectAnswerData];
  }
  private applyConditions(barChartData: any): void {
    this.changeBarChartData = JSON.parse(JSON.stringify(barChartData));
    this.showCorrectAnswer = true;

    // if (this._workspaceservice.chooseCorrectAnswers && !this._workspaceservice.presentationMode || this._workspaceservice.multiplechoicepresenterEnterClick) {
    //   this.showCorrectAnswer = true;
    // } else {
    //   this.showCorrectAnswer = false;
    // }

    // if (!this._workspaceservice.slideShowInResults) {
    //   this.changeBarChartData.forEach(item => {
    //     item.value = 0;
    //   });
    // } else {
    //   this._workspaceservice.dynamicChartData(this._workspaceservice.options).forEach(multipleChoiceItem => {
    //     const changeBarItem = this.changeBarChartData.find(item => item.id === multipleChoiceItem.id);
    //     if (changeBarItem) {
    //       changeBarItem.value = multipleChoiceItem.value;
    //     }
    //   });
    // }

    // if (this._workspaceservice.slideResponseAsPercentage) {
    //   const totalValue = this.changeBarChartData.reduce((sum, item) => sum + item.value, 0);
    //   if (totalValue > 0) {
    //     this.changeBarChartData.forEach(item => {
    //       const percentage = (item.value / totalValue) * 100;
    //       item.displayValue = percentage.toFixed() + '%';
    //       item.value = item.value;
    //     });
    //   } else {
    //     this.changeBarChartData.forEach(item => {
    //       item.displayValue = '0%';
    //       item.value = 0;
    //     });
    //   }
    // }
    // else{
    //   const totalValue = this.changeBarChartData.reduce((sum, item) => sum + item.value, 0);
    //   if (totalValue > 0) {
    //     this.changeBarChartData.forEach(item => {
    //       item.displayValue =  item.value;
    //       item.value = item.value;
    //     });
    //   } else {
    //     this.changeBarChartData.forEach(item => {
    //       item.displayValue = 0;
    //       item.value = 0;
    //     });
    //   }
    // }
  }
  createCharts(value: any) {
    this.createSvg();
    this.drawBars(value);
  }
  private createSvg(): void {
    d3.select('div#my_dataviz').select("svg").remove();
    this.svg = d3
      .select('div#my_dataviz')
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100' + '%')
      .attr('viewBox', '0 0 960 640')
      .append('g')
      .attr('transform', this.isPresenterEditorScreen ? 'translate(200, 120)' : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? 'translate(200, 120)' : 'translate(200, -120)');
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
      .attr('font-size', '14px')
      .attr('y', '10')
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
      .call(this.wrap, 100)
      .attr('opacity', d => {
        const datum = data.find(item => item.name === d);
        return (this.isPresenterEditorScreen) ? (datum && datum.isCorrect ? 1 : 0.7) : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? (datum && datum.isCorrect ? 1 : 0.7) : 1;
      });

    this.svg.select('path').attr('d', 'M0,0V0H550V0');
    this.svg.select('path').attr('stroke-width', '2');
    this.svg.select('path').attr('stroke', 'black');
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
      .attr('fill', (d, i) => this.slideTheme.ThemeVisualizationColor[i]?.color)
      // .attr('opacity', d => this.showCorrectAnswer ? (d.isCorrect ? 1 : 0.3) : 1);
      .attr('opacity', d => (this.isPresenterEditorScreen) ? (d.isCorrect ? 1 : 0.3) : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? (d.isCorrect ? 1 : 0.3) : 0);

    const barsUpdate = barsEnter.merge(bars);

    barsUpdate.select('rect')
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value))
      .attr('height', d => this.height - y(d.value))
      .attr('opacity', d => (this.isPresenterEditorScreen) ? (d.isCorrect ? 1 : 0.3) : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? (d.isCorrect ? 1 : 0.3) : 0);
    // .attr('opacity', d => this.showCorrectAnswer ? (d.isCorrect ? 1 : 0.3) : 1);

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
      .text(d => d.value)
      .attr('opacity', d => (this.isPresenterEditorScreen && d.value == 0) ? 0 : d.value > 0 ? 1 : 0);

    const icons = this.svg.selectAll('.icons').data(data, d => d.name);
    icons.exit().remove();

    const iconsEnter = icons.enter().append('g').attr('class', 'icons');

    iconsEnter.append("path")
      .attr("d", d => d.isCorrect ?
        "M35.4142 5.58579C36.1953 6.36683 36.1953 7.63317 35.4142 8.41421L13.4142 30.4142C12.6332 31.1953 11.3668 31.1953 10.5858 30.4142L0.585786 20.4142C-0.195262 19.6332 -0.195262 18.3668 0.585786 17.5858C1.36683 16.8047 2.63316 16.8047 3.41421 17.5858L12 26.1716L32.5858 5.58579C33.3668 4.80474 34.6332 4.80474 35.4142 5.58579Z" :
        "M31.4142 4.58579C32.1953 5.36684 32.1953 6.63317 31.4142 7.41421L7.41421 31.4142C6.63317 32.1953 5.36684 32.1953 4.58579 31.4142C3.80474 30.6332 3.80474 29.3668 4.58579 28.5858L28.5858 4.58579C29.3668 3.80474 30.6332 3.80474 31.4142 4.58579Z M4.58579 4.58579C5.36684 3.80474 6.63317 3.80474 7.41421 4.58579L31.4142 28.5858C32.1953 29.3668 32.1953 30.6332 31.4142 31.4142C30.6332 32.1953 29.3668 32.1953 28.5858 31.4142L4.58579 7.41421C3.80474 6.63317 3.80474 5.36684 4.58579 4.58579Z")
      .attr("fill", d => d.isCorrect ? "#00DB91" : "#DB3734")
      .attr("opacity", (this.isPresenterEditorScreen) ? 1 : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? 1 : 0)
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
      .attr("opacity", (this.isPresenterEditorScreen) ? 1 : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? 1 : 0)
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
      let lineNumber = 0;
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
          tspan = textElement.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
      if (lineNumber >= 6) {
        textElement.attr('font-size', '12px');
      } else {
        textElement.attr('font-size', '14px');
      }
    });
  }
  private dynamicChartResponseLoad() {
    //this.updateChart(this.changeBarChartData);
  }
  updateChart(value: any) {
    this.selectAnswerData = value;
    this.barChartData = this.selectAnswerData;
    value.forEach((data: any, i) => {
      if (data.name.trimStart().endsWith(i + ' ' + 'P')) {

      } else if (data.name.trimStart().endsWith(this.MultiIndex + ' ' + 'P')) {

      }
      else {
        data.name = data?.name.trimStart() + i + ' ' + 'P'
      }
    });
    if (value.length !== this.barChartData.length) {
      this.applyConditions(value);
      this.createSvg();
      this.drawBars(this.barChartData);
      this.createBar(this.barChartData);
    } else {
      this.applyConditions(value);
      this.createSvg();
      this.drawBars(this.barChartData);
      this.createBar(this.barChartData);
    }
  }
  updateTheme(data: any) {
   
    const colors = this.quizTheme.ThemesChartColor.map(item => item.Color);

    this.barChartData.forEach((option, index) => {
      if (colors[index]) {
        option.color = colors[index];
      }
    });    
    this.updateChart(this.barChartData);
    this.slideTheme = this.staticPresentationTheme;
  }
  getScreenName() {
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/');
    this.currentUrl = pathSegments[pathSegments.length - 1];
    if (this.currentUrl == 'presentation') {
      this.isPresenterEditorScreen = false;
    }
    else {
      this.isPresenterEditorScreen = true;
    }

  }
  @HostListener('document:keydown.enter', ['$event'])
  public documentClick(event: Event): void {
    this.startQuiz();
  }
  startQuiz() {
    if (!this.isPresenterEditorScreen) {
      if (this.screenState == this._workspaceservice.quizPresenterScreen.WAITING_FOR_QUIZ_PLAYERS) {
        let QuizDTO={
          presentationId:this._workspaceservice.presentationId,
          slideId:this._workspaceservice.activeSlideId
        }
        if(!this._workspaceservice.isPreviewMode){
          this._workspaceSignalRService.startQuizForRemote(QuizDTO);
        }
        this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.FAST_ANSWERS_SCREEN);
        this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.FAST_ANSWERS_SCREEN;
        this.screenState = this._workspaceservice.quizState;
        this.startFastAnswersScreen();
        this.quizScreenState(this._workspaceservice.quizPresenterScreen.FAST_ANSWERS_SCREEN);
      }
    }
  }
  startFastAnswersScreen() {
    setTimeout(() => {
      this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.LOADER_SCREEN);
      this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.LOADER_SCREEN;
      this.screenState = this._workspaceservice.quizState;
      this.quizScreenState(this._workspaceservice.quizPresenterScreen.LOADER_SCREEN);
      this.startflashScreenTimer();   // Start count Down
    }, 3000);
  }
  startflashScreenTimer(): void {
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.LOADER_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.startFlashScreenTimer = setInterval(() => {
      if (this.flashScreentimer > 0) {
        this.flashScreentimer--; // Decrement timer by 1 second
      } else {
        this.stopTimer(); // Stop the timer when it reaches 0
        this.flashScreentimer = 5;

      }
    }, 1000); // Update every 1 second
  }
  stopTimer(): void {
    clearInterval(this.startFlashScreenTimer);
    this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.VOTING_SCREEN);
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.VOTING_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.quizScreenState(this._workspaceservice.quizPresenterScreen.VOTING_SCREEN);
    this.startTimerForPlaying(this._workspaceservice.quizSecondsToAnswers);
  }
  quizScreenState(screenName: any) {
    let presentationDTO = {
      presentationId: this._workspaceservice.presentationId,
      slideId: this._workspaceservice.activeSlideId,
      state: screenName,
      isTemplate: this._workspaceservice.isTemplate
    }
    this.presentationService.quizStateUpdate(presentationDTO).subscribe(
      (response: any) => {
        // this.workSpaceSignalRService.openAndCloseResponse(this.workSpaceService.presentationId);
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  startTimerForPlaying(secondsfromUser: any) {
    //this.quizSeconds.unsubscribe();
    //this.minutes = 0;
    //this.seconds = 0;
    if (secondsfromUser > 60) {
      this.minutes = Math.floor((secondsfromUser % 3600) / 60);
      this.seconds = secondsfromUser % 60;
      if (!(this.minutes < 0)) {
        this.quizSeconds = setInterval(() => {
          this.seconds--;                                                                                                   // Generate interval every one second;
          if (this.seconds < 0) {
            this.minutes = this.minutes - 1;                                                                                // Decrease the mintuies after 59 less
            this.seconds = 59;                                                                                              // Regenerate the sec
          }
          if (this.seconds === 0 && this.minutes === 0) {
            // this.isTimerFinished = true;
            // this.selectedAnswersTimesUp(true);
            // Unsubscribe the interval when timer finished
            //  clearInterval(this.quizSeconds);
            this.clearInterForQuizPlaying();
            // call TimesUp API
          }
        }, 1000)

      }
    }
    else {
      this.seconds = secondsfromUser;
      this.quizSeconds = setInterval(() => {
        if (!(this.seconds < 0)) {
          this.seconds--;
          if (this.seconds === 0) {
            // this.selectedAnswersTimesUp(true);
            // this.isTimerFinished = true;
            // clearInterval(this.quizSeconds);
            this.clearInterForQuizPlaying();                                                                                 // Unsubscribe the interval when timer finished
          }
        }
      }, 1000)
    }
  }
  clearInterForQuizPlaying() {
    clearInterval(this.quizSeconds);
    this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
    this.screenState = this._workspaceservice.quizState;
    this.updateChartAfterQuizEnd();
    this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
    this.quizScreenState(this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
  }
  addNewPlayerList(list){
    this.playersList = list;
  }
  updatePlayerlist(player) {
    var index = this.playersList.findIndex(x=>x.playerId == player[0].playerId);
    if(index != -1){
      this.playersList[index].playerName = player[0].playerName;
      this.playersList[index].playerImageURL = player[0].playerImageURL;
      this.playersList[index].score = player[0].score;
      this.playersList[index].answerdTime = player[0].answerdTime;
      this.playersList[index].answerdOptionId = player[0].answerdOptionId;
    }else{
      this.playersList.push(player[0]);
      this._workspaceservice.quizPlayersCount++;
    }
  }
  updateChartAfterQuizEnd() {
    this.selectAnswerData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.barChartData = this.selectAnswerData;
    this.updateChart(this.barChartData);
  }
  updatePlayerResponse(response: any) {
    if (this._workspaceservice.quizPlayersCount > 0) {
      // this.respondPlayerCount = response.filter(x => x.isVoted == true)?.length;
      this.respondPlayerCount = response;
      this._workspaceservice.slideVotersCount = this.respondPlayerCount;
      if (this._workspaceservice.quizPlayersCount == this.respondPlayerCount) {
        clearInterval(this.quizSeconds);
        this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.EVERY_ONE_HAS_VOTED;
        this.screenState = this._workspaceservice.quizState;
        setTimeout(() => {
          this._workspaceservice.quizState = this._workspaceservice.quizPresenterScreen.RESULT_SCREEN;
          this.screenState = this._workspaceservice.quizState;
          this.updateChartAfterQuizEnd();
          this._workspaceSignalRService.quizScreenMaintenance(this._workspaceservice.presentationId, this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
          this.quizScreenState(this._workspaceservice.quizPresenterScreen.RESULT_SCREEN);
        }, 2000);
      }
    }
  }
  clearTimerWhenDestroy(){    
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
    this.flashScreentimer = 5;
    // this._workspaceservice.quizSecondsToAnswers = 0;
    this.seconds = 0;
    this.minutes = 0;
  }
  ngOnDestroy(){
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
  }
}

