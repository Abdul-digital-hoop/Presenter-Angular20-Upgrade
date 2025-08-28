import { Component, ElementRef, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { QuizTheme, staticPresentationTheme } from 'src/app/utility/MasterConstants';
import { settingVariables } from 'src/app/utility/SettingVariables';

interface DataPoint {
  date: string;
  value: number;
}


@Component({
    selector: 'app-guess-the-number-quiz',
    templateUrl: './guess-the-number-quiz.component.html',
    styleUrls: ['./guess-the-number-quiz.component.scss'],
    standalone: false
})
export class GuessTheNumberQuizComponent implements OnInit {

  @Input() guesstheNumberData: any;
  @Input() slideTheme: any;
  @Input() screenState: any;
  @Input() isFastAnswerGetMorePoints: boolean = false;
  @Input() playersList: any[] = [];
  @Input() selectAnswerData: any[] = [];
  screenOptions = 'presentationScreen';
  isShowLongerDescription = false;
  slidData = {
    "isShowResults": true,
    "slideThemes": {
      "ThemeLineColor": "#252b36",
      "ThemeBackgroundColor": "#000",
      "ThemeTextColor": "#000",
      "ThemeVisualizationColor": [
        { "height": 25, "color": "#498dde" },
        { "height": 40, "color": "#ffcc00" },
        { "height": 80, "color": "#ff007e" },
        { "height": 40, "color": "#ff5d91" },
        { "height": 25, "color": "#7e6abf" }
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
  contrast: any;
  ResultLength: any = false;
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
  presentationMode: boolean;
  isPresenterEditorScreen: boolean;
  
  startFlashScreenTimer!: ReturnType<typeof setInterval>;
  minutes: number = 0;
  seconds: number = 0;
  quizSeconds!: ReturnType<typeof setInterval>;

  respondPlayerCount: number = 0;
  showChart: boolean = false;
  isNonofOptionCorrect: boolean = false;
  currentUrl: string;
  flashScreentimer: number = 5;
  quizTheme = QuizTheme;
  staticPresentationTheme = staticPresentationTheme;
  constructor(
    private _commanService: CommanService,
    private _activateRouter: ActivatedRoute,
    public _workspaceservice: WorkspaceService,
    public _workspaceSignalRService: WorkSignalRServiceService,
    public presentationService: PresentationService,
  ) {
    const currentRoute = this._activateRouter.snapshot.url;
    this.currentRouter = currentRoute.slice(0, 1).map(segment => segment.path)[0];
    this.guesstheNumberData = this._workspaceservice.dynamicGuesstheNumberData(this._workspaceservice.guesstheNumberoptions)
    this.slideTheme = this.staticPresentationTheme;
    this.presentationMode = this._workspaceservice.presentationMode;
    this.screenState = this._workspaceservice.quizState;
    this.isFastAnswerGetMorePoints = this._workspaceservice.quizMorePointsforCorrectAnswers;
    this.getScreenName();
    this._activateRouter.queryParams.subscribe(params => {
      if ('isTemplate' in params) {
        this._workspaceservice.isTemplate = params['isTemplate'];
      }
    });
  }

  ngOnInit() {
    if (!this._workspaceservice.presentationMode || this.screenState === this._workspaceservice.quizPresenterScreen.RESULT_SCREEN) {
      this.showCorrectAnswer = true;
    }
    this.contrastColor = this._commanService.getContrastColor(this.slideTheme?.ThemeTextColor);
    this.correctAnswerArrayCreate();
    this.presentationMode = this._workspaceservice.presentationMode;
    // if (!this.slidData.isShowResults) {
    //   this.isHover = false;
    // }
    //this.guesstheNumberData = this._workspaceservice.dynamicGuesstheNumberData(this._workspaceservice.guesstheNumberoptions)
    if (this.guesstheNumberData?.IsErrorMargin) {
      this.ErrorMarginStart = (this.guesstheNumberData?.CorrectAnswer + this.guesstheNumberData?.ErrorMarginNumber);
      this.ErrorMarginEnd = (this.guesstheNumberData?.CorrectAnswer - this.guesstheNumberData?.ErrorMarginNumber);
    }
    this.createChart(this.guesstheNumberData);
    // this.correctAnswerArrayCreate();
  }
  ngOnChanges() {
    if (this.guesstheNumberData?.IsErrorMargin) {
      this.ErrorMarginStart = (this.guesstheNumberData?.CorrectAnswer + this.guesstheNumberData?.ErrorMarginNumber);
      this.ErrorMarginEnd = (this.guesstheNumberData?.CorrectAnswer - this.guesstheNumberData?.ErrorMarginNumber);
    }
  }
  ngAfterViewInit() {
    if ((this.screenState == this._workspaceservice?.quizPresenterScreen.VOTING_SCREEN || this.screenState == this._workspaceservice?.quizPresenterScreen.RESULT_SCREEN) || (this.screenState == this._workspaceservice?.quizPresenterScreen.EVERY_ONE_HAS_VOTED) || (this.isPresenterEditorScreen)) {
      this.correctAnswerArrayCreate();
      this.guessTheNumberChartValues(this.guesstheNumberData);
    }
  }
  correctAnswerArrayCreate() {
    // static gradientData
    this.gradientStaticData = [
      { offset: '10%', color: this.slideTheme?.ThemeVisualizationColor[0]?.color },
      { offset: '100%', color: this.slideTheme?.ThemeVisualizationColor[0]?.color },
    ]
    this.guessTheNumberDetails = [];
    this.guessTheNumberResults = [];
    this.guessTheNumberResults = [...this._workspaceservice.guessTheNumberResults?.Score];
    var originalLeght = this.guessTheNumberResults?.length;
    // Add dummy axis for first and last index of array
    this.guessTheNumberResults.splice(0, 0, { x: 0, y: 0 });
    this.guessTheNumberResults.splice(originalLeght + 1, 0, { x: this.guessTheNumberResults[originalLeght]?.x, y: 0 });
    this.modifiedResults = this.guessTheNumberResults;
    this.maxValue = Math.max(...this.modifiedResults.map(o => o.x));
    this.guessTheNumberDetails.push(this.modifiedResults.find((res: any) => res?.x == (this._workspaceservice.guesstheNumberoptions?.CorrectAnswer - this._workspaceservice.guesstheNumberoptions?.Start) / this._workspaceservice.guesstheNumberoptions.ScaleIncrement));
    //this.createChart();
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
      var obj = [{ offset: (this.percentageStart) + "%", color: this.slideTheme?.ThemeVisualizationColor[0]?.color },
      { offset: (this.percentageStart) + "%", color: this.slideTheme?.ThemeVisualizationColor[1]?.color },
      { offset: (this.percentageEnd + 1) + "%", color: this.slideTheme?.ThemeVisualizationColor[1]?.color },
      { offset: (this.percentageEnd + 1) + "%", color: this.slideTheme?.ThemeVisualizationColor[0]?.color },]
      this.gradientData = obj;
    }
    else {
      this.percentageStart = (((this._workspaceservice.guesstheNumberoptions?.CorrectAnswer - this._workspaceservice.guesstheNumberoptions?.ErrorMarginNumber) - this._workspaceservice.guesstheNumberoptions?.Start) / (this._workspaceservice.guesstheNumberoptions.End - this._workspaceservice.guesstheNumberoptions?.Start)) * 100;
      this.percentageEnd = (((this._workspaceservice.guesstheNumberoptions?.CorrectAnswer + this._workspaceservice.guesstheNumberoptions.ErrorMarginNumber) - this._workspaceservice.guesstheNumberoptions?.Start) / (this._workspaceservice.guesstheNumberoptions?.End - this._workspaceservice.guesstheNumberoptions?.Start)) * 100;
      var obj = [{ offset: (this.percentageStart) + "%", color: this.slideTheme?.ThemeVisualizationColor[0]?.color },
      { offset: (this.percentageStart) + "%", color: this.slideTheme?.ThemeVisualizationColor[1]?.color },
      { offset: (this.percentageEnd + 1) + "%", color: this.slideTheme?.ThemeVisualizationColor[1]?.color },
      { offset: (this.percentageEnd + 1) + "%", color: this.slideTheme?.ThemeVisualizationColor[0]?.color },]
      this.gradientData = obj;
    }

  }
  private createChart(value: any): void {
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
      .attr('viewBox', '0 0 750 450')
      .append('g')
      //.attr('transform', 'translate(' + 150 + ',' + 10 + ')');
      .attr('transform', this.isPresenterEditorScreen ? 'translate(150, 10)' : this.screenState == this._workspaceservice.quizPresenterScreen.RESULT_SCREEN ? 'translate(150, 10)' : 'translate(150, -100)');
    // .append('svg')
    // .attr('class', 'centered-svg')
    // .attr('width', '100%')
    // .attr('height', '100%')
    // .attr('viewBox', '0 0 750 300')
    // .append('g')
    // .attr('transform', 'translate(' + 150 + ',' + 10 + ')');

    // d3.select('div#chart').select("svg").remove();
    // this.width = 440 - this.margin.left - this.margin.right;
    // this.height = 300 - this.margin.top - this.margin.bottom;
    // this.x = d3.scaleLinear().range([20, this.width]);
    // this.y = d3.scaleLinear().range([this.height, 0]);
    // this.svg = d3.select("div#chart")
    //this.updateChart();
  }



  private guessTheNumberChartValues(value: any): void {
    if (!this._workspaceservice.presentationMode || this.screenState === this._workspaceservice.quizPresenterScreen.RESULT_SCREEN) {
      this.showCorrectAnswer = true;
    }
    if (this.showCorrectAnswer) {
      const staticDataForGradient = this.gradientStaticData;
      staticDataForGradient.splice(1, 0, ...this.gradientData);
      this.gradientStaticData = [];
      this.gradientStaticData = staticDataForGradient;
    }
    else {
      this.gradientStaticData.splice(1, this.gradientStaticData?.length - 2);
    }
    if (value.IsErrorMargin) {
      this.ErrorMarginStart = (value.CorrectAnswer + value.ErrorMarginNumber);
      this.ErrorMarginEnd = (value.CorrectAnswer - value.ErrorMarginNumber);
    }

    this.svg?.selectAll('*').remove();

    const data = value;

    this.x = d3.scaleLinear().range([20, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.x.domain(d3.extent(this.modifiedResults, (d: any) => d.x));
    this.y.domain([0, d3.max(this.modifiedResults, (d: any) => d.y)]);

    this.svg?.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.x).tickFormat(() => '').tickSize(0))
      .attr('stroke-width', '2')

    const labelStart = this.svg?.append('g')

    labelStart?.append('text')
      .attr('x', this.width + 20)
      .attr('y', this.height + 5)
      .attr('text-anchor', 'start')
      .text(data.End)
      .style('fill', this.slideTheme?.ThemeTextColor)

    labelStart?.append('text')
      .attr('x', 0)
      .attr('y', this.height + 5)
      .attr('text-anchor', 'end')
      .text(data.Start)
      .style('fill', this.slideTheme?.ThemeTextColor)

    d3.select(".domain")
      .attr("stroke", 'black')

    this.svg?.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(this.y).ticks(5))
      .attr('opacity', '0');

    const valueline = d3.line()
      .x((d: any) => this.x(d.x))
      .y((d: any) => this.y(d.y))
      .curve(d3.curveMonotoneX);

    this.svg?.append('path')
      .data([this.modifiedResults])
      .attr('class', 'area')
      .attr('stroke', 'transperant')
      .attr('stroke-width', 3)
      .attr('fill', 'url(#graph-gradient)')
      .attr('opacity', 1)
      .attr('d', this.slidData?.isShowResults ? valueline : '')
      .on('mouseover', () => {
        this.isHover = true;
        circleText.attr('opacity', this.isShowResults && this.isHover && this.presentationMode ? 1 : 0);
      })
      .on('mouseout', () => {
        this.isHover = false;
        circleText.attr('opacity', this.isShowResults && this.isHover && this.presentationMode ? 1 : 0);
      });
    const circleText = this.svg?.selectAll('circle')
      .data(this.modifiedResults)
      .enter()
      .append('g')
      .attr('opacity', () => this.isHover ? 1 : 0);

    const crtAnswer = this.svg?.selectAll('circle')
      .data(this.guessTheNumberDetails)
      .enter()
      .append('g')

    circleText?.append('circle')
      .attr('cx', (d: any, index: any) => this.x(d.x))
      .attr('cy', (d: any) => this.y(d.y))
      .attr('opacity', (d: any) => d.y == 0 ? 0 : !this.slidData?.isShowResults ? 0 : 1)
      .attr('r', 10)
      .attr('fill', (d: any) => (this.showCorrectAnswer && (d.y > 0) ? (data.IsErrorMargin ? (d.SelectedValue <= this.ErrorMarginStart && d.SelectedValue >= this.ErrorMarginEnd) : (data.CorrectAnswer == d.SelectedValue)) : 0) ? this.slideTheme?.ThemeVisualizationColor[1]?.color : this.slideTheme?.ThemeVisualizationColor[0]?.color)
      .on('mouseover', () => {
        this.isHover = true;
        circleText.attr('opacity', this.isShowResults && this.isHover && this.presentationMode ? 1 : 0);
      })
      .on('mouseout', () => {
        this.isHover = false;
        circleText.attr('opacity', this.isShowResults && this.isHover && this.presentationMode ? 1 : 0);
      });

    circleText?.append('text')
      .attr('x', (d: any) => this.x(d.x) - 2)
      .attr('y', (d: any) => this.y(d.y) + 3)
      .attr('font-size', '10')
      .attr('fill', '#ffffff')
      .attr('opacity', (d: any) => d.y == 0 ? 0 : !this.slidData?.isShowResults ? 0 : 1)
      .text((d: any) => d.y)
      .on('mouseover', () => {
        this.isHover = true;
        circleText.attr('opacity', this.isShowResults && this.isHover && this.presentationMode ? 1 : 0);
      })
      .on('mouseout', () => {
        this.isHover = false;
        circleText.attr('opacity', this.isShowResults && this.isHover && this.presentationMode ? 1 : 0);
      });

    crtAnswer?.append('rect')
      .attr('x', (d: any) => this.x(d.x) - 20)
      .attr('y', 230)
      .attr('height', '20')
      .attr('width', (data.CorrectAnswer).toString().length <= 2 ? '45' : (data.CorrectAnswer).toString().length <= 4 ? '55' : '65')
      .attr('opacity', this.showCorrectAnswer ? 1 : 0)
      .attr('rx', 10)
      .attr('fill', 'black');

    crtAnswer?.append('text')
      .attr('x', ((d: any) => this.x(d.x) - 12))
      .attr('y', (this._workspaceservice.guesstheNumberoptions?.CorrectAnswer).toString().length <= 2 ? '245' : (this._workspaceservice.guesstheNumberoptions?.CorrectAnswer).toString().length <= 4 ? '243' : '243')
      .attr('fill', '#fff')
      .attr('font-size', (this._workspaceservice.guesstheNumberoptions?.CorrectAnswer).toString().length <= 2 ? '14' : (this._workspaceservice.guesstheNumberoptions?.CorrectAnswer).toString().length <= 4 ? '12' : '10')
      .attr('opacity', this.showCorrectAnswer ? 1 : 0)
      .text('✔')
      .style('fill', this.contrastColor);

    crtAnswer?.append('text')
      .attr('x', (data.CorrectAnswer).toString().length <= 2 ? ((d: any) => this.x(d.x) + 6) : (data.CorrectAnswer).toString().length <= 4 ? ((d: any) => this.x(d.x) + 4) : ((d: any) => this.x(d.x) + 2))
      .attr('y', (data.CorrectAnswer).toString().length <= 2 ? '245' : (data.CorrectAnswer).toString().length <= 4 ? '243' : '243')
      .attr('font-size', (data.CorrectAnswer).toString().length <= 2 ? '14' : (data.CorrectAnswer).toString().length <= 4 ? '12' : '10')
      .attr('opacity', this.showCorrectAnswer ? 1 : 0)
      .text(data.CorrectAnswer)
      .style('fill', this.contrastColor);

    crtAnswer?.append('text')
      .attr('x', (d: any) => this.x(d.x))
      .attr('y', 265)
      .attr('fill', this.slideTheme?.ThemeTextColor)
      .attr('text-anchor', 'middle')
      .attr('opacity', this.showCorrectAnswer ? 1 : 0)
      .text(() => {
        if (data && data.IsErrorMargin) {
          return 'Accepted answers:';
        } else {
          return '';
        }
      });

    crtAnswer?.append('text')
      .attr('x', (d: any) => this.x(d.x))
      .attr('y', 280)
      .attr('fill', this.slideTheme?.ThemeTextColor)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14')
      .attr('opacity', this._workspaceservice.presentationMode ? (this.showCorrectAnswer ? 1 : 0) : 1)
      .text(() => {
        if (data && data.IsErrorMargin) {
          var startValue = data.Start <= 0 ? 0 : Number(data.Start);
          var endValue = data.End <= 0 ? 0 : Number(data.End);
          //var correctValue = currectAnswer <= 0 ? 0 : Number(currectAnswer);
          var correctValue = 'focusout' == settingVariables?.FocusEvent
            ? (data.CorrectAnswer <= 0 ? 0 : Number(data.CorrectAnswer))
            : (data.CorrectAnswer === '' ? null : (data.CorrectAnswer <= 0 ? 0 : Number(data.CorrectAnswer)));

          // Safely handle scaleIncrement
          var incrementValue;
          if (typeof data.ScaleIncrement === "string" && data.ScaleIncrement.includes(':')) {
            incrementValue = Number(data.ScaleIncrement.split(':', 2)[1].trim());
          } else {
            incrementValue = Number(data.ScaleIncrement);
          }
          var errorMarginValue = data.ErrorMarginNumber <= 0 ? 0 : Number(data.ErrorMarginNumber)
          var correctValueAddorEven = correctValue % 2;
          var OprationValueAddorEven = (startValue + incrementValue) % 2;
          var termNumber = 1;
          var termIncrementValue = startValue;
          var isValidTerm = false;
          var isPossibleNumber = false;
          this.CorrectAnswers = correctValue;
          this.errorMarginValue = errorMarginValue;
          this.StartAnswer = startValue;
          this.EndAnswer = endValue;
          this.errorMarginMaxValue = Math.abs(this.StartAnswer - this.EndAnswer);
          var resultsAnswersCount = (endValue - startValue) / incrementValue;
          while (termIncrementValue < endValue) {
            termNumber++;
            termIncrementValue += incrementValue;
          }
          isValidTerm = termIncrementValue === endValue;
          for (let i = startValue; i <= endValue; i += incrementValue) {
            if (i === correctValue) {
              isPossibleNumber = true;
              break;
            }
            else {
              isPossibleNumber = false;
            }
          }
          if (this.CorrectAnswers >= 0) {
            this.startValueForGuess = this.CorrectAnswers - this.errorMarginValue;
            if (this.startValueForGuess < 0) {
              this.startValueForGuess = 0;
            }
            this.addValue = this.CorrectAnswers + this.errorMarginValue;
            this.subValue = this.CorrectAnswers - this.errorMarginValue;
            if (this.addValue > this.EndAnswer) {
              this.endValueForGuess = this.EndAnswer;
            } else {
              this.endValueForGuess = this.addValue;
            }
            if (this.subValue < this.StartAnswer) {
              this.startValueForGuess = this.StartAnswer;
            } else {
              this.startValueForGuess = this.subValue;
            }
            if (this.CorrectAnswers > this.EndAnswer) {
              this.endValueForGuess = this.addValue;
              this.startValueForGuess = this.subValue;
            }
            this.errorMarginMaxValue = Math.abs(this.StartAnswer - this.EndAnswer);
          }
          return `${this.startValueForGuess} - ${this.endValueForGuess}`;
        } else {
          return '';
        }

      });
    if (this._workspaceservice.slideShowInResults) {
      const gradient = this.svg
        ?.append('defs')
        ?.append('linearGradient')
        ?.attr('id', 'graph-gradient');

      gradient?.selectAll('stop')
        .data(this.gradientStaticData)
        .enter()
        .append('stop')
        .attr('offset', (d: any) => d.offset)
        .attr('stop-color', (d: any) => d.color);
    }
    // Append gradient definition

  }

  showGuessTheNumberCorrectAnswers() {
    this.showCorrectAnswer = !this.showCorrectAnswer
    this.guesstheanswerStatusMsg = this.showCorrectAnswer ? 'hide' : 'show';
    if (this.showCorrectAnswer) {
      var staticDataForGradient = this.gradientStaticData;
      staticDataForGradient.splice(1, 0, ...this.gradientData);
      this.gradientStaticData = [];
      this.gradientStaticData = staticDataForGradient;
    }
    else {
      this.gradientStaticData.splice(1, this.gradientStaticData?.length - 2);
    }
    //this.createChart(this.guesstheNumberData);
  }
  showGuessTheNumberAnswers() {
    if (this.showCorrectAnswer) {
      var staticDataForGradient = this.gradientStaticData;
      staticDataForGradient.splice(1, 0, ...this.gradientData);
      this.gradientStaticData = [];
      this.gradientStaticData = staticDataForGradient;
    }
    else {
      this.gradientStaticData.splice(1, this.gradientStaticData?.length - 2);
    }
    //this.createChart(this.guesstheNumberData);
  }
  // showLongerDescription(){
  //   if( this._workspaceservice.presentationMode)
  //   {
  //     this.isShowLongerDescription = true;
  //   }
  // }
  // hideLongerDescription(){
  //   if( this._workspaceservice.presentationMode)
  //   {
  //     this.isShowLongerDescription = false;
  //   }
  // }
  private dynamicChartResponseLoad() {
    this.updateChart(this.guesstheNumberData);
  }
  updateChart(value: any) {
    this.correctAnswerArrayCreate();
    this.createSvg();
    this.guessTheNumberChartValues(value);
  }
  updateTheme(data: any) {
    this.contrastColor = this._commanService.getContrastColor(this.slideTheme?.ThemeTextColor);
    this.correctAnswerArrayCreate();
    this.guessTheNumberChartValues(this.guesstheNumberData);
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
        let QuizDTO = {
          presentationId: this._workspaceservice.presentationId,
          slideId: this._workspaceservice.activeSlideId
        }
        this._workspaceSignalRService.startQuizForRemote(QuizDTO);
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
  addNewPlayerList(list) {
    this.playersList = list;
  }
  updatePlayerlist(player) {
    var index = this.playersList.findIndex(x => x.playerId == player[0].playerId);
    if (index != -1) {
      this.playersList[index].playerName = player[0].playerName;
      this.playersList[index].playerImageURL = player[0].playerImageURL;
      this.playersList[index].score = player[0].score;
      this.playersList[index].answerdTime = player[0].answerdTime;
      this.playersList[index].answerdOptionId = player[0].answerdOptionId;
    } else {
      this.playersList.push(player[0]);
      this._workspaceservice.quizPlayersCount++;
    }
  }
  updateChartAfterQuizEnd() {
    this.guesstheNumberData = this._workspaceservice.dynamicGuesstheNumberData(this._workspaceservice.guesstheNumberoptions)
    this.updateChart(this.guesstheNumberData);
  }
  updatePlayerResponse(response: any) {
    if (this._workspaceservice.quizPlayersCount > 0) {
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
  clearTimerWhenDestroy() {
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
    this.flashScreentimer = 5;
    // this._workspaceservice.quizSecondsToAnswers = 0;
    this.seconds = 0;
    this.minutes = 0;
  }
  ngOnDestroy() {
    clearInterval(this.startFlashScreenTimer);
    clearInterval(this.quizSeconds);
  }
}
