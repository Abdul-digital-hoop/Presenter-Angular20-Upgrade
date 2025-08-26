import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateService } from '../Service/template.service';
import { ToastrService } from 'ngx-toastr';
import { SlideType } from 'src/app/utility/MasterConstants';
import { MasterSlideTypeName } from 'src/app/utility/constants';

@Component({
  selector: 'app-templates-publish',
  templateUrl: './templates-publish.component.html',
  styleUrls: ['./templates-publish.component.scss']
})
export class TemplatesPublishComponent implements OnInit, OnChanges {
  @ViewChild('tagInputElement') tagInputElement!: ElementRef;
  isloading: boolean = false;
  isComponentLoading: boolean = false;
  @Input() templateTags!:string
  @Input()templatePrice!: number
  @Input() templateDescription !:string
  @Input() templateId!: string;
  @Input() templateName!: string;
  @Input() categoryName!: string;
  @Input() categoryList!: any;
  @Input() templateType!: any;
  @Input() templateSlideType!: any;
  @Input() previewSlideId!:any;
  isCategoryDropdownOpen = false;
  isTypeDropdownOpen = false;
  isDropdownOpen: boolean = false;
  selectedCategoryName: string = '';
  selectedTemplateType: string ='';
  isTagInputFocused: boolean = false;
  removingTagIndex: number | null = null;
  tagInput:string = "";
  tags: string[] = [];
  tagError = "";
  popularFeatures:any =[];
  selectedSlide:string;
  selectedslideList:any =[];
  PresentationResponse :any =[];
  selectedSlideId: string | null = null;
  @Output() closedForm = new EventEmitter<void>();
  @Output() updatedTemplateCard = new EventEmitter<any>();
  masterSlideTypeName = MasterSlideTypeName;
  publishForm!: FormGroup;
  maxDescriptionLength = 150;
  maxNameLength = 100;

  constructor(private fb: FormBuilder, private _templateService: TemplateService, private toastr: ToastrService) {
    this.popularFeatures = SlideType
    .filter(slide => slide.ContentType === "POPULAR")
    .map(slide => slide.Name); 
    this.popularFeatures.unshift("Presentation")
  }

  ngOnInit(): void {
    this.loadSlideTypes();
  }

  loadSlideTypes() {
    this.isComponentLoading = true;
    this._templateService.getSlideTypesForTemplate(this.templateId,false).subscribe({
      next: (response) => {
        this.selectedslideList = response;
        this.isComponentLoading = false;
        const isSlideMatched = this.selectedslideList.some(slide => slide?.slideId === this.previewSlideId);
        this.publishForm.controls['SlideId'].setValue(isSlideMatched ? this.previewSlideId : '');
      },
      error: (error) => {
        console.error('Failed to load slide types:', error);
        this.isComponentLoading = false;
      }
    });
  }

  toggleDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    this.isDropdownOpen = this.isCategoryDropdownOpen;
  }
   

  toggleTypeDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
    this.isDropdownOpen = this.isTypeDropdownOpen;
  }

  selectType(type: string, event: Event) {
    event.stopPropagation(); 
  
    this.selectedTemplateType = type; 
    this.publishForm.controls['type'].setValue(type); // Update form control
    this.isTypeDropdownOpen = false; // Close dropdown after selection
  }
  
  
  selectCategory(category: any, event: Event) {
    event.stopPropagation(); 
  
    this.publishForm.controls['categories'].setValue(category.id);
    this.selectedCategoryName = category.categoryName;
  
    this.isCategoryDropdownOpen = false;
    this.isDropdownOpen = false;
  }
  
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!event.target || !(event.target as HTMLElement).closest('.custom-dropdown-container')) {
      this.isCategoryDropdownOpen = false;
      this.isTypeDropdownOpen = false;
      this.isDropdownOpen = false;
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.initializeForm();
    if (changes['categoryList'] || changes['categoryName']) {
      this.setFormInitialValues();
    }

    if (changes['templateName'] && this.publishForm) {
      this.publishForm.controls['name'].setValue(this.templateName || '');
    }

    if (changes['templateDescription'] && this.publishForm) {
      this.publishForm.controls['description'].setValue(this.templateDescription || '');
    }

    if (changes['templatePrice'] && this.publishForm) {
      this.publishForm.controls['price'].setValue(this.templatePrice || 0);
    }
    if (changes['templateTags']) {
      this.setTagsFromInput(); 
      this.publishForm.controls['tags'].setValue(this.templateTags || '');
    }

    if (changes['templateType'] && this.publishForm) {
      this.publishForm.controls['type'].setValue(this.templateType || 'no Type');
      this.selectedTemplateType = this.templateType || 'Select Type'; 
    }

    if (changes['previewSlideId'] && this.publishForm) {
      const isSlideMatched = this.selectedslideList.some(slide => slide?.slideId === this.previewSlideId);
      this.publishForm.controls['SlideId'].setValue(isSlideMatched ? this.previewSlideId : '');
    }
  
  }

  preventEnter(KeyboardEvent: any) {
    event.preventDefault();
  }

  setTagsFromInput() {
    this.tags = this.templateTags ? this.templateTags.split(',').map(tag => tag.trim()) : [];
    this.updateTagsValue();
  }

  addTag(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    setTimeout(() => {
        let value = input.value.trim();
        const tagPattern = /^[\p{L}\p{M}\s'!@#$%^&*()_+\-=[\]{};:"\\|,.<>/?~`]+$/u;
        const words = value.split(',').map(word => word.trim()).filter(word => word !== '');
        let invalidWords = words.filter(word => !tagPattern.test(word));
        this.tagError = invalidWords.length > 0 ? `Invalid characters in: ${invalidWords.join(', ')}` : '';
        if (value === '') {
            this.tagError = '';
        }
        if ((event.key === ',' || event.key === 'Enter') && value.length > 0) {
            event.preventDefault();

            if (invalidWords.length > 0) {
                return; 
            }

            words.forEach(word => {
                if (!this.tags.includes(word)) {
                    this.tags.push(word);
                }
            });

            this.updateTagsValue();
            input.value = ''; 
            this.tagError = '';
        }
    }, 0);
}

  removeTag(index: number,event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.removingTagIndex = index;
    setTimeout(() => {
    this.tags.splice(index, 1);
    this.updateTagsValue();
    this.removingTagIndex = -1;
    },300)
  }

  updateTagsValue() {
    this.publishForm.controls['tags'].setValue(this.tags.join(',')); 
  }
  

  initializeForm() {
    this.publishForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,  
          Validators.maxLength(100), 
          (control: AbstractControl) =>
            control.value && control.value.trim().length === 0
              ? { noOnlySpaces: 'Name cannot be empty or only spaces' }
              : null
        ]
      ],
      tags: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?!.*\d)[\p{L}\p{M}\s'!@#$%^&*()_+\-=[\]{};:"\\|,.<>/?~`]+$/u)
        ]
      ],      
      categories: [null, Validators.required],
      price: [
        0, 
        [
          Validators.required,
          Validators.min(0),
          Validators.max(8000),
          Validators.pattern(/^\d+(\.\d{1,2})?$/) 
        ]
      ],
      type: [null, Validators.required], 
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.maxDescriptionLength),
          (control: AbstractControl) => 
            control.value && control.value.trim().length === 0 
              ? { noOnlySpaces: 'Description cannot be empty or only spaces' } 
              : null
        ]
      ],
      SlideId: ['', Validators.required]    
    });

    this.setFormInitialValues();
  }

  setFormInitialValues() {
    if (this.publishForm) {
      this.setTagsFromInput();
      const selectedCategory = this.categoryList?.find(cat => cat.categoryName === this.categoryName);
      if (selectedCategory) {
        this.publishForm.controls['categories'].setValue(selectedCategory.id);
        this.selectedCategoryName = selectedCategory.categoryName;
      }
      const categoryId = selectedCategory ? selectedCategory.id : null;
      this.publishForm.patchValue({
        name: this.templateName || '',
        categories: categoryId,
        description: this.templateDescription,
        price:this.templatePrice,
        tags: this.tags.join(','),
        type:this.templateType,
        SlideId:this.previewSlideId
      });
      this.selectedTemplateType = this.templateType || 'Select Type';
    }
  }

  loadSlides(i:any) {
    this.selectedslideList = this.PresentationResponse?.slides[i]?.slides
  }
  
  selectSlide(slideId: string) {
    this.previewSlideId = slideId;
    this.selectedSlideId = slideId;
    this.publishForm.controls['SlideId'].setValue(slideId);
    this.publishForm.controls['SlideId'].markAsTouched();
    this.publishForm.controls['SlideId'].updateValueAndValidity();
  }

  private isValidSlideType(): boolean {
    const typeControl = this.publishForm.controls['type'];
    const selectedType = typeControl.value;
  
    if (!selectedType) {
      typeControl.setErrors({ required: true });
      typeControl.markAsTouched();
      return false;
    }
  
    if (selectedType === this.popularFeatures[0]) {
      typeControl.setErrors(null);
      return true;
    }
  
    const allMatch = this.selectedslideList.every(type => type.slideTypeName === selectedType);

    if (!allMatch) {
      typeControl.setErrors({ invalidType: true });
      typeControl.markAsTouched();
      return false;
    }
  
    typeControl.setErrors(null);
    return true;
  }
  
  
  onSubmit() {
    if (this.isloading) {
      return;
    }

    this.isloading = true;
    this.publishForm.markAllAsTouched();
    const isSlideTypeValid = this.isValidSlideType();
    if (this.publishForm.valid && isSlideTypeValid) {
      const selectedCategory = this.categoryList.find(category => category.id === Number(this.publishForm.value.categories));
      const categoryData = {
        categoryId: selectedCategory?.id || null,
        categoryName: selectedCategory?.categoryName || ''
      };
  
      const payload = {
        templateId: this.templateId,
        templateName: this.publishForm.value.name.trim(),
        tags: this.publishForm.value.tags,
        categories: [categoryData],
        price: Number(this.publishForm.value.price),
        description: this.publishForm.value.description.trim(),
        type: this.publishForm.value.type,
        previewSlideId:this.publishForm.value.SlideId
      };
  
      this._templateService.publishTemplate(payload).subscribe({
        next: (response) => {
          this.isloading = false;
          this.toastr.success('Published successfully!');
          this.updatedTemplateCard.emit(response)
          this.closeForm();
        },
        error: (error) => {
          this.toastr.error('Failed to publish. Please try again.');
          console.error('Publish Error:', error);
          this.isloading = false;
        }
      });
    } else {
      this.isloading = false;
      this.toastr.error('Please fill all required fields correctly');
    }

    if (this.tagInputElement) {
      this.tagInputElement.nativeElement.value = '';
    }
  }
  

  closeForm(): void {
    this.publishForm.reset();
    this.setFormInitialValues();
    this.closedForm.emit();

    if (this.tagInputElement) {
      this.tagInputElement.nativeElement.value = '';
      this.tagError ='';
    }
  }

  ngOnDestroy() {
    this.isComponentLoading = false;
    this.isloading = false;
  }
}
