import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
  selector: 'app-right-panel-text',
  templateUrl: './right-panel-text.component.html',
  styleUrls: ['./right-panel-text.component.scss']
})
export class RightPanelTextComponent implements OnInit {
  @Output() public slideThemesEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public textColor: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public lineColor: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public textFamily: EventEmitter<any[]> = new EventEmitter<any[]>(); 
  @Output() public restThemes: EventEmitter<any[]> = new EventEmitter<any[]>();
  private fontStyleUpdateSubject = new Subject<void>();
  private readonly DEBOUNCE_TIME = 300; // 300ms delay 
  presentationId: string; 
  slideListArray: any[] = [];
  customerPlan: CustomerPlan | null = null;
  constructor(public workSpaceService:WorkspaceService,public presentationService: PresentationService,private _customerPlanService:CustomerPlanService) { 
    this.customerPlan = this._customerPlanService.getCustomerPlan();
  }

  ngOnInit(): void {
    this.fontStlyeSubjectEmitter();
  }
  applyThemeToChart(data:any){
    this.slideThemesEmitter.emit(data);
 }
 designSlideChangeTextFamily(fontFamily:any){
  this.textFamily.emit(fontFamily);
}
  designSlideChangeTextFontSize(fontSize:any){
    if(this.customerPlan.custom_colours == true){
      this.workSpaceService.activeFontSizeButton = fontSize ? 'increase' : 'decrease';
    let newSlideThemes:any;
    this.workSpaceService.fontSize = fontSize ? this.workSpaceService.fontSize +2 : this.workSpaceService.fontSize-2 ;
    this.workSpaceService.slideDesign.slideTextFontSize = this.workSpaceService.fontSize;
    this.workSpaceService.resetThemes = true;
    newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
    this.slideThemesEmitter.emit(newSlideThemes);
    this.designSlideTextDetails();
    }
    else{
      return;
    }
    
  }
  designSlideChangeTextColor(textColor:any){
    this.textColor.emit(textColor);
  }
  designSlideChangelineColor(lineColor:any){
    this.lineColor.emit(lineColor);
  }
  designSlideChangebackgroundClour(backGroundColor:any){
    if(this.customerPlan.custom_colours == true){
      let newSlideThemes:any;
      this.workSpaceService.slideBackgroundColor = backGroundColor;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.slideDesign.slideBackgroundColor = backGroundColor;
      this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      // this.workSpaceService.setApplyCurrentSlideTheme(this.workSpaceService.slideDesign);
      this.designSlideTextDetails();
    }
    else{
      return;
    }
   
  }
  designSlideResetThemeDefault(){
    this.restThemes.emit();
  }
  designSlideTextOptionsBold(value:any){
    if(this.customerPlan.custom_colours == true){
      let newSlideThemes:any;
      this.workSpaceService.slideTextBold = value;
      this.workSpaceService.slideDesign.slideTextBold = value;
      this.workSpaceService.resetThemes = true;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.fontStyleUpdateSubject.next();
    }
    else{
      return;
    }
   
  }
  designSlideTextOptionsItalic(value:any){
    if(this.customerPlan.custom_colours == true){
      let newSlideThemes:any;
      this.workSpaceService.slideTextItalic = value;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.slideDesign.slideTextItalic = value;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.fontStyleUpdateSubject.next();
    }
    else{
      return;
    }
   
  }
  designSlideTextOptionsUnderLine(value:any){
    if(this.customerPlan.custom_colours == true){
      let newSlideThemes:any;
      this.workSpaceService.slideTextUnderLine = value;
      this.workSpaceService.resetThemes = true;
      this.workSpaceService.slideDesign.slideTextUnderLine = value;
      newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
      this.slideThemesEmitter.emit(newSlideThemes);
      this.fontStyleUpdateSubject.next();
    }
    else{
      return;
    }
  }
  designSlideTextOptionsStrikeThrough(value:any){
    if(this.customerPlan.custom_colours == true){
      let newSlideThemes:any;
    this.workSpaceService.slideTextStrikeThrough = value;
    this.workSpaceService.resetThemes = true;
    this.workSpaceService.slideDesign.slideTextStrikeThrough = value;
    newSlideThemes = this.workSpaceService.setSlideThemes(this.workSpaceService.slideDesign);
    this.slideThemesEmitter.emit(newSlideThemes);
    this.fontStyleUpdateSubject.next();
    }
    else{
      return;
    }
    
  }
  designSlideTextDetails(){
    if(this.customerPlan.custom_colours == true){
      let slideDesignDTO={
        presentationId: this.workSpaceService.presentationId,
        slideId:this.workSpaceService.activeSlideId,
        slideTextBold : this.workSpaceService.slideTextBold,
        slideTextItalic :this.workSpaceService.slideTextItalic,
        slideTextUnderLine :this.workSpaceService.slideTextUnderLine,
        slideTextStrikeThrough :this.workSpaceService.slideTextStrikeThrough,
        slideTextColor:this.workSpaceService.slideTextColor,
        slideLineColor:this.workSpaceService.slideLineColor,
        slideBackgroundColor:this.workSpaceService.slideBackgroundColor,
        fontFamily :this.workSpaceService.fontFamily,
        fontSize :this.workSpaceService.fontSize,
        isTemplate: this.workSpaceService.isTemplate
       //  resetThemes :this.workSpaceService.resetThemes,
     }
     const slideSettings = {
      slideBackgroundColor: this.workSpaceService.slideBackgroundColor,
      slideLayoutId: this.workSpaceService.slideLayoutId,
      slideLineColor: this.workSpaceService.slideLineColor,
      slideResetTheme: this.workSpaceService.resetThemes,
      slideResponseAsPercentage: this.workSpaceService.slideResponseAsPercentage,
      slideTextBold: this.workSpaceService.slideTextBold,
      slideTextColor: this.workSpaceService.slideTextColor,
      slideTextFontFamily: this.workSpaceService.fontFamily,
      slideTextFontSize: this.workSpaceService.fontSize,
      slideTextItalic: this.workSpaceService.slideTextItalic,
      slideTextStrikeThrough: this.workSpaceService.slideTextStrikeThrough,
      slideTextUnderLine: this.workSpaceService.slideTextUnderLine,
      slideVisualizationId: this.workSpaceService.slideVisualizationId
    } as const;
     this.workSpaceService.slideDesign = slideSettings;
     this.applyTextFontAndColorToSlide(slideDesignDTO)
      .then((response:any) => {
        const presentationData = response['data'];
        this.workSpaceService.slideListArray = presentationData?.activePresentationData?.slides.sort((a,b)=>a.index - b.index);
        const currentActiveSlide = this.workSpaceService.slideListArray?.length > 0 
          ? this.workSpaceService.slideListArray.find(x => x.slideId == this.workSpaceService.activeSlideId) 
          : null;
        this.workSpaceService.SetCurrectSlideThemeValue(currentActiveSlide, presentationData);
      })
      .catch((error) => {
        console.error('Error applying text font and color:', error);
      });
    }
    else{
      return;
    }
  }
  fontStlyeSubjectEmitter(){
    this.fontStyleUpdateSubject
      .pipe(
        debounceTime(this.DEBOUNCE_TIME)
      )
      .subscribe(() => {
        this.designFontStyleDetails();
      });
  }
  designFontStyleDetails(){
    if(this.customerPlan.custom_colours == true){
      let slideDesignDTO={
        presentationId: this.workSpaceService.presentationId,
        slideId:this.workSpaceService.activeSlideId,
        slideTextBold : this.workSpaceService.slideTextBold,
        slideTextItalic :this.workSpaceService.slideTextItalic,
        slideTextUnderLine :this.workSpaceService.slideTextUnderLine,
        slideTextStrikeThrough :this.workSpaceService.slideTextStrikeThrough,
        slideTextColor:this.workSpaceService.slideTextColor,
        slideLineColor:this.workSpaceService.slideLineColor,
        slideBackgroundColor:this.workSpaceService.slideBackgroundColor,
        fontFamily :this.workSpaceService.fontFamily,
        fontSize :this.workSpaceService.fontSize,
        isTemplate: this.workSpaceService.isTemplate
       //  resetThemes :this.workSpaceService.resetThemes,
     }
     const slideSettings = {
      slideBackgroundColor: this.workSpaceService.slideBackgroundColor,
      slideLayoutId: this.workSpaceService.slideLayoutId,
      slideLineColor: this.workSpaceService.slideLineColor,
      slideResetTheme: this.workSpaceService.resetThemes,
      slideResponseAsPercentage: this.workSpaceService.slideResponseAsPercentage,
      slideTextBold: this.workSpaceService.slideTextBold,
      slideTextColor: this.workSpaceService.slideTextColor,
      slideTextFontFamily: this.workSpaceService.fontFamily,
      slideTextFontSize: this.workSpaceService.fontSize,
      slideTextItalic: this.workSpaceService.slideTextItalic,
      slideTextStrikeThrough: this.workSpaceService.slideTextStrikeThrough,
      slideTextUnderLine: this.workSpaceService.slideTextUnderLine,
      slideVisualizationId: this.workSpaceService.slideVisualizationId
    } as const;
     this.workSpaceService.slideDesign = slideSettings;
     this.applyTextFontAndColorToSlide(slideDesignDTO)
      .then((response:any) => {
        const presentationData = response['data'];
        this.workSpaceService.slideListArray = presentationData?.activePresentationData?.slides.sort((a,b)=>a.index - b.index);
      })
      .catch((error) => {
        console.error('Error applying text font and color:', error);
      });
    }
    else{
      return;
    }
  }
  private applyTextFontAndColorToSlide(slideDesignDTO: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.presentationService.applyTextFontAndColor(slideDesignDTO).subscribe(
        (response: any) => {
          try {
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        (error: any) => {
          console.log(error?.error);
          reject(error);
        }
      );
    });
  }
  ngOnDestroy() {
    this.fontStyleUpdateSubject.complete();
  }
}
