import { Component, OnInit,ChangeDetectorRef, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-reactions',
    templateUrl: './reactions.component.html',
    styleUrls: ['./reactions.component.scss'],
    standalone: false
})
export class ReactionsComponent implements OnInit,OnChanges {

  ContrastColor:any;
  presentationMode: boolean;
  @Input() presentationReactions: any[]=[];
  presentationReactionArray:any[]=[];
  constructor( 
    public workSpaceService:WorkspaceService,
    private cdr: ChangeDetectorRef,
    private _CommanService: CommanService
  ) { 
   
  }

  //#region LifeCycle Hooks
  ngOnChanges(changes: SimpleChanges) {
    this.presentationMode = this.workSpaceService.presentationMode;
    this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
    this.presentationReactionArray=this.workSpaceService.presentationSettingActiveReactions;
  }

  ngOnInit(): void {
    this.presentationMode = this.workSpaceService.presentationMode;
    this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
    this.presentationReactionArray = this.presentationReactions;
  }

  ngDoCheck() {
    // console.log("AppComponent: DoCheck");
  }

  ngAfterContentInit() {
    // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
    // console.log("AppComponent:AfterContentChecked");
  }

  ngAfterViewInit() {
    // console.log("AppComponent:AfterViewInit");
  }

  ngAfterViewChecked() {
    this.ContrastColor = this._CommanService.getContrastColor(this.workSpaceService?.slideDesign?.slideBackgroundColor);
    // console.log("AppComponent:AfterViewChecked");
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    //  console.log("AppComponent:OnDestroy");
  }
  //#endregion LifeCycle Hooks

  getReactionsCount(reactionId: any): number {
    if (this.workSpaceService.slideReactionsCountList?.length > 0) {
      var reaction = this.workSpaceService.slideReactionsCountList.find(x => x.reactionId == reactionId);
      if (reaction != undefined) {
        return reaction?.reactionCount;
      }
      else {
        return 0;
      }
    }
    else {
      return 0;
    }
  }

}
