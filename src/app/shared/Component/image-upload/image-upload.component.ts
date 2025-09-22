import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommanService } from 'src/app/core/Sevices/comman.service';
import { FileHandle } from '../../directive/dragDrop.directive';
import { defaultmediaService } from 'src/app/core/Sevices/defaultmedia.service';

declare var $: any;

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
@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
    standalone: false
})

export class ImageUploadComponent implements OnInit{
  @Output() uploadEvent = new EventEmitter<any>();
  @Output() PatchSource = new EventEmitter<any>();
  @Input('SlideDetails') public slideDetails;
  @ViewChild('myInputFile', { static: false }) myInputFile: ElementRef;
  staticImages: any[] = [];
  allowedFileTypes: string[] = [
    'jpg',
    'png',
    'gif',
    'jpeg'
  ];
  allowedSizeType: number = 15360;
  imageChangedEvent: any = '';
  uploadTabNumber: any = 1;
  files: FileHandle[] = [];
  images: UnsplashImage[] = [];
  searchQuery: string = '';
  gifSearchQuery: string = '';
  unsplashImages: any[] = [];
  gifs: any[] = [];
  currentPage: number = 1;
  perPage: number = 30;
  loadingImages: boolean = false;
  @ViewChild('imageContainer', { static: true }) imageContainer!: ElementRef;
  @Output() backToUploadComp = new EventEmitter<boolean>();
  searchTerm = '';
  selectedGif: any = null;
  isLoading: boolean = true;
  skeletons: number[] = Array(50).fill(0);
  isUnsplashLoading: boolean = true;
  showErrorMessage: boolean = false;
  errorMessage: string = '';
  readonly unsplashReferral = 'utm_source=Slidone&utm_medium=referral';
  myImages: MyImage[] = [];
  myImagesErrorMessage: string = '';
  isMyImagesLoading: boolean = false;
  isMasonryLayoutApplied: boolean = false;
  private resizeListener: (() => void) | null = null;
  constructor(private _commanservice: CommanService, private defaultmediaService:defaultmediaService) {
    this.staticImages = _commanservice.GetStaticImageLibraty();
  }


    //#region LifeCycle Hooks
    ngOnChanges() {
      //console.log("AppComponent: OnChanges");
    }
  
    ngOnInit(): void {
      if (this.uploadTabNumber === 4) {
        this.loadMyImages();
      }
      this.resizeListener = () => {
        if (this.uploadTabNumber === 4 && this.myImages.length > 0) {
          requestAnimationFrame(() => {
            this.applyMasonryLayout();
          });
        }
      };
      window.addEventListener('resize', this.resizeListener);
    }
  
    ngDoCheck() {
      // console.log("AppComponent: DoCheck");
    }
  
    ngAfterContentInit() {
      // console.log("AppComponent: AfterContentInit");
    }
  
    ngAfterContentChecked() {
      // console.log("AppComponent:AfterContentChecked");
    }
  
  ngAfterViewInit() {
    window.addEventListener('resize', () => {
      if (this.uploadTabNumber === 4 && this.myImages.length > 0) {
        requestAnimationFrame(() => {
          this.applyMasonryLayout();
        });
      }
    });
  }
  
    ngAfterViewChecked() {
      // console.log("AppComponent:AfterViewChecked");
    }
  
  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
    //
    filesDropped(files: FileHandle[]): void {
      if (this.myInputFile && this.myInputFile.nativeElement) {
        const inputElement = this.myInputFile.nativeElement;
        const dataTransfer = new DataTransfer();
  
        for (let i = 0; i < files.length; i++) {
          dataTransfer.items.add(files[i].file);
        }
  
        inputElement.files = dataTransfer.files;
  
        // Create and dispatch the change event
        const changeEvent = new Event('change', { bubbles: true });
        inputElement.dispatchEvent(changeEvent);
      }
    }
  
    BackgroundImageUpload(event: any) {
      const file = event.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        this.files.push({ file, url });
      }
      this.uploadEvent.emit(event);  // Emit the original event
    }
  CloseModal(){
    this.PatchSource.emit('');
    this.backToUploadComp.emit(false); 
  }
  selectTabForUpload(Tab:any) {
    this.uploadTabNumber = Tab;
    if (this.uploadTabNumber === 2) {
      this.loadDefaultImages();
    }
    else if(this.uploadTabNumber === 4) {
      this.loadMyImages();
      this.applyMasonryLayout();
    }
    else if(this.uploadTabNumber === 3) {
      this.loadDefaultGif();
    }
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Handle drop logic here
  }
  loadDefaultImages(): void {
    const defaultSearchTerm = 'nature';
    this.loadImages(defaultSearchTerm);
  }

  loadImages(query: string): void {
    if (this.loadingImages) return;
    this.loadingImages = true;
    this.isUnsplashLoading = true;
    this.defaultmediaService.searchImages(query).subscribe(
      (response) => {
        if (response.results?.length) {
          this.images = [...this.images, ...response.results];
          this.showErrorMessage = false;
        } else {
          this.showErrorMessage = true;
          this.errorMessage = 'No images found for this search';
        }
        this.loadingImages = false;
        this.isUnsplashLoading = false;
      },
      (error) => {
        console.error('Error fetching images', error);
        this.showErrorMessage = true;
        this.errorMessage = 'No images found for this search';
        this.loadingImages = false;
        this.isUnsplashLoading = false;
      }
    );
  }

  searchUnsplashImages(): void {
    this.showErrorMessage = false;
    const sanitizedQuery = this.searchQuery?.replace(/[^a-zA-Z0-9\s]/g, '') || 'wildlife';
    this.images = [];
    this.currentPage = 1;
    this.loadImages(sanitizedQuery);
  }

  setupScrollListener(): void {
    const container = this.imageContainer.nativeElement;
    container.addEventListener('scroll', () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
        this.currentPage++;
        this.loadImages(this.searchQuery || 'wildlife'); // Load more images
      }
    });
  }
  selectUnsplashImage(image: any) {
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
              this.uploadEvent.emit(event);
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
            this.uploadEvent.emit(event);
        })
        .catch(error => {
            console.error('Error fetching Unsplash image:', error);
        });
        }
      );
}
// searchGifs(): void {
//   if (this.gifSearchQuery.trim()) {
//     this.defaultmediaService.searchGifs(this.gifSearchQuery).subscribe((response: any) => {
//       this.gifs = response.data;
//     });
//   }
// }

// selectGif(gif: any): void {
//   console.log('Selected GIF:', gif);
// }


searchGif() {
  this.showErrorMessage = false;
  const sanitizedTerm = this.searchTerm?.replace(/[^a-zA-Z0-9\s]/g, '') || 'wildlife';
  
  this.isLoading = true;
  this.defaultmediaService.searchGifs(sanitizedTerm).subscribe(
    (response) => {
      this.isLoading = false;
      if (response.results?.length) {
        this.gifs = response.results;
        this.showErrorMessage = false;
      } else {
        this.showErrorMessage = true;
        this.errorMessage = 'No GIFs found for this search';
      }
    },
    (error) => {
      console.error('Error fetching GIFs:', error);
      this.isLoading = false;
      this.showErrorMessage = true;
      this.errorMessage = 'No GIFs found for this search';
    }
  );
}

selectGif(gif: any) {
  const url = gif.media[0].gif.url; // Select the best available GIF URL
  const fileType = 'gif'; // Set GIF type explicitly
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];

  if (!allowedTypes.includes(fileType)) {
    console.error('Unsupported file type:', fileType);
    return;
  }

  // Add the selected GIF to the upload list
  this.unsplashImages.push({ url, type: fileType });
  this.files.push({ file: null, url });

  // Emit the selected file for further processing
  this.uploadEvent.emit({ file: null, url, type: fileType });
  //his.PatchSource.emit(url);
    this.showErrorMessage = false;
  }

loadDefaultGif(){
  this.searchGif()
}
onGifLoad(gif: any) {
  gif.loaded = true;  // Set loaded to true when the GIF is ready
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
        
        if (this.myImages.length === 0) {
          this.myImagesErrorMessage = 'No images uploaded yet. Upload some images to see them here.';
        } else {
          requestAnimationFrame(() => {
            this.applyMasonryLayout();
          });
        }
      } else {
        this.myImages = [];
        this.myImagesErrorMessage = 'No images uploaded yet. Upload some images to see them here.';
      }
    },
    (error) => {
      this.isMyImagesLoading = false;
      this.myImagesErrorMessage = 'Error loading images. Please try again.';
    }
  );
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

  // First, hide all images to prevent flicker
  images.forEach((img) => {
    const imageElement = img as HTMLElement;
    imageElement.style.opacity = '0';
  });

  images.forEach((img, index) => {
    const imageElement = img as HTMLElement;
    const image = imageElement.querySelector('img') as HTMLImageElement;
    
    if (image) {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
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
  
  // Show all images with a smooth transition after layout is applied
  requestAnimationFrame(() => {
    images.forEach((img) => {
      const imageElement = img as HTMLElement;
      imageElement.style.transition = 'opacity 0.2s ease-in-out';
      imageElement.style.opacity = '1';
    });
  });
  
  this.isMasonryLayoutApplied = true;
}


selectMyImage(image: MyImage): void {
  if (image.url.startsWith('data:')) {
    try {
      const [header, base64Data] = image.url.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
      
      let fileExtension = 'jpg'; 
      if (mimeType.includes('png')) {
        fileExtension = 'png';
      } else if (mimeType.includes('gif')) {
        fileExtension = 'gif';
      } else if (mimeType.includes('svg')) {
        fileExtension = 'svg';
      } else if (mimeType.includes('jpeg')) {
        fileExtension = 'jpg';
      }
      
      const baseFileName = (image.name || 'my-image').split('.')[0];
      const finalFileName = `${baseFileName}.${fileExtension}`;
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const file = new File([bytes], finalFileName, { type: mimeType });
      const event = {
        target: {
          files: [file]
        },
        isFromMyImages: true
      };
      
      this.uploadEvent.emit(event);
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      const imageType = this.getImageTypeFromUrl(image.url);
      const event = {
        url: image.url,
        type: imageType,
        isFromMyImages: true
      };
      this.uploadEvent.emit(event);
    }
  } else {
    const imageType = this.getImageTypeFromUrl(image.url);
    const event = {
      url: image.url,
      type: imageType,
      isFromMyImages: true
    };
    this.uploadEvent.emit(event);
  }
}


private getImageTypeFromUrl(url: string): string {
  if (url.startsWith('data:')) {
    const mimeType = url.split(',')[0].split(':')[1].split(';')[0];
    return mimeType;
  }
  
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      if (url.includes('gif') || url.includes('GIF')) {
        return 'image/gif';
      }
      return 'image/jpeg';
  }
}

private getImageNameFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName || 'Image';
  } catch {
    return 'Image';
  }
}
navigateToUploadTab(): void {
    this.uploadTabNumber = 1;
  }
}