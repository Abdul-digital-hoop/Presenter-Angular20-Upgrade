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
  constructor(private _commanservice: CommanService, private defaultmediaService:defaultmediaService) {
    this.staticImages = _commanservice.GetStaticImageLibraty();
  }


    //#region LifeCycle Hooks
    ngOnChanges() {
      //console.log("AppComponent: OnChanges");
    }
  
    ngOnInit(): void {
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
      // console.log("AppComponent:AfterViewInit");
    }
  
    ngAfterViewChecked() {
      // console.log("AppComponent:AfterViewChecked");
    }
  
    ngOnDestroy() {
      //  console.log("AppComponent:OnDestroy");
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
}