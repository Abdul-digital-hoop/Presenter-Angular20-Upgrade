// ? Angular Import
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild, Inject } from '@angular/core';
// ? Custom Service Import
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { CommonConfig, MasterSlideTypeName, VisualizationSlideType } from 'src/app/utility/constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { trigger } from '@angular/animations';
import { CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { Router } from '@angular/router';
declare var $: any;
@Component({
    selector: 'app-left-side-bar',
    templateUrl: './left-side-bar.component.html',
    styleUrls: ['./left-side-bar.component.scss'],
    standalone: false
})
export class LeftSideBarComponent implements OnInit {
  commonConfig = CommonConfig;
  masterSlideTypeName = MasterSlideTypeName;
  isShowSlideAction: boolean = false;
  slideActionPopupTop: number;  // In Pixel
  slideActionPopupLeft: number; // In Pixel
  presentationId: any = "";
  activeSlideId: any = "";
  slideListArray: any[] = [];
  currentSlideId:any="";
  nextSlideId:any=0;
  perviousSlideId:any=0;
  closeModal: boolean = false;
  @ViewChild('importButton') importButton: ElementRef;
  @ViewChild('dragBoundary', { static: true }) dragBoundary: ElementRef;
  @Output() public slideTypeName: EventEmitter<any> = new EventEmitter<any>();
  @Output() public contentChanged: EventEmitter<any> = new EventEmitter<any>();
  profileImageURL: any;
  userName: any;
  errorMessage: string | null = null;
  ErrorTitle: string | null = null;
  isLoadingshow: boolean;
  deleteIndex: number;
  backgroundImageStyle: any;
  activeslideTypeName: any;
  pageCount: number | null = null;
  private scrollThreshold = 20;
  isDeletePopupVisible: boolean =false;
  isConfirmDeletePopupVisible: boolean = false;
  fileBytes: ArrayBuffer;
  @ViewChild('popup') popupElement!: ElementRef;
  marginTop: string = '0px';
  isResetPopupVisisble: boolean = false;
  isConfirmResetPopupVisible:boolean = false;
  customerPlan:CustomerPlan;
  isLoadingCreateSlide:boolean = false;
  isHovered: boolean = false;
  draggedSlideIndex: number = -1;
  imageType: any;
  slidePdfImage: any;
  activePptImage: boolean=false;
  showPdf: boolean=false;
  @ViewChild('slideImage') slideImage: ElementRef<HTMLImageElement>;
  hoveredQuizSlideType: any | null = null;
  hoveredPopularSlideType: any | null = null;
  hoveredInstructionSlide: boolean = false;
  @Input() showCreatedWithAiModal: boolean = false;
  private autoScrollInterval: any;
  private readonly SCROLL_THRESHOLD = 50; // pixels from top/bottom to trigger scroll
  private readonly SCROLL_SPEED = 10; // pixels per scroll interval
  private readonly SCROLL_INTERVAL = 50; // milliseconds between scrolls
  isImportModalOpen: boolean = false;
  constructor(
    public presentationService: PresentationService,
    public workSpaceService:WorkspaceService,
    public _commanService:CommanService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private renderer: Renderer2,
    public _customerPlanService: CustomerPlanService,
    private router: Router
  ){
    //this.workSpaceService.presentationId = localStorage.getItem("presentationId");
    this.customerPlan = this._customerPlanService.getCustomerPlan();
  }
  //#region LifeCycle Hooks
    ngOnChanges() {
    }
    
    ngOnInit() {
      this.imageType = this.workSpaceService.slideLayoutType;
      // console.log("AppComponent: OnInit");
      // ? GetSlideDetailList For Initial Binding
     // this.getSlideDetailList();
     var userDetails = localStorage.getItem('userData');
      if (userDetails) {
        const userData = JSON.parse(userDetails);
        if(userData.ProfileImgUrl){
          this.profileImageURL = userData.ProfileImgUrl;
        }else{
          if (userData.ProfileSecondName) {
            this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
          } else {
            this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase();
          }
        }
      }
      const storedActiveSlideId = this.workSpaceService.activeSlideId;
    if (storedActiveSlideId) {
      this.activeSlideId = storedActiveSlideId;
      this.currentSlideId = this.activeSlideId;

      const slideListArray = this.workSpaceService.slideListArray;
      const index = slideListArray.findIndex(slide => slide.slideId === this.activeSlideId);

      if (index !== -1) {
        this.activeSlide(this.activeSlideId, slideListArray[index].slideTypeId, index);
      }
    }
    
      if (this.showCreatedWithAiModal) {
        this.openCreatedWithAiModal();
      }
    }

    ngDoCheck() {
      // console.log("AppComponent: DoCheck");
    }

    ngAfterContentInit() {
      // console.log("AppComponent: AfterContentInit");
    }

    ngAfterContentChecked() {
      if(this.activeslideTypeName === "Import Document"){
          this.imageType = 'Full Image';
      }
      this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
      this.loadBGLayout();
    }
    ngAfterViewInit() {
      // console.log("AppComponent:AfterViewInit");
      if(this.workSpaceService.currentMasterSlideTypeId == ""){
        if (this.importButton) {
          this.importButton.nativeElement.click();
        }
      }
      $("body").tooltip({ selector: '[data-bs-toggle=tooltip]', trigger: 'hover'});
      // this.slidePdfImage.nativeElement.onload = () => {
      //   this.checkImageOrientation();
      // };
    }

    ngAfterViewChecked() {
      this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
      if(this.activeslideTypeName === "Import Document"){
        this.loadBGLayout();
      }
      // console.log("AppComponent:AfterViewChecked");
    }
    handleViewChecked() {
      if(this.activeslideTypeName === "Import Document"){
        this.loadBGLayout();
      }
    }
    ngOnDestroy() {
      //  console.log("AppComponent:OnDestroy");
      $("body").tooltip('dispose');
    }
  //#endregion LifeCycle Hooks

  //#region Component Level functions
   //#region API Call

    /**
     * * New Slide Create
     * ? Methods Trigger When you click the New Slide Button
     * todo: After API Call we store the active slideIn LocalStroage and store the Active Slide detail in Workspace Service
     * @param slideTypeId pass masterSlideTypeId (eg:Multiple Choice SlideType Id)
     */
    newSlide(slideTypeId: any) {
      if(this.workSpaceService.slideCountWithoutLeaderboard < this.customerPlan?.slide_types_per_presentation){
        var isNotImport = this.workSpaceService?.masterImportSlideType.findIndex(x=>x.id == slideTypeId);
        var access = true;
        if(isNotImport != -1){
          if(this.workSpaceService.slideCountForImport < this.customerPlan?.import_presentations){
            access = true;
          }else{
            access = false;
          }
        }
        if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
           this.workSpaceService.dynamicComponent_Clone.instance.updateContent();
        }
        if(access){
          if (this.workSpaceService.presentationId != null) {
            if(this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
              var currentSlideIndex = this.workSpaceService.currentSlideIndex + 3;
            }else{
              var currentSlideIndex = this.workSpaceService.currentSlideIndex + 2;
            }
            var obj = {
              presentationId: this.workSpaceService.presentationId,
              slideTypeId: slideTypeId,
              isTemplate:this.workSpaceService.isTemplate,
              index: currentSlideIndex
            };
            if(this.isLoadingCreateSlide == true){
              return;
            }
            this.isLoadingCreateSlide = true;
            this.presentationService.createNewSlide(obj).subscribe(
              (response: any) => {
                if(response){
                  this.workSpaceService.currentPresentation.slides.forEach(slide => {
                    if (slide.index >= response.index) {
                      slide.index += 1;
                    }
                  });
                this.workSpaceService.currentPresentation.slides.push(response);
                this.workSpaceService.currentPresentation.slides.sort((a,b)=>a.index - b.index);
                this.workSpaceService.slideListArray = this.workSpaceService.currentPresentation.slides;
                this.workSpaceService.currentPresentation.activeSlideId = response?.slideId;
                this.workSpaceService.currentPresentation.activeSlideTypeName = response?.slideTypeName;
                this.workSpaceService.currentMasterSlideTypeId = response?.slideTypeId;
                this.isLoadingCreateSlide = false;
                this.workSpaceService.activeSlideId = response?.slideId;
                this.workSpaceService.isAllowedChangesforOptions = true;
                this.workSpaceService.isAllowedChangesforguesstheNumber = true; 
                this.workSpaceService.assignNewValueOnStore(this.workSpaceService.currentPresentation).then(() => {
                  this.contentChanged.emit("content");  
                  //this.scrollDown();
                });
              }
              },  
              (error: any) => {
                console.log(error?.error);
                this.isLoadingCreateSlide = false;
              }
            );
          }
        }else{
          this.toastr.info("Upgrade your plan now to access more slides.", "", {
            timeOut: 3000,
          });
          this.isLoadingCreateSlide = false;
        }
      }else{
        this.toastr.success('Slide limit reached. Please remove some slides to add more.', "", {
          timeOut: 3000,
        });
        this.isLoadingCreateSlide = false;
      }
    }
    newQuizSlide(slideTypeId: any) {
      if(this.customerPlan?.quiz_per_presentation > this.workSpaceService.quizSlidesCount && this.workSpaceService.slideCountWithoutLeaderboard < this.customerPlan?.slide_types_per_presentation){
        if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
          this.workSpaceService.dynamicComponent_Clone.instance.updateContent();
       }
        if (this.workSpaceService.presentationId != null) {
          if(this.workSpaceService.slideContentType === this.workSpaceService.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
            // Check if the next slide after current quiz is its respective leaderboard
            const nextSlideIndex = this.workSpaceService.currentSlideIndex + 1;
            const nextSlide = this.workSpaceService.currentPresentation.slides[nextSlideIndex];
            
            if(nextSlide && nextSlide.slideTypeName === this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
              // If next slide is leaderboard, add after it
              var currentSlideIndex = this.workSpaceService.currentSlideIndex + 3;
            }else{
              // If next slide is not leaderboard, add immediately after current quiz
              var currentSlideIndex = this.workSpaceService.currentSlideIndex + 2;
            }
          }else{
            var currentSlideIndex = this.workSpaceService.currentSlideIndex + 2;
          }
          var obj = {
            presentationId: this.workSpaceService.presentationId,
            slideTypeId: slideTypeId,
            isTemplate:this.workSpaceService.isTemplate,
            index: currentSlideIndex
          };
          if(this.isLoadingCreateSlide == true){
            return;
          }
          this.isLoadingCreateSlide = true;
          this.presentationService.createQuizNewSlide(obj).subscribe(
            (response: any) => {
              if(response){
                this.workSpaceService.currentPresentation.slides.forEach(slide => {
                  if (slide.index >= response['data'].slideData[0].index) {
                    slide.index += 2;
                  }
                });
                this.workSpaceService.currentPresentation.slides = [
                  ...this.workSpaceService.currentPresentation.slides,
                  ...response['data'].slideData
                ];
                this.workSpaceService.currentPresentation.slides.sort((a,b)=>a.index - b.index);
                this.workSpaceService.slideListArray = this.workSpaceService.currentPresentation.slides;
                this.workSpaceService.currentPresentation.leaderBoard = response['data'].presentationLeaderBoard;
                this.workSpaceService.currentPresentation.activeSlideId = response['data'].slideData[0]?.slideId;
                this.workSpaceService.currentPresentation.activeSlideTypeName = response['data'].slideData[0]?.slideTypeName;
                this.workSpaceService.currentMasterSlideTypeId = response['data'].slideData[0]?.slideTypeId;
                this.isLoadingCreateSlide = false;
              //localStorage.setItem('activeSlideId',response?.activeSlideId);
              this.workSpaceService.activeSlideId = response['data'].slideData[0]?.slideId;
              this.workSpaceService.isAllowedChangesforOptions = true; // for option component new options update
              this.workSpaceService.isAllowedChangesforguesstheNumber = true; 
              this.workSpaceService.assignNewValueOnStore(this.workSpaceService.currentPresentation).then(() => {
                this.contentChanged.emit("content");  
                // this.scrollDown();
              });
            }else{
              this.isLoadingCreateSlide = false;
            }
            },
            (error: any) => {
              console.log(error?.error);
              this.isLoadingCreateSlide = false;
            }
          );
        }
      }else{
        if(this.customerPlan?.quiz_per_presentation <= this.workSpaceService.quizSlidesCount){
          this.toastr.info("Upgrade your plan now to access more slides.", "", {
            timeOut: 3000,
          });
          this.isLoadingCreateSlide = false;
        }else{
          this.toastr.success('Slide limit reached. Please remove some slides to add more.', "", {
            timeOut: 3000,
          });
          this.isLoadingCreateSlide = false;
        }
      }
    }
    /**
     * * GetSlideDetailsList for Initial Binding
     * ? The method triggers when the page loads for initial binding.
     * todo:After The API call We store the ActiveSlide and SlideListArray in local Variable and service.
     */
    getSlideDetailList(){
      this.presentationService.getSlideDetailList(this.workSpaceService.presentationId).subscribe(
        (response: any) => {
        //  localStorage.setItem('activeSlideId',response?.activeSlideId);
        this.workSpaceService.activeSlideId = response?.activeSlideId;
          this.activeSlideId = response?.activeSlideId;
          this.slideListArray = response?.slide;
          this.workSpaceService.activeSlideId = this.activeSlideId;
          this.workSpaceService.slideListArray = this.slideListArray;
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    importSlide() {

    }
    listingAllSlides() {

    }
    showtheSlideOptions() {

    }
    copyToSlide() {

    }
    duplicateSlide() {

    }
    resetResult() {

    }
    /**
     * * Delete Slide 
     * ? Delete slide via slide Actions popup
     * todo:After API Call we store the active slideIn LocalStroage and store the Active Slide detail in Workspace Service
     */
    deleteSlide(index: number): void {
      const slideListArray = this.workSpaceService.slideListArray;
      const deletedSlideId = slideListArray[index].slideId;
      this.activeSlideId = this.workSpaceService.activeSlideId;
      const currentIndex = slideListArray.findIndex(slide => slide.slideId === this.activeSlideId);
      let newActiveSlideId: number | null = null;
      if (this.activeSlideId === deletedSlideId) {
        if (slideListArray.length === 1) {
          newActiveSlideId = null;
        } else if (index === slideListArray.length - 1) {
          newActiveSlideId = slideListArray[index - 1]?.slideId ?? null;
        } else if (index === 0) {
          if(this.masterSlideTypeName.QUIZ === this.workSpaceService.slideContentType && this.workSpaceService.activeSlideTypeName != this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
            newActiveSlideId = slideListArray[index + 2]?.slideId ?? null;
          }else{
            newActiveSlideId = slideListArray[index + 1]?.slideId ?? null;
          }
        } else {
          newActiveSlideId = slideListArray[index - 1]?.slideId ?? null;
        }
      } else {
        newActiveSlideId = this.activeSlideId;
      }
      const nextActiveSlide = this.workSpaceService.slideListArray.find(x=>x.slideId == newActiveSlideId);
       if(slideListArray[index].contentType == this.workSpaceService.masterSlideTypeName.QUIZ){
        if(slideListArray[index].slideTypeName != this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
          var leaderboarddata = slideListArray.find(slide => slide.parentId == deletedSlideId);
          if(leaderboarddata?.slideId == newActiveSlideId){
            if(leaderboarddata.index == 1 ){
              newActiveSlideId = slideListArray[index +1].slideId;
            }else{
              newActiveSlideId = this.findFirstAvailableSlideId(slideListArray, deletedSlideId, newActiveSlideId);
            }
          }
        }
      }
      const nextSlideQuestion = this.workSpaceService.changeQuestionDataFormat(nextActiveSlide?.slideContentData);
      const deleteSlidePayload = {
        presentationId: this.workSpaceService.presentationId,
        slideId: deletedSlideId,
        activeSlideId: newActiveSlideId,
        isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.deleteWorkSpaceSlide(deleteSlidePayload).subscribe(
        (response: any) => {
          this.workSpaceService.questions = nextSlideQuestion;
          this.workSpaceService.currentPresentation = response;
          this.workSpaceService.currentPresentation.slides = response?.slides.sort((a,b)=>a.index - b.index);
          this.workSpaceService.currentPresentation.activeSlideTypeName = response?.activeSlideTypeName;
          this.workSpaceService.slideListArray = response?.slides.sort((a,b)=>a.index - b.index);
          this.workSpaceService.currentActiveSlide = this.workSpaceService.slideListArray?.length > 0 ? this.workSpaceService.slideListArray.find(x => x.slideId == newActiveSlideId) : null;
          this.isShowSlideAction = false;
          this.isDeletePopupVisible = false;
          this.isConfirmDeletePopupVisible = false;
          slideListArray.splice(index, 1);
          this.workSpaceService.currentPresentation.activeSlideId = newActiveSlideId;
          this.workSpaceService.currentMasterSlideTypeId = this.workSpaceService.currentPresentation.slides.find(x=>x.slideId == newActiveSlideId)?.slideTypeId;
          this.workSpaceService.slideCount = this.workSpaceService.currentPresentation.slides.length;
          this.workSpaceService.slideCountWithoutLeaderboard = this.workSpaceService.currentPresentation.slides.filter(x=>x.slideTypeName != this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE)?.length;
          if (slideListArray.length === 0) {
            this.activeSlideId = null;
            this.currentSlideId = null;
            localStorage.removeItem('activeSlideId');
          } else {
            localStorage.removeItem('activeSlideId');
            if (newActiveSlideId !== null) {
              this.workSpaceService.activeSlideId = newActiveSlideId.toString();
            }
          }
          this.workSpaceService.isAllowedChangesforguesstheNumber = true;
          this.workSpaceService.isAllowedChangesforOptions = true;
          this.workSpaceService.assignNewValueOnStore(this.workSpaceService.currentPresentation).then(() => {
            this.contentChanged.emit("content"); 
          });
        },
        (error: any) => {
          console.error('Error deleting slide:', error);
        }
      );
    }
   
  /**
   * * Active Slide
   * ? Method Trigger When you the particular slide
   * @param slideId Pass a Slide for active the slide purpose
   * todo: Store the ActiveSlideId in local and Service and currentMasterSlideTypeId
   */
  activeSlide(slideId: any, slideTypeId: any, index: number) {
    if (this.workSpaceService.activeSlideId == slideId) {
      return;
    }
    this.workSpaceService.setCenterPanelLoading(true);
    if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
      this.workSpaceService.dynamicComponent_Clone.instance.updateContent();
   }
    this.activeSlideId = slideId;
    this.currentSlideId = this.activeSlideId;
   this.workSpaceService.activeSlideId = slideId;
   this.workSpaceService.questions = "";
    this.workSpaceService.isAllowedChangesforguesstheNumber = true;
    this.workSpaceService.changeSlideFlag = true;
    this.workSpaceService.changeSlideData().subscribe(
      (response: any) => {
        this.workSpaceService.isAllowedChangesforguesstheNumber = true;
        this.workSpaceService.isAllowedChangesforOptions = true;
        let presentationData = response['data'];
        this.workSpaceService.activeSlideId = presentationData?.activePresentationData.activeSlideId;
        this.workSpaceService.currentMasterSlideTypeId = presentationData?.masterSlideTypeId;
        this.workSpaceService.currentPresentation.activeSlideId = presentationData?.activePresentationData.activeSlideId;
        this.workSpaceService.currentPresentation.activeSlideTypeName = presentationData?.activePresentationData.activeSlideTypeName;
        var slideIndex = this.workSpaceService.currentPresentation.slides.findIndex(x=>x.slideId == this.workSpaceService.activeSlideId);
        this.workSpaceService.currentPresentation.slides[slideIndex] = presentationData?.activePresentationData?.slides[0];
        this.workSpaceService.isAllowedChangesforguesstheNumber = false;
         this.workSpaceService.updateSlideData(presentationData);
         this.workSpaceService.setCenterPanelLoading(false);
      },
      (error: any) => {
        this.workSpaceService.changeSlideFlag = false;
        console.log(error);
      }
    )
    if(this.workSpaceService.uploadImageSlideId === this.workSpaceService.activeSlideId){
      this.workSpaceService.setLoading(true);
    }else{
      this.workSpaceService.setLoading(false);
    }
  }
  //#endregion API Call

  showHidePanel(){
    this.closeModal = !this.closeModal;
    this._commanService.SetCloseModal(this.closeModal);
    $('.btn-class-panel').toggleClass('show')
    $('.left-panel-before').toggleClass('show')
  }

  //#region Without API Call
    // Show Slide Actions 

    /**
     * * showPopover
     * ? Show slide Action Popup
     * @param event Sent event for popup height and top Fixing
     * @param currentSlideId sent a selected slideId
     * @param nextSlideId Sent a nextSlideId from your selectedSlide Id
     * @param perivousSlideId Sent a perviousSlideId from your selectedSlide Id
     */
    showPopover(event: MouseEvent, currentSlideId: any, nextSlideId: any, perivousSlideId: any, index: number, slide: any) {
      this.activeSlide(slide?.slideId, slide?.slideTypeId, index);
      this.currentSlideId = currentSlideId;
      this.nextSlideId = nextSlideId;
      this.perviousSlideId = perivousSlideId;
      this.isShowSlideAction = true;
      this.isConfirmDeletePopupVisible = false;
      this.isDeletePopupVisible = false;
      this.isResetPopupVisisble = false;
      this.isConfirmResetPopupVisible = false;
      this.deleteIndex = index;
  
      const buttonPosition = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.slideActionPopupTop = buttonPosition.top + window.scrollY -17;
      this.slideActionPopupLeft = buttonPosition.left + window.scrollX +35;
  
      setTimeout(() => {
          this.adjustDeletePopupPosition();
      }, 0);
      event.preventDefault();
      event.stopPropagation();
  }
    slideTypeLevelFunctionality()
    {
      let slideTypeName = this.workSpaceService.activeSlideTypeName;
      switch(slideTypeName) {
        case this.workSpaceService.masterSlideTypeName.SELECT_ANSWER_SLIDE_TYPE:
          this.workSpaceService.correctOptionValidations();
          this.workSpaceService.stopQuizMusic();
          break;
          case this.workSpaceService.masterSlideTypeName.TYPE_ANSWER_SLIDE_TYPE:
            this.workSpaceService.stopQuizMusic();
            break;
      }
      
    }
  //#endregion Without API Call

  //#endregion Component Level functions

  //#region Common Methods
    /**
     * ? Hide the Slide Actions Popup When click the document
     * @param event 
     */
    @HostListener('document:click', ['$event'])
    RightSideBar(event: MouseEvent) {
      if (!(event.target instanceof HTMLElement) || !event.target.closest('button')) {
        this.isShowSlideAction = false;
      }
      else{
        this.isShowSlideAction = false;
      }
    }
    onScroll() {
      const element = document.querySelector('.right-panel-thumbnail') as HTMLElement;

      if (element) {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        if (scrollTop > this.scrollThreshold) {
        this.isShowSlideAction = false;
        this.isConfirmDeletePopupVisible = false;
        this.isDeletePopupVisible = false;
      }
      }
    }

    //  SVG load left slide
    sanitizeSvg(svgContent: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(svgContent);
    }
  getMasterLayoutData(id: any) {
    var layout = this.workSpaceService.getMasterLayoutData(id);
    return layout?.layoutType;
  }
  //#endregion Common Metods
  onDrop(event: DragEvent): void {
    event.preventDefault();
  //  this.onDragLeave(event);
    if (event.dataTransfer?.files) {
      this.addFiles(event);
    }
  }
  async addFiles(event: any) {
    if(this.workSpaceService.slideCountForImport < this.customerPlan.import_presentations){
      const selectedFile: File = event.dataTransfer?.files[0];
      if (selectedFile) {
      
        const fileNameWithoutExtension: string = selectedFile.name.replace(/\.[^/.]+$/, ""); 
        const fileExtension: string = selectedFile.name.split('.').pop()!.toLowerCase();
        const allowedExtensions: string[] = ['ppt', 'pptx', 'pdf'];
        const maxFileSizeMB: number = 10;
        let trimmedFileName: string = fileNameWithoutExtension;
        if (fileNameWithoutExtension.length > 130) {
          var excessLength = fileNameWithoutExtension.length - 130;
          trimmedFileName = fileNameWithoutExtension.slice(0, fileNameWithoutExtension.length - excessLength);
      }
      if(this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
        var currentSlideIndex = this.workSpaceService.currentSlideIndex + 3;
      }else{
        var currentSlideIndex = this.workSpaceService.currentSlideIndex + 2;
      }
        if (!allowedExtensions.includes(fileExtension)) {
          this.errorMessage = `Invalid file type! You can only upload files with the following extensions: .ppt, .pptx, and .pdf.`;
        } else if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
          this.errorMessage = `Uh-oh, it appears that the file is too large. Each file should be less than 10 MB.`;
        } else if(fileExtension == 'pdf') {
          const pageCount = await this.getPdfPageCount(selectedFile);
          const slideCount = this.workSpaceService.slideCountWithoutLeaderboard;
          const balSlideCount = this.customerPlan?.slide_types_per_presentation - slideCount;
          if(balSlideCount == 0){
            this.errorMessage = `Looks like your file is too large! Only ${this.customerPlan?.import_presentations - this.workSpaceService.slideCountForImport} slides can be uploaded.`;
            // $('#importSlideModal').modal('hide');
            // this.toastr.success('You have reached the maximum number of Slides', "", {
            //   timeOut: 3000,
            // });
            return;
          }
          this.errorMessage = null;
          this.isLoadingshow = true;
            const formData1 = new FormData();
            formData1.append('file', selectedFile);
            formData1.append('presentationid', this.workSpaceService.presentationId);
            formData1.append('slideIndex', this.workSpaceService.currentActiveSlide?.index ?? 0);
            formData1.append('fileType', fileExtension);
            formData1.append('filename',trimmedFileName);
            formData1.append('isTemplate',this.workSpaceService.isTemplate.toString());
            const slideId = this.workSpaceService.activeSlideId ?? ""; 
            formData1.append('slideId', slideId);
            formData1.append('index', currentSlideIndex.toString());
            this.presentationService.ImportFile(formData1).subscribe(
              (response: any) => {
              //  localStorage.setItem('activeSlideId',response.activeSlideId);
              this.workSpaceService.activeSlideId = response.activeSlideId;
                this.workSpaceService.storeActiveSlideDetails().then(() => {
                  const slideTypeId = this.workSpaceService.slideListArray.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
                  this.slideTypeName.emit(slideTypeId);
                  this.contentChanged.emit("content"); 
                  this.scrollDown(); 
                }).catch((error) => {
                  console.error('Error in storeActiveSlideDetails(): ', error);
                });
                $('#importSlideModal').modal('hide');
                $('#importSuccessModel').modal('show');
                //this.presentationDetails = response;
                //this.GetPresentationId(this.workSpaceService.presentationId);
                this.isLoadingshow = false;
                event.target.value = '';
              },
              (error: any) => {
                event.target.value = '';
                this.isLoadingshow = false;
                $('#importSlideModal').modal('hide');
                console.log(error);
              }
            );
          // };
          // reader.readAsDataURL(selectedFile); 
        }
        else if (fileExtension == 'ppt' || fileExtension == 'pptx') {
          this.errorMessage = null;
          const formData1 = new FormData();
          formData1.append('inputFile', selectedFile);
          formData1.append('PresentationId', this.workSpaceService.presentationId);
          formData1.append('slideId',this.workSpaceService.activeSlideId);
          formData1.append('isTemplate',this.workSpaceService.isTemplate.toString());
          formData1.append('index', currentSlideIndex.toString());
          this.isLoadingshow = true;
          //var totalslidecount = this.presentationDetails?.slide?.length;
          this.presentationService.convertPPTtoPNG(formData1).subscribe((response: any) => {
            //localStorage.setItem('activeSlideId',response.activeSlideId);
            this.workSpaceService.activeSlideId = response.activeSlideId;
            this.workSpaceService.storeActiveSlideDetails().then(() => {
              const slideTypeId = this.workSpaceService.slideListArray.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
              this.slideTypeName.emit(slideTypeId);
              this.contentChanged.emit("content");  
              this.scrollDown();
            }).catch((error) => {
              console.error('Error in storeActiveSlideDetails(): ', error);
            });
            $('#importSlideModal').modal('hide');
            $('#importSuccessModel').modal('show');
            //this.presentationDetails = response;
          // this.GetPresentationId(this.workSpaceService.presentationId);
            this.isLoadingshow = false;
            event.target.value = '';
          },
          (error: any) => {
          //   event.target.value = '';
          //   console.log(error);
          //   const errormessage = "Uh-oh, it looks like you've reached the limit. You can only add up to 10 slides" ;
          //   if (errormessage === error){
          //     this.isLoadingshow = false;
          //     this.errorMessage =  error;
          //   }
          //  else{
          //   this.isLoadingshow = false;
          //   $('#importSlideModal').modal('hide');
          //  }
          this.isLoadingshow = false;
          this.errorMessage =  error;
          });
        }
      }
    }else{
      $("#importSlideModal").modal("hide");
      this.toastr.error("Upgrade your plan now to access more slides.", "", {
          timeOut: 3000,
        });
    }
    
  }
 async  onFileSelected(event: any) {
  if(this.workSpaceService.slideCountForImport < this.customerPlan.import_presentations){
    const selectedFile: File = event.target.files[0];
    if (selectedFile) {
      const fileNameWithoutExtension: string = selectedFile.name.replace(/\.[^/.]+$/, ""); 
      const fileExtension: string = selectedFile.name.split('.').pop()!.toLowerCase();
      const allowedExtensions: string[] = ['ppt', 'pptx', 'pdf'];
      const maxFileSizeMB: number = 10;
      let trimmedFileName: string = fileNameWithoutExtension;
      if (fileNameWithoutExtension.length > 130) {
        var excessLength = fileNameWithoutExtension.length - 130;
        trimmedFileName = fileNameWithoutExtension.slice(0, fileNameWithoutExtension.length - excessLength);
    }
    if(this.workSpaceService.slideContentType == this.workSpaceService.masterSlideTypeName.QUIZ && this.workSpaceService.activeSlideTypeName != this.workSpaceService.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE){
      var currentSlideIndex = this.workSpaceService.currentSlideIndex + 3;
    }else{
      var currentSlideIndex = this.workSpaceService.currentSlideIndex + 2;
    }
      if (!allowedExtensions.includes(fileExtension)) {
        this.ErrorTitle = `Invalid file format.`;
        this.errorMessage = `Please upload a file that is either in PPTX, PPT, or PDF format.`;
       } else if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
        this.ErrorTitle = `Upload failed`
         this.errorMessage = `File too large! You can only upload files up to 10 MB.`;
       }
       else if(fileExtension == 'pdf') {
        const pageCount = await this.getPdfPageCount(selectedFile);
        const slideCount = this.workSpaceService.slideCountWithoutLeaderboard;
        const balSlideCount = this.customerPlan?.slide_types_per_presentation - slideCount;
        if(balSlideCount == 0 ){
          this.errorMessage = `Looks like your file is too large! Only ${this.customerPlan?.import_presentations - this.workSpaceService.slideCountForImport} slides can be uploaded.`;
          // $('#importSlideModal').modal('hide');
          // this.toastr.success('You have reached the maximum number of Slides', "", {
          //   timeOut: 3000,
          // });
           return;
        }
        this.errorMessage = null;
        this.ErrorTitle = null;
        this.isLoadingshow = true;

        const formData1 = new FormData();
        formData1.append('file', selectedFile);
        formData1.append('presentationid', this.workSpaceService.presentationId);
        formData1.append('slideIndex', this.workSpaceService.currentActiveSlide?.index ?? 0);
        formData1.append('fileType', fileExtension);
        formData1.append('filename',trimmedFileName);
        formData1.append('isTemplate',this.workSpaceService.isTemplate.toString());
        const slideId = this.workSpaceService.activeSlideId ?? ""; 
        formData1.append('slideId', slideId); 
        formData1.append('index', currentSlideIndex.toString());
          this.presentationService.ImportFile(formData1).subscribe(
            (response: any) => {
             // localStorage.setItem('activeSlideId',response.activeSlideId);
             this.workSpaceService.activeSlideId = response.activeSlideId;
              this.workSpaceService.storeActiveSlideDetails().then(() => {
                const slideTypeId = this.workSpaceService.slideListArray.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
                this.slideTypeName.emit(slideTypeId);
                this.contentChanged.emit("content"); 
                this.scrollDown(); 
              }).catch((error) => {
                console.error('Error in storeActiveSlideDetails(): ', error);
              });
              $('#importSlideModal').modal('hide');
              $('#importSuccessModel').modal('show');
              //this.presentationDetails = response;
              //this.GetPresentationId(this.workSpaceService.presentationId);
              this.isLoadingshow = false;
              event.target.value = '';
            },
            (error: any) => {
              event.target.value = '';
              this.isLoadingshow = false;
              $('#importSlideModal').modal('hide');
              console.log(error);
            }
          );
        // };
        // reader.readAsDataURL(selectedFile); 
      }
      else if (fileExtension == 'ppt' || fileExtension == 'pptx') {
        this.errorMessage = null;
        this.ErrorTitle = null;
        const formData1 = new FormData();
        formData1.append('inputFile', selectedFile);
        formData1.append('PresentationId', this.workSpaceService.presentationId);
        const slideId = this.workSpaceService.activeSlideId ?? "";
        formData1.append('slideId', slideId);
        formData1.append('isTemplate',this.workSpaceService.isTemplate.toString());
        formData1.append('index', currentSlideIndex.toString());
        this.isLoadingshow = true;
        //var totalslidecount = this.presentationDetails?.slide?.length;
        this.presentationService.convertPPTtoPNG(formData1).subscribe((response: any) => {
        //  localStorage.setItem('activeSlideId',response.activeSlideId);
        this.workSpaceService.activeSlideId = response.activeSlideId;
          this.workSpaceService.storeActiveSlideDetails().then(() => {
            const slideTypeId = this.workSpaceService.slideListArray.find(x => x.slideId === response.activeSlideId)?.slideTypeId;
            this.slideTypeName.emit(slideTypeId);
            this.contentChanged.emit("content");  
            this.scrollDown();
          }).catch((error) => {
            console.error('Error in storeActiveSlideDetails(): ', error);
          });
          $('#importSlideModal').modal('hide');
          $('#importSuccessModel').modal('show');
          //this.presentationDetails = response;
         // this.GetPresentationId(this.workSpaceService.presentationId);
          this.isLoadingshow = false;
          event.target.value = '';
        },
          (error: any) => {
              this.isLoadingshow = false;
              this.errorMessage =  error;
          });
        }
    }
  }else{
    $("#importSlideModal").modal("hide");
    this.toastr.error("Upgrade your plan now to access more slides.", "", {
        timeOut: 3000,
      });
  }
  }
  
  getPdfPageCount(file: File): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const text = this.arrayBufferToString(uint8Array);
          const regex = /\/Type\s*\/Page\b/g;
          const matches = text.match(regex);
          const pageCount = matches ? matches.length : null;
          resolve(pageCount);
        } catch (error) {
          reject('Error parsing PDF content: ' + error);
        }
      };
      reader.onerror = (error) => {
        reject('Error reading file: ' + error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  arrayBufferToString(buffer: Uint8Array): string {
    return new TextDecoder('utf-8').decode(buffer);
  }
  preventDrag(event: DragEvent): void {
    event.preventDefault();
  }
  closeimportModel(){
    this.errorMessage = '';
    this.isImportModalOpen = false;
  }
  loadBGLayout() {
    if (this.activeslideTypeName === 'Import Document') {
      const pptImage = this.workSpaceService.slidePptImage;
      this.backgroundImageStyle = {
        'background-image': `url(${pptImage})`
      };
    } else {
      this.backgroundImageStyle = {};
    }
  }
  loadBGLayoutForslideImages(imageURL:any) {
    // if(this.activeslideTypeName === "Import Document" && this.workSpaceService.isPdf === false ){
    //   this.imageType == 'Full Image'
    //   const pptImage = this.workSpaceService.slidePptImage;
    //   this.showPdf = false;
    //   this.activePptImage = true;
    //   return {
    //     backgroundImage: `url(${pptImage})`,
    //   };
    // }
    
    if (this.activeslideTypeName === "Import Document") {
      this.activePptImage = true;
      this.showPdf = true;
      this.slidePdfImage = this.workSpaceService.slidePptImage
      var defaultImageUrl = "/assets/images/static_bg_image.svg";
      var fullImageUrl = imageURL;
      if (this.workSpaceService.activeSlideId === '') {
        this.imageType = 'Default';
        this.workSpaceService.slideLayoutType = this.imageType;
      }
      else {
        this.imageType = this.workSpaceService.slideLayoutType;
      }
      const finalImageUrl = fullImageUrl ?? defaultImageUrl;
      return {
        backgroundImage: `url(${finalImageUrl})`,
      };
    }
    else {
      this.activePptImage = false;
      this.showPdf = false;
      var defaultImageUrl = "/assets/images/static_bg_image.svg";
      var fullImageUrl = imageURL;
      if (this.workSpaceService.activeSlideId === '') {
        this.imageType = 'Default';
        this.workSpaceService.slideLayoutType = this.imageType;
      }
      else {
        this.imageType = this.workSpaceService.slideLayoutType;
      }
      const finalImageUrl = fullImageUrl ?? defaultImageUrl;
      return {
        backgroundImage: `url(${finalImageUrl})`,
      };
    }

  }
  truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
  getSlidePptImage(slide: any): string | null {
    if (slide.slideTypeName !== 'Import Document') {
      return null;
    }
    
    const contentData = slide.slideContentData.find((data: any) => data.name === 'contentData');
    if (contentData && Array.isArray(contentData.value)) {
      const imageData = contentData.value.find((item: any) => item.name === 'slideImage');
      if (imageData) {
        return imageData.value;
      }
    }
    return null;
  }
  
  getAboutSlide(slide: any): string | null {
    const contentData = slide.slideContentData.find((data: any) => data.name === 'contentData');
    if (contentData && Array.isArray(contentData.value)) {
      const imageData = contentData.value.find((item: any) => item.name === 'aboutSlide');
      if (imageData) {
        return imageData.value;
      }
    }
    return null;
  }

  //#region slide drag and drop
  drop(event: CdkDragDrop<string[]>) {
    const { currentIndex, previousIndex, dropPoint } = event;
    
    // Check if the indices are the same, if so, do nothing
    if (currentIndex === previousIndex) {
      document.body.style.cursor = 'default';
      this.resetHighlight();
      return;
    }

    // Get the actual target position based on dropPoint
    const dragBoundary = document.querySelector('.right-panel-thumbnail');
    if (dragBoundary) {
      const boundaryRect = dragBoundary.getBoundingClientRect();
      const scrollTop = dragBoundary.scrollTop;
      const relativeY = dropPoint.y - boundaryRect.top + scrollTop;
      const slideItems = dragBoundary.querySelectorAll('.thumbnail-oderlist-item, .cdk-drag-preview');
      let calculatedIndex = currentIndex;
      let foundTargetIndex = false;
      
      if (slideItems.length > 0) {
        let accumulatedHeight = 0;
        
        for (let i = 0; i < slideItems.length; i++) {
          const itemRect = slideItems[i].getBoundingClientRect();
          const itemHeight = itemRect.height;
          const itemTop = itemRect.top - boundaryRect.top + scrollTop;
          const itemBottom = itemTop + itemHeight;
          
          if (relativeY >= itemTop && relativeY <= itemBottom) {
            const itemCenter = itemTop + (itemHeight / 2);
            calculatedIndex = relativeY < itemCenter ? i : i + 1;
            foundTargetIndex = true;
            break;
          }
          
          if (relativeY > itemBottom && i < slideItems.length - 1) {
            const nextItemRect = slideItems[i + 1].getBoundingClientRect();
            const nextItemTop = nextItemRect.top - boundaryRect.top + scrollTop;
            
            if (relativeY < nextItemTop) {
              calculatedIndex = i + 1;
              foundTargetIndex = true;
              break;
            }
          }
          
          accumulatedHeight += itemHeight;
        }
        
        if (!foundTargetIndex) {
          if (relativeY < 0) {
            calculatedIndex = 0;
          } else if (relativeY > accumulatedHeight) {
            calculatedIndex = slideItems.length;
          } else {
            let tempHeight = 0;
            for (let i = 0; i < slideItems.length; i++) {
              const itemRect = slideItems[i].getBoundingClientRect();
              const itemHeight = itemRect.height;
              tempHeight += itemHeight;
              
              if (relativeY <= tempHeight) {
                calculatedIndex = i;
                break;
              }
            }
          }
        }
      }
      
      // Ensure the calculated index is within bounds
      const validIndex = Math.max(0, Math.min(calculatedIndex, this.workSpaceService.slideListArray.length - 1));
      
      let finalIndex = validIndex;
      
      if (!foundTargetIndex) {
        finalIndex = currentIndex;
      }
      
      finalIndex = Math.max(0, Math.min(finalIndex, this.workSpaceService.slideListArray.length - 1));
      
      if (finalIndex !== previousIndex) {
        moveItemInArray(this.workSpaceService?.slideListArray, previousIndex, finalIndex);
        
        const swappedSlide = this.workSpaceService?.slideListArray[finalIndex];
        const swapSlidePayload = {
          presentationId: this.workSpaceService?.presentationId,
          slideId: swappedSlide?.slideId,
          indexA: previousIndex + 1,
          indexB: finalIndex + 1,
          isTemplate: this.workSpaceService.isTemplate
        };

      this.presentationService.SlideSwap(swapSlidePayload).subscribe(
        (response:any) => {
          if (Array.isArray(response?.resultData) && response?.resultData.length > 0) {
            response?.resultData.forEach((swapDto: any) => {
              const slide = this.workSpaceService.currentPresentation.slides.find((s: any) => s.slideId == swapDto.slideId || s.slideId == swapDto.slideId);
              if (slide) {
                slide.index = swapDto.updatedIndex;
              }
            });
          }
          this.workSpaceService.currentSlideIndex = this.workSpaceService.currentPresentation.slides.findIndex(x => x.slideId == this.workSpaceService.activeSlideId);
          this.workSpaceService.slideListArray = this.workSpaceService.currentPresentation.slides;
          document.body.style.cursor = 'default';
          this.resetHighlight();
        },
        (error:any) => {
          console.error('Error in SlideSwap API call ', error);
          document.body.style.cursor = 'default';
          this.resetHighlight();
        }
      );
    }
  }
}
  getSlideStylesImportDocument(slide: any) {
    const isImportDocument = slide.slideTypeName === MasterSlideTypeName.ImportDocument;
    if(isImportDocument){
      const imageUrl = this.getSlidePptImage(slide)?.replace(/ /g, '%20');

      if (!imageUrl) {
        return {};
      }
  
      const img = new Image();
      img.src = imageUrl;
  
      const { naturalWidth: width, naturalHeight: height } = img;
  
      const isLandscape = width > height;
      
      const baseStyle = {
        'background-image': `url(${imageUrl})`,
        'background-position': 'center center',
        'background-repeat': 'no-repeat',
      };
  
      if (isLandscape) {
        return isImportDocument
          ? { ...baseStyle, 'height': '-webkit-fill-available', 'width': '100%', 'background-size': 'cover' }
          : baseStyle;
      } else {
        return isImportDocument
          ? { ...baseStyle, 'height': '-webkit-fill-available', 'width': '50%', 'margin-left': '30px', 'background-size': 'contain' }
          : baseStyle;
      }
    }
  }
  getSlideStyles(slide: any) {
    const isImportDocument = slide.slideTypeName === MasterSlideTypeName.ImportDocument;
    if(isImportDocument){
      const imageUrl = this.getSlidePptImage(slide)?.replace(/ /g, '%20');

      if (!imageUrl) {
        return {};
      }
  
      const img = new Image();
      img.src = imageUrl;
  
      const { naturalWidth: width, naturalHeight: height } = img;
  
      const isLandscape = width > height;
      
      const baseStyle = {
        'background-image': `url(${imageUrl})`,
        'background-position': 'center center',
        'background-repeat': 'no-repeat',
      };
  
      if (isLandscape) {
        return isImportDocument
          ? { ...baseStyle, 'height': '-webkit-fill-available', 'width': '100%', 'background-size': 'contain' }
          : baseStyle;
      } else {
        return isImportDocument
          ? { ...baseStyle, 'height': '-webkit-fill-available', 'width': '50%', 'margin-left': '30px', 'background-size': 'contain' }
          : baseStyle;
      }
    }
    else{
      var layoutType = this.getMasterLayoutData(slide?.design?.slideLayoutId);
      if(layoutType == "Full Image"){
        const baseStyle = {
          'background-image': `url(${slide?.contentImage?.croppedUrl || '/assets/images/static_bg_image.svg'})`,
          'background-position': 'center center',
          'background-repeat': 'no-repeat',
          'background-size': 'cover',
          'height': '-webkit-fill-available',
          'width': '100%',
          'position': 'absolute',
          'opacity':slide?.contentImage?.backgroundImageOpacity
        };
        return baseStyle;
      }
    }
   
  }
  closeDeletePopup(){
    this.isShowSlideAction = false;
    this.isDeletePopupVisible = false;
    this.isConfirmDeletePopupVisible = false;
    this.isResetPopupVisisble = false;
    this.isConfirmResetPopupVisible = false;
  }
  toggleDiv(event: MouseEvent): void {
    event.stopPropagation(); 
    this.isShowSlideAction = true;
    this.isConfirmDeletePopupVisible = !this.isConfirmDeletePopupVisible;
    this.isDeletePopupVisible = true;
    this.isResetPopupVisisble = !this.isResetPopupVisisble;
    setTimeout(() => {
      this.adjustDeletePopupPosition();
    }, 0);
  }
  adjustDeletePopupPosition() {
    const popupElement = document.getElementById('popup');
    if (!popupElement) {
      return;
    }
    const windowHeight = window.innerHeight;
    const popupRect = popupElement.getBoundingClientRect();
    const popupBottomPosition = popupRect.bottom;
    const spaceBelowPopup = windowHeight - popupBottomPosition;
    if (spaceBelowPopup < 0) {
      this.marginTop = `${spaceBelowPopup}px`; 
    } else {
      this.marginTop = '0px';
    }
    if (popupElement) {
      this.renderer.setStyle(popupElement, 'margin-top', this.marginTop);
    const positiveMarginTop = `${Math.abs(parseInt(this.marginTop, 10))}px`;
    const tooltipElements = document.getElementsByClassName('position-tooltip-dropdown');
    for (let i = 0; i < tooltipElements.length; i++) {
        (tooltipElements[i] as HTMLElement).style.setProperty('--arrow-margin-top', positiveMarginTop);
    }
  } else {
    this.renderer.removeStyle(popupElement, 'margin-top');
    const tooltipElements = document.getElementsByClassName('position-tooltip-dropdown');
    for (let i = 0; i < tooltipElements.length; i++) {
        (tooltipElements[i] as HTMLElement).style.removeProperty('--arrow-margin-top');
    }
  }
}
resetSlideResult(index:number){
  const presentationId = this.workSpaceService.presentationId;
  const slideListArray = this.workSpaceService.slideListArray;
  const slideId = slideListArray[index].slideId;
  const slideTypeId = slideListArray[index].slideTypeId;
  const resetData = {presentationId:presentationId,slideId:slideId}
  this.presentationService.resetSlideResult(resetData).subscribe(
    (response:any)=>{
      this.workSpaceService.storeActiveSlideDetails().then(() => {
        // this.slideTypeName.emit(slideTypeId);
        this.contentChanged.emit("content");  
        this.isResetPopupVisisble = false;
        this.isConfirmResetPopupVisible = false;
      }).catch((error) => {
        console.error('Error in storeActiveSlideDetails(): ', error);
      });
    });
}
resetToggleDiv(event: MouseEvent): void {
  if(this.customerPlan?.reset_result){
    event.stopPropagation(); 
    this.isShowSlideAction = true;
    this.isConfirmResetPopupVisible = !this.isConfirmResetPopupVisible;
    this.isResetPopupVisisble = true;
    this.isDeletePopupVisible = !this.isDeletePopupVisible;
    setTimeout(() => {
      this.adjustDeletePopupPosition();
    }, 0);
  }
  else{
    this.toastr.warning("You don't have access.", "", {
      timeOut: 3000,
    });
  }
}
  //#endregion slide drag and drop
  openImportModal(){
    if (this.closeModal) {
      this.closeModal = false;
      this._commanService.SetCloseModal(this.closeModal);
      $('.btn-class-panel').removeClass('show');
      $('.left-panel-before').removeClass('show');
    }
    this.isImportModalOpen = true;
    if(this.workSpaceService.slideCountForImport < this.customerPlan.import_presentations && this.workSpaceService.slideCountWithoutLeaderboard < this.customerPlan.slide_types_per_presentation){
      $("#importSlideModal").modal("show");
    } else {
      $("#upgradeModal").modal("show");
    }
  }
  goToMyPlan() {
    this.router.navigate(['app/myplan']);
    $("#upgradeModal").modal("hide");
  }
  openToolTIp(){
    if(this.workSpaceService.slideCountWithoutLeaderboard >= this.customerPlan?.slide_types_per_presentation){
      this.toastr.info("Upgrade your plan to add more than "+this.customerPlan?.slide_types_per_presentation+" slides in your presentation.", "", {
        timeOut: 3000,
      });
    }
  }
  scrollDown() {
    setTimeout(() => {
      const element = document.querySelector('.right-panel-thumbnail') as HTMLElement;
  
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 0);
  }
  onHover(slide: any, isHovered: boolean): void {
    slide.isHovered = isHovered;
  }
  onDragStart(event: CdkDragStart, slide: any, index: number) {
    this.draggedSlideIndex = index;
    document.body.style.cursor = 'grabbing';
  }

  onDragEnd(event: CdkDragEnd, slide: any, index: number) {
    if (this.draggedSlideIndex === index) {
      document.body.style.cursor = 'grab';
      this.draggedSlideIndex = -1; 
    }
    // Clear auto-scroll interval when drag ends
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  
  // Reset highlight for all slides
  resetHighlight(): void {
    this.workSpaceService.slideListArray.forEach(slide => {
      slide.isHighlighted = false;
    });
  }
  checkImageOrientation() {
    const image = this.slideImage.nativeElement;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (width > height) {
      image.classList.add('landscape');
      image.classList.remove('portrait');
    } else {
      image.classList.add('portrait');
      image.classList.remove('landscape');
    }
  }

  openCreatedWithAiModal(){
    $('#createdWithAiModal').modal('show');
  }

  closeCreatedWithAiModal(){
    $('#createdWithAiModal').modal('hide');
  }
  shouldDisableDeleteForQuiz(): boolean {
    if (this.workSpaceService.slideListArray.length === 1) {
      return true;
    }
    if (this.workSpaceService.slideContentType !== this.masterSlideTypeName.QUIZ) {
      return false;
    }
    
    const slideArray = this.workSpaceService.slideListArray;
    if (!slideArray || slideArray.length !== 2) {
      return false;
    }
    
    // Check if one of the slides is a Leader Board slide
    return slideArray.some(slide => slide.slideTypeName === this.masterSlideTypeName.LEADER_BOARD_SLIDE_TYPE);
  }

  onDragMove(event: CdkDragMove) {
    const dragBoundary = document.querySelector('.right-panel-thumbnail');
    if (!dragBoundary) return;

    const boundaryRect = dragBoundary.getBoundingClientRect();
    const mouseY = event.pointerPosition.y;
    
    // Clear any existing scroll interval
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }

    // Check if we need to scroll up
    if (mouseY < boundaryRect.top + this.SCROLL_THRESHOLD) {
      this.autoScrollInterval = setInterval(() => {
        dragBoundary.scrollTop -= this.SCROLL_SPEED;
      }, this.SCROLL_INTERVAL);
    }
    // Check if we need to scroll down
    else if (mouseY > boundaryRect.bottom - this.SCROLL_THRESHOLD) {
      this.autoScrollInterval = setInterval(() => {
        dragBoundary.scrollTop += this.SCROLL_SPEED;
      }, this.SCROLL_INTERVAL);
    }
  }

  findFirstAvailableSlideId(slideListArray: any[], deletedSlideId: any, newActiveSlideId: any): any {
    const availableSlide = slideListArray.find(slide => 
      slide.slideId !== deletedSlideId && slide.slideId !== newActiveSlideId
    );
    
    return availableSlide ? availableSlide.slideId : newActiveSlideId;
  }
}
