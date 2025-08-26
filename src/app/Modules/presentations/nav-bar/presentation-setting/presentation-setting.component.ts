// angular import
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerLimitationsCount, CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { TrashServiceService } from 'src/app/trash-service.service';
import { PrizeString } from 'src/app/utility/constants';
import { PopularSlideTypeName } from 'src/app/utility/constants';
import { SlideType } from 'src/app/utility/MasterConstants';
declare var $: any;
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-presentation-setting',
    templateUrl: './presentation-setting.component.html',
    styleUrls: ['./presentation-setting.component.scss'],
    standalone: false
})
export class PresentationSettingComponent implements OnInit {
  categoryList:any;
  maxDescriptionLength = 150;
  isTemplateButtonDisabled: boolean = false;
  isTypeDropdownOpen = false;
  isCategoryDropdownOpen = false;
  customerPlan:CustomerPlan;
  customerLimitationCount:CustomerLimitationsCount;
  slideTypes = Object.values(PopularSlideTypeName);
  prizeString = PrizeString;
  selectedType :string;
  popularFeatures:string[] = [];
  isDropdownOpen = false;
  selectedCategory: string | null = null;
  selectedSlide:string;
  selectedslideList:any =[];
  selectedSlideId: string | null = null;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  @Output() public reactionUpdate: EventEmitter<any> = new EventEmitter<any>();
  isSaveTemplateLoading: boolean = false;
  constructor(public workSpaceService:WorkspaceService,public presentationService: PresentationService, private formBuilder: FormBuilder,private _toastr:ToastrService,
    public customerPlanService: CustomerPlanService,
    private _trashService :TrashServiceService,
    private _customerPlanService:CustomerPlanService,
    private _router :Router) {
    this.customerPlan = _customerPlanService.getCustomerPlan();
    this.customerLimitationCount = _customerPlanService.getCustomerLimitationsCounts();
    this.popularFeatures = SlideType
      .filter(slide => slide.ContentType === "POPULAR")
      .map(slide => slide.Name); 
      this.popularFeatures.unshift("Presentation")
   }
//#region LifeCycle Hooks
  ngOnChanges() {
    //console.log("AppComponent: OnChanges");
  }

