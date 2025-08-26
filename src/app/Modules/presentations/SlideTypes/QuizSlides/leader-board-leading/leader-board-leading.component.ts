import { Component, Input, OnInit } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { QuizPresenterScreenManageConstant } from 'src/app/utility/constants';

@Component({
  selector: 'app-leader-board-leading',
  templateUrl: './leader-board-leading.component.html',
  styleUrls: ['./leader-board-leading.component.scss']
})
export class LeaderBoardLeadingComponent implements OnInit {

  @Input('LeaderBoard') public LeaderBoard:any;
  @Input('themes') public theme:any;
  leaderboardPlayers:any[]=[];
  leaderBoardPointsBackgroundColor:any="";
  topThreePlayers:any[]=[];
  leadingPercentage:number = 0;
  colors= [
    "#FF5733", "#33FF57", "#5733FF", "#F1C40F", "#8E44AD", "#1ABC9C",
    "#3498DB", "#E74C3C", "#9B59B6", "#2ECC71", "#E67E22", "#34495E",
    "#16A085", "#2980B9", "#C0392B", "#27AE60", "#D35400", "#7F8C8D",
    "#F39C12", "#D93652", "#5E3370", "#66CC99", "#FF9900", "#CC0000",
    "#336699", "#0099CC", "#9900FF", "#FF6600", "#99CC33", "#6699FF",
    "#CC99FF", "#FFCC66", "#33FFCC", "#CC3366", "#66CCFF", "#FF99CC",
    "#FF9966", "#FFCC33", "#00CC99", "#33CCCC", "#CC6633", "#669966",
    "#6600CC", "#99FF66", "#FF33CC", "#33FF99", "#CC6699", "#FF6666",
    "#6666CC", "#FFCC00"
  ]
  quizPresenterScreenManageConstant =QuizPresenterScreenManageConstant
  constructor(public workSpaceService:WorkspaceService) { }

  ngOnInit(): void {
    this.leaderBoardPointsBackgroundColor = this.workSpaceService?.ContrastColorForCMT;
    this.leaderBoardCheck();
  }
  ngOnChanges(){
    this.leaderBoardCheck();
  }
  leaderBoardCheck(){
    this.leaderboardPlayers = this.workSpaceService.presentationQuizPlayerList.sort((a,b)=> b.score - a.score);
    var totalQuizSlide = this.workSpaceService.slidesQuizPlayerList;
    var i = 1;
    totalQuizSlide.forEach((item)=>{
      if(item.quizState == this.quizPresenterScreenManageConstant.RESULT_SCREEN){
        this.leadingPercentage = i * 1000;
        i++;
      }
    })
  }
  getBackgroundColorWithOpacity(colorCode: any, opacity: any): string {
    let rgb: number[];
    // Check if the input is a hex code
    if (colorCode?.startsWith('#')) {
      rgb = this.hexToRgb(colorCode);
    } else {
      // Assume it's an rgb string
      rgb = colorCode?.match(/\d+/g).map(Number);
    }
    // Calculate the contrast color
    const contrastRgb = rgb?.map((val) => (val > 128 ? 0 : 255));
    // Return the contrast color with opacity
    return `rgba(${contrastRgb?.join(', ')}, ${opacity})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];

    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }    
    return rgb;
  }

  updatePresentationPoints(points:any){
    this.leaderboardPlayers = points;
    this.leaderBoardCheck();
  }
}
