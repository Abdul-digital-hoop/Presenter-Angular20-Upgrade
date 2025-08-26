import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { settingVariables } from 'src/app/utility/SettingVariables';
declare var $: any;
@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.component.html',
    styleUrls: ['./image-modal.component.scss'],
    standalone: false
})
export class ImageModalComponent implements OnInit{

  @Input('slideDetails') public slideDetails;
  @Input('urlForImage') public OriginalImage;
  @Output() SlideImageRemove = new EventEmitter<any>();
  @Output() SlideImageObject = new EventEmitter<any>();
  @Output() ImageModelStatus = new EventEmitter<any>();
  settingVariable = settingVariables;
  imageEvent: any="";
  SourceSlideImage: any='';
  SourceImageDatabase:any='';
  isShowCropModal: boolean=false;
  allowedSizeType: number = 15360;
  allowedFileTypes: string[] = [
    'jpg',
    'png',
    'gif',
    'jpeg',
    'svg'
  ];
  imageformat:any;
  svgimage: any;
  constructor(private _presentationService:PresentationService) {}

  ngOnInit(): void {
    this.SourceImageDatabase=this.slideDetails?.sourceImage?.url;
    this.svgimage=this.slideDetails?.sourceImage?.url;
  }
  ngOnChanges(){
    // this.SourceImageDatabase=this.slideDetails?.sourceImage?.url;
    this._presentationService.slideData$.subscribe((data) => {
      if (data) {
        if (data !== this.SourceImageDatabase) {
          this.SourceImageDatabase = data;
        }
      }else{
        this.SourceImageDatabase;
      }
    });
  }
  getModal(){
    $('#imageAddModal').modal('show');
    this.isShowCropModal=false;
  }
  getModalUpdate(){
    const fileExtension: string = this.slideDetails?.sourceImage?.url.split('.').pop().toLowerCase();
    if (fileExtension == 'svg' || fileExtension == 'gif') {
      this.imageformat = fileExtension;
      this.SourceSlideImage=this.slideDetails?.sourceImage?.url;
      $('#imageAddModal').modal('show');
        this.isShowCropModal=false;
    }else{
      this.getSlideImageasBase64forImage(this.slideDetails?.sourceImage?.url);
    }
  }
  getSlideImageasBase64forImage(url: string) {
    this._presentationService.getslideBase64String(url).subscribe(
      (response: any) => {
        var imageData = response['item'];
        this.OriginalImage = imageData?.base64Images;
        $('#imageAddModal').modal('show');
        this.isShowCropModal=false;
      },
      (error: any) => {
        console.log(error);
      }
    )
  }
  RemoveSlideImage(type: any){
    this.imageEvent='';
    this.SourceImageDatabase='';
    this.SlideImageRemove.emit(type);
  }
  uploadImage(event:any){
    const fileExtension: string = event?.target?.files[0].name.split('.').pop().toLowerCase();
    if (!this.allowedFileTypes.includes(fileExtension)) {
      $('#imageAddModal').modal('hide');
      $('#fileTypeInvalide').modal('show');
      return;
    }
    if (Math.floor(event?.target?.files[0]?.size / 1024) > this.allowedSizeType) {
      $('#imageAddModal').modal('hide');
      $('#fileSizeInvalide').modal('show');
      return;
    }
    this.imageEvent = event;
    if (fileExtension == 'svg' || fileExtension == 'gif') {
      this.imageformat=fileExtension
    }
    const file=event.target.files?.[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        this.SourceSlideImage = loadEvent.target?.result;
      };
      reader.readAsDataURL(file);
      this.isShowCropModal=false;
  }
  saveSlideImageObj(event:any){
    this.SlideImageObject.emit(event);
  }
  emptyImageEvent(event:any){
    if(event){
      this.imageEvent='';
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
    this.ImageModelStatus.emit();
    const reader = new FileReader();
    const binaryString = reader.readAsDataURL(event[0]?.file);
    const fileExtension: string = event[0]?.file.name.split('.').pop().toLowerCase();
    if (!this.allowedFileTypes.includes(fileExtension)) {
      $('#fileTypeInvalide').modal('show');
      return;
    }
    if (Math.floor(event[0]?.file?.size / 1024) > this.allowedSizeType) {
      $('#fileSizeInvalide').modal('show');
      return;
    }
    reader.onload = (event: any) => {
        var obj = {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
        }
        var SaveObj = {
          croppedImg: event.target.result,
          image64: event.target.result,
          croppedPosition: obj,
          placeHolder: ''
        }
        this.SlideImageObject.emit(SaveObj);
    };
    reader.onerror = (event: any) => {
      console.log("File could not be read: " + event.target.error.code);
      return event.target.error.code;
    };
  }
}