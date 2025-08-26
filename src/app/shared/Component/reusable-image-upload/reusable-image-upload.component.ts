import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ImageUploadTabName } from 'src/app/utility/constants';
import { defaultmediaService } from 'src/app/core/Sevices/defaultmedia.service';
import { FileHandle } from '../../directive/dragDrop.directive';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
interface UnsplashImage {
  urls: {
    small: string;
    regular: string;
  };
  user: {
    name: string;
    username: string;
  };
  isHovered?: boolean;
}
export class ImageTypeClass {
  Type: string;
}
@Component({
  selector: 'app-reusable-image-upload',
  templateUrl: './reusable-image-upload.component.html',
  styleUrls: ['./reusable-image-upload.component.scss']
})
export class ReusableImageUploadComponent implements OnInit{
  @Output() closeUploadComponentModal = new EventEmitter<void>();
  @Output() selectedFileEvent = new EventEmitter<any>();
  @ViewChild('myInputFile', { static: false }) myInputFile: ElementRef;
  public imageUploadTabNameConstant = ImageUploadTabName;
  public currentUploadingOptionTabName: string = '';
  public isGetImageAngGifFromThirdPartyAPI: boolean = false;
  readonly unsplashReferral = 'utm_source=Slidone&utm_medium=referral';
  public imageUploadfiles: FileHandle[] = [];
  public thirdPartyImageList: UnsplashImage[] = [];
  public thirdPartyGifList: any[] = [];
  public isThirdPartyAPIError: boolean = false;
  public thirdPartyAPIErrorMessages: string = '';
  public gifSearchKey: string = '';
  public imageSearchKey: string = '';
  public currentPageForImageSearch: number = 1;
  public perPageimageRecord: number = 30;
  public emptySkeletons: number[] = Array(50).fill(0);
  public currentImageTpe: string;
  public imageTypeToChildComponent: any;
  constructor(public defaultmediaService: defaultmediaService, public workspaceService: WorkspaceService) {
    this.currentUploadingOptionTabName = this.imageUploadTabNameConstant.Device;
  }
  ngOnInit(): void {
  }
  imageUploadViaDragAndDrop(files: FileHandle[]): void {
    if (this.myInputFile && this.myInputFile.nativeElement) {
      const inputElement = this.myInputFile.nativeElement;
      const dataTransfer = new DataTransfer();

      // Filter out GIF files if the slide type is Multimedia
      const filteredFiles = files.filter(fileHandle => {
        if (this.workspaceService.activeSlideTypeName === 'Multimedia') {
          return !fileHandle.file.type.includes('gif');
        }
        return true;
      });

      for (let i = 0; i < filteredFiles.length; i++) {
        dataTransfer.items.add(filteredFiles[i].file);
      }

      inputElement.files = dataTransfer.files;

      // Create and dispatch the change event
      const changeEvent = new Event('change', { bubbles: true });
      inputElement.dispatchEvent(changeEvent);
    }
  }
  imageUploadViaInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Filter out GIF files if the slide type is Multimedia
      if (this.workspaceService.activeSlideTypeName === 'Multimedia' && file.type.includes('gif')) {
        return; // Don't process GIF files for Multimedia slide type
      }
      
