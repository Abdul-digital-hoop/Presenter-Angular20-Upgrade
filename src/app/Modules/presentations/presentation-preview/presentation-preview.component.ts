import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router,ActivatedRoute } from '@angular/router';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { environment } from 'src/environments/environment';
declare const Tawk_API: any;
@Component({
    selector: 'app-presentation-preview',
    templateUrl: './presentation-preview.component.html',
    styleUrls: ['./presentation-preview.component.scss'],
    standalone: false
})
export class PresentationPreviewComponent implements OnInit {

  presenterURL:SafeResourceUrl;
  AudienceURL:SafeResourceUrl;
  environmentDetails = environment;
  isLoadingshow:boolean = true;
  currentScreen: any='presenter';
  clientWidth: number=0;
  presentationId:any;
  customerPlan: CustomerPlan;
  constructor(
    public workSpaceService: WorkspaceService,
    private _router: Router,
    public sanitizer: DomSanitizer,
    public presentationService:PresentationService,private route: ActivatedRoute,
  public customerPlanService: CustomerPlanService,) { 
    }

  ngOnInit(): void {
    this.clientWidth = window.innerWidth;
    this.route.queryParams.subscribe(params => {
      this.presentationId = params['id'];
      this.workSpaceService.presentationId = this.presentationId;
      this.workSpaceService.activeSlideId = params['slideid'];
      if ('isTemplate' in params) {
        this.workSpaceService.isTemplate = params['isTemplate'];
      }
    });
    if(this.workSpaceService.activeSlideTypeName === this.workSpaceService.masterSlideTypeName.MULTIMEDIA){
      setTimeout(() => {
        this.updatePreview(true);
      }, 2000);
    } else {
      this.updatePreview(true);
    }
    // if (typeof Tawk_API !== 'undefined' && Tawk_API.showWidget) {
    //   Tawk_API.hideWidget();
    // }
  }
  ngAfterViewInit(): void {
    // if (typeof Tawk_API !== 'undefined' && Tawk_API.hideWidget) {
    //   Tawk_API.onLoad = () => {
    //     Tawk_API.hideWidget();
    //   };
    // }
    this.customerPlan = this.customerPlanService.getCustomerPlan(); 
  }
  ngOnDestroy(): void {
    // if (typeof Tawk_API !== 'undefined' && Tawk_API.showWidget) {
    //   Tawk_API.showWidget();
    // }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.clientWidth = window.innerWidth;
  }
  setUrl(url:any){
    const presenterUrl = `${this.environmentDetails.PresenterDomain}/WorkSpace/presentation?id=${this.presentationId}&isTemplate=${this.workSpaceService.isTemplate}&mode=preview`;
    this.presenterURL = this.sanitizer.bypassSecurityTrustResourceUrl(presenterUrl);
    if(!this.workSpaceService.isTemplate)
    {
      this.AudienceURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }else{
      const queryParams = new URLSearchParams();
      queryParams.set('isTemplate', this.workSpaceService.isTemplate.toString());

      const updatedUrl = `${url}?${queryParams.toString()}`;

      this.AudienceURL = this.sanitizer.bypassSecurityTrustResourceUrl(updatedUrl);
    }
    this.isLoadingshow = false;
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    this.updatePreview(false);
  }
  @HostListener('window:keyup.escape', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    this.updatePreview(false);
  }

  updatePreview(isPreview:any){
    let presentDTO = {
      presentationId:this.workSpaceService.presentationId,
      activeSlideId:this.workSpaceService.activeSlideId,
      isPreview: isPreview,
      isTemplate: this.workSpaceService.isTemplate
    }
    this.presentationService.updatePreview(presentDTO).subscribe(
      (response:any)=>{
        var url = this.environmentDetails?.AudienceDomain + response?.presentationAccess?.url;
        this.workSpaceService.activeSlideId = response?.activeSlideId;
        if(response.isPreview){
          this.setUrl(url);
        }
        else{
          this.workSpaceService.isPreviewMode = false;
          if(!this.workSpaceService.isTemplate){
        this._router.navigate(['/WorkSpace/edit'], {
              queryParams: { id: this.workSpaceService.presentationId }
            });
        }else{
          this._router.navigate(['/WorkSpace/edit'], {
            queryParams: { id: this.workSpaceService.presentationId,isTemplate: this.workSpaceService.isTemplate }
          });
        }
      }
      },
      (error:any)=>{
        console.log(error.error);
      }
    )
  }

  onChangeScreen(screen:any){
    this.currentScreen = screen;
  }
}
