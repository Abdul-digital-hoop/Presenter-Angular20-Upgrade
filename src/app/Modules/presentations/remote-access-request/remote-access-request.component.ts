import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remote-access-request',
  templateUrl: './remote-access-request.component.html',
  styleUrls: ['./remote-access-request.component.scss'],
  standalone:false
})
export class RemoteAccessRequestComponent implements OnInit {
  @Input() presentationId: string = '';
  @Output() accessGranted = new EventEmitter<any>();

  remoteAccessForm: FormGroup;
  isRequesting: boolean = false;
  requestStatus: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private workSignalRService: WorkSignalRServiceService,
    private http: HttpClient,
    private router: Router
  ) {
    this.remoteAccessForm = this.fb.group({
      remoteUserName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Redirect to auth module for remote access
    this.redirectToAuthModule();
  }

  private redirectToAuthModule(): void {
    // Redirect to the auth module's remote access page
    this.router.navigate(['/auth/remote-access'], {
      queryParams: {
        id: this.presentationId
      }
    });
  }

  // Legacy methods - these won't be used anymore but kept for compatibility
  requestAccess(): void {
    // This method is deprecated - users are redirected to auth module
    this.redirectToAuthModule();
  }

  resetForm(): void {
    // This method is deprecated
    this.redirectToAuthModule();
  }

  setupSignalRListeners(): void {
    // This method is deprecated - SignalR is handled in auth module
  }

  ngOnDestroy(): void {
    // Clean up if needed
  }
}
