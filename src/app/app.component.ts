import { Component, HostListener } from '@angular/core';
import { AccountService } from './core/Sevices/account.service';
import { Router } from '@angular/router';
import { PresentationService } from './core/Sevices/Presentation/presentation.service';
import { getMessage } from './core/SuccessMessageHandler';
import { SuccessMessages } from './core/SuccessResponse';
import { Profile } from './core/Models/profile.model';
import { ToastrService } from 'ngx-toastr';
import { MetaService } from './core/Sevices/meta.service';
declare let zoomSdk: any;
declare const _IntegrationMediumZoom: boolean;
declare var $: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'Slidea';
  iframeContainer: any;
 

  @HostListener('document:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 83){
      $event.preventDefault();
    }
  }

  
  constructor(
    private router: Router,
    private _presentationService:PresentationService,
    private _accountservice:AccountService,
    private _toastr:ToastrService,
    private _metaService: MetaService
  ) {
      this._accountservice.alertEvent.subscribe((message: any) => {
        if(!message){
          $('#offlineModel').modal('show');
        }else if(message){
          $('#offlineModel').modal('hide');
        }
      });
     }

  async ngOnInit() {
    // Reset to default meta tags for main application
    this._metaService.resetToDefault();
    
    if (localStorage.getItem("integration_medium") && _IntegrationMediumZoom) {
      this.configureZoomApp();
    }
    // const tokenValue  = this._accountservice.getToken();
    
    // // if(cookieValue == null && tokenValue){
    // //   const userData = localStorage.getItem('userData');
    // // const profileData = JSON.parse(userData);
    // //   this._accountservice.checkAndSetCookie('user_Guid',profileData.ProfileEMail, 1);
    // // }
    // if(tokenValue){
    //   const cookieData = {Token:tokenValue}
    //     this._accountservice.cookieLogin(cookieData).subscribe(
    //       (response: any) => {
    //         // Process the response here
    //         console.log(response);
    //         this.cookieLoginFunc(response);
    //       },
    //     );
    // }
  }
  closeOfflineModal() {
    $('#offlineModel').modal('hide');
  }
 async configureZoomApp() {
    if (typeof zoomSdk !== 'undefined') {
      const configResponse = await zoomSdk.config({
      version: "0.16",
      popoutSize: { width: 480, height: 360 },
      capabilities: ["shareApp","onShareApp","launchAppInMeeting",
      "getRunningContext","openUrl","onRunningContextChange","onCollaborateChange",
      "getMeetingUUID","getMeetingContext","getUserContext","startCollaborate","onShareapp","sendAppInvitationToAllParticipants",
      "onMeeting","onMessage","onConnect","postMessage","connect","runRenderingContext","joinCollaborate"],
      });

        zoomSdk.getRunningContext()
        .then((resolvedValue) => {
          if (resolvedValue && resolvedValue.context) {
            const contextValue = resolvedValue.context;
            if (contextValue === 'inMainClient') {
              this.router.navigate(['/zoom']);
            } 
            else if (contextValue === 'inMeeting') 
            {
              this.router.navigate(["/zoom"]);
            } 
            else if (contextValue === 'inCollaborate') 
            {
              zoomSdk.getUserContext().then((result) => {
                if (result && result.role) {
                  const role = result.role;
                 if (role === 'attendee') 
                  {
                    this._presentationService.setRole(role);
                    this.router.navigate(["/zoom"]);
                  }
                }
              });
            }
          }
        })
        .catch((error) => {
          console.error('Error occurred while fetching running context:', error);
        });
      
    }
  }
  cookieLoginFunc(response:any){
    //this.isLoading = false;
      this._accountservice.storeToken(response.token);
          //this._accountservice.storeRefreshToken(response.refreshToken);
          const PROFILE = new Profile;
          PROFILE.ProfileId = response?.customerId;
          PROFILE.ProfileEMail = response?.email;
          PROFILE.ProfileFirstName = response?.firstName;
          PROFILE.ProfileSecondName = response?.lastName;
          PROFILE.ProfileRole = response?.customerRoleName;
          PROFILE.TeamId = response?.teamId;
          PROFILE.ProfileImgUrl = response?.imageURL;
          PROFILE.PlanName = response?.planName;
          PROFILE.PlanId = response?.planId;
          PROFILE.ParticipationLimit = response?.customerPlan?.participants_per_presentation;
          //this._accountservice.StoreUserValue(PROFILE);
          this.router.navigateByUrl('/app/home');
          if(PROFILE.TeamId!=null){
          localStorage.setItem('teamId', PROFILE.TeamId.toString());
          }
          // const message = getMessage(SuccessMessages.UserSection1000,SuccessMessages.User1001);
          // this._toastr.success(message,"", {
          //   timeOut: 5000,
          // });
         // this._accountservice.checkAndSetCookie('user_Guid', response?.email, 1);
         //this._accountservice.checkAndSetCookie('user_Guid', response?.email, 30);
  }
}
