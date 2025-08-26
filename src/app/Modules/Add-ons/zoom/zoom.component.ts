import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { zoom } from 'd3';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { environment } from 'src/environments/environment';
declare let zoomSdk: any;
@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent implements OnInit {
  value:any;
  receivedData: any;
  zoomAuthorizationUrl: string;
  accessToken: string;
  startUrl:string
  token: string;
  client: any;
  authEndpoint: string;
  meetingNumber: any;
  role: any;
  dynamicContentElement: HTMLElement;
  ContentElement: HTMLElement;
  code: string = '';
  constructor(private router: Router,private _presentationService:PresentationService,
  private _accountService:AccountService) { }
  async ngOnInit(){
    //this.role=this._presentationService.getRole();
    if (localStorage.getItem('contextValue') === 'inMainClient') {
      this.ContentElement = document.getElementById('container');
      this.ContentElement.style.removeProperty('display');
    }
    this.dynamicContentElement = document.getElementById('dynamicContent');
    this.dynamicContentElement.style.display = 'none';
    if (typeof zoomSdk !== 'undefined') {
      const configResponse = await  zoomSdk.config({
          version: "0.16",
            popoutSize: { width: 480, height: 360 },
            capabilities: ["shareApp","onShareApp","launchAppInMeeting",
            "getRunningContext","openUrl","onRunningContextChange","onCollaborateChange",
            "getMeetingUUID","getMeetingContext","getUserContext","startCollaborate","onShareapp","sendAppInvitationToAllParticipants",
            "onMeeting","onMessage","onConnect","postMessage","connect"],
          });
          if(configResponse!=null){
          this.meetingContext();
        }
      }
    }
    launchZoomApp(){
        zoomSdk.launchAppInMeeting();    
    }
    meetingContext(){
      zoomSdk.getRunningContext()
      .then((resolvedValue) => {
        if (resolvedValue && resolvedValue.context) {
          const contextValue = resolvedValue.context;
          this.checkMeetingContext(contextValue);
      }})
    }
    checkMeetingContext(contextValue){
      if (contextValue === 'inMainClient') {
        this.ContentElement = document.getElementById('container');
        this.ContentElement.style.removeProperty('display');
      } else if (contextValue === 'inMeeting') {
        this.ContentElement = document.getElementById('meetingContent');
        this.ContentElement.style.removeProperty('display');
      } else if (contextValue === 'inCollaborate') {
        zoomSdk.getUserContext().then((result) => {
          if (result && result.role) {
            const role = result.role;
            if (role === 'attendee') {
              zoomSdk.getMeetingUUID()
              .then((result) => {
                return result; 
              })
              .then((result) => {
                const meetingUUID=result.meetingUUID;
                this._presentationService.setMeetingUUID(meetingUUID);
                this.getZoomToken(meetingUUID);     
               // this.getMeetingDetails(meetingUUID);
              })
              .catch((error) => {
              });
            } else {
              console.log("Failed to configure Zoom SDK.");
              }
          } else {
          console.log("zoomSdk is not defined. Make sure the SDK script is loaded.");
        }
       })
      }
    }
    getZoomToken(data: any): void {
      const meetingId=this._presentationService.getMeetingUUID();
      this._presentationService.getZoomToken(data).subscribe(
      (response: string) => {
        this._accountService.storeToken(response);
        this.getMeetingDetails(meetingId);
      },
      (error: any) => {
        console.error('Error retrieving Zoom token:', error);
      });
    }
    getMeetingDetails(meetingUUID:string) {
      this._presentationService.getMeetingDetails(meetingUUID).subscribe(
        (response: any) => {
          if (response) { 
            const PresenterDomain = environment.PresenterDomain;
            const AudienceDomain = environment.AudienceDomain;
            const presentUrl = `${PresenterDomain}WorkSpace/presentation?id=${response.presentationId}`;
            const audienceUrl = `${AudienceDomain}${response.url}?integration_medium=zoom`;
    
            const element = document.getElementById('container');
            if (element) {
              element.style.display = 'none';
            }
    
            const element2 = document.getElementById('dynamicContent');
            if (element2) {
              element2.style.display = 'block';
              element2.style.backgroundColor = 'black';
              element2.style.overflow = 'hidden';
              element2.style.margin = '0';
            }
              const iframe = document.getElementById('presIframe') as HTMLElement | null;
              if (iframe) {
                iframe.style.display = 'block';
              }
              this.setupListeners();
            const audiContent=document.getElementById('audiContent');
            audiContent.style.display='none';
            element2.addEventListener('click', (event) => {
              zoomSdk.getRunningContext()
              .then((resolvedValue) => {
                if (resolvedValue && resolvedValue.context) {
                  const contextValue = resolvedValue.context;
                  if (contextValue === 'inCollaborate') {
                  }
                  else if(contextValue === 'inMeeting'){
                    this._presentationService.setAudienceUrl(audienceUrl);
                    this.meetingContext(); 
                  }
              }})
             
            });
    
            const body = document.body;
            if (body) {
              body.style.overflow = 'hidden';
            }
    
            const iframeElement1 = this.dynamicContentElement?.querySelector('#mainIframe') as HTMLIFrameElement | null;
            const iframeElement2 = this.dynamicContentElement?.querySelector('#sideIframe') as HTMLIFrameElement | null;
    
            if (iframeElement1 && iframeElement2) {
              iframeElement1.src = presentUrl;
              iframeElement2.src = audienceUrl;
         
            } else {
              console.error('Iframe element not found.');
            }
          }
         
        }, (error) => {
            console.error('Error fetching meeting details:', error);
          });
    }

    setupListeners(): void {
      setInterval(async () => {
        try {
          const context = await zoomSdk.getRunningContext();
          if (context.context != 'inCollaborate') {
           this.cleanupIframe();
          }
        } catch (error) {
          console.error('Polling error for context check:', error);
        }
      }, 500);
    }
  
    cleanupIframe(): void {
      const iframe = document.getElementById('presIframe') as HTMLElement | null;
      if (iframe) {
        iframe.style.display = 'none';
      } 
    }
    
    JoinAsParticipant(codeValue: string) {
      const trimmedCode = codeValue.trim();
    
      if (!trimmedCode) {
        alert('Please enter a code.');
        return;
      }
    
      const codeNavigate = `${environment.AudienceDomain}?code=${encodeURIComponent(trimmedCode)}&integration_medium=zoom`;
    
      window.location.href = codeNavigate; 
    }
    signIn(){
      this.router.navigate(["/auth/signin"]);
    }
    signUp(){
      this.router.navigate(["/auth/signup"]);
    }
}
