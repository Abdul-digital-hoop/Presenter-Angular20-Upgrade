import { trigger } from '@angular/animations';
import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';

interface PathData {
  name: string;
  type: string;
  variable?: string;
  id: string;
  data: { x: number; y: number }[];
}

@Component({
  selector: 'app-scales',
  templateUrl: './scales.component.html',
  styleUrls: ['./scales.component.scss'],
})
export class ScalesComponent implements OnInit {
  @Input('themesChartColor') public themesChartColor: any[];
  @Input('lineColor') public lineColor: any;
  @Input('themesFontColor') public themesFontColor: any;
  @Input('slidDetails') public slideData: any;
  @Input('slideThemes') public slideThemes: any;
  @Input('isShowResults') public isShowResults: boolean = false;
  @Input('screenOptions') public screenOptions: string;
  @Input() slideTheme: any;
  isShowLongerDescription = false;
  @ViewChild('spiderChart', { static: true })
  private width = 400;
  private height = 300;
  private radius = (this.height - 40) / 2; // Adjusted margin
  private central = [this.width / 2, this.height / 2 + 20];
  private colors = {
    _grid: '#424242',
    _data: '#D50000',
  };
  private gridInfo: any;
  private sizeInfo = { _gridX: 1, _gridO: 1, _newline: 2 };
  private textInfo: any = { namesDx: '0.5', namesDy: '0.5' };
  line: d3.Line<[number, number]>;
  resultArray: any[];
  tempCircleData: any;
  dataLength: any;
  firstValue: any;
  actualResultArray: any[];
  slideOption: any[];
  // new -------------------------------
  optionsData: any;
  scalesResult: any;
  dimensions: any;
  @Input() scaleChartData: any[] = [];
  copiedResultsArray: any[];
  gridMaxValue: number;
  lessThanZero: any;
  gridG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  constructor(
    private _commanService: CommanService,
    private _workspaceservice: WorkspaceService,
  ) {
    // if(this.scaleChartData?.length == 0){
    //   this._workspaceservice.storeActiveSlideDetails();
    // }
    // else{
    //   this._workspaceservice.storeActiveSlideDetails();
    //   this.scaleChartData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    // }
    this.slideTheme = this._workspaceservice.presentationTheme;
    this.scaleChartData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.copiedResultsArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));
    this.scalesResult = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.dimensions = this._workspaceservice.scalesDimensions;
  }

  ngOnInit(): void {
    this.slideOption = this.scaleChartData;
     this.copiedResultsArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));
    this.scalesResult = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.dimensions = this._workspaceservice.scalesDimensions;
    const dataset = this.dataMaker();
    this.createChart(dataset);
  }

  ngOnChanges(): void {
    this.scaleChartData = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.slideOption = this.scaleChartData;
     this.copiedResultsArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));
    this.scalesResult = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.dimensions = this._workspaceservice.scalesDimensions;
    const dataset = this.dataMaker();
    this.createChart(dataset);
  }
  gridDetail() {
    this.firstValue = this.dimensions[0]?.Id;
    const lastValue = this.dimensions[this.dimensions.length - 1]?.Id;

    // Subtract the values
    this.gridMaxValue = lastValue - this.firstValue;
    if (this.gridMaxValue >= 6) {
      this.gridInfo = {
        value: {
          min: this._workspaceservice?.slideVotersCount == 0 || !this._workspaceservice.slideShowInResults? 0 : this.firstValue,
          max: this._workspaceservice?.slideVotersCount == 0 || !this._workspaceservice.slideShowInResults? this.gridMaxValue : lastValue,
          interval: this.gridMaxValue / 5
        }
      };
    } else {
      this.gridInfo = {
        value: {
          min: this._workspaceservice?.slideVotersCount == 0 || !this._workspaceservice.slideShowInResults? 0 : this.firstValue,
          max: this._workspaceservice?.slideVotersCount == 0 || !this._workspaceservice.slideShowInResults? this.gridMaxValue : lastValue,
          interval: 1
        }
      };
    }
  }


  private gridMaker(data, valueScale): PathData[] {
    const tempN = data.length;
    this.dataLength = data.length;
    const tempAngleUnit = { pi: (2 * Math.PI) / tempN, degree: 360 / tempN };
    const tempNames = data.map((d) => d.name);
    const tempPathData: PathData[] = [];

    for (let i = 0; i < tempN; i++) {
      tempPathData.push({
        name: '_gridX',
        type: '_grid',
        variable: tempNames[i],
        id: `gridX${i}`,
        data: [
          { x: 0, y: 0 },
          {
            x: this.radius * Math.cos(i * tempAngleUnit.pi - Math.PI / 2),
            y: this.radius * Math.sin(i * tempAngleUnit.pi - Math.PI / 2),
          },
        ],
      });
    }

    const tempValues = d3.range(
      this.gridInfo?.value?.min,
      this.gridInfo?.value?.max + 0.1,
      this.gridInfo?.value?.interval
    );

    tempValues.forEach((value, i) => {
      const tempLength = valueScale(value);
      const tempData = d3.range(tempN).map((d) => ({
        x: tempLength * Math.cos(d * tempAngleUnit.pi - Math.PI / 2),
        y: tempLength * Math.sin(d * tempAngleUnit.pi - Math.PI / 2),
      }));

      tempPathData.push({
        name: '_gridO',
        type: '_grid',
        id: `gridO${i}`,
        data: tempData,
      });
    });

    this.tempCircleData = data.map((d, i) => {
      const scoreObject = this.scalesResult.find(result => result.OptionId === d.id);
      let scoreValue = 0;
      var isSkip=false;
      if (scoreObject) {
        const nonZeroScores = scoreObject.Score.filter(score => score.Y !== 0);
        if (nonZeroScores.length > 0) {
          const sumOfX = nonZeroScores.reduce((sum, score) => sum + score.X * score.Y, 0);
          scoreValue = sumOfX !== 0 ? sumOfX / scoreObject.ResponseCount : 0;
        }
        else{
          isSkip = true;
        }
      }
      const tempLength = valueScale(scoreValue);
      return {
        name: d.name,
        id: scoreValue,
        isSkip: isSkip,
        x: tempLength * Math.cos(i * tempAngleUnit.pi - Math.PI / 2),
        y: tempLength * Math.sin(i * tempAngleUnit.pi - Math.PI / 2),
      };
    });

    tempPathData.push({
      name: '_newline',
      type: '_data',
      id: '_newline',
      data: this.tempCircleData,
    });

    return tempPathData;
  }



  private dataMaker() {
    this.resultArray = [];
    this.actualResultArray = [];
    this.isShowResults = this._workspaceservice.slideShowInResults;
    if (this.isShowResults) {
      this.scalesResult.forEach((response) => {
        // Check if all responseCount values are 0
        const noResponse = this.scalesResult.every(
          (response) => response.ResponseCount === 0
        );
        if (!noResponse) {
          var allYZero = response.Score.every((score) => score.Y === 0);
          if (allYZero) {
            if (response.Score.length > 0) {
              // Set the "y" property of the first object to 0
              response.Score[0].Y = 0;
            }
          }
        }
      });
      // Loop through each object in scalesResult
      this.scalesResult.forEach((scaleResult, i) => {        
        // Filter scores with y not equal to 0
        let scoresWithNonZeroY = scaleResult.Score.filter(
          (score) => score.Y !== 0
        );
        if (scoresWithNonZeroY.length > 0) {
          // Sum all x values
          let sumOfX = scoresWithNonZeroY.reduce(
            (sum, score) => sum + score.X * score.Y,
            0
          );
          let result;
          // Calculate the result
          if (scaleResult.ResponseCount === 0 && sumOfX !== 0) {
            result = sumOfX;
          } else {
            result = sumOfX !== 0 ? sumOfX / scaleResult.ResponseCount : 0;
          }
          this.actualResultArray.push(result);
          this.resultArray.push(result - this.firstValue);
        }
      });
    }
    if (this.slideOption.length >= 0) {
      return this.slideOption.map((item, i) => ({
        name: item.name,
        id: item.id,
      }));
    } else {
      return [];
    }
  }
  showLongerDescription() {
    if (this.screenOptions == 'presentationScreen') {
      this.isShowLongerDescription = true;
    }
  }
  hideLongerDescription() {
    if (this.screenOptions == 'presentationScreen') {
      this.isShowLongerDescription = false;
    }
  }


  private createChart(data): void {
    this.gridDetail();
    d3.select('div#d3RadarChart').select('svg').remove();

    // Determine viewBox and scale based on conditions
    let viewBoxValue = '0 -30 960 440';
    let scaleValue = 1.1;

    if ([1, 2, 3].includes(this._workspaceservice.options?.length)) {
        if (this._workspaceservice.slideLayoutActive) {
            viewBoxValue = '0 -20 880 490';
            scaleValue = 0.9;
        } else {
            viewBoxValue = '0 -30 960 490';
            scaleValue = 0.8;
        }
    } else if ([4, 5].includes(this._workspaceservice.options?.length)) {
      if (this._workspaceservice.slideLayoutActive) {
        viewBoxValue = '0 -10 880 490';
        scaleValue = 0.9;
    } else {
        viewBoxValue = '0 -30 960 490';
        scaleValue = 0.8;
    }
    }

    const svg = d3
      .select('div#d3RadarChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', viewBoxValue)
      .attr('transform', `scale(${scaleValue})`)
      .attr('preserveAspectRatio', 'xMidYMid')
      .attr('font-family', this._workspaceservice?.slideDesign?.ThemeFontFamily)
      .style('overflow', 'visible');

    this.gridG = svg
      .append('g')
      .attr('id', 'id-6bec31bc-f403-4d0a-88ad-cfcc4e9f54bf')
      .attr('class', 'focus')
      .attr('transform', 'translate(291,81)');

    this.line = d3.line()
      .x((d: any) => d?.x)
      .y((d: any) => d?.y)
      .curve(d3.curveLinearClosed);

    const valueScale = d3.scaleLinear()
      .domain([this.gridInfo?.value?.min, this.gridInfo?.value?.max])
      .range([0, this.radius]);

    const tempPathData = this.gridMaker(data, valueScale);
    this.updatePaths(this.gridG, tempPathData);
    this.updateText(this.gridG, tempPathData);
}

  private drawchart(data): void{
    this.gridDetail();
    const valueScale = d3.scaleLinear()
    .domain([this.gridInfo?.value?.min, this.gridInfo?.value?.max])
    .range([0, this.radius]);
    const tempPathData = this.gridMaker(data, valueScale);
    this.updatePaths(this.gridG, tempPathData);
    this.updateText(this.gridG, tempPathData);
  }
  private updatePaths(gridG, tempPathData): void {
    const axis = gridG.selectAll('g.axis')
    .data(tempPathData.filter(d => d.name === '_gridX'))
    .enter()
    .append('g')
    .attr('class', (d, i) => `axis axis-${i + 1}`)
    .each((d, i, nodes) => {
      const g = d3.select(nodes[i]);
      g.append('line')
        .attr('stroke', this.slideTheme.ThemeLineColor)
        .attr('stroke-width', 2)
        .attr('x1', this.radius)
        .attr('y1', this.radius)
        .attr('x2', d.data[1].x + this.radius)
        .attr('y2', d.data[1].y + this.radius);
    });

    const levels = [0, 1, 2, 3, 4, 5];
    levels.forEach((level, i) => {
      let levelGroup = gridG.select(`.level-group-${i}`);
    
      if (levelGroup.empty()) {
        levelGroup = gridG.append('g').attr('class', `level-group level-group-${i}`);
      }
    
      const levelData = tempPathData.filter(d => d.name === '_gridO' && d.id === `gridO${i}`);
      levelData.forEach(d => {
        d.data.forEach((point, j, arr) => {
          const nextPoint = arr[(j + 1) % arr.length];
          levelGroup.append('line')
            .attr('class', 'level')
            .attr('stroke-width', 2)
            .attr('stroke', this.slideTheme?.ThemeLineColor)
            .attr('x1', point.x + this.radius)
            .attr('y1', point.y + this.radius)
            .attr('x2', nextPoint.x + this.radius)
            .attr('y2', nextPoint.y + this.radius);
        });
      });
    });
  
    const polygonData = tempPathData.find(d => d.name === '_newline');
    const polygon = gridG.selectAll('polygon.area')
      .data([polygonData]);
  
    polygon.enter()
      .append('polygon')
      .attr('class', 'area')
      .merge(polygon)
      .transition()
      .duration(2000)
      .attr('fill-opacity', 0.5)
      .attr('stroke-width', 2)
      .attr('stroke', this._workspaceservice.options[0]?.visualizationColor)
      .attr('fill', this._workspaceservice.options[0]?.visualizationColor)
      .attr('points', d => d.data.map(p => `${(p.isSkip ? 0 : p.x) + this.radius},${(p.isSkip ? 0 : p.y) + this.radius}`).join(' '));
  
    const circleGroup = gridG.selectAll('g.circle-group')
      .data([this.tempCircleData]);
  
    const circles = circleGroup.enter()
      .append('g')
      .attr('class', 'circle-group')
      .merge(circleGroup)
      .selectAll('g.circle')
      .data(d => d);
  
    const circleEnter = circles.enter()
      .append('g')
      .attr('class', 'circle');
  
    circleEnter.append('circle')
      .attr('r', 0)
      .merge(circles.select('circle'))
      .transition()
      .duration(2000)
      .attr('fill', this._workspaceservice.options[0]?.visualizationColor)
      .attr('fill-opacity', 0.9)
      .attr('r', 15)
      .attr('cx', d => (d.isSkip ? 0 : d.x) + this.radius)
      .attr('cy', d => (d.isSkip ? 0 : d.y) + this.radius);
  
    circleEnter.append('text')
      .merge(circles.select('text'))
      .transition()
      .duration(2000)
      .attr('fill', this._commanService.getContrastColor(this._workspaceservice.options[0]?.visualizationColor))
      .attr('class', 'circle-value')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('x', d => (d.isSkip ? 0 : d.x) + this.radius)
      .attr('y', d => (d.isSkip ? 0 : d.y) + this.radius)
      .text(d => isNaN(parseFloat(d.id)) ? '0.0' : parseFloat(d.id).toFixed(1));
  }
  
  private updateText(gridG, tempPathData): void {
    const distanceFromChart = 20;
    const angleSlice = Math.PI * 2 / tempPathData.length;
    const tempTextData = tempPathData
      .filter(d => d.name === '_gridX')
      .map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = this.radius * Math.cos(angle);
        const y = this.radius * Math.sin(angle);
        let tempTextAnchor, tempDx, tempDy, cstmY;
        if (i === 0 || i === this.dataLength / 2) {
          tempTextAnchor = 'middle';
          tempDx = 0;
          tempDy = i === 0 ? -this.textInfo.namesDy : this.textInfo.namesDy * 2;
          cstmY = i === 0 ? d.data[1].y - distanceFromChart : d.data[1].y + distanceFromChart;
        } else if (i < this.dataLength / 2) {
          tempTextAnchor = 'start';
          tempDx = +this.textInfo.namesDx;
          tempDy = +this.textInfo.namesDy;
          cstmY = d.data[1].y + distanceFromChart;
        } else {
          tempTextAnchor = 'end';
          tempDx = -this.textInfo.namesDx;
          tempDy = +this.textInfo.namesDy;
          cstmY = d.data[1].y + distanceFromChart;
        }
        return {
          x: d.data[1].x,
          y: cstmY,
          name: tempPathData[i].variable,
          textAnchor: tempTextAnchor,
          dx: tempDx,
          dy: tempDy,
        };
      });

    const tempText = gridG
      .selectAll('text.name')
      .data(tempTextData, d => d.name); // Use key function for data binding

    // EXIT: Remove old text with transition
    tempText.exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();

    // ENTER: Create new text elements
    const textEnter = tempText.enter()
      .append('text')
      .attr('class', 'name')
      .attr('x', d => d.x + this.radius)
      .attr('y', d => d.y + this.radius)
      .attr('dx', d => d.dx + 'em')
      .attr('dy', '0.0em')
      .attr('font-size', '12')
      .style('text-anchor', d => d.textAnchor)
      .style('fill', this.slideTheme?.ThemeTextColor)
      .style('opacity', 0) // Start with opacity 0 for transition effect
      .attr('transform', (d, i) => {
        const textLength = d.name?.length;
        if (d.textAnchor == 'middle' && i !== 0) {
          return `translate(10, ${textLength / 20})`;
        }
        else if (d.textAnchor == 'end' && i !== 0) {
          return `translate(-15, ${-textLength / 7})`;
        }
        else if (d.textAnchor == 'start' && i !== 0) {
          return `translate(15, ${-textLength / 6})`;
        }
        return `translate(-10, ${-textLength/1.5 })`;
      });

    // UPDATE + ENTER: Merge and apply transition
    textEnter.merge(tempText)
      .transition()
      .duration(500)
      .style('opacity', 1)
      .attr('x', d => d.x + this.radius)
      .attr('y', d => d.y + this.radius)
      .attr('dx', d => d.dx + 'em')
      .attr('dy', d => d.dy + 'em');

    // Multi-line wrapping logic
    textEnter.merge(tempText).each(function (d) {
      const text = d3.select(this);
      const val = d.name.trimStart();
      let words = val.split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = text.attr('y');
      const x = text.attr('x');
      const dx = text.attr('dx');
      const dy = parseFloat(text.attr('dy'));
      let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dx', dx).attr('dy', dy + 'em');

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > 150) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dx', dx)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
}

  updateChart(value: any) {
    this.slideOption = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.scalesResult = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.dimensions = this._workspaceservice.scalesDimensions;
    const dataset = this.dataMaker();
    const resultArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));  
    if(resultArray.length != this.copiedResultsArray.length ){
      this.copiedResultsArray = resultArray;
      this.createChart(dataset);
    } 
    else{
      this.copiedResultsArray = resultArray;
      this.drawchart(dataset);
    }
  }
  updateTheme(data: any) {
    this.slideTheme = data;
    if(!this._workspaceservice.resetThemes){
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this._workspaceservice.options.forEach((option, index) => {
      if (colors[index]) {
        option.visualizationColor = colors[index];
      }
    });
  }
    this.slideOption = this._workspaceservice.dynamicChartData(this._workspaceservice.options);
    this.copiedResultsArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));
    this.scalesResult = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.dimensions = this._workspaceservice.scalesDimensions;
    const dataset = this.dataMaker();
    this.createChart(dataset);
  }
  dynamicChartResponseLoad() {
    this.slideOption = this._workspaceservice.dynamicChartData(this._workspaceservice.options);    
    this.copiedResultsArray = JSON.parse(JSON.stringify(this._workspaceservice.scalesResult));
    this.scalesResult = this._workspaceservice.slideShowInResults ? this._workspaceservice.scalesResult : this.hideResults();
    this.dimensions = this._workspaceservice.scalesDimensions;
    const dataset = this.dataMaker();
    this.createChart(dataset);
  }
  hideResults() {
    this.copiedResultsArray.forEach(option => {
      option.Score.forEach(score => {
        score.Y = 0;
      });
    });
    return this.copiedResultsArray;
  }
}