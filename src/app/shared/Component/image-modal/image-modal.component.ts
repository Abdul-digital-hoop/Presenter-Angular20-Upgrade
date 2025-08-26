import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { settingVariables } from 'src/app/utility/SettingVariables';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { active } from 'd3';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ImageCropComponent } from '../image-crop/image-crop.component';
import { HttpClient } from '@angular/common/http';
import { ImageType, ImageUploadeModuleName, MasterSlideTypeName } from 'src/app/utility/constants';
declare var $: any;
@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent implements OnInit{
  @Input('SlideDetails') public slideDetails;
  @Input('urlForImage') public OriginalImage;
  @Output() SlideImageRemove = new EventEmitter<any>();
  @Output() SlideImageObject = new EventEmitter<any>();
  @ViewChild(ImageUploadComponent, { static: false }) imageUploadComponent: ImageUploadComponent;
  @ViewChild(ImageCropComponent, { static: false }) imageCropComponent: ImageCropComponent;

  settingVariable = settingVariables;
  imageEvent: any="";
  SourceSlideImage: any='';
  SourceImageDatabase:any='';
  isShowCropModal: boolean=false;
  allowedSizeType: number = 2048;
  allowedFileTypes: string[] = [
    'jpg',
    'png',
    'gif',
    'jpeg',
    'svg'
  ];
  imageformat:any;
  svgimage: any;
  uploadTabNumber: any;
  fileExtension:any;
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  file: any;
  imageLoaded:any;
  croppedPositionObj = { x1: 0, y1: 0, x2: 0, y2: 0 };
  emptyCropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
  isLoading = false;
  ImageType = ImageType;
  masterSlideTypeName = MasterSlideTypeName;
  isUpdateImageDivDisabled :boolean = false;
  isRemoveImageDisabled :boolean = false;
  backToUploadTriggered: boolean = false;
  constructor(private _presentationService:PresentationService,public workSpaceService:WorkspaceService,private _http:HttpClient) {
    this.workSpaceService.isLoading$.subscribe(
      loading => this.isLoading = loading
    );
  }

  ngOnInit(): void {
    this.SourceImageDatabase = this.workSpaceService?.slideContentImage?.originalUrl == null ? '': this.workSpaceService?.slideContentImage?.originalUrl;
    this.svgimage = this.workSpaceService?.slideContentImage?.originalUrl;
  }
  ngOnChanges(){
    this.SourceImageDatabase = this.workSpaceService?.slideContentImage?.originalUrl == null ? '': this.workSpaceService?.slideContentImage?.originalUrl;
    if (this.imageUploadComponent) {
  }
  if (this.imageCropComponent) {
  }
  this.isLoading = false;
  }
  getModal(){
    $('#imageAddModal').modal('show');
    this.isShowCropModal=false;
    const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
    if (modalBackdrop) {
        modalBackdrop.remove();
    }
  }
  getModalUpdate(){debugger
    if(this.isUpdateImageDivDisabled){
      return;
    }
    const fileExtension: string = this.workSpaceService?.slideContentImage?.originalUrl.split('.').pop().toLowerCase();
    if (fileExtension == 'svg' || fileExtension == 'gif') {
      this.imageformat = fileExtension;
      this.SourceSlideImage = this.workSpaceService?.slideContentImage?.originalUrl;
      if(!this.SourceSlideImage){
        $('#imageAddModal').modal('show');
        const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
        if (modalBackdrop) {
            modalBackdrop.remove();
        }
        this.isShowCropModal=false;
      }else{
        this.isUpdateImageDivDisabled = true;
          this.SourceSlideImage = this.workSpaceService?.slideContentImage?.originalUrl;
          this.SourceImageDatabase = this.workSpaceService?.slideContentImage?.originalUrl
          this.getSlideImageasBase64forImage(this.workSpaceService?.presentationId,this.workSpaceService?.activeSlideId);
        } 
    }else{
      this.isUpdateImageDivDisabled = true;
      this.SourceSlideImage = this.workSpaceService?.slideContentImage?.originalUrl;
      this.SourceImageDatabase = this.workSpaceService?.slideContentImage?.originalUrl
      this.getSlideImageasBase64forImage(this.workSpaceService?.presentationId,this.workSpaceService?.activeSlideId);
    }
  }
  getSlideImageasBase64forImage(presentationId:string,activeSlideId:string) {
   
    const data ={
      presentationId:presentationId,
      slideId:activeSlideId,
      imageType:ImageUploadeModuleName.SlideImage,
      themeId:"",
      isTemplate:this.workSpaceService.isTemplate
    };
    this._presentationService.getslideBase64String(data).subscribe(
      (response: any) => {
        var imageData = response['item'];
        this.OriginalImage = imageData?.base64Images;
        $('#imageAddModal').modal('show');
        const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
        if (modalBackdrop) {
            modalBackdrop.remove();
        }
        this.isShowCropModal=false;
        this.isUpdateImageDivDisabled = false;
      },
      (error: any) => {
        console.log(error);
        this.isUpdateImageDivDisabled = false;
      }
    )
  }
  RemoveSlideImage(type: any){
    this.isLoading = false;
    this.imageEvent='';
    this.SourceImageDatabase='';
    var deleteImage = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this._presentationService.RemoveContentImage(deleteImage).subscribe(
      (response: any) => {
        this.workSpaceService.slideContentImage.originalUrl =null;
        this.workSpaceService.slideContentImage.croppedUrl = null;
        this.workSpaceService.slideContentImage.croppedPosition = null;
        // this.workSpaceService.slideLayoutImage = this.workSpaceService.slideLayoutDefaultImage;
        this.workSpaceService.slidePptImage = null;
        this.workSpaceService.storeActiveSlideDetails();
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
    this.SlideImageRemove.emit(type);
  }
  uploadImage(event:any){
    let fileExtension;
    if (event?.url) {
      fileExtension = event.type.toLowerCase();
    } else {
      const file = event?.target?.files[0] || event[0]?.file;
      fileExtension = file?.name.split('.').pop().toLowerCase();
    }
    if (!this.allowedFileTypes.includes(fileExtension)) {
      $('#imageAddModal').modal('hide');
      $('#fileTypeInvalide').modal('show');
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
      return;
    }
    if (event?.target?.files[0] && Math.floor(event.target.files[0].size / 1024) > this.allowedSizeType) {
      $('#imageAddModal').modal('hide');
      $('#fileSizeInvalide').modal('show');
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (modalBackdrop) {
          modalBackdrop.remove();
      }
      return;
    }
    this.imageEvent = event;
    if (fileExtension === 'svg' || fileExtension === 'gif') {
      this.imageformat = fileExtension;
    }
    if (event?.url) {
      //this.SourceSlideImage = event.url;
      fetch(event?.url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          this.SourceSlideImage = base64Url;
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error converting URL to base64:', error);
      });
    } else {
    const file = event.target?.files?.[0] || event[0]?.file;
    
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        this.SourceSlideImage = loadEvent.target?.result;
      };
      reader.readAsDataURL(file);
  }
      this.isShowCropModal=false;
  }
  saveSlideImageObj(event:any){
    this.SlideImageObject.emit(event);
    this.imageEvent='';
    this.imageLoaded = false;
    this.SourceImageDatabase = '';
    this.imageformat = null;
    this.OriginalImage = null;
    this.svgimage = null;
    this.SourceSlideImage = null;
    this.isShowCropModal = false;
  }
  emptyImageEvent(event:any){
    if(event){
      this.imageEvent='';
      this.imageLoaded = false;
      this.SourceImageDatabase = '';
      this.imageformat = null;
      this.OriginalImage = null;
      this.svgimage = null;
      this.SourceSlideImage = null;
      this.isShowCropModal = false;
    }
  }
  ImageSourceEvent(event:any){
    this.SourceImageDatabase=event;
  }
  ImageSource(event:any){
    this.isShowCropModal=true;
    this.SourceImageDatabase=event;
    $('#imageAddModal').modal('hide');
  }
  //Drag or Drop files for Image
  slidefilesDropped(event: any) {
    const reader = new FileReader();
    const binaryString = reader.readAsDataURL(event[0]?.file);
    const fileExtension: string = event[0]?.file.name.split('.').pop().toLowerCase();
    if (!this.allowedFileTypes.includes(fileExtension)) {
      $('#fileTypeInvalide').modal('show');
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (modalBackdrop) {
          modalBackdrop.remove();
      }
      return;
    }
    if (Math.floor(event[0]?.file?.size / 1024) > this.allowedSizeType) {
      $('#fileSizeInvalide').modal('show');
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (modalBackdrop) {
          modalBackdrop.remove();
      }
      return;
    }
    this.isLoading = true;
    reader.onerror = (event: any) => {
      console.log("File could not be read: " + event.target.error.code);
      return event.target.error.code;
    };
    this.imageEvent = event;
    if (fileExtension == 'svg' || fileExtension == 'gif') {
      this.imageformat=fileExtension
    }
    this.convertImageUrlToBase64(event[0]?.url?.changingThisBreaksApplicationSecurity);
  }
  convertImageUrlToBase64(imageUrl: string): void {
    this.isLoading = true;
  
    httpGetAsync(imageUrl, (responseText) => {
      const binaryString = atob(responseText.split(',')[1]); 
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      
      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
  
      let blob;
      if (this.imageformat === 'svg') {
        blob = new Blob([bytes], { type: 'image/svg+xml' });
      } else {
        blob = new Blob([bytes], { type: 'image/jpeg' });
      }
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const base64data = reader.result as string;
        this.SourceSlideImage = base64data;
        var SaveObj = {
          originalUrl: base64data, 
          croppedUrl: base64data, 
          croppedPosition: this.croppedPositionObj,
          presentationId: this.workSpaceService.presentationId,
          slideId: this.workSpaceService.activeSlideId,
          isTemplate: this.workSpaceService.isTemplate
        };
        this.SlideImageObject.emit(SaveObj);
        this._presentationService.contentImageUpdate(SaveObj).subscribe(
          (response: any) => {
            //this.workSpaceService.storeActiveSlideDetails();
            this.isLoading = false;
            this.workSpaceService.storeActiveSlideDetails().then(() => {
              if (this.workSpaceService.slideLayoutType === 'Default') {
                const layoutId = this.workSpaceService.getLayoutData(this.ImageType.IMAGE_RIGHT);
                if(this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.POWER_POINT ||this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.GoogleSlides || this.workSpaceService.slideContentType == this.masterSlideTypeName.QUIZ || this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.INSTRUCTION_SLIDE_TYPE){
                  this.designSlideSelectLayoutOptions(layoutId[0].id, this.ImageType.FULL_IMAGE);
                }
                else{
                  this.designSlideSelectLayoutOptions(layoutId[0].id, this.ImageType.IMAGE_RIGHT);
                }
              }
            }).catch((error) => {
              console.error('Error storing active slide details:', error);
            });
            this.workSpaceService.slideContentImage.originalUrl = response?.originalUrl;
            this.workSpaceService.slideContentImage.croppedUrl = response?.croppedUrl ?? response?.originalUrl;
            this.workSpaceService.slideContentImage.croppedPosition = response?.croppedPosition;
          },
          (error: any) => {
            console.log(error?.error);
          }
        );
        // You can now use 'base64data' as the base64 representation of the image
      };
      reader.readAsDataURL(blob);
      this.isShowCropModal=false;
    });
  }
  designSlideSelectLayoutOptions(layoutId:any,layoutType:any){
    this.workSpaceService.slideLayoutId = layoutId;
    this.workSpaceService.slideLayoutType = layoutType;
    let applyLayoutDTO = {
      presentationId: this.workSpaceService.presentationId,
      slideId:this.workSpaceService.activeSlideId,
      layoutId: layoutId,
      isTemplate: this.workSpaceService.isTemplate
    }
    this._presentationService.applyLayout(applyLayoutDTO).subscribe(
      (response: any) => {
        if (this.workSpaceService.activeSlideTypeName == this.masterSlideTypeName.MULTIPLE_CHOICE_SLIDE_TYPE) {
          if( layoutType == 'Default' || layoutType == 'Full Image' ){
            this.workSpaceService.slideLayoutActive = false;
          }else{
            this.workSpaceService.slideLayoutActive = true;
          }
          this.workSpaceService.dynamicComponent_Clone.instance.multipleChoiceData = this.workSpaceService.options;
          this.workSpaceService.dynamicComponent_Clone.instance.updateChart(this.workSpaceService.dynamicChartData(this.workSpaceService.options));
        } 
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  selectTabForUpload(Tab:any) {
    this.uploadTabNumber = Tab;
  }
  resetState() {
    this.imageLoaded = false;
    this.imageEvent = '';
    this.SourceImageDatabase = '';
    this.imageformat = null;
    this.OriginalImage = null;
    this.svgimage = null;
    this.SourceSlideImage = null;
    this.isShowCropModal = false;
  }
  showLoadingIndicator(show: boolean) {
    this.isLoading = show;
  }
  handleBackToUpload(isBack:boolean) {
    if (isBack) {
      this.backToUploadTriggered = true; // Show upload component
    } else {
    this.backToUploadTriggered = false; // Set back to upload state
    this.imageEvent = ''; // Optionally reset the uploaded image
  }
}
}

//gif get value
function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();

  xmlHttp.responseType = 'blob'; 

  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      const reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsDataURL(xmlHttp.response); 
    }
  };

  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}
