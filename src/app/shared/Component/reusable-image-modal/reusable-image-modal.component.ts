import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { ImageUploadeModuleName } from 'src/app/utility/constants';
declare var $: any;
export class ImageTypeClass {
  Type:string;
}

@Component({
    selector: 'app-reusable-image-modal',
    templateUrl: './reusable-image-modal.component.html',
    styleUrls: ['./reusable-image-modal.component.scss'],
    standalone: false
})
export class ReusableImageModalComponent implements OnInit {
  @Input() imageURL: string | null = null;
  @Input() imageUploadedType: string = '';
  @Input() imageURLEntity: any | null = null;
  @Input() instanceId: string = '';
  @Input() ThemeId: string = '';
  @Output() updatedImageToParent = new EventEmitter<any>();
  
  // Dynamic allowed file types based on slide type
  get allowedFileTypes(): string[] {
    if (this.workSpaceService.activeSlideTypeName === 'Multimedia') {
      return ['jpg', 'png', 'jpeg', 'svg']; // No GIF for Multimedia
    }
    return ['jpg', 'png', 'gif', 'jpeg', 'svg']; // Include GIF for other slide types
  }
  
  public allowedSizeType: number = 2048;
  public currentlyOrginalImage: any = '';
  public currentlyUploadedImage: any = '';
  public currentUploadedImageEvent: any | null = null;
  public currentImageformat: string = '';
  public currentImageURLEntity: any | null = null;
  public currentImageUploadedType: any | null = null;
  public isImageUploadingLoader: boolean = false;
  public isShowCrop: boolean = false;
  public emptyCropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
  dragandDorpImageCoordinates: { x1: number; y1: number; x2: number; y2: number; };
  croppedPositionObj = { x1: 0, y1: 0, x2: 0, y2: 0 };
  constructor(public workSpaceService: WorkspaceService, 
    public _presentationService: PresentationService,
     public _presentationThemeService: PresentationThemeService,
     private cdr: ChangeDetectorRef) { }
  // This method initializes the component and sets the currently uploaded image if an image URL is provided.
  ngOnInit(): void {
    this._presentationThemeService.setImageType(this.imageUploadedType);
    this.currentlyOrginalImage = this.imageURL;
    this.currentlyUploadedImage = this.imageURL;
    this.currentUploadedImageEvent = null;
    this.currentImageURLEntity = this.imageURLEntity;
    this.currentImageUploadedType = this._presentationThemeService.objForPassingImageTypeToChildComponent.Type;
    // this.isShowCrop = this.imageURL ? true:false;
  }
  ngAfterViewInit() {
    this._presentationThemeService.setImageType(this.imageUploadedType);
    this.currentlyOrginalImage = this.imageURL;
    this.currentlyUploadedImage = this.imageURL;
    this.currentUploadedImageEvent = null;
    this.currentImageURLEntity = this.imageURLEntity;
    this.currentImageUploadedType =  this._presentationThemeService.objForPassingImageTypeToChildComponent.Type;
    // this.isShowCrop = this.imageURL ? true:false;
  }
  openImageUploadModal(): void {
    switch (this.imageUploadedType) {
      case ImageUploadeModuleName.ThemeLogoImages:
        this.currentImageUploadedType = "ThemeLogoImage";
        var imageTypeClass = new ImageTypeClass();
        imageTypeClass.Type = "ThemeLogoImage"
        this._presentationThemeService.setImageType(imageTypeClass.Type);
        break;
      case ImageUploadeModuleName.ThemeBackgroundImage:
        this.currentImageUploadedType = "ThemeBackgroundImage";
        var imageTypeClass = new ImageTypeClass();
        imageTypeClass.Type = "ThemeBackgroundImage"
        this._presentationThemeService.setImageType(imageTypeClass.Type);
        break;
      case ImageUploadeModuleName.MultiSlideImage:
        this.isShowCrop = false;
        this.currentImageUploadedType = "MultiSlideImage";
        break;

    }
    this.cdr.detectChanges();
    $('#imageUploadModal-'+this.instanceId).modal('show');
  }
  imageUploade(event: any) {
    const reader = new FileReader();
    reader.readAsDataURL(event[0]?.file);
    const fileExtension: string = event[0]?.file.name.split('.').pop().toLowerCase();
    
    // Additional check for GIF files when slide type is Multimedia
    if (this.workSpaceService.activeSlideTypeName === 'Multimedia' && fileExtension === 'gif') {
      this.showModalAndRemoveBackdrop('#fileTypeInvalide-'+this.instanceId);
      return;
    }
    
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.showModalAndRemoveBackdrop('#fileTypeInvalide-'+this.instanceId);
      return;
    }
    if (Math.floor(event[0]?.file?.size / 1024) > this.allowedSizeType) {
      this.showModalAndRemoveBackdrop('#fileSizeInvalide-'+this.instanceId);
      return;
    }
    this.isImageUploadingLoader = true;
    reader.onerror = (event: any) => {
      console.log("File could not be read: " + event.target.error.code);
      return event.target.error.code;
    };
    this.currentUploadedImageEvent = event;
    this.currentImageformat = fileExtension === 'svg' || fileExtension === 'gif' ? fileExtension : '';
    if(this.workSpaceService.activeSlideTypeName == 'Multimedia'){
      this.convertImageUrlToBase64Multimedia(event[0]?.url?.changingThisBreaksApplicationSecurity);
    }else{
      this.convertImageUrlToBase64(event[0]?.url?.changingThisBreaksApplicationSecurity);
    }
  }
  private showModalAndRemoveBackdrop(modalId: string) {
    $(modalId).modal('show');
    // const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
    // if (modalBackdrop) {
    //   modalBackdrop.remove();
    // }
  }
  convertImageUrlToBase64Multimedia(imageUrl: string): void {
  
    httpGetAsync(imageUrl, (responseText) => {
      const binaryString = atob(responseText.split(',')[1]); 
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      
      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
  
      let blob;
      if (this.currentImageformat === 'svg') {
        blob = new Blob([bytes], { type: 'image/svg+xml' });
      } else {
        blob = new Blob([bytes], { type: 'image/jpeg' });
      }
      const reader = new FileReader();
  
      reader.onloadend = () => {
        return new Promise((resolve, reject) => {
          const base64data = reader.result as string;
          this.workSpaceService.updateMultimediaSlideImage(base64data).then(response => {
            resolve(response);
            this.updatedImageToParent.emit(response);
            this.isImageUploadingLoader = false;
          }, error => {
            reject(error);
            this.isImageUploadingLoader = false;
          });
        });
      };
      reader.readAsDataURL(blob);
    });
  }
  convertImageUrlToBase64(imageUrl: string): void {
    httpGetAsync(imageUrl, (responseText) => {
      const binaryString = atob(responseText.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      let blob;
      if (this.currentImageformat === 'svg') {
        blob = new Blob([bytes], { type: 'image/svg+xml' });
      } else {
        blob = new Blob([bytes], { type: 'image/jpeg' });
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgElement = new Image();
        imgElement.src = reader.result as string;
        setTimeout(() => {
          this.getImageCoordinates(imgElement).then(() => {
            // this.saveCurrentCroppedImage(imgElement.src);
          }).finally(() => {
            this.saveCurrentCroppedImage(imgElement.src);
          });
        }, 100);
      };
      reader.readAsDataURL(blob);
    });
    
  }
  getImageCoordinates(imgElements:HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const x1 = 0;
      const y1 = 0;
      const x2 = imgElements.naturalWidth;
      const y2 = imgElements.naturalHeight;
      this.dragandDorpImageCoordinates ={ x1, y1, x2, y2 };
      resolve();
    });
  }
  saveCurrentCroppedImage(base64String:any) {
    var imageUploadedType = this.instanceId;
    if (!imageUploadedType) {
      throw new Error('currentImageUploadedType is null or undefined');
    }
    switch (imageUploadedType) {
      case ImageUploadeModuleName.ThemeBackgroundImage:
        this.themeBackgroundUploadImageAPI(base64String).then((response: any) => {
          this.inticateImageUploading(false);
          var response = response;
          var obj = {
            response: response,
            type: ImageUploadeModuleName.ThemeBackgroundImage
          }
          this.savedImageEntityDetails(obj);
        });
        break;
      case ImageUploadeModuleName.ThemeLogoImages:
        this.themeLogoImageAPI(base64String).then((response: any) => {
          this.inticateImageUploading(false);
          var response = response;
          var obj = {
            response: response,
            type: ImageUploadeModuleName.ThemeLogoImages
          }
          this.savedImageEntityDetails(obj);
        });
        break;
      case ImageUploadeModuleName.SlideImage:
        // this.slideLevelImageAPI();
        break;
      case ImageUploadeModuleName.MultiSlideImage:
        break;
      default:
        console.error('Invalid context for backToUploadComponent');
    }
  }
  closeUploadComponentModal() {
    $('#imageUploadModal-'+this.instanceId).modal('hide');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }
    this.currentUploadedImageEvent = null;
    this.currentImageformat = '';
  }
  selectedFileEvents(event: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let fileExtension;
      if (event?.url) {
        fileExtension = event.type.toLowerCase();
      } else {
        const file = event?.target?.files[0] || event[0]?.file;
        fileExtension = file?.name.split('.').pop().toLowerCase();
      }
      if (!this.allowedFileTypes.includes(fileExtension)) {
        $('#imageUploadModal-'+this.instanceId).modal('hide');
        $('#fileTypeInvalide-'+this.instanceId).modal('show');
        const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
        if (modalBackdrop) {
          modalBackdrop.remove();
        }
        reject('Invalid file type');
        return;
      }
      if (event?.target?.files[0] && Math.floor(event.target.files[0].size / 1024) > this.allowedSizeType) {
        $('#imageUploadModal-'+this.instanceId).modal('hide');
        $('#fileSizeInvalide-'+this.instanceId).modal('show');
        const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
        if (modalBackdrop) {
          modalBackdrop.remove();
        }
        reject('File size exceeds the limit');
        return;
      }
      this.currentUploadedImageEvent = event;
      if (fileExtension === 'svg' || fileExtension === 'gif') {
        this.currentImageformat = fileExtension;
      }
      if (event?.url) {
        fetch(event?.url)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Url = reader.result as string;
              this.currentlyUploadedImage = base64Url;
              this.isShowCrop = true;
              resolve();
            };
            reader.readAsDataURL(blob);
          })
          .catch(error => {
            console.error('Error converting URL to base64:', error);
            reject('Error converting URL to base64');
          });
      } else {
        const file = event.target?.files?.[0] || event[0]?.file;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          this.currentlyUploadedImage = loadEvent.target?.result;
          this.isShowCrop = true;
          resolve();
        };
        reader.readAsDataURL(file);
      }
    }).catch(error => {
      console.error('Error processing file:', error);
    }).finally(() => {
      this.currentlyOrginalImage = this.currentlyUploadedImage;
      this.isShowCrop = true;
    });
  }
  customerTriggerBackToUploadEvent() {
    this.isShowCrop = false;
    this.clearLocalVariables().finally(() => {
      this.openImageUploadModal();
    })
  }
  clearLocalVariables(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.currentlyUploadedImage = null;
      this.currentImageURLEntity = null;
      this.allowedSizeType = 2048;
      this.currentImageformat = '';
      this.isImageUploadingLoader = false;
      resolve();
      console.log("Clear Local Variable Image modal");
    });
  }
  inticateImageUploading(isUploadingImage: any) {
    this.currentImageformat = '';
    if (isUploadingImage) {
      this.isImageUploadingLoader = true;
      $('#imageUploadModal-'+this.instanceId).modal('hide');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
    }
    else {
      this.isImageUploadingLoader = false;
    }
  }
  imageUploadModalUpdate() {
    if (this.imageUploadedType != null || this.currentImageUploadedType != null) {
      switch (this.instanceId) {
        case ImageUploadeModuleName.ThemeBackgroundImage:
          var fileExtension: string = this.imageURLEntity?.themeBackgroundImageOriginalUrl.split('.').pop().toLowerCase();
          if (fileExtension == 'svg' || fileExtension == 'gif') {
            this.currentImageformat = fileExtension;
            if (!this.imageURLEntity?.themeBackgroundImageOriginalUrl) {
              $('#imageUploadModal-'+this.instanceId).modal('show');
            } else {
              this.getSlideImageasBase64forImage(ImageUploadeModuleName.ThemeBackgroundImage);
            }
          } else {
            this.getSlideImageasBase64forImage(ImageUploadeModuleName.ThemeBackgroundImage);
          }
          break;
        case ImageUploadeModuleName.ThemeLogoImages:
          var fileExtension: string = this.imageURLEntity?.logoOriginalUrl.split('.').pop().toLowerCase();
          if (fileExtension == 'svg' || fileExtension == 'gif') {
            this.currentImageformat = fileExtension;
            if (!this.imageURLEntity?.logoOriginalUrl) {
              $('#imageUploadModal-'+this.instanceId).modal('show');
            } else {
              this.getSlideImageasBase64forImage(ImageUploadeModuleName.ThemeLogoImages);
            }
          } else {
            this.getSlideImageasBase64forImage(ImageUploadeModuleName.ThemeLogoImages);
          }
          break;
      }
    }

  }
  getSlideImageasBase64forImage(imageType:any) {
    const data = {
      presentationId: this.workSpaceService.presentationId,
      slideId: this.workSpaceService.activeSlideId,
      imageType: imageType,
      themeId: this.ThemeId,
      isTemplate:this.workSpaceService.isTemplate ?? false
    };
    this._presentationService.getslideBase64String(data).subscribe(
      (response: any) => {
        var imageData = response['item'];
        this.currentlyUploadedImage = imageData?.base64Images;
        this.currentImageURLEntity = this.imageURLEntity;
        this.currentImageUploadedType = this._presentationThemeService.objForPassingImageTypeToChildComponent.Type;
        this.isShowCrop = true;
        this.showModalAndRemoveBackdrop("#imageUploadModal-"+this.instanceId);
      },
      (error: any) => {
        console.log(error);
      }
    )
  }
  savedImageEntityDetails(response: any) {
    if (this.imageUploadedType != null || this.currentImageUploadedType != null) {
      switch (response.type) {
        case ImageUploadeModuleName.ThemeBackgroundImage:
          if (response) {
            if (this.currentImageURLEntity) {
              this.currentImageURLEntity.themeBackgroundImageOriginalUrl = response?.response?.themeBackgroundImageOriginalUrl;
              this.currentImageURLEntity.themeBackgroundImageCroppedUrl = response?.response?.themeBackgroundImageCroppedUrl;
              this.currentImageURLEntity.croppedposition = response?.response?.croppedposition;
            }
            else {
              this.currentImageURLEntity = response?.response;
            }
            this._presentationThemeService.customerThemeBackgroundImage = response?.response?.themeBackgroundImageCroppedUrl;
            if (this.imageURLEntity) {
              this.imageURLEntity.themeBackgroundImageOriginalUrl = response?.response?.themeBackgroundImageOriginalUrl;
              this.imageURLEntity.themeBackgroundImageCroppedUrl = response?.response?.themeBackgroundImageCroppedUrl;
              this.imageURLEntity.croppedposition = response?.response?.croppedposition;
            }
            else {
              this.imageURLEntity = response?.response;
            }
            this.currentImageUploadedType = response.type;
            this.imageUploadedType = response.type;
            this.imageURL = this.currentImageURLEntity.themeBackgroundImageCroppedUrl;
            this.isShowCrop = false;
            this.updatedImageToParent.emit(this.imageURLEntity);
          }
          else {
            console.log("Response is undefined or null");
          }
          break;
        case ImageUploadeModuleName.ThemeLogoImages:
            if (response) {
              if (this.currentImageURLEntity) {
                this.currentImageURLEntity.logoOriginalUrl = response?.response?.logoOriginalUrl;
                this.currentImageURLEntity.logoCroppedUrl = response?.response?.logoCroppedUrl;
                this.currentImageURLEntity.croppedposition = response?.response?.croppedposition;
              }
              else {
                this.currentImageURLEntity = response?.response;
              }
              this._presentationThemeService.customerThemeLogoImage = response?.response?.logoCroppedUrl;
              this._presentationThemeService.logoPositionType = this._presentationThemeService.checkOrientation(response?.response?.croppedposition);
              if (this.imageURLEntity) {
                this.imageURLEntity.logoOriginalUrl = response?.response?.logoOriginalUrl;
                this.imageURLEntity.logoCroppedUrl = response?.response?.logoCroppedUrl;
                this.imageURLEntity.croppedposition = response?.response?.croppedposition;
              }
              else {
                this.imageURLEntity = response?.response;
              }
              this.currentImageUploadedType = response.type;
              this.imageUploadedType = response.type;
              this.imageURL = this.currentImageURLEntity.logoOriginalUrl;
              this.isShowCrop = false;
              this.updatedImageToParent.emit(this.imageURLEntity);
            }
            else {
              console.log("Response is undefined or null");
            }
            break;
        case ImageUploadeModuleName.MultiSlideImage:
          this.updatedImageToParent.emit(response.response);
          break;
      }
    }
  }
  removeImage(imageURL: any) {
    if (this.imageUploadedType != null || this.currentImageUploadedType != null) {
      switch (this.instanceId) {
        case ImageUploadeModuleName.ThemeBackgroundImage:
          this.themeBackgroundRemoveImageAPI().finally(() => {
            this.clearLocalVariables();
            this.imageURL = null;
            this.imageURLEntity = null;
            this.imageUploadedType = null;
            this.currentImageURLEntity = null;
          });
          break;
        case ImageUploadeModuleName.ThemeLogoImages:
          this.themeLogoRemoveImageAPI().finally(() => {
            this.clearLocalVariables();
            this.imageURL = null;
            this.imageURLEntity = null;
            this.imageUploadedType = null;
            this.currentImageURLEntity = null;
          });
          break;
        default:
          console.log("case doesn't match");
          break;
      }
    }
    else {
      console.log("Cann't get image type for delete")
    }
  }
  themeBackgroundRemoveImageAPI(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._presentationThemeService.removeThemeBackgroundImage()
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }
  themeLogoRemoveImageAPI(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._presentationThemeService.removeThemeLogo()
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }
  themeBackgroundUploadImageAPI(base64String:any): Promise<any> {
    this.inticateImageUploading(true);
    return new Promise((resolve, reject) => {
      this._presentationThemeService.updateThemeBackgroundImage(base64String, base64String, this.dragandDorpImageCoordinates,this.workSpaceService.isTemplate)
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }
  themeLogoImageAPI(base64String:any): Promise<any> {
    this.inticateImageUploading(true);
    return new Promise((resolve, reject) => {
      this._presentationThemeService.updateThemeLogo(base64String, base64String, this.dragandDorpImageCoordinates)
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }
  closeCropComponentModal(){
    this.isShowCrop = false;
    this.clearLocalVariables();
  }
}

function httpGetAsync(theUrl, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.responseType = 'blob';
  xmlHttp.onload = () => {
    if (xmlHttp.status === 200) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(xmlHttp.response);
    }
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send();
}