  ngOnInit() {
    this.presentationService.isOnPageLoad = true;
    this.getAllCategory();
  // console.log("AppComponent: OnInit");
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
    this.customerPlan = this.customerPlanService.getCustomerPlan(); 
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
    presentationSettingHideJoiningInstructionBar(value:any){
      this.workSpaceService.presentationSettingJoiningInstructions = value;
      this.updatePresentationSettings();
    }
    presentationSettingMakeLinkAvailable(value:any){
      this.workSpaceService.presentationSettingMakeLinkavailable = value;
      this.updatePresentationSettings();
    }
    presentationSettingAudienceFeedBack(value:any){
      this.workSpaceService.presentationSettingAudienceFeekback = value;
      this.updatePresentationSettings();
    }
    presentationSettingAudienceReview(value:any){
      this.workSpaceService.presentationSettingAudienceReview = value;
      this.updatePresentationSettings();
    }
    presentationSettingShowSlideOneLink(value:any){
      this.workSpaceService.presentationSettingLink = value;
      this.updatePresentationSettings();
    }
    presentationSettingAllowMultipleResponse(value:any){
      if(this.customerPlan?.several_answers){
      this.workSpaceService.presentationSettingAllowMultipleResponse = value;
      this.updatePresentationSettings();
      } else{
        this._toastr.warning("You don't have access to enable questions" , '', {
          timeOut: 5000
        });
      }
    }
    loadSlides() {
      this.selectedslideList = this.workSpaceService?.slideListArray || [];
    }
    CategoryToggleDropdown(event?: Event) {
      event?.stopPropagation();
      this.isDropdownOpen = !this.isDropdownOpen;
    }
    presentationSettingReactions(reactionId:any){
      let presentationUpdateDTO ={
        presentationId:this.workSpaceService?.presentationId,
        reactionId:reactionId,
        isTemplate: this.workSpaceService.isTemplate
      }
      var reactions = this.workSpaceService.presentationSettingReactions;
      this.workSpaceService.presentationSettingReactions =[];
      this.workSpaceService.presentationSettingReactions =reactions;
      this.presentationService.updatePersentationReactions(presentationUpdateDTO).subscribe(
        (response: any) => {
          this.reactionUpdate.emit(this.workSpaceService.presentationSettingReactions);
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }

    presentationSettingLanguage(value:any){
      this.workSpaceService.presentationSettingLanguage = value;
      this.updatePresentationSettingsLanguages();
    }
    presentationSettingAlwaysEnglish(value:any){
      this.workSpaceService.presentationSettingAlwaysEnglish = value;
      this.updatePresentationSettingsLanguages();
    }
    presentationSettingProfanity(value){
      this.workSpaceService.presentationSettingProfanity = value;
    }
    presentationSettingAlwaysUseSameProfanityFilter(value:any){
      this.workSpaceService.presentationSettingProfanitySelectedFilter = value;
      this.updatePresentationSettingsLanguages();
    }
    updatePresentationSettings(){
      let updatePresentationSettingsDTO ={
        presentationId :this.workSpaceService.presentationId,
        hideTheJoingingInstructionBar : this.workSpaceService.presentationSettingJoiningInstructions,
        makeLinksClickable : this.workSpaceService.presentationSettingMakeLinkavailable,
        allowAudienceFeedback : this.workSpaceService.presentationSettingAudienceFeekback,
        allowAudienceToReviewTheSlides : this.workSpaceService.presentationSettingAudienceReview,
        showResults : this.workSpaceService.presentationSettingShowResults,
        reactions :this.workSpaceService.presentationSettingReactions,
        allowMultipleResponse : this.workSpaceService.presentationSettingAllowMultipleResponse,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.updatePresentationSettings(updatePresentationSettingsDTO).subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    presenterShowResponse() {
      let presentationDTO = {
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          slideShowInResults: this.workSpaceService.slideShowInResults,
          isTemplate: this.workSpaceService.isTemplate
      };
      this.presentationService.PresentationLevelShowResponse(presentationDTO).subscribe(
          (response: any) => {
              if(this.workSpaceService.presentationSettingShowResults != this.workSpaceService.slideShowInResults){
                this.workSpaceService.presentationSettingShowResults = this.workSpaceService.slideShowInResults;
                this.workSpaceService.currentActiveSlide.settings.showInResults = this.workSpaceService.slideShowInResults;
              }
              this.workSpaceService.dynamicChartResponseLoad();
          },
          (error: any) => {
              console.log(error?.error);
          }
      );
    }
    updatePresentationSettingsLanguages(){
      let updatePresentationSettingsLanguagesDTO ={
        presentationId :this.workSpaceService.presentationId,
         presentationLanguage :  this.workSpaceService.presentationSettingLanguage,
         alwaysUseEngilsh :this.workSpaceService.presentationSettingAlwaysEnglish,
         profanityFilter : this.workSpaceService.presentationSettingProfanity,
         alwaysUseTheSelectedFilters : this.workSpaceService.presentationSettingProfanitySelectedFilter,
         isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.updatePresentationSettingsLanguagePerference(updatePresentationSettingsLanguagesDTO).subscribe(
        (response: any) => {
        },
        (error: any) => {
          console.log(error?.error);
        }
      );
    }
    checkTemplate(){
      const presentationId=this.workSpaceService.presentationId;
      this.presentationService.CheckResponseBeforeTemplate(presentationId).subscribe(
        (response) => {
          if(response == true){
            this.isTemplateButtonDisabled = true;
          }else{
            this.isTemplateButtonDisabled = false;
          }
          if(this.customerLimitationCount?.templateCount >= this.customerPlan?.create_presentation_templates){
            this.isTemplateButtonDisabled = false;
          }
         
        });
    }
    createTemplate(){
      this.loadSlides();
      if(!(this.customerLimitationCount?.templateCount >= this.customerPlan?.create_presentation_templates)){
        $('#settingModal').modal('hide');
        $('#createTemplate').modal('show');
      }
      else
      {
        return;
      }
    }
    
    
    storeTemplate($event:any): void {
      if($event){
        $('#createTemplate').modal('hide');
        this._router.navigate(['/app/templates'], { queryParams: { isPublished: false,selectedCategory:"All Templates" } });
      }
      else{
        return;
      }
    }
    
  presenterEnableQuestion(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    this.workSpaceService.OnlyQA = !isChecked;
    this.workSpaceService.slideShowQuestions = isChecked;
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      IsTrue: this.workSpaceService.OnlyQA,
      isTemplate: this.workSpaceService.isTemplate
    };

    this.presentationService.OnlyQAEnableQuestion(presentationDTO).subscribe(
      (response: any) => {

      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }

  presenterEnableComment() {
    this.workSpaceService.slideShowComments = !this.workSpaceService.slideShowComments;
    let presentationDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.presenterEnableComment(presentationDTO).subscribe(
      (response: any) => {

      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  //#endregion API Call

  //#region Without API Call
  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods

//#endregion Common Metods

  //#region Profanity filter
    selectProfanityLanguage(languageDetails: any) {
      languageDetails.isApply = !languageDetails.isApply;
      var languageDTO = {
        presentationId: this.workSpaceService.presentationId,
        id: languageDetails?.id,
        Language: languageDetails?.language,
        IsApply: languageDetails.isApply,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.ProfanityFilterUpdate(languageDTO).subscribe(
        (response: any) => {
          this.workSpaceService.presentationSettingProfanity = response.presentationLanguage.profanityFilter;
          this.workSpaceService.selectedProfantyLanguage = response.presentationLanguage.profanityFilter.filter(x=> x.isApply == true);
          this.workSpaceService.isAllSelectedProfantyLanguage = response.presentationLanguage.profanityFilter.every(x=> x.isApply == true);
        },
        (error: any) => {
          console.log(error);
        }
      )
    }
    selectAllLanguage() {
      this.workSpaceService.isAllSelectedProfantyLanguage = !this.workSpaceService.isAllSelectedProfantyLanguage;
      this.workSpaceService.presentationSettingProfanity.forEach((item)=>{
        item.isApply = this.workSpaceService.isAllSelectedProfantyLanguage;
      })
      var languageDTO = {
        presentationId: this.workSpaceService.presentationId,
        IsAllSelected: this.workSpaceService.isAllSelectedProfantyLanguage,
        isTemplate: this.workSpaceService.isTemplate
      }
      this.presentationService.ProfanityFilterBulkUpdate(languageDTO).subscribe(
        (response: any) => {
          this.workSpaceService.presentationSettingProfanity = response.presentationLanguage.profanityFilter;
          this.workSpaceService.selectedProfantyLanguage = response.presentationLanguage.profanityFilter.filter(x=> x.isApply == true);
        },
        (error: any) => {
          console.log(error);
        }
      )
    }
    toggleDropdown(dropdown: string) {
      if (dropdown === 'type') {
        this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
        if (this.isCategoryDropdownOpen) {
          this.isCategoryDropdownOpen = false; // Close category dropdown if type dropdown is opened
        }
      } else if (dropdown === 'category') {
        this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
        if (this.isTypeDropdownOpen) {
          this.isTypeDropdownOpen = false; // Close type dropdown if category dropdown is opened
        }
      }
    }

    getAllCategory(){
      this.presentationService.getAllCategory().then((response:any)=>{
        this.presentationService.isOnPageLoad = false;
        this.categoryList = response.filter(category => category.categoryName !== "All Templates");
      }).finally(() => {
        this.presentationService.isOnPageLoad = false;
      })
    }

}
