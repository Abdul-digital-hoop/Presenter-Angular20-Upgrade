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

interface MyImage {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  isHovered?: boolean;
}
export class ImageTypeClass {
  Type: string;
}
@Component({
    selector: 'app-reusable-image-upload',
    templateUrl: './reusable-image-upload.component.html',
    styleUrls: ['./reusable-image-upload.component.scss'],
    standalone: false
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
  public myImages: MyImage[] = [];
  public myImagesErrorMessage: string = '';
  public isMyImagesLoading: boolean = false;
  public isMasonryLayoutApplied: boolean = false;
  private resizeListener: (() => void) | null = null;
  constructor(public defaultmediaService: defaultmediaService, public workspaceService: WorkspaceService) {
    this.currentUploadingOptionTabName = this.imageUploadTabNameConstant.Device;
  }
  ngOnInit(): void {
    if (this.currentUploadingOptionTabName === this.imageUploadTabNameConstant.MyImages) {
      this.loadMyImages();
    }
    this.resizeListener = () => {
      if (this.currentUploadingOptionTabName === this.imageUploadTabNameConstant.MyImages && this.myImages.length > 0) {
        requestAnimationFrame(() => {
          this.applyMasonryLayout();
        });
      }
    };
  }

  ngAfterViewInit() {
    window.addEventListener('resize', () => {
      if (this.currentUploadingOptionTabName === this.imageUploadTabNameConstant.MyImages && this.myImages.length > 0) {
        requestAnimationFrame(() => {
          this.applyMasonryLayout();
        });
      }
    });
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
      } else if (this.currentUploadingOptionTabName === this.imageUploadTabNameConstant.MyImages) {
        this.loadMyImages();
        this.applyMasonryLayout();
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
      this.myImagesErrorMessage = '';
      this.isMyImagesLoading = false;
      resolve();
      console.log("Clear Local Variable Image upload");
    });
  }

  loadMyImages(): void {
    this.isMyImagesLoading = true;
    this.isMasonryLayoutApplied = false;
    this.myImagesErrorMessage = '';
    
    this.defaultmediaService.getUserRecentImages().subscribe(
      (response: any) => {
        this.isMyImagesLoading = false;
        
        if (Array.isArray(response)) {
          this.myImages = response.map((img: any) => ({
            id: img.id.toString(),
            name: this.getImageNameFromUrl(img.imageUrl),
            url: img.imageUrl,
            uploadedAt: new Date(img.dateAndTime),
            isHovered: false
          }));
          
          this.myImagesErrorMessage = '';
          
          if (this.myImages.length > 0) {
            requestAnimationFrame(() => {
              this.applyMasonryLayout();
            });
          }
        } else {
          this.myImages = [];
          this.myImagesErrorMessage = '';
        }
      },
      (error) => {
        this.isMyImagesLoading = false;
        this.myImagesErrorMessage = 'Error loading images. Please try again.';
        this.myImages = [];
      }
    );
  }


  selectMyImage(image: MyImage): void {
    const fileType = this.getImageTypeFromUrl(image.url);
    this.selectedFileEvent.emit({ file: null, url: image.url, type: fileType, isFromMyImages: true });
  }


  private getImageNameFromUrl(url: string): string {
    if (url.includes('data:')) {
      return 'Uploaded Image';
    }
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1] || 'Image';
  }

  private getImageTypeFromUrl(url: string): string {
    if (url.includes('data:')) {
      const mimeMatch = url.match(/data:image\/([^;]+)/);
      return mimeMatch ? mimeMatch[1] : 'jpg';
    }
    
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.gif')) return 'gif';
    if (urlLower.includes('.png')) return 'png';
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return 'jpg';
    if (urlLower.includes('.webp')) return 'webp';
    if (urlLower.includes('.svg')) return 'svg';
    
    return 'jpg';
  }

  navigateToUploadTab(): void {
    this.currentUploadingOptionTabName = this.imageUploadTabNameConstant.Device;
  }

  applyMasonryLayout() {
    const container = document.querySelector('.my-images-grid') as HTMLElement;
    if (!container) {
      return;
    }
  
    const images = container.querySelectorAll('.image-container');
    if (images.length === 0) return;
  
    const containerWidth = container.offsetWidth;
    const minColumnWidth = 150; 
    const maxColumnWidth = 200; 
    const gap = 8; 
    
    let columnWidth = minColumnWidth;
    if (containerWidth > 600) {
      columnWidth = Math.min(maxColumnWidth, Math.floor((containerWidth - gap * 3) / 4));
    } else if (containerWidth > 400) {
      columnWidth = Math.min(maxColumnWidth, Math.floor((containerWidth - gap * 2) / 3));
    } else {
      columnWidth = Math.min(maxColumnWidth, Math.floor((containerWidth - gap) / 2));
    }
    
    const numColumns = Math.floor((containerWidth + gap) / (columnWidth + gap));
    
    if (numColumns === 0) return;
  
    const columnHeights = new Array(numColumns).fill(0);
    const positions: { left: number; top: number; width: number; height: number }[] = [];
  
    images.forEach((img) => {
      const imageElement = img as HTMLElement;
      imageElement.style.opacity = '0';
    });
  
    images.forEach((img, index) => {
      const imageElement = img as HTMLElement;
      const image = imageElement.querySelector('img') as HTMLImageElement;
      
      if (image) {
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          // Image not loaded yet, use default aspect ratio and set up load handler
          const defaultAspectRatio = 1; 
          const width = columnWidth;
          const height = width / defaultAspectRatio;
          
          const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const left = shortestColumnIndex * (columnWidth + gap);
          const top = columnHeights[shortestColumnIndex];
          
          columnHeights[shortestColumnIndex] += height + gap;
          
          imageElement.style.position = 'absolute';
          imageElement.style.left = `${left}px`;
          imageElement.style.top = `${top}px`;
          imageElement.style.width = `${width}px`;
          imageElement.style.height = `${height}px`;
          
          // Set up load handler to recalculate layout when image loads
          image.onload = () => {
            requestAnimationFrame(() => {
              this.applyMasonryLayout();
            });
          };
          return;
        }
        
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        const width = columnWidth;
        const height = width / aspectRatio;
        
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
        
        const left = shortestColumnIndex * (columnWidth + gap);
        const top = columnHeights[shortestColumnIndex];
        
        columnHeights[shortestColumnIndex] += height + gap;
        
        positions[index] = { left, top, width, height };
        
        imageElement.style.position = 'absolute';
        imageElement.style.left = `${left}px`;
        imageElement.style.top = `${top}px`;
        imageElement.style.width = `${width}px`;
        imageElement.style.height = `${height}px`;
      }
    });
  
    const maxHeight = Math.max(...columnHeights);
    container.style.height = `${maxHeight}px`;
    
    requestAnimationFrame(() => {
      images.forEach((img) => {
        const imageElement = img as HTMLElement;
        imageElement.style.transition = 'opacity 0.2s ease-in-out';
        imageElement.style.opacity = '1';
      });
    });
    
    this.isMasonryLayoutApplied = true;
  }
  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    
    this.clearLocalVariables().then(() => {
      console.log('Local variables cleared on destroy');
    });
  }
}
