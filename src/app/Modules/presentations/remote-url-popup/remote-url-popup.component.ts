import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
  selector: 'app-remote-url-popup',
  templateUrl: './remote-url-popup.component.html',
  styleUrls: ['./remote-url-popup.component.scss'],
  standalone:false
})
export class RemoteUrlPopupComponent {
  @Input() presentationId: string = '';
  @Input() isVisible: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Output() openRemoteAccessManagementEvent = new EventEmitter<void>();
  constructor(public workspaceService: WorkspaceService) {}
  remoteUrl: string = '';
  ngOnInit(): void {
    if (this.presentationId) {
      this.remoteUrl = `${window.location.origin}/auth/remote-access?id=${this.presentationId}`;
    }
  }
  
  copyUrl(): void {
    navigator.clipboard.writeText(this.remoteUrl).then(() => {
      // You could show a toast notification here
      console.log('URL copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.remoteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('URL copied to clipboard!');
    });
  }
  
  closePopup(): void {
    this.popupClosed.emit();
  }
  
  openRemoteAccessManagement(): void {
    this.openRemoteAccessManagementEvent.emit();
  }
}