      const url = URL.createObjectURL(file);
      this.imageUploadfiles.push({ file, url });
    }
    this.selectedFileEvent.emit(event);
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  closeUploadImageModal() {
    this.clearLocalVariables().finally(() => {
      this.closeUploadComponentModal.emit();
    });
  }
  uploadOptionTabs(tabName: string) {
    this.currentUploadingOptionTabName = tabName;
    this.clearLocalVariables().finally(() => {
      this.isGetImageAngGifFromThirdPartyAPI = false;
      if (this.currentUploadingOptionTabName === this.imageUploadTabNameConstant.ThiredPartyImage) {
        this.thirdPartyAPIForImage();
      } else if (this.currentUploadingOptionTabName === this.imageUploadTabNameConstant.ThiredPartyGif) {
        this.thirdPartyAPIForGif();
      }
    });

  }
  thirdPartyAPIForImage() {
    const sanitizedImageSearchQuery = this.imageSearchKey?.replace(/[^a-zA-Z0-9\s]/g, '') || 'nature';
    if (this.isGetImageAngGifFromThirdPartyAPI) return;
    this.isGetImageAngGifFromThirdPartyAPI = true;
    this.defaultmediaService.searchImages(sanitizedImageSearchQuery).subscribe(
      (response) => {
        if (response.results?.length) {
          this.thirdPartyImageList = [...this.thirdPartyImageList, ...response.results];
          this.isThirdPartyAPIError = false;
        } else {
          this.isThirdPartyAPIError = true;
          this.thirdPartyAPIErrorMessages = 'No images found for this search';
        }
        this.isGetImageAngGifFromThirdPartyAPI = false;
      },
      (error) => {
        console.error('Error fetching images', error);
        this.isThirdPartyAPIError = true;
        this.thirdPartyAPIErrorMessages = 'No images found for this search';
        this.isGetImageAngGifFromThirdPartyAPI = false;
      }
    );
  }
  thirdPartyAPIForGif() {
    const sanitizedSearchKey = this.gifSearchKey?.replace(/[^a-zA-Z0-9\s]/g, '') || 'wildlife';
    this.isGetImageAngGifFromThirdPartyAPI = true;
    this.defaultmediaService.searchGifs(sanitizedSearchKey).subscribe(
      (response) => {
        this.isGetImageAngGifFromThirdPartyAPI = false;
        this.isThirdPartyAPIError = false;
        if (response.results?.length) {
          this.thirdPartyGifList = response.results;
          this.isThirdPartyAPIError = false;
        } else {
          this.isThirdPartyAPIError = true;
          this.thirdPartyAPIErrorMessages = 'No GIFs found for this search';
        }
      },
      (error) => {
        console.error('Error fetching GIFs:', error);
        this.isGetImageAngGifFromThirdPartyAPI = false;
        this.isThirdPartyAPIError = true;
        this.thirdPartyAPIErrorMessages = 'No GIFs found for this search';
      }
    );
  }
  searchThirdPartyImage(): void {
    this.thirdPartyImageList = []
    this.currentPageForImageSearch = 1;
    this.thirdPartyAPIForImage();
  }
  searchThirdPartyGif(): void {
    this.thirdPartyGifList = []
    this.currentPageForImageSearch = 1;
    this.thirdPartyAPIForGif();
  }
  selectThirdPartyImage(image: any) {
    this.defaultmediaService.trackDownload(image.links.download_location)
      .subscribe(
        () => {
          fetch(image.urls.regular)
            .then(response => response.blob())
            .then(blob => {
              const file = new File([blob], 'unsplash-image.jpg', { type: 'image/jpeg' });
              const event = {
                target: {
                  files: [file]
                }
              };
              this.selectedFileEvent.emit(event);
            })
            .catch(error => {
              console.error('Error fetching Unsplash image:', error);
            });
        },
        error => {
          console.error('Error tracking download:', error);
          fetch(image.urls.regular)
            .then(response => response.blob())
            .then(blob => {
              const file = new File([blob], 'unsplash-image.jpg', { type: 'image/jpeg' });
              const event = {
                target: {
                  files: [file]
                }
              };
              this.selectedFileEvent.emit(event);
            })
            .catch(error => {
              console.error('Error fetching Unsplash image:', error);
            });
        }
      );
  }
  selectThirdPartyGif(gif: any) {
    const url = gif.media[0].gif.url;
    const fileType = 'gif';
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedTypes.includes(fileType)) {
      console.error('Unsupported file type:', fileType);
      return;
    }
    this.selectedFileEvent.emit({ file: null, url, type: fileType });
  }
  onGifLoad(gif: any) {
    gif.loaded = true;
  }
  clearLocalVariables(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isGetImageAngGifFromThirdPartyAPI = false;
      this.thirdPartyImageList = [];
      this.thirdPartyGifList = [];
      this.isThirdPartyAPIError = false;
      this.thirdPartyAPIErrorMessages = '';
      this.gifSearchKey = '';
      this.imageSearchKey = '';
      resolve();
      console.log("Clear Local Variable Image upload");
    });
  }
  ngOnDestroy() {
    this.clearLocalVariables().then(() => {
      console.log('Local variables cleared on destroy');
    });
  }
}
