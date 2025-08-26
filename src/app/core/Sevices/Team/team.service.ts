import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  inviteClicked: EventEmitter<void> = new EventEmitter<void>();
  inviteSuccess: EventEmitter<void> = new EventEmitter<void>(); // Add inviteSuccess EventEmitter

  constructor(private _http: HttpClient,) { }

  private openPopupSubject = new Subject<void>();
  openPopup$ = this.openPopupSubject.asObservable();

  private presentationDataSubject = new BehaviorSubject<any>(null);
  presentationData$ = this.presentationDataSubject.asObservable();
  setPresentationData(data: any): void {
    this.presentationDataSubject.next(data);
  }

  openPopup() {
    this.openPopupSubject.next();
  }
  onMyTeamMenuClick() {
    const teamId = localStorage.getItem('teamId');
    if (teamId) {
      return this.GetTeamId(teamId);
    } else {
      console.error('TeamId not found in localStorage');
    }
  }
  CreateTeam(teamdata: any) {
    return this._http.post(environment.MyApi + 'create-team', teamdata);
  }
  GetTeamId(TeamId: any) {
    return this._http.get(environment.MyApi + 'get-all-team?teamid=' + TeamId);
  }
  Invitewithdrawal(teamdata: any) {
    return this._http.post(environment.MyApi + 'invite-withdrawal',teamdata );
  }
  InviteMember(teamdata: any){
    return this._http.post(environment.MyApi + 'add-team-members', teamdata);
  }
  LeaveTeam(leavedata: any){
    return this._http.post(environment.MyApi + 'delete-team', leavedata);
  }
  RemoveMember(memberdata: any){
    return this._http.post(environment.MyApi + 'remove-member', memberdata);
  }
  TeamInvite(invitecode: string){
    return this._http.get(environment.MyApi + 'team-invite?invitecode='+ invitecode);
  }
  SharedPresentation(){
    return this._http.get(environment.MyApi+'getRestorePresentation');
  }
  GetsharedPresentations(id:any){
    return this._http.get(environment.MyApi+'get-sharedpresentation?id='+ id);
  }
}
