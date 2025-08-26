import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-this-or-that',
    templateUrl: './this-or-that.component.html',
    styleUrls: ['./this-or-that.component.scss'],
    standalone: false
})
export class ThisOrThatComponent implements OnInit {
screenOptions :any='presentationScreen' ;
presentationMode : boolean = true;
  isShowLongerDescription = false;
  options: any[] = [];
  
@Input() slideTheme:any;
  ContrastColor: any;
  constructor(public workSpaceService: WorkspaceService,public commonService: CommanService,private cdr: ChangeDetectorRef) {
    this.options = this.workSpaceService.options;
    this.slideTheme = this.workSpaceService.presentationTheme;
  }

  ngOnChanges() {
    this.options = this.workSpaceService.options;
    this.ContrastColor = this.commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
  }
  animate = false;
  ngOnInit(): void {
    this.options = this.workSpaceService.options;
    this.presentationMode = this.workSpaceService.presentationMode;
    this.ContrastColor = this.commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
    setInterval(() => {
      this.animate = false;
      setTimeout(() => {
        this.animate = true;
      }, 20);
    }, 1000); 

  
  }
  ngAfterContentChecked() {
    this.presentationMode = this.workSpaceService.presentationMode;
    this.ContrastColor = this.commonService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
  }
  public thisOrThatValue(index: number): boolean {
    if (!this.workSpaceService?.slideShowInResults) {
        return true;
    } else {
        var maxValue = Math.max(this.options[0]?.value, this.options[1]?.value);
        return this.options[index]?.value == maxValue;
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
  
  updateChart(value:any){
    this.options =this.workSpaceService.options;
    this.cdr.detectChanges();
  }
  calculateFontSize(text: string, isMaxValue: boolean): string {
    const length = text ? text.length : 0;
    let fontSize = 20;

    // Determine the base font size based on text length
    if (this.presentationMode) {
        if (length > 35) {
            fontSize = 16;
        } else if (length >= 20 && length <= 35) {
            fontSize = 18;
        } else {
            fontSize = 20;
        }
    } else {
        if (length > 35) {
            fontSize = 8;
        } else if (length >= 20 && length <= 35) {
            fontSize = 10;
        } else {
            fontSize = 14;
        }
    }

    // Apply the same font size for options with the maximum value
    return isMaxValue ? `${fontSize}px` : `${fontSize}px`;
}
  calculatePercentage(value: number): number {
    const totalValue = this.options.reduce((acc, option) => acc + option.value, 0);
    if (totalValue === 0) {
      return 0;
    }
    return (value / totalValue) * 100;
  }
  updateTheme(data: any) {
    this.slideTheme = data;
   // this.slideTheme = data;
   if(!this.workSpaceService.resetThemes){
    const colors = this.slideTheme.ThemeVisualizationColor.map(item => item.color);

    this.workSpaceService.options.forEach((option, index) => {
      if (colors[index]) {
        option.visualizationColor = colors[index];
      }
    });
  }
     this.workSpaceService.dynamicChartData(this.workSpaceService.options);
  }
  calculateCircleSize(value: number): string {
  if (value === 0) {
    return '0px';
  }
    const sizeMap = [
        { min: 1, max: 5.4, size: 7.5 },
        { min: 5.5, max: 10.4, size: 15 },
        { min: 10.5, max: 15.4, size: 22.5 },
        { min: 15.5, max: 20.4, size: 30 },
        { min: 20.5, max: 25.4, size: 37.5 },
        { min: 25.5, max: 30.4, size: 45 },
        { min: 30.5, max: 35.4, size: 52.5 },
        { min: 35.5, max: 40.4, size: 60 },
        { min: 40.5, max: 45.4, size: 67.5 },
        { min: 45.5, max: 50.4, size: 75 },
        { min: 50.5, max: 55.4, size: 82.5 },
        { min: 55.5, max: 60.4, size: 90 },
        { min: 60.5, max: 65.4, size: 97.5 },
        { min: 65.5, max: 70.4, size: 105 },
        { min: 70.5, max: 75.4, size: 112.5 },
        { min: 75.5, max: 80.4, size: 120 },
        { min: 80.5, max: 85.4, size: 127.5 },
        { min: 85.5, max: 90.4, size: 135 },
        { min: 90.5, max: 95.4, size: 142.5 },
        { min: 95.5, max: 100, size: 150 }
    ];

    const percentage = this.calculatePercentage(value);
    let size = 7.5;

    for (const range of sizeMap) {
        if (percentage >= range.min && percentage <= range.max) {
            size = range.size;
            break;
        }
    }

    return `${size}px`;
}

}
