import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class TrashServiceService {
  constructor(private _http: HttpClient,) { }
  private presentationDataSubject = new BehaviorSubject<any>(null);
  presentationData$ = this.presentationDataSubject.asObservable();
  setPresentationData(data: any): void {
    this.presentationDataSubject.next(data);
  }
  restoreAllPresentations(presentationIds: string[]): Observable<any> {
    return this._http.put(environment.MyApi + 'restore-allpresentation', presentationIds);
  }
  removeAllPresentations(presentationId: string[]): Observable<any> {
    return this._http.put(environment.MyApi + 'remove-allpresentation', presentationId);
  }
  removePresentation(presentationId: string): Observable<any> {
    return this._http.put(environment.MyApi + `remove-presentation?presentationId=${presentationId}`, presentationId);
  }
}
