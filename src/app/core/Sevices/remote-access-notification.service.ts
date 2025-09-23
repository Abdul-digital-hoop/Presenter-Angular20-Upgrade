import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RemoteAccessRequest {
  requestId: string;
  presentationId: string;
  remoteUserId: string;
  remoteUserName: string;
  connectionId: string;
  requestedAt: Date;
  hasAccess: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class RemoteAccessNotificationService {
  private _requests = new BehaviorSubject<RemoteAccessRequest[]>([]);
  private _newRequest = new BehaviorSubject<RemoteAccessRequest | null>(null);
  private _showNotification = new BehaviorSubject<boolean>(false);
  private expiryTimers: Map<string, any> = new Map();
  private readonly REQUEST_EXPIRY_TIME = 20 * 1000; 
  private isManuallyHidden: boolean = false; 

  public requests$ = this._requests.asObservable();
  public newRequest$ = this._newRequest.asObservable();
  public showNotification$ = this._showNotification.asObservable();

  constructor() { }

  addRequest(request: RemoteAccessRequest): void {
    const currentRequests = this._requests.value;
    const existingIndex = currentRequests.findIndex(r => r.requestId === request.requestId);
    
    if (existingIndex >= 0) {
      // Update existing request
      currentRequests[existingIndex] = request;
    } else {
      // Add new request
      currentRequests.push(request);
    }
    
    this._requests.next([...currentRequests]);
    this._newRequest.next(request);
    
    this.isManuallyHidden = false; // Reset manual hide flag for new requests
    this._showNotification.next(true);
    
    this.setupExpiryTimer(request);
  }

  removeRequest(requestId: string): void {
    const currentRequests = this._requests.value.filter(r => r.requestId !== requestId);
    this._requests.next(currentRequests);
    
    if (currentRequests.length === 0) {
      this._showNotification.next(false);
      this.isManuallyHidden = false; // Reset manual hide flag when no requests
    }
    
    this.clearExpiryTimer(requestId);
  }

  clearRequests(): void {
    this._requests.next([]);
    this._showNotification.next(false);
    this.isManuallyHidden = false; // Reset manual hide flag
    this.expiryTimers.forEach(timer => clearTimeout(timer));
    this.expiryTimers.clear();
  }

  getRequests(): RemoteAccessRequest[] {
    return this._requests.value;
  }

  private setupExpiryTimer(request: RemoteAccessRequest): void {
    this.clearExpiryTimer(request.requestId);
    
    const now = new Date();
    const requestTime = new Date(request.requestedAt);
    const elapsedTime = now.getTime() - requestTime.getTime();
    const remainingTime = Math.max(0, this.REQUEST_EXPIRY_TIME - elapsedTime);
    
    if (remainingTime <= 0) {
      this.removeRequest(request.requestId);
      return;
    }
    
    const timer = setTimeout(() => {
      this.removeRequest(request.requestId);
    }, remainingTime);
    
    this.expiryTimers.set(request.requestId, timer);
  }

  private clearExpiryTimer(requestId: string): void {
    const timer = this.expiryTimers.get(requestId);
    if (timer) {
      clearTimeout(timer);
      this.expiryTimers.delete(requestId);
    }
  }

  getRemainingTime(requestId: string): number {
    const request = this._requests.value.find(r => r.requestId === requestId);
    if (!request) return 0;
    
    const now = new Date();
    const requestTime = new Date(request.requestedAt);
    const elapsedTime = now.getTime() - requestTime.getTime();
    const remainingTime = Math.max(0, this.REQUEST_EXPIRY_TIME - elapsedTime);
    
    return Math.ceil(remainingTime / 1000); 
  }

  hideNotification(): void {
    this._showNotification.next(false);
    this.isManuallyHidden = true; 
  }

  shouldShowNotificationForComponent(): boolean {
    const hasRequests = this._requests.value.length > 0;
    return hasRequests && !this.isManuallyHidden;
  }

  shouldShowNotification(): boolean {
    return this._showNotification.value;
  }
}
