import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemoteAccessCommunicationService {
  private _checkAccessTrigger = new BehaviorSubject<boolean>(false);
  private _accessApproved = new BehaviorSubject<any>(null);
  private _accessRejected = new BehaviorSubject<any>(null);

  public checkAccessTrigger$ = this._checkAccessTrigger.asObservable();
  public accessApproved$ = this._accessApproved.asObservable();
  public accessRejected$ = this._accessRejected.asObservable();

  constructor() { }

  triggerCheckAccess(): void {
    this._checkAccessTrigger.next(true);
  }

  notifyAccessApproved(data: any): void {
    this._accessApproved.next(data);
  }

  notifyAccessRejected(data: any): void {
    this._accessRejected.next(data);
  }
}
