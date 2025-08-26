import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {
  private onlineStatusSubject: BehaviorSubject<boolean>;
  private onlineSubscription: Subscription;
  private offlineSubscription: Subscription;

  constructor() {
    this.onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
    this.validateNetWork();
  }

  // Validate Network Status
   validateNetWork() {
    // Network Status listen
    this.onlineSubscription = fromEvent(window, 'online').subscribe(() => {
      this.onlineStatusSubject.next(true);
    });

    this.offlineSubscription = fromEvent(window, 'offline').subscribe(() => {
      this.onlineStatusSubject.next(false);
    });
  }

  // Observable for subscribing to the network status
  get onlineStatus$(): Observable<boolean> {
    return this.onlineStatusSubject.asObservable();
  }

  // Current Network Status
  isNetworkStatus(): boolean {
    return navigator.onLine;
  }

  // Clean up subscriptions
  ngOnDestroy() {
    if (this.onlineSubscription) {
      this.onlineSubscription.unsubscribe();
    }
    if (this.offlineSubscription) {
      this.offlineSubscription.unsubscribe();
    }
  }
}
