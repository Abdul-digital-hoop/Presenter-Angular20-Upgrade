import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { settingVariables } from 'src/app/utility/SettingVariables';
import { FormControl, FormControlName } from '@angular/forms';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { every } from 'd3';
import { MasterSlideTypeName,ImageType } from 'src/app/utility/constants';
declare var $: any;
@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent implements OnInit, OnChanges {
  @Input('SlideDetails') public slideDetails;
  @Input('URLFromSource') public URL;
  @Input('SourceImageFromModal') public imageSource;
  @Input('imageEvent') public imageEvent;
  @Input('imageformat') public imageformat;
  @Input('isShowCropModalFromModal') public isShowCropModalFromModal;
  @Input('svgimagesource') public svg_imagesource;
  @Output() SlideImageObject = new EventEmitter<any>();
  @Output() ImageEventEmpty = new EventEmitter<any>();
  @Output() PatchSourceImage = new EventEmitter<any>();
  @Output() imageformatChange = new EventEmitter<string>();
  @Output() imageEventChange = new EventEmitter<string>();
  @Output() clearURLEvent = new EventEmitter<void>();
  settingVariable = settingVariables;
  imageChangedEvent: any;
  croppedImage: string;
  image_cropper: any;
  croppedPositionObj = { x1: 0, y1: 0, x2: 0, y2: 0 };
  emptyCropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
  cropper = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  };
  cropperRatio: boolean = false;
  widthRatio: number;
  heightRatio: number;
  ratioType: string = 'Free';
  ImageEventBoolean: boolean = false;
  text: any = '';
  Image: any = '';
  showCropper: boolean = true;
  altTextForImage = new FormControl();
  allowedFileTypes: string[] = [
    'jpg',
    'png',
    'gif',
    'jpeg'
  ];
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  @Output() modalOpen = new EventEmitter<boolean>();
  hideResizeSquares:boolean = true;
  modalData: any = {};
  imageOrientation: string = 'horizontal';
  slideLayoutData: any;
  presentationId: any = "";
  masterSlideTypeName = MasterSlideTypeName;
  ImageType = ImageType;
  activeslideTypeName: any;
  layoutId: any;
  @Output() loading = new EventEmitter<boolean>();
  @Input() backToUploadTriggered: boolean = false; // Check if back to upload was triggered
  @Output() backToUploadComp = new EventEmitter<boolean>();
  constructor(
    private _http: HttpClient,
    public presentationService: PresentationService,
    public workSpaceService:WorkspaceService) { }
  ngOnInit(): void {
    this.altTextForImage = this.slideDetails?.sourceImage?.placeHolder;
    this.imageChangedEvent = this.imageEvent;
    if(this.svg_imagesource!=''){
      const fileExtension: string = this.svg_imagesource.split('.').pop().toLowerCase();
      if (fileExtension == 'svg' ) {
        this.imageformat=fileExtension;
        this.imageSource=this.svg_imagesource;
      }
    }
    // if (this.URL) {
    //   this.determineImageOrientation(this.URL);
    // }
    //this.setURL(this.URL);
    this.presentationId = this.workSpaceService.activeSlideId;
    this.activeslideTypeName = this.workSpaceService.activeSlideTypeName;
  }
  determineImageOrientation(imageUrl: string): void {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (img.width > img.height) {
        this.imageOrientation = 'horizontal';
      } else {
        this.imageOrientation = 'vertical';
      }
    };
  }
  ngOnChanges(): void {
    this.showCropper = !this.showCropper;
    this.imageChangedEvent = this.imageEvent;
  }
  ngAfterViewInit(){
    this.showCropper = !this.showCropper;
    this.imageChangedEvent = this.imageEvent;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.imageChangedEvent = this.imageEvent;
 
    if (event.cropperPosition) {
      const X1 = event.cropperPosition.x1;
      const X2 = event.cropperPosition.x2;
      const Y1 = event.cropperPosition.y1;
      const Y2 = event.cropperPosition.y2;
 
      this.croppedPositionObj = { x1: X1, y1: Y1, x2: X2, y2: Y2 };
    }
 
    if (this.workSpaceService?.slideContentImage?.croppedPosition == null) {
      this.convertImageUrlToBase64(event.objectUrl!);
    } else {
      this.convertImageUrlToBase64(event.objectUrl!);
    }
  }
 
  toggleCropperVisibility() {
    this.showCropper = !this.showCropper;
  }
 
  imageLoaded() {
    this.hideResizeSquares = true;
    this.showCropper = !this.showCropper;
 
    if (this.backToUploadTriggered && (this.imageformat != 'gif' || this.imageformat != 'svg')) {
      this.freeSize();
      this.cropper = this.emptyCropperPosition;
    }
    else if (this.workSpaceService?.slideContentImage?.croppedPosition &&
      JSON.stringify(this.workSpaceService.slideContentImage.croppedPosition) !== JSON.stringify(this.emptyCropperPosition)) {
      setTimeout(() => {
        this.hideResizeSquares = false;
        this.cropper = this.workSpaceService?.slideContentImage?.croppedPosition;
      }, 200);
    } else {
      this.freeSize();
      this.cropper = this.emptyCropperPosition;
    }
  }
 
  // async imageLoaded() {
  //   console.log('imageLoaded: Start');
  //   this.showCropper = !this.showCropper;
  //   if(this.workSpaceService?.slideContentImage?.croppedPosition != null){
  //     setTimeout(() => {
  //       this.cropper = this.workSpaceService?.slideContentImage?.croppedPosition;
  //     }, 200);
  //   }
   
  // console.log('Image loaded',this.cropper)
  //  // await this.updateCropperPosition();
 
  //   console.log('imageLoaded: Cropper position updated and imageLoaded complete');
  // }
 
  setURL(url: string): void {
    this.convertImageUrlToBase64(this.URL);
  }
 
 
 
 
  convertImageUrlToBase64(imageUrl: string): void {
    this._http.get(imageUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        this.croppedImage = base64data;
      };
      reader.readAsDataURL(blob);
    });
  }
 
  closebgImagePreview(type: any) {
    if (!type) {
      $("#imageAddModal").modal("hide");
      this.ImageEventBoolean = true;
      this.ratioType = 'Free';
      this.croppedImage = "";
      this.imageformat = "";
      this.imageformatChange.emit(this.imageformat);
      this.imageEventChange.emit(this.imageEvent);
      this.ImageEventEmpty.emit(this.ImageEventBoolean);
      this.URL = '';
      this.clearURLEvent.emit();
      this.backToUploadComp.emit(false);
    } else {
      this.loading.emit(true);
      this.imageformatChange.emit(this.imageformat);
      this.imageEventChange.emit(this.imageEvent);
      this.imageformat = "";
      this.clearURLEvent.emit();
      $("#imageAddModal").modal("hide");
      this.ratioType = 'Free';
      // if(this.workSpaceService.slideLayoutType === 'Default'){
      //   this.layoutId = this.workSpaceService.slideLayoutId;
      // }
      const layoutId = this.workSpaceService.getLayoutData(this.ImageType.IMAGE_RIGHT);
        var SaveObj = {
          originalUrl: this.imageSource,
          croppedUrl: this.croppedImage ?? this.imageSource,
          croppedPosition: this.croppedPositionObj,
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          layoutId:layoutId[0].id,
          isTemplate: this.workSpaceService.isTemplate
        };
        this.workSpaceService.uploadImageSlideId = this.workSpaceService.activeSlideId;
        this.SlideImageObject.emit(SaveObj);
        this.presentationService.contentImageUpdate(SaveObj).subscribe(
          (response: any) => {
            //this.workSpaceService.storeActiveSlideDetails();
            this.workSpaceService.uploadImageSlideId = '';
            this.workSpaceService.storeActiveSlideDetails().then(() => {
              if(this.workSpaceService.activeSlideId === response?.slideId){
                this.workSpaceService.slideLayoutId = response?.layoutId;
                this.workSpaceService.slideContentImage.originalUrl = response?.originalUrl;
                this.workSpaceService.slideContentImage.croppedUrl = response?.croppedUrl ?? response?.originalUrl;
                this.workSpaceService.slideContentImage.croppedPosition = response?.croppedPosition;
              }
            }).catch((error) => {
              console.error('Error storing active slide details:', error);
            });
            this.loading.emit(false);
            // else{
            //  // this.designSlideSelectLayoutOptions(this.workSpaceService.slideLayoutId,this.workSpaceService.slideLayoutType);
            //  this.workSpaceService.storeActiveSlideDetails();
            // }
            // if (this.workSpaceService.slideLayoutType === 'Default') {
            //   const layoutId = this.workSpaceService.getLayoutData(this.ImageType.IMAGE_RIGHT);
            //   if(this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.POWER_POINT || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.GoogleSlides || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.QUESTIONS_AND_ANSWER_SLIDE_TYPE || this.workSpaceService.slideContentType == this.masterSlideTypeName.QUIZ || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE){
            //     this.designSlideSelectLayoutOptions(layoutId[0].id,response?.slideId, this.ImageType.FULL_IMAGE);
            //   }
            //   else{
            //     this.designSlideSelectLayoutOptions(layoutId[0].id,response?.slideId, this.ImageType.IMAGE_RIGHT);
            //   }
            // }
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
     
    }
  }
  // designSlideSelectLayoutOptions(layoutId:any,slideId:any,layoutType:any){
  //   this.workSpaceService.slideLayoutId = layoutId;
  //   this.slideLayoutData = this.workSpaceService.getMasterLayoutData(layoutId)
  //   this.workSpaceService.slideLayoutType = layoutType;
  //   this.presentationId = this.workSpaceService.presentationId;
  //   let applyLayoutDTO = {
  //     presentationId: this.presentationId,
  //     slideId:slideId,
  //     layoutId: layoutId,
  //   }
  //   this.presentationService.applyLayout(applyLayoutDTO).subscribe(
  //     (response: any) => {
  //       if (this.activeslideTypeName == this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
  //         if( layoutType == 'Default' || layoutType == 'Full Image' ){
  //           this.workSpaceService.slideLayoutActive = false;
  //         }else{
  //           this.workSpaceService.slideLayoutActive = true;
  //         }
  //         this.workSpaceService.dynamicComponent_Clone.instance.multipleChoiceData = this.workSpaceService.options;
  //         this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(this.workSpaceService.options));
  //       }
  //       console.log(response);
  //     },
  //     (error: any) => {
  //       console.log(error?.error);
  //     }
  //   );
  // }
 
  backToUpload() {
    this.ImageEventBoolean = true;
    this.ratioType = 'Free';
    this.croppedImage = "";
    this.imageSource = "";
    this.imageformat = "";
    this.modalData = {};
    this.isShowCropModalFromModal = false;
    this.svg_imagesource = "";
    this.cropper = this.emptyCropperPosition;
   
    this.backToUploadComp.emit(true);
    //this.workSpaceService.slideContentImage.croppedPosition = this.emptyCropperPosition;
    this.imageformatChange.emit(this.imageformat);
    this.SlideImageObject.emit(null);
    // this.imageEventChange.emit(this.imageEvent);
    this.ImageEventEmpty.emit(this.ImageEventBoolean);
    this.PatchSourceImage.emit('');
    this.showCropper = false;
    this.freeSize();
  }
  freeSize() {
    this.ratioType = 'Free';
    this.cropperRatio = false;
    this.hideResizeSquares = false;
    this.widthRatio = 20;
    this.heightRatio = 12;
  }
  perfect() {
    this.ratioType = 'Perfect';
    this.cropperRatio = true;
    this.widthRatio = 8;
    this.heightRatio = 9;
    this.hideResizeSquares = true;
  }
  square() {
    this.ratioType = 'Square';
    this.cropperRatio = true;
    this.widthRatio = 1;
    this.heightRatio = 1;
    this.hideResizeSquares = false;
  }
 
}