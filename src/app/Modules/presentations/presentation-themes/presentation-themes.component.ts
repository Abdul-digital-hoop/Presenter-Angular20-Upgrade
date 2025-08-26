import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
// Removed unused variable declaration for $:any;
declare var $: any;
@Component({
  selector: 'app-presentation-themes',
  templateUrl: './presentation-themes.component.html',
  styleUrls: ['./presentation-themes.component.scss']
})
export class PresentationThemesComponent implements OnInit {
  uploadTabNumber: any = 1; // Variable to track the current upload tab number
  isVisible: boolean = false; // Flag to show or hide the popover
  top: number; // Top position for the popover
  left: any; // Left position for the popover
  defaultThemes: any[] = []; // Array to hold default themes
  @Output() public themesEmiter: EventEmitter<any> = new EventEmitter<any>(); // Event emitter for themes
  slideThemesAppliedSlidesIndexArray: number[]; // Array to hold slide indices with applied themes
  selectedTheme: any; // Currently selected theme
  slideListArray: any; // Array to hold slide list
  isSkeletonLoading: boolean = false; // Flag to show skeleton loading for theme list
  isCreateThemeLoader: boolean = false; // Flag to show loader for create theme API call
  skeletons: number[] = Array(10).fill(0); // Array to simulate skeleton loading
  currentThemeId: any[];
  isCreateTheme:boolean=false;
  isEditTheme:boolean=false;
customerPlan: CustomerPlan | null = null;

  constructor(public workSpceService: WorkspaceService, private _router: Router, public presentationThemeService: PresentationThemeService, public presentationService: PresentationService,private _cutomerPlanService:CustomerPlanService,) {
    this.customerThemeAndDefaultTheme(); // Call to fetch customer and default themes
    this.customerPlan = this._cutomerPlanService.getCustomerPlan();
  }

  ngOnInit(): void {

  }
  customerThemeAndDefaultTheme() {
    this.isSkeletonLoading = true; // Show skeleton loading
    this.presentationThemeService.getCustomerThemesAndDefaultThemes().finally(() => {
      this.isSkeletonLoading = false; // Hide skeleton loading
      this.currentThemeId = this.presentationThemeService.defaultThemes.map(theme => theme.id);
    });
   
  }
  selectTabForUpload(Tab: any) {
    this.uploadTabNumber = Tab; // Update the upload tab number
  }
  showPopover(event, themeData) {
    this.presentationThemeService.customeThemeId = themeData.id;
    this.isVisible = true; // Show the popover
    this.top = (event.clientY - 30); // Calculate top position
    this.left = (event.clientX + 30); // Calculate left position
    event.preventDefault(); // Prevent default event behavior
    event.stopPropagation(); // Stop event propagation
  }

