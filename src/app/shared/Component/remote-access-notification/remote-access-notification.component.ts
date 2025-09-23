import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { RemoteAccessNotificationService, RemoteAccessRequest } from 'src/app/core/Sevices/remote-access-notification.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-remote-access-notification',
  templateUrl: './remote-access-notification.component.html',
  styleUrls: ['./remote-access-notification.component.scss'],
  standalone:false
})
export class RemoteAccessNotificationComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() requestApproved = new EventEmitter<RemoteAccessRequest>();
  @Output() requestRejected = new EventEmitter<RemoteAccessRequest>();

  pendingRequests: RemoteAccessRequest[] = [];
  isProcessing: boolean = false;
  private subscription: Subscription = new Subscription();
  private countdownIntervals: Map<string, any> = new Map();
  requestCountdowns: Map<string, number> = new Map();

  constructor(
    private workSignalRService: WorkSignalRServiceService,
    public workspaceService: WorkspaceService,
    private http: HttpClient,
    private remoteAccessNotificationService: RemoteAccessNotificationService
  ) {}

  ngOnInit(): void {
    this.setupSignalRListeners();
    this.subscribeToRequests();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();
    
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();
  }

  private subscribeToRequests(): void {
    this.subscription.add(
      this.remoteAccessNotificationService.requests$.subscribe(requests => {
        this.pendingRequests = requests;
        if (requests.length > 0) {
          this.isVisible = true;
          this.visibilityChange.emit(true);
        } else {
          this.isVisible = false;
          this.visibilityChange.emit(false);
        }
        
        this.updateCountdownTimers();
      })
    );

    this.subscription.add(
        this.remoteAccessNotificationService.newRequest$.subscribe(request => {
          if (request) {
            this.startCountdownTimer(request);
          }
        })
    );
  }

  private setupSignalRListeners(): void {
    // SignalR listeners are now handled by the notification service
    // This method is kept for compatibility but does nothing
  }

  private showBrowserNotification(request: RemoteAccessRequest): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Remote Access Request', {
        body: `${request.remoteUserName} wants to join your presentation`,
        icon: '/assets/favicon.ico',
        tag: `remote-access-${request.remoteUserId}`
      });
    }
  }

  async approveRequest(request: RemoteAccessRequest): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const response = await this.http.post(`${environment.MyApi}remote-access/approve`, {
        presentationId: request.presentationId,
        remoteUserId: request.remoteUserId,
        isApproved: true,
        connectionId: request.connectionId
      }).toPromise();

      
      // Update request status
      request.status = 'approved';
      
      // Remove from notification service
      this.remoteAccessNotificationService.removeRequest(request.requestId);
      
      // Emit event
      this.requestApproved.emit(request);
      
      // Send SignalR notification to remote user
      await this.workSignalRService.notifyRemoteAccessDecision({
        presentationId: request.presentationId,
        remoteUserId: request.remoteUserId,
        IsApproved: true
      });

      // Hide notification if no more pending requests
      if (this.pendingRequests.length === 0) {
        this.hideNotification();
      }

    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async rejectRequest(request: RemoteAccessRequest): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const response = await this.http.post(`${environment.MyApi}remote-access/approve`, {
        presentationId: request.presentationId,
        remoteUserId: request.remoteUserId,
        isApproved: false,
        connectionId: request.connectionId
      }).toPromise();

      
      // Update request status
      request.status = 'rejected';
      
      // Remove from notification service
      this.remoteAccessNotificationService.removeRequest(request.requestId);
      
      // Emit event
      this.requestRejected.emit(request);
      var data = {
        presentationId: request.presentationId,
        remoteUserId: request.remoteUserId,
        IsApproved: false
      }
      // Send SignalR notification to remote user
      await this.workSignalRService.notifyRemoteAccessDecision(data);

      // Hide notification if no more pending requests
      if (this.pendingRequests.length === 0) {
        this.hideNotification();
      }

    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  hideNotification(): void {
    this.isVisible = false;
    this.visibilityChange.emit(false);
    this.remoteAccessNotificationService.hideNotification();
  }

  get pendingCount(): number {
    return this.pendingRequests.length;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  }

  private updateCountdownTimers(): void {
    const currentRequestIds = new Set(this.pendingRequests.map(r => r.requestId));
    
    this.countdownIntervals.forEach((interval, requestId) => {
      if (!currentRequestIds.has(requestId)) {
        clearInterval(interval);
        this.countdownIntervals.delete(requestId);
        this.requestCountdowns.delete(requestId);
      }
    });

    this.pendingRequests.forEach(request => {
      if (!this.countdownIntervals.has(request.requestId)) {
        this.startCountdownTimer(request);
      }
    });
  }

  private startCountdownTimer(request: RemoteAccessRequest): void {
    const existingInterval = this.countdownIntervals.get(request.requestId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    this.updateCountdown(request.requestId);

    const interval = setInterval(() => {
      this.updateCountdown(request.requestId);
    }, 1000);

    this.countdownIntervals.set(request.requestId, interval);
  }

  private updateCountdown(requestId: string): void {
    const remainingSeconds = this.remoteAccessNotificationService.getRemainingTime(requestId);
    this.requestCountdowns.set(requestId, remainingSeconds);

    if (remainingSeconds <= 0) {
      const interval = this.countdownIntervals.get(requestId);
      if (interval) {
        clearInterval(interval);
        this.countdownIntervals.delete(requestId);
        this.requestCountdowns.delete(requestId);
      }
    }
  }

  getCountdownText(requestId: string): string {
    const seconds = this.requestCountdowns.get(requestId) || 0;
    if (seconds <= 0) return 'Expired';
    return `${seconds}s remaining`;
  }
}
