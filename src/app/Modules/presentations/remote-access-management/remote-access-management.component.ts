import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';

interface RemoteUser {
  remoteUserId: string;
  remoteUserName: string;
  requestStatus: string;
  requestedAt: string;
  hasAccess: boolean;
  approvedAt?: string;
  lastActivity?: string;
  connectionId?: string;
}

@Component({
  selector: 'app-remote-access-management',
  templateUrl: './remote-access-management.component.html',
  styleUrls: ['./remote-access-management.component.scss'],
  standalone:false
})
export class RemoteAccessManagementComponent implements OnInit, OnDestroy, OnChanges {
  @Input() presentationId: string = '';
  @Input() isVisible: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Output() openUrlPopup = new EventEmitter<void>();
  
  remoteUsers: RemoteUser[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  refreshInterval: any;
  
  constructor(private cdr: ChangeDetectorRef, public workspaceService: WorkspaceService, public workSignalRService: WorkSignalRServiceService) {}
  
  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Watch for changes to isVisible input
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      // Wait a bit for presentationId to be set if it's not available immediately
      if (this.presentationId) {
        this.loadRemoteUsers();
      } else {
        // Try again after a short delay
        setTimeout(() => {
          if (this.presentationId) {
            this.loadRemoteUsers();
          }
        }, 100);
      }
    } else if (changes['isVisible'] && changes['isVisible'].currentValue === false) {
      // Clear interval when popup is hidden
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
    
    // Also watch for changes to presentationId
    if (changes['presentationId'] && changes['presentationId'].currentValue && this.isVisible) {
      this.loadRemoteUsers();
    }
    
    // If both inputs are available and popup is visible, ensure we load users
    if (this.isVisible && this.presentationId && (!changes['isVisible'] || !changes['presentationId'])) {
      this.loadRemoteUsers();
    }
  }
  
  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  
  async loadRemoteUsers(): Promise<void> {
    if (!this.presentationId) {
      return;
    }
    
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const apiUrl = `${environment.MyApi}remote-access/presentation/${this.presentationId}/users`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const result = await response.json();
        // Handle different response structures
        let users = [];
        if (Array.isArray(result)) {
          users = result;
          
        } else if (result.data && Array.isArray(result.data)) {
          users = result.data;
        } else if (result.remoteUsers && Array.isArray(result.remoteUsers)) {
          users = result.remoteUsers;
          this.workspaceService.remoteUrlQRCode = result.remoteUrl;
        } else {
          users = [];
        }
        
        // Sort users by request time (latest first)
        this.remoteUsers = users.sort((a, b) => {
          const dateA = new Date(a.requestedAt || 0);
          const dateB = new Date(b.requestedAt || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });
        
        // Force change detection to ensure UI updates
        this.cdr.detectChanges();
      } else {
        let errorData;
        try {
          errorData = await response.json();
          this.errorMessage = errorData.message || `Failed to load remote users (Status: ${response.status})`;
        } catch (parseError) {
          this.errorMessage = `Failed to load remote users (Status: ${response.status})`;
        }
      }
    } catch (error) {

    } finally {
      this.isLoading = false;
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    }
  }
  
  async approveAccess(user: RemoteUser): Promise<void> {
    try {
      const response = await fetch(`${environment.MyApi}remote-access/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presentationId: this.presentationId,
          remoteUserId: user.remoteUserId,
          isApproved: true,
        })
      });
      
      if (response.ok) {
        // Refresh the list
        await this.loadRemoteUsers();
        await this.workSignalRService.notifyRemoteAccessDecision({
          presentationId: this.presentationId,
          remoteUserId: user.remoteUserId,
          IsApproved: true
        });
      } else {
        const errorData = await response.json();
        this.errorMessage = errorData.message || 'Failed to approve access';
      }
    } catch (error) {
    }
  }
  
  async denyAccess(user: RemoteUser): Promise<void> {
    try {
      const response = await fetch(`${environment.MyApi}remote-access/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presentationId: this.presentationId,
          remoteUserId: user.remoteUserId,
          isApproved: false,
        })
      });
      
      if (response.ok) {
        // Refresh the list
        await this.loadRemoteUsers();
        await this.workSignalRService.notifyRemoteAccessDecision({
          presentationId: this.presentationId,
          remoteUserId: user.remoteUserId,
          IsApproved: false
        });
      } else {
        const errorData = await response.json();
        this.errorMessage = errorData.message || 'Failed to deny access';
      }
    } catch (error) {
    }
  }
  
  async revokeAccess(user: RemoteUser): Promise<void> {
    try {
      const response = await fetch(`${environment.MyApi}remote-access/revoke/${this.presentationId}/${user.remoteUserId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh the list
        await this.loadRemoteUsers();
      } else {
        const errorData = await response.json();
        this.errorMessage = errorData.message || 'Failed to revoke access';
      }
    } catch (error) {

    }
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'denied':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
  
  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'denied':
        return 'Denied';
      default:
        return status;
    }
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  closePopup(): void {
    this.popupClosed.emit();
  }

  openRemoteUrlPopup(): void {
    this.openUrlPopup.emit();
  }
  
  refreshList(): void {
    this.loadRemoteUsers();
  }
}
