import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { RemoteAccessCommunicationService } from 'src/app/core/Sevices/remote-access-communication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remote-access',
  templateUrl: './remote-access.component.html',
  styleUrls: ['./remote-access.component.scss'],
  standalone:false
})
export class RemoteAccessComponent implements OnInit, OnDestroy {
  presentationId: string = '';
  remoteAccessForm: FormGroup;
  isRequesting: boolean = false;
  requestStatus: string = '';
  errorMessage: string = '';
  hasRemoteAccess: boolean = false;
  guestToken: string = '';
  remoteUserId: string = ''; // Add remoteUserId property
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private workSignalRService: WorkSignalRServiceService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private remoteAccessCommunicationService: RemoteAccessCommunicationService
  ) {
    this.remoteAccessForm = this.fb.group({
      remoteUserName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.presentationId = params['id'] || '';
      if (!this.presentationId) {
        this.errorMessage = 'Presentation ID is required';
        return;
      }
      
      this.checkExistingAccess();
    });

    this.ensureSignalRConnection().then(() => {
    }).catch((error) => {
    });

    this.setupCommunicationListeners();
    
    this.setupDirectSignalRListeners();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setupCommunicationListeners(): void {
    this.subscription.add(
      this.remoteAccessCommunicationService.checkAccessTrigger$.subscribe(() => {
        this.checkExistingAccess();
      })
    );

    this.subscription.add(
      this.remoteAccessCommunicationService.accessApproved$.subscribe((data) => {
        if (data) {
          this.toastr.success('Access approved! Checking your access...', 'Success');
          this.checkExistingAccess();
        }
      })
    );

    this.subscription.add(
      this.remoteAccessCommunicationService.accessRejected$.subscribe((data) => {
        if (data) {
          this.toastr.error('Access denied by presenter', 'Access Denied');
          this.requestStatus = 'rejected';
          this.hasRemoteAccess = false;
        }
      })
    );
  }

  private ensureSignalRConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.workSignalRService.presentationHub && 
          this.workSignalRService.presentationHub.state === 'Connected') {
        this.setupSignalRListeners();
        this.setupDirectSignalRListeners();
        resolve();
      } else {
        try {
          if (this.presentationId) {
            this.workSignalRService.setPresentationIdForAuthModule(this.presentationId);
          }
          
          this.workSignalRService.callSignalR();          
          const checkConnection = () => {
            if (this.workSignalRService.presentationHub && 
                this.workSignalRService.presentationHub.state === 'Connected') {
              this.setupSignalRListeners();
              this.setupDirectSignalRListeners();
              resolve();
            } else {
              setTimeout(checkConnection, 500);
            }
          };
          
          setTimeout(checkConnection, 1000);
        } catch (error) {
          this.createAuthModuleSignalRConnection().then(() => {
            this.setupSignalRListeners();
            this.setupDirectSignalRListeners();
            resolve();
          }).catch(() => {
            resolve();
          });
        }
      }
    });
  }

  private async createAuthModuleSignalRConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        import('@microsoft/signalr').then((signalR) => {
          const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(environment.SignalRDomain + 'result', {
              transport: signalR.HttpTransportType.WebSockets,
              skipNegotiation: true,
            })
            .configureLogging(signalR.LogLevel.Information)
            .withAutomaticReconnect([0, 5000, 10000, 30000])
            .build();

          hubConnection.serverTimeoutInMilliseconds = 60 * 60 * 1000;

          hubConnection.start().then(() => {
            hubConnection.invoke('CreateGroup', this.presentationId, "1", "RemoteUsers").then(() => {
              this.workSignalRService.presentationHub = hubConnection;
              
              this.workSignalRService.remoteAccessApprovedOn();
              this.workSignalRService.remoteAccessRejectedOn();
              
              this.setupCommunicationListeners();
              
              resolve();
            }).catch((error) => {
              reject(error);
            });
          }).catch((error) => {
            reject(error);
          });
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private checkExistingAccess(): void {
    const existingToken = localStorage.getItem(`remote_access_${this.presentationId}`);
    const existingRemoteUserId = localStorage.getItem(`remote_user_id_${this.presentationId}`);
    
    if (existingToken && existingRemoteUserId) {
      this.guestToken = existingToken;
      this.remoteUserId = existingRemoteUserId;
      this.validateExistingToken();
    }
  }

  private validateExistingToken(): void {
    this.http.get(`${environment.MyApi}remote-access/validate/${this.presentationId}/${this.guestToken}`)
      .subscribe({
        next: (response: any) => {
          if (response && response.hasAccess) {
            this.hasRemoteAccess = true;
            this.requestStatus = 'approved';
            this.remoteUserId = response.remoteUserId || this.remoteUserId;
            if (this.remoteUserId) {
              localStorage.setItem(`remote_user_id_${this.presentationId}`, this.remoteUserId);
            }
            this.redirectToRemotePage();
          } else {
            localStorage.removeItem(`remote_access_${this.presentationId}`);
            localStorage.removeItem(`remote_user_id_${this.presentationId}`);
            this.guestToken = '';
            this.remoteUserId = '';
          }
        },
        error: () => {
          localStorage.removeItem(`remote_access_${this.presentationId}`);
          localStorage.removeItem(`remote_user_id_${this.presentationId}`);
          this.guestToken = '';
          this.remoteUserId = '';
        }
      });
  }

  private setupSignalRListeners(): void {
    if (!this.workSignalRService.presentationHub || 
        this.workSignalRService.presentationHub.state !== 'Connected') {
      return;
    }

    this.workSignalRService.presentationHub.off('RemoteAccessApproved');
    this.workSignalRService.presentationHub.off('RemoteAccessRejected');

    this.workSignalRService.presentationHub.on('RemoteAccessApproved', (data: any) => {
      if (data.presentationId === this.presentationId && data.remoteUserId === this.remoteUserId) {
        this.handleAccessResponse(data);
      }
    });

    this.workSignalRService.presentationHub.on('RemoteAccessRejected', (data: any) => {
      if (data.presentationId === this.presentationId && data.remoteUserId === this.remoteUserId) {
        this.onAccessRejected(data);
      }
    });
  }

  private setupDirectSignalRListeners(): void {
    if (this.workSignalRService.presentationHub && 
        this.workSignalRService.presentationHub.state === 'Connected') {
      this.workSignalRService.remoteAccessApprovedOn();
      this.workSignalRService.remoteAccessRejectedOn();
    }
  }

  private handleAccessResponse(response: any): void {
    this.requestStatus = 'approved';
    this.hasRemoteAccess = true;
  
    if (!this.guestToken) {
      this.validateAccessAfterApproval();
    } else {
      this.proceedWithNavigation();
    }
  }

  private validateAccessAfterApproval(): void {
  
    this.guestToken = 'approved-' + Date.now();
    this.remoteUserId = this.remoteUserId || 'remote-user-' + Date.now();
    
  
    localStorage.setItem(`remote_access_${this.presentationId}`, this.guestToken);
    localStorage.setItem(`remote_user_id_${this.presentationId}`, this.remoteUserId);
    
    this.toastr.success('Remote access granted!', 'Success');
    this.proceedWithNavigation();
  }

  private proceedWithNavigation(): void {
    // Redirect to remote page
    setTimeout(() => {
      this.redirectToRemotePage();
    }, 1000);
  }

  private onAccessRejected(data: any): void {
    this.requestStatus = 'rejected';
    this.hasRemoteAccess = false;
    this.toastr.error('Access denied by presenter', 'Access Denied');
  }

  requestAccess(): void {
    if (this.remoteAccessForm.invalid) {
      return;
    }

    this.isRequesting = true;
    this.requestStatus = 'requesting';
    this.errorMessage = '';

    this.ensureSignalRConnection().then(() => {
      const requestData = {
        PresentationId: this.presentationId,
        RemoteUserName: this.remoteAccessForm.get('remoteUserName')?.value,
        ConnectionId: this.workSignalRService.presentationHub?.connectionId || ''
      };

      this.http.post(`${environment.MyApi}remote-access/request`, requestData)
        .subscribe({
          next: (response: any) => {
            this.isRequesting = false;
            const signalRRequestData = {
              PresentationId: this.presentationId,
              RemoteUserName: this.remoteAccessForm.get('remoteUserName')?.value,
              RemoteUserId: response.remoteUserId,
              Status: response.requestStatus,
            };
            this.workSignalRService.requestRemoteAccess(signalRRequestData);
            if (response && response.hasAccess === true) {
              this.requestStatus = 'approved';
              this.hasRemoteAccess = true;
              
              if (response.remoteUserId) {
                this.remoteUserId = response.remoteUserId;
                localStorage.setItem(`remote_user_id_${this.presentationId}`, this.remoteUserId);
              }
              
              if (response.guestToken) {
                this.guestToken = response.guestToken;
                localStorage.setItem(`remote_access_${this.presentationId}`, this.guestToken);
              }
              
              this.toastr.success('Access granted! Redirecting...', 'Access Approved');
              setTimeout(() => this.redirectToRemotePage(), 1000);
            } else {
              this.requestStatus = 'pending';
              
              if (response && response.remoteUserId) {
                this.remoteUserId = response.remoteUserId;
                localStorage.setItem(`remote_user_id_${this.presentationId}`, this.remoteUserId);
              }
              
              if (response && response.guestToken) {
                this.guestToken = response.guestToken;
                localStorage.setItem(`remote_access_${this.presentationId}`, this.guestToken);
              }
              this.toastr.info('Request sent! Waiting for presenter approval...', 'Request Pending');
            }
          },
          error: (error: any) => {
            this.isRequesting = false;
            this.requestStatus = 'error';
            this.errorMessage = error.error?.message || 'Failed to send request';
            this.toastr.error(this.errorMessage, 'Error');
          }
        });
    }).catch(error => {
      this.isRequesting = false;
      this.requestStatus = 'error';
      this.errorMessage = 'Failed to establish connection';
      this.toastr.error(this.errorMessage, 'Error');
    });
  }

  private redirectToRemotePage(): void {
    // Redirect to the remote page with the presentation ID and guest token
    this.router.navigate(['/WorkSpace/remote'], {
      queryParams: {
        id: this.presentationId,
        token: this.guestToken,
        remoteUserId: this.remoteUserId // Also pass the remoteUserId
      }
    });
  }

  resetForm(): void {
    this.remoteAccessForm.reset();
    this.requestStatus = '';
    this.errorMessage = '';
  }

}
