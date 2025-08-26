import { Component, Input, OnInit, OnChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MasterSlideTypeName, QuizPresenterScreenManageConstant } from 'src/app/utility/constants';
export interface participent {
  userId: any;
  userName: any;
  isCorrectAnswer: any;
  points: any;
  position: any;
  optionColor: any;
};
@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss']
})
export class LeaderBoardComponent implements OnInit, OnChanges, AfterViewInit {
  @Input('screenOptions') public screenOptions: string;
  isShowLongerDescription = false;
  private barHeight = 50;
  private marginTop = 5;
  private marginRight = 50;
  private marginBottom = 10;
  private marginLeft = 100;
  private width = 700;
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  x: any;
  y: any;
  height: number;
  leaderboardPlayers: any[] = [];
  @Input() rankingOptionData: any[] = [];
  @Input() slideTheme:any;
  emojiSize : any;
  LeaderBoardBarColors : any[]=[
    {color :"#48B2FF"},
    {color :"#62FF48"},
    {color :"#48FFE0"},
    {color :"#FFC248"},
    {color :"#BC48FF"},
    {color :"#FF4848"},
    {color :"#FFC248"},
    {color :"#FF48E2"},
    {color :"#FFFF48"},
    {color :"#FF4888"}
  ]
  AllCorrectAnswer: any[]=[];
  correctAanswer: any="";
  correctAanswerArr: string[]=[];
  crtAnswer: any[]=[];
  topThreePlayers: any[] = [];
  QuizPresenterScreenManageConstant = QuizPresenterScreenManageConstant;
  masterSlideTypeName = MasterSlideTypeName
  parentSlideDetails: any;
  UsersFound: boolean=false;
  constructor(public workSpaceService: WorkspaceService,public cdr: ChangeDetectorRef) {
  }
  
  ngOnInit() {
    this.slideTheme = this.workSpaceService.presentationTheme;
    this.leaderBoardCheckCrtAns();
  }
  ngOnChanges() {
  }
  ngAfterViewInit() {
    this.leaderBoardCheckCrtAns();
  }
  leaderBoardCheckCrtAns(){
    this.leaderboardPlayers = [];
    this.topThreePlayers = [];
    this.correctAanswer = "";
    this.correctAanswerArr = [];
    this.parentSlideDetails = this.workSpaceService.slideListArray.find(x=> x.slideId == this.workSpaceService.parentId);
    var leaderboardPlayers = this.workSpaceService.quizResultLeaderboard.sort((a, b) => b.score - a.score);
    if (leaderboardPlayers.some(x => x.isVoted == true)) {
      this.UsersFound = true;
    }
    if(leaderboardPlayers.length >=1){
      for (var i = 0; i < leaderboardPlayers.length; i++) {
        if (leaderboardPlayers[i].score > 0 && i<3) {
          this.topThreePlayers.push(leaderboardPlayers[i]);
        }
        else{
          this.leaderboardPlayers.push(leaderboardPlayers[i]);
        }
      }
    }
  }
  updatePresentationPoints(points:any){
    this.leaderBoardCheckCrtAns();
  }
}