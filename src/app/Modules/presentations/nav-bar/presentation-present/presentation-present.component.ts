// angular import
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { throwIfEmpty } from 'rxjs';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
declare var $;
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-presentation-present',
    templateUrl: './presentation-present.component.html',
    styleUrls: ['./presentation-present.component.scss'],
    standalone: false
})
export class PresentationPresentComponent implements OnInit {
  hasLeaderboardSlides: boolean;
  lastSlideId: any;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  currentMode: string = '';
  isLinkVisible: boolean = true;
  loadPresentationPage: boolean = true;
  copied: boolean = false;
  isDropdownOpen: boolean = false; // Add dropdown state control
  showRemoteUrlPopup: boolean = false; // Control remote URL popup visibility
  showRemoteAccessManagement: boolean = false; // Control remote access management popup visibility

  constructor(
    private _router:Router,
    public workSpaceService:WorkspaceService,
    public workSpaceSignalRService:WorkSignalRServiceService,
    public presentationService:PresentationService,private route: ActivatedRoute) { }
//#region LifeCycle Hooks
  ngOnChanges() {
    //console.log("AppComponent: OnChanges");
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.workSpaceService.isTemplate = params.get('isTemplate') === 'true';
    });
  }
  
  // Dropdown control methods
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  closeDropdown() {
    this.isDropdownOpen = false;
  }
  
  onDropdownItemClick(action: string) {
    this.closeDropdown();
    if (action === 'present') {
      this.presentThePresentation();
    } else if (action === 'remote') {
      this.showRemoteAccessManagementPopup();
    }
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
  // console.log("AppComponent:AfterViewChecked");
  }

  ngOnDestroy() {
  //  console.log("AppComponent:OnDestroy");
  }
//#endregion LifeCycle Hooks

//#region Component Level functions
  //#region API Call
  addLeaderBoard() {
    let updateAddLeaderBoard = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.lastSlideId,
      isLeadeboard: !this.workSpaceService.quizAddLeaderboard,
      isTemplate: this.workSpaceService.isTemplate,
      isLast: true,
    }
    this.presentationService.updateAddLeaderBoard(updateAddLeaderBoard).subscribe(
      (response: any) => {
        this.workSpaceService.storeActiveSlideDetails();
        $("#quizModal").modal("hide");
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  //#endregion API Call

  //#region Without API Call
    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if(key == 'p' && !this.workSpaceService.isTemplate && !this.workSpaceService.isPreviewMode){
        this.presentThePresentation();
      }
    }
    
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
      const target = event.target as HTMLElement;
      // Check if click is outside the dropdown
      if (!target.closest('.dropdown')) {
        this.closeDropdown();
      }
    }
  presentThePresentation(mode?: string) {
    this.currentMode = mode || '';
    // if (this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE ||
    //   this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE ||
    //   this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.LINEUP_SLIDE_TYPE ||
    //   this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ)
    // {
      let slides = this.workSpaceService.slideListArray.filter(
        slide =>
          slide.slideTypeName === this.workSpaceService.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE ||
          slide.slideTypeName === this.workSpaceService.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE ||
          slide.slideTypeName === this.workSpaceService.masterSlideTypeName.LINEUP_SLIDE_TYPE ||
          slide.slideTypeName === this.workSpaceService.masterSlideTypeName.GUESS_THE_NUMBER_QUIZ 
      );

      if (slides?.length > 0) {
        var lengthOfSlides = slides.length;
        let lastSlideIndex = slides[lengthOfSlides - 1]?.index;
        this.lastSlideId = slides[lengthOfSlides - 1]?.slideId;
        this.hasLeaderboardSlides = slides.some(slide => {
          // Check if slideContentData exists
          if (slide.slideContentData && slide.slideContentData.length > 0) {
            // Check each item in slideContentData
            return slide.slideContentData.some(contentData => {
              // Find the item with name 'AddLeaderboard'
              const addLeaderboardData = contentData.value.find(
                data => data.name === 'AddLeaderboard'
              );
              // Return true if AddLeaderboard is true
              return addLeaderboardData && addLeaderboardData.value === true;
            });
          }
          return false;
        });

        // Case 1: Single quiz slide without leaderboard
        if (slides.length === 1 && !this.hasLeaderboardSlides) {
          this.openQuizLeaderBoardModal();
        }
        // Case 2: Multiple quiz slides with at least one leaderboard
        else if (slides.length > 1 && !this.hasLeaderboardSlides) {
          this.openQuizLeaderBoardModal();
        }
        // Case 3: Last quiz slide without leaderboard
        else if (this.workSpaceService.activeSlideIdIndex === lastSlideIndex && !this.hasLeaderboardSlides) {
          this.openQuizLeaderBoardModal();
        }
        else if (this.workSpaceService.activeSlideIdIndex === lastSlideIndex) {
          const lastSlide = slides[lengthOfSlides - 1];
          if (!lastSlide.slideContentData.some(contentData => {
            const addLeaderboardData = contentData.value.find(
              data => data.name === 'AddLeaderboard'
            );
            return addLeaderboardData && addLeaderboardData.value === true;
          }) && !this.hasLeaderboardSlides) {
            this.openQuizLeaderBoardModal();
          } else {
            this.workSpaceSignalRService.stopConnection();
            if (this.IntegrationMediumOffice) {
              window.location.href = `#/WorkSpace/presentation?id=${this.workSpaceService.presentationId}${mode ? `&mode=${mode}` : ''}`;
            } else {
              this._router.navigate(['/WorkSpace/presentation'], {
                queryParams: { 
                  id: this.workSpaceService.presentationId,
                  ...(mode && { mode })
                }
              });
            }
          }
        }
        // Proceed with presentation if all checks pass
        else {
          this.workSpaceSignalRService.stopConnection();
          if (this.IntegrationMediumOffice) {
            window.location.href = `#/WorkSpace/presentation?id=${this.workSpaceService.presentationId}${mode ? `&mode=${mode}` : ''}`;
          } else {
            this._router.navigate(['/WorkSpace/presentation'], {
              queryParams: { 
                id: this.workSpaceService.presentationId,
                ...(mode && { mode })
              }
            });
          }
        }
      } else {
        // No quiz slides present
         // Not a select or type answer slide
      if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
        this.workSpaceService.dynamicComponent_Clone.instance.updateContent();
      }
        this.workSpaceSignalRService.stopConnection();
        if (this.IntegrationMediumOffice) {
          window.location.href = `#/WorkSpace/presentation?id=${this.workSpaceService.presentationId}${mode ? `&mode=${mode}` : ''}`;
        } else {
          this._router.navigate(['/WorkSpace/presentation'], {
            queryParams: { 
              id: this.workSpaceService.presentationId,
              ...(mode && { mode })
            }
          });
        }
      }
    // } else {
    //   // Not a select or type answer slide
    //   if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
    //     this.workSpaceService.dynamicComponent_Clone.instance.updateContent();
    //   }
    //   this.workSpaceSignalRService.stopConnection();
    //   this._router.navigate(['/WorkSpace/presentation'], {
    //     queryParams: { id: this.workSpaceService.presentationId }
    //   });
    // }
  }
    presentAnyway(mode?: string){
      this.workSpaceSignalRService.stopConnection();
      if (this.IntegrationMediumOffice) {
        window.location.href = `#/WorkSpace/presentation?id=${this.workSpaceService.presentationId}${mode ? `&mode=${mode}` : ''}`;
      } else {
        this._router.navigate(['/WorkSpace/presentation'], {
          queryParams: { 
            id: this.workSpaceService.presentationId,
            ...(mode && { mode })
          }
        });
      }
    }
  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods
openQuizLeaderBoardModal(){
  $("#quizModal").modal("show");
}

openShareModal(){
  $("#shareModal").modal("show");
}

closeShareModal(){
  $("#shareModal").modal("hide");
}

copyToClipboard(){
  if (this.workSpaceService.audienceURL) {
    navigator.clipboard.writeText(this.workSpaceService.audienceURL).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
}

  showRemotePopup() {
    this.showRemoteUrlPopup = true;
  }

  closeRemoteUrlPopup() {
    this.showRemoteUrlPopup = false;
  }

  showRemoteAccessManagementPopup() {
    this.showRemoteAccessManagement = true;
  }

  closeRemoteAccessManagement() {
    this.showRemoteAccessManagement = false;
  }

  openRemoteUrlPopup() {
    this.showRemoteAccessManagement = false;
    this.showRemoteUrlPopup = true;
  }

  openRemoteAccessManagementFromUrlPopup() {
    this.showRemoteUrlPopup = false;
    this.showRemoteAccessManagement = true;
  }
//#endregion Common Metods

  //#region Preview section
  async openPreview(){
    if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
      await this.workSpaceService.dynamicComponent_Clone.instance.updateContent();
    }
    this.workSpaceService.isPreviewMode = true;
    this.workSpaceSignalRService.stopConnection();

    const isTemplate = this.workSpaceService.isTemplate;
    const navigationParams = {
      queryParams: {
        id: this.workSpaceService.presentationId,
        slideid: this.workSpaceService.activeSlideId,
        ...(isTemplate && { isTemplate })
      }
    };
    this._router.navigate(['/WorkSpace/preview'], navigationParams);
  }
  //#endregion Preview section


}
