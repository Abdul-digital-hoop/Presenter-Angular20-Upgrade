import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { MasterSlideTypeName } from 'src/app/utility/constants';

@Component({
    selector: 'app-convert-template',
    templateUrl: './convert-template.component.html',
    styleUrls: ['./convert-template.component.scss'],
    standalone: false
})
export class ConvertTemplateComponent implements OnInit {

  @Input() selectedslideList: any[] = [];
  @Input() presentationId: string;
  @Input() customerPlan: any;
  @Input() customerLimitationCount: any;
  @Input() isTemplateButtonDisabled: boolean = false;
  @Input() categoryList: any[] = [];
  @Input() isEditorScreen:boolean=false;
  @Input() popularFeatures: string[] = ['Multiple Choice', 'Open Ended', 'Scales', 'Ranking', 'Question & Answers', 'Guess the Number', 'This or That', 'Truth or Lie', 'Traffic Lights', 'Multiple Donut', 'Multiple Dot', 'Multiple Pie', 'Multiple Bar', 'Scales Slider', 'Open Ended Flowing'];
  @Output() templateCreated = new EventEmitter<any>();
  @Output() categoryToggleDropdown = new EventEmitter<any>();

  myForm: FormGroup;
  maxDescriptionLength: number = 150;
  isSaveTemplateLoading: boolean = false;
  selectedSlideId: string | null = null;
  selectedCategory: string = '';
  isTypeDropdownOpen: boolean = false;
  isCategoryDropdownOpen: boolean = false;
  isComponentLoading: boolean;
  masterSlideTypeName = MasterSlideTypeName;
  constructor(
    private fb: FormBuilder,
    private presentationService: PresentationService,
    private _toastr: ToastrService,
    private _router: Router,
    public workSpaceService: WorkspaceService 
  ) {
    this.myForm = this.fb.group({
      Type: ['', Validators.required],
      CategoryName: ['', Validators.required],
      Description: ['', [Validators.required, Validators.maxLength(this.maxDescriptionLength)]],
      SlideId: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    if(!this.isEditorScreen){
      this.loadSlideTypes();
    }
  }
  loadSlideTypes() {
    this.isComponentLoading = true;
    this.presentationService.getSlideTypesForTemplate(this.presentationId,true).subscribe({
      next: (response:any) => {
        this.selectedslideList = response;
        this.isComponentLoading = false;
      },
      error: (error) => {
        console.error('Failed to load slide types:', error);
        this.isComponentLoading = false;
      }
    });
  }
  toggleDropdown(type: 'type' | 'category') {
    if (type === 'type') {
      this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
      this.isCategoryDropdownOpen = false;
    } else {
      this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
      this.isTypeDropdownOpen = false;
      this.categoryToggleDropdown.emit();
    }
  }

  selectCategory(category: any) {
    this.selectedCategory = category.categoryName;
    this.myForm.patchValue({ CategoryName: category });
    // this.isCategoryDropdownOpen = false;
  }

  selectSlide(slideId: string) {
    this.selectedSlideId = slideId;
    this.myForm.patchValue({ SlideId: slideId });
  }

  clearForm() {
    this.myForm.reset();
    this.selectedSlideId = null;
    this.selectedCategory = '';
  }

  async storeTemplate() {
    if (!(this.customerLimitationCount?.templateCount >= this.customerPlan?.create_presentation_templates)) {
      const slides = this.workSpaceService?.slideCount;
      const isValidSlideType = this.checkSlideTypeName(); 
  
      if (!isValidSlideType) {
        return; 
      }
  
      if (slides == 0) {
        const message = getErrorMessage(ErrorMessages.TemplatesSection6000, ErrorMessages.TemplatesSection6003);
        this._toastr.error(message, "", { timeOut: 5000 });
        this.myForm.reset();
        this.clearForm();
        this.myForm.controls['Type'].setValue('');
        this.myForm.controls['CategoryName'].setValue('');
        this.myForm.controls['Description'].setValue('');
        this.myForm.controls['SlideId'].setValue('');
        this.isSaveTemplateLoading = false;
        this.templateCreated.emit(false); // Emitting false to indicate the popup should not close
      } else {
        this.myForm.markAllAsTouched()
        if (this.myForm.valid) {
          const presentationId = this.presentationId;

          if (this.isSaveTemplateLoading) {
            return;
          }
          this.isSaveTemplateLoading = true;
          this.presentationService.addTemplate(this.myForm.value, presentationId).subscribe(
            (response: any) => {
              this.customerLimitationCount.templateCount = response?.data?.templateCount;
              this.clearForm();
              this.myForm.reset();
              this.myForm.controls['Type'].setValue('');
              this.myForm.controls['CategoryName'].setValue('');
              this.myForm.controls['Description'].setValue('');
              this.myForm.controls['SlideId'].setValue('');

              if (response?.data?.results === false) {
                const message = getErrorMessage(ErrorMessages.TemplatesSection6000, ErrorMessages.TemplatesSection6002);
                this._toastr.error(message, "", { timeOut: 5000 });
                this.isSaveTemplateLoading = false;
                this.templateCreated.emit(false); // Emitting false to indicate the popup should not close
              } else {
                const message = getMessage(SuccessMessages.TemplatesSection6000, SuccessMessages.TemplatesSection6001);
                this._toastr.success(message, '', {
                  enableHtml: true,
                  timeOut: 5000,
                });
                this.isSaveTemplateLoading = false;
                this.templateCreated.emit(true); // Emitting true to indicate the popup should close
              }
            },
            (error) => {
              const message = getErrorMessage(ErrorMessages.TemplatesSection6000, ErrorMessages.TemplatesSection6001);
              this._toastr.error(message, "", { timeOut: 5000 });
              this.isSaveTemplateLoading = false;
              this.templateCreated.emit(false); // Emitting false to indicate the popup should not close
            }
          );
        } else {
          console.error("Form is invalid");
          this.isSaveTemplateLoading = false;
          this.templateCreated.emit(false); // Emitting false to indicate the popup should not close
        }
      }
    }
  }
  checkSlideTypeName(selectedType = this.myForm.value['Type']): boolean {
    if (selectedType === this.popularFeatures[0]) {
      return true;
    }
    if (selectedType && this.workSpaceService?.slideListArray?.length > 0) {
      const isAllSameType = this.workSpaceService.slideListArray.every(
        slide => slide.slideTypeName === selectedType
      );
      if (!isAllSameType) {
        this._toastr.error("All slideType must be in same selected Type");
        return false;
      }
    }
  
    return true;
  }
  ngOnDestroy() {
    // Reset form controls
    this.myForm.reset();
    this.myForm.patchValue({
      Type: '',
      CategoryName: '',
      Description: '',
      SlideId: ''
    });
    
    // Reset other component properties
    this.selectedSlideId = null;
    this.selectedCategory = '';
    this.isTypeDropdownOpen = false;
    this.isCategoryDropdownOpen = false;
    this.isSaveTemplateLoading = false;
  }
}
