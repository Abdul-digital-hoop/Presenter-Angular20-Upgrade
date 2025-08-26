import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName } from 'src/app/utility/constants';

@Component({
  selector: 'app-view-result-response',
  templateUrl: './view-result-response.component.html',
  styleUrls: ['./view-result-response.component.scss']
})
export class ViewResultResponseComponent implements OnInit {
  PresentationId: string;
  masterSlideTypeName = MasterSlideTypeName;
  responseSummary:any;
  @Input() responseData: any;
  sortedGuessNumberOptions: any[] = [];
  isLoading: boolean = true;
  constructor(private _presentationservice: PresentationService,private _sanitizer: DomSanitizer,public workSpaceService:WorkspaceService,private _activateRouter: ActivatedRoute,) {
    this.PresentationId = this._activateRouter.snapshot.paramMap.get("id");
   }

  ngOnInit(): void {
    this.responsesSummary();
  }
  GetSVGtoIMG(data: any) {
    var modifiedSVG = this.RemoveTitleFromSVG(data);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(modifiedSVG, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    svgElement.setAttribute('width', '20px');
    svgElement.setAttribute('height', '20px');
    const serializer = new XMLSerializer();
    const updatedSVG = serializer.serializeToString(svgElement);
    return this._sanitizer.bypassSecurityTrustHtml(updatedSVG);
  }
  RemoveTitleFromSVG(data: any): string {
    const imgURL = data;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(imgURL, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    const titleElement = svgElement.querySelector('title');
    if (titleElement) {
      titleElement.remove();
    }
    const modifiedSVGString = new XMLSerializer().serializeToString(svgElement);
    return modifiedSVGString;
    
  }
  responsesSummary(){
    const payload = {presentationId:this.PresentationId};
    this.isLoading = true;
    this._presentationservice.responsesSummary(this.PresentationId).subscribe(
      (response: any) => {
          this.responseSummary = response;
          this.sortedGuessNumberOptions = this.sortGuessNumberOptions(response.guessNumberOptions);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching response summary:', error);
          this.isLoading = false;
        }
      );
    }
  
    private sortGuessNumberOptions(options: any[]): any[] {
      if (options) {
        return options.sort((a, b) => {
          if (a.start === b.start) {
            return a.end - b.end; // Sort by 'end' if 'start' is the same
          }
          return a.start - b.start; // Sort by 'start'
        });
      }
      return []; // Return an empty array if no options are provided
    }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['responseData']) {
      // Logic to execute when responseData changes
      // Additional logic can be added here
    }
  }
  getTotalParticipantCount(response: any): number {
    if (response?.optionsResponsecount?.length > 0) {
      const totalParticipantCount = response.optionsResponsecount.reduce((total: number, option: any) => {
          return total + (option.audienceCount || 0);
      }, 0);
      
      // Calculate the average by dividing the total by the number of options
      const numberOfOptions = response.optionsResponsecount.length;
      const average = totalParticipantCount / numberOfOptions;
      
      // Round the result to the nearest whole number
      return Math.round(average);
  }
  return 0;
  }
  calculatePercentage(choice): number {
    if (choice.value > 0) {
      return Math.min(Math.round((choice.yvalue / choice.value) * 100), 100);
    }
    return 0; // Return 0% if value is 0
  }
  
  calculateOffset(yvalue: number, value: number): number {
    const circumference = 2 * Math.PI * 45; // Circle circumference
    return circumference - (yvalue / value) * circumference; // Calculate offset
  }

  // Calculate the X position of the handle
  circleX(yvalue: number, value: number): number {
    const radius = 45;
    const angle = (yvalue / value) * 2 * Math.PI - Math.PI / 2; // Convert value to angle in radians
    return 50 + radius * Math.cos(angle); // Calculate X position
  }

  // Calculate the Y position of the handle
  circleY(yvalue: number, value: number): number {
    const radius = 45;
    const angle = (yvalue / value) * 2 * Math.PI - Math.PI / 2; // Convert value to angle in radians
    return 50 + radius * Math.sin(angle); // Calculate Y position
  }

  // Update the yvalue when the slider is changed (optional if you want it to be functional)
  updateYValue(event: Event, index: number, response: any) {
    const newValue = (event.target as HTMLInputElement).value;
    response.choices[index].yvalue = +newValue;
  }
  getMaxPosition(choice) {
    return Math.max(...choice.map(choice => choice.position));
  }

  getProgress(choice) {
    const maxPosition = this.getMaxPosition(choice);
    return maxPosition > 0 ? (choice.position / maxPosition) * 100 : 0;
  }
  getProgressWidth(rankDataSum: number): number {
    const totalRankDataSum = this.getTotalRankDataSum();
    return totalRankDataSum > 0 ? (rankDataSum / totalRankDataSum) * 100 : 0; // Prevent division by zero
  }
  getTotalRankDataSum(): number {
    const rankingSlides = this.responseSummary?.filter(slide => slide.questionType === 'Ranking') || [];
    
    return rankingSlides.reduce((sum, slide) => {
      const rankDataSum = slide.rankingOptions?.reduce((innerSum, option) => innerSum + (option.rankDataSum || 0), 0) || 0; // Sum up the rankDataSum for each ranking option
      return sum + rankDataSum;
    }, 0) || 1; // Avoid division by 0
  }
  getMaxRankDataSum(): number {
    const rankingOptions = this.responseSummary?.filter(slide => slide.questionType === 'Ranking');
    return Math.max(...rankingOptions.map(slide => 
      slide.rankingOptions ? Math.max(...slide.rankingOptions.map(option => option.rankDataSum || 0)) : 0
    ), 0); // Default to 0 if no ranking options are present
  }
  
  getScalesProgressWidth(audienceCount: number, totalParticipants: number): number {
    return totalParticipants ? (audienceCount / totalParticipants) * 100 : 0;
  }  
}
