import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersettingsService {

  constructor(private _fb: FormBuilder, private _http: HttpClient, private _router: Router,private ngZone: NgZone) { }
  
  GetUserDetails(Token: any) {
    return this._http.get(environment.MyApi + 'getuserDetails?token=' + Token);
  }

  UpdateUserDetails(UserProfileData:any){
    return this._http.post(environment.MyApi + 'updateUserDetails',UserProfileData);
  }
 UpdateUserEmailDetails(UserEmailData: any){
    return this._http.put(environment.MyApi+'UpdateUserEmail',UserEmailData);
 }
  UpdateUserPasswordDetails(UserPasswordData: any){
    return this._http.post(environment.MyApi+ 'UpdateUserPasswordDetails',UserPasswordData);
  }
  DeleteUserDetails(UserProfileId : any){
    return this._http.delete(environment.MyApi+'user?userId='+ UserProfileId);
  }
  UploadProfileimage(ProfileImage:any){
    return this._http.post(environment.MyApi + 'UserProfileImage',ProfileImage);
  }
  RemoveUserprofileImage(UserProfileId :any){
    return this._http.post(environment.MyApi+'RemoveUserprofileImage',UserProfileId);
  }
  Logoutotherdevices(UserProfileData: any){
    return this._http.put(environment.MyApi+'LogoutOtherDevices',UserProfileData);
  }
  getUserImageBase64(){
     return this._http.get(environment.MyApi+`get-profile-image-url`);
  }
}
