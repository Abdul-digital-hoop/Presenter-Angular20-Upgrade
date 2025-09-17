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

  public requests$ = this._requests.asObservable();
  public newRequest$ = this._newRequest.asObservable();

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
  }

  removeRequest(requestId: string): void {
    const currentRequests = this._requests.value.filter(r => r.requestId !== requestId);
    this._requests.next(currentRequests);
  }

  clearRequests(): void {
    this._requests.next([]);
  }

  getRequests(): RemoteAccessRequest[] {
    return this._requests.value;
  }
}