  setDefaultThemeToPresentaion(theme: any) {
    this.selectedTheme = theme; // Set the selected theme
    this.slideThemesAppliedSlidesIndexArray = this.workSpceService.slideListArray.map((obj, index) => obj.design.slideResetTheme ? index + 1 : null).filter(index => index !== null);
    if (this.slideThemesAppliedSlidesIndexArray?.length > 0) {
      // $('#changeThemeModal').modal('show'); // Show theme change modal
      this.workSpceService.isShowThemeChange = true; // Flag to show theme change modal
    }
    else {
      this.workSpceService.changeSlideThemes(theme); // Change slide themes
      this.applyThemes(theme); // Apply the selected theme
    }
  }
  createThemeConditionCheck(){
    if(!this.customerPlan?.custom_themes){
      return ;
    }
    this.slideThemesAppliedSlidesIndexArray = this.workSpceService.slideListArray.map((obj, index) => obj.design.slideResetTheme ? index + 1 : null).filter(index => index !== null);
    if (this.slideThemesAppliedSlidesIndexArray?.length > 0) {
      // $('#changeThemeModal').modal('show'); // Show theme change modal
      this.workSpceService.isShowThemeChange = true; // Flag to show theme change modal
      this.isCreateTheme = true;
    }
    else {
      this.workSpceService.isShowThemeNameChange = true;
      this.isCreateTheme = false;
      // this.createTheme();
    }
  }
  saveThemesChanges(action: any) {
    if (action) {
      this.workSpceService.changeSlideThemes(this.selectedTheme); // Change slide themes
      if (this.isCreateTheme) {
        this.workSpceService.isShowThemeNameChange = true;
      } else if (this.isEditTheme) {
        this.editTheme();
      } else {
        this.applyThemes(this.selectedTheme); // Apply the selected theme
      }
    }
    else {
      this.workSpceService.isShowThemeChange = false; // Hide theme change modal
      this.isCreateTheme = false;
    }
  }
  saveThemeNameChanges(action: {isChangeThemesName: boolean, themeName: string}){
    if(action.isChangeThemesName){
      this.createTheme(action.themeName);
    }
    else{
      this.workSpceService.isShowThemeNameChange = action.isChangeThemesName;
    }
  }
  applyThemes(theme) {
    let applyThemesDTO = {
      presentationId: this.workSpceService.presentationId, // Presentation ID
      themeId: theme.id, // Theme ID
      isTemplate: this.workSpceService.isTemplate
    }
    this.applyThemeAPICall(applyThemesDTO);
  }
  applyThemeAPICall(applyThemesDTO:any){
    this.presentationService.applyThemeToPresentation(applyThemesDTO).subscribe(
      (response: any) => {
        this.isEditTheme = false;
        let presentationData = response['data'];
        this.workSpceService.slideListArray = presentationData?.activePresentationData?.slides.sort((a,b)=>a.index - b.index); // Update slide list array
        let currentActiveSlide = this.workSpceService.slideListArray?.length > 0 ? this.workSpceService.slideListArray.find(x => x.slideId == this.workSpceService.activeSlideId) : null; // Find the current active slide
        this.workSpceService.SetCurrectSlideThemeValue(currentActiveSlide, presentationData); // Set the current slide theme value
        let correntSlideThemes = this.workSpceService.setSlideThemes(this.workSpceService.slideDesign); // Set slide themes
        this.themesEmiter.emit(correntSlideThemes); // Emit the themes event
        
        // Update visualization colors for current active slide's content data options
        this.workSpceService.setApplyPresentationTheme(presentationData?.activePresentationData?.presentationThemes);
        const themeColors = this.workSpceService.slidesTheme.ThemeVisualizationColor.map(item => item.color);
        this.workSpceService.updateOptionsVisualizationColor(themeColors);

        this.workSpceService.options.forEach((data, index) => {
          const themeColor = this.workSpceService.slidesTheme.ThemeVisualizationColor[index]?.color;
        
          if (themeColor && data.visualizationColor !== themeColor && !this.workSpceService.resetThemes) {
            data.visualizationColor = themeColor;
          }
        });
      
        this.workSpceService.currentThemeId = applyThemesDTO.themeId;
      
      },
      (error: any) => {
        this.isEditTheme = false;
      }
    );
  }
  createTheme(themeName:string) {
    if(!this.customerPlan.custom_themes){
      return;
    }
    if(themeName){
      themeName = themeName;
    }
    else{
      themeName = "Untitled theme";
    }
    this.presentationThemeService.createTheme(themeName).then((response: any) => {
      if (response) {
        this.workSpceService.isShowThemeNameChange = false;
        this.isCreateTheme = false;
        this.presentationThemeService.customerThemes.push(response); 
        
        if(!this.workSpceService.isTemplate){
          this._router.navigate(
            ['WorkSpace/create-theme/', response.id], 
            { queryParams: { 'presentation-id': this.workSpceService.presentationId } }
          );
        } else {
          this._router.navigate(
            ['WorkSpace/create-theme/', response.id], 
            { queryParams: { 'presentation-id': this.workSpceService.presentationId,'isTemplate':this.workSpceService.isTemplate } }
          );
        }

        let applyThemesDTO = {
          presentationId: this.workSpceService.presentationId,
          themeId: response.id,
          isTemplate: this.workSpceService.isTemplate
        };
        
        this.presentationService.applyThemeToPresentation(applyThemesDTO).subscribe(
          (applyResponse: any) => {
          },
          (applyError: any) => {
            console.error('Error', applyError);
          }
        );
      } else {
        console.error('Error: No response received');
      }
    }).catch(error => {
      this.workSpceService.isShowThemeNameChange = false;
      this.isCreateTheme = false;
      console.error('Error: ', error);
    });
  }
  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    if (this.isVisible) {
      this.closePopover();
    }
  }
  @HostListener('document:wheel', ['$event.target'])
  public onWheel(targetElement) {
    this.closePopover();
  }
  closePopover() {
    this.isVisible = false;
  }
  editThemeConditionCheck() {
    this.slideThemesAppliedSlidesIndexArray = this.workSpceService.slideListArray.map((obj, index) => obj.design.slideResetTheme ? index + 1 : null).filter(index => index !== null);
    if (this.slideThemesAppliedSlidesIndexArray?.length > 0) {
      // $('#changeThemeModal').modal('show'); // Show theme change modal
      this.workSpceService.isShowThemeChange = true; // Flag to show theme change modal
      this.isEditTheme = true;
    }
    else {
      this.isEditTheme = false;
      this.editTheme();
    }
  }
  editTheme(){
    let applyThemesDTO = {
      presentationId: this.workSpceService.presentationId, // Presentation ID
      themeId: this.presentationThemeService.customeThemeId, // Theme ID
      isTemplate: this.workSpceService.isTemplate
    }
    this.applyThemeAPICall(applyThemesDTO);
    if(!this.workSpceService.isTemplate){
    this._router.navigate(
      ['WorkSpace/create-theme/', this.presentationThemeService.customeThemeId], 
      { queryParams: { 'presentation-id': this.workSpceService.presentationId } }
    );
  }
    else{
      this._router.navigate(
        ['WorkSpace/create-theme/', this.presentationThemeService.customeThemeId], 
        { queryParams: { 'presentation-id': this.workSpceService.presentationId,'isTemplate':this.workSpceService.isTemplate } }
      );
    }
  }
  deleteTheme() {
    $("#deleteCustomeTheme").modal("show");
  }
  checkOrientation(croppedPosition: { x1: number; y1: number; x2: number; y2: number }): string {
    if (croppedPosition != null) {
      const width = croppedPosition.x2 - croppedPosition.x1;
      const height = croppedPosition.y2 - croppedPosition.y1;
      const aspectRatio = width / height;
      if (aspectRatio > 2) {
        return 'Landscape';
      } else {
        return 'Portrait';
      }
    }
  }
}
