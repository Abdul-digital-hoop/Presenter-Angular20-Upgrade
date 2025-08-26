import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { ImageUploadeModuleName } from 'src/app/utility/constants';
import { settingVariables } from 'src/app/utility/SettingVariables';

@Component({
  selector: 'app-reusable-image-crop',
  templateUrl: './reusable-image-crop.component.html',
  styleUrls: ['./reusable-image-crop.component.scss']
})
export class ReusableImageCropComponent implements OnInit {
  @Input() currentImageFormat: string = '';
  @Input() currentOrginalImage: string = '';
  @Input() currentCroppedImage: string = '';
  @Input() instanceId: string = '';
  @Input() currentUploadedImageEvent: any;
  @Input() existingCroppedPossition: any | null = null;
  @Output() isInticateImageUploading = new EventEmitter<any>();
  @Output() inticateCustomerBackToUpload = new EventEmitter<any>();
  @Output() savedImageEntityDetails = new EventEmitter<{response: any, type: string}>();
  public settingVariable = settingVariables;
  public isHideAndShowCropper: boolean = false;
  public cropperRatio: boolean = false;
  public cropPositionWidthRatio: number;
  public cropPositionHeightRatio: number;
  public hideResizeSquares: boolean = true;
  public ratioButtonType: string = 'Free';
  public cropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  };
  public newCroppedPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
  public emptyCropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
  public newCroppedImage: string = '';
  constructor(private _http: HttpClient, private _presentationThemeService: PresentationThemeService, public _workspaceService: WorkspaceService) {}

  ngOnInit(): void {
  }
  imageCropped(event: any) {
    if (event.cropperPosition) {
      const X1 = event.cropperPosition.x1;
      const X2 = event.cropperPosition.x2;
      const Y1 = event.cropperPosition.y1;
      const Y2 = event.cropperPosition.y2;
      this.newCroppedPosition = { x1: X1, y1: Y1, x2: X2, y2: Y2 };
    }
    this.convertImageUrlToBase64(event.objectUrl!);
  }
  convertImageUrlToBase64(imageUrl: string): void {
    this._http.get(imageUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        this.newCroppedImage = base64data;
      };
      reader.readAsDataURL(blob);
    });
  }
  imageLoaded() {
    this.hideResizeSquares = true;
    this.isHideAndShowCropper = !this.isHideAndShowCropper;
    if (["gif", "svg"].includes(this.currentImageFormat)) {
      this.freeSizeRatio();
      this.cropperPosition = this.emptyCropperPosition;
    } else if (this.existingCroppedPossition && this.existingCroppedPossition !== this.emptyCropperPosition) {
      setTimeout(() => {
        this.hideResizeSquares = false;
        this.cropperPosition = this.existingCroppedPossition;
      }, 200);
    } else {
      this.freeSizeRatio();
      this.cropperPosition = this.emptyCropperPosition;
    }
  }

  perfectRatio() {
    this.ratioButtonType = this.settingVariable?.RatioPerfect;
    this.cropperRatio = true;
    this.cropPositionWidthRatio = 8;
    this.cropPositionHeightRatio = 9;
    this.hideResizeSquares = true;
  }
  freeSizeRatio() {
    this.ratioButtonType = this.settingVariable?.RatioFree;
    this.cropperRatio = false;
    this.hideResizeSquares = false;
    this.cropPositionWidthRatio = 20;
    this.cropPositionHeightRatio = 12;
  }
  squareRatio() {
    this.ratioButtonType = this.settingVariable?.RatioSquare;
    this.cropperRatio = true;
    this.cropPositionWidthRatio = 1;
    this.cropPositionHeightRatio = 1;
    this.hideResizeSquares = false;
  }
  backToUploadComponent() {
     this.clearLocalVariables().finally(()=>{
      this.inticateCustomerBackToUpload.emit();
     })
  }
  saveCurrentCroppedImage() {
    var imageUploadedType = this.instanceId;
    if (!imageUploadedType) {
      throw new Error('currentImageUploadedType is null or undefined');
    }
    switch (imageUploadedType) {
      case ImageUploadeModuleName.ThemeBackgroundImage:
        this.themeBackgroundUploadImageAPI().then((response:any) => {
          this.isInticateImageUploading.emit(false);
          this.savedImageEntityDetails.emit({response, type: ImageUploadeModuleName.ThemeBackgroundImage});
          this.clearLocalVariables();
        });
        break;
      case ImageUploadeModuleName.ThemeLogoImages:
        this.themeLogoImageAPI().then((response:any) => {
          this.isInticateImageUploading.emit(false);
          this.savedImageEntityDetails.emit({response, type: ImageUploadeModuleName.ThemeLogoImages});
          this.clearLocalVariables();
        });
        break;
      case ImageUploadeModuleName.SlideImage:
        // this.slideLevelImageAPI();
        break;
      case ImageUploadeModuleName.MultiSlideImage:
        this.multiSlideImageAPI().then((response:any) => {
          this.isInticateImageUploading.emit(false);
          this.savedImageEntityDetails.emit({response, type: ImageUploadeModuleName.MultiSlideImage});
          this.clearLocalVariables();
        });
        break;
      default:
        console.error('Invalid context for backToUploadComponent');
    }
  }
  themeBackgroundUploadImageAPI(): Promise<any> {
    this.isInticateImageUploading.emit(true);
    return new Promise((resolve, reject) => {
      var croppedImage = this.newCroppedImage ? this.newCroppedImage : this.currentOrginalImage;
      this._presentationThemeService.updateThemeBackgroundImage(this.currentOrginalImage, croppedImage, this.newCroppedPosition,this._workspaceService.isTemplate)
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }
  themeLogoImageAPI(): Promise<any> {
    this.isInticateImageUploading.emit(true);
    return new Promise((resolve, reject) => {
      var croppedImage = this.newCroppedImage ? this.newCroppedImage : this.currentOrginalImage;
      this._presentationThemeService.updateThemeLogo(this.currentOrginalImage, croppedImage, this.newCroppedPosition)
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }

  multiSlideImageAPI(): Promise<any> {
    this.isInticateImageUploading.emit(true);
    return new Promise((resolve, reject) => {
      var croppedImage = this.newCroppedImage ? this.newCroppedImage : this.currentOrginalImage;
      this._workspaceService.updateMultimediaSlideImage(croppedImage)
        .then(response => {
          resolve(response);
        }, error => {
          reject(error);
        });
    });
  }

  closeCurrentCropperImage() {
    this.clearLocalVariables().finally(()=>{
      this.inticateCustomerBackToUpload.emit();
    })
  }
  clearLocalVariables(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.currentImageFormat = '';
      this.currentOrginalImage = '';
      this.currentCroppedImage = '';
      this.currentUploadedImageEvent = null;
      this.existingCroppedPossition = null;
      this.isHideAndShowCropper = false;
      this.cropperRatio = false;
      this.cropPositionWidthRatio = 0;
      this.cropPositionHeightRatio = 0;
      this.hideResizeSquares = true;
      this.ratioButtonType = 'Free';
      this.cropperPosition = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      };
      this.newCroppedPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
      this.emptyCropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
      this.newCroppedImage = '';
      resolve();
      console.log("Clear Local Variable Image Crop");
    });
  }
}
