import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Profile } from '../Models/profile.model';
import { BehaviorSubject } from 'rxjs';
import { CustomerPlanService } from './CustomerPlan/customer-plan.service';
declare const _IntegrationMediumZoom: boolean;
declare const _IntegrationMediumOffice: boolean;
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  public UserProfile = new BehaviorSubject<Profile>(null);
  profileValue: any;
  userEmail: any;
  cookieLoading: boolean = true;
  alertEvent: EventEmitter<any> = new EventEmitter<any>();
  private isbalancePresentationLimitSubject = new BehaviorSubject<boolean>(false);
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor(private _fb: FormBuilder, private _http: HttpClient, private _router: Router,private ngZone: NgZone,private _customerPlanService:CustomerPlanService) {
    // var userDataString = localStorage.getItem('userData');
    // if (userDataString) {
    //   const USERDATA = JSON.parse(userDataString);
    //   this.UserProfile.next(USERDATA);
    // }
    var token = this.getToken();
    if(token != null){
      this.customerDetail(token);
    }
    else{
      this.cookieLoading = false;
    }
    this.setupPageVisibilityListener();
  }
  private setupPageVisibilityListener() {
    window.addEventListener('offline', () => {
      this.alertEvent.emit(false);
      // Perform actions when the user goes offline
  });
    // Handle online/offline events
    window.addEventListener('online', async () => {
      this.alertEvent.emit(true);
    });
  }
  roleMatch(allowedRoles: any[]): boolean {
    var isMatch = false;
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    var userRole = payLoad.role;
    allowedRoles.forEach((element: any) => {
      if (userRole == element) {
        isMatch = true;
        return false;
      }
    });
    return isMatch;
  }
  login(formData: any) {
    return this._http.post(environment.MyApi + 'login', formData);
  }
  googlelogin(token: string, utmData: any = null) {
    let params = new HttpParams().set('token', token);
    
    const body = utmData ? {
      utm_source: utmData.utm_source || null,
      utm_medium: utmData.utm_medium || null,
      utm_campaign: utmData.utm_campaign || null,
      utm_term: utmData.utm_term || null,
      utm_content: utmData.utm_content || null
    } : {};

    return this._http.post(`${environment.MyApi}google-user`,body,{ params: params });
  }
  CreatePresentation(formData: any) {
    return this._http.post(environment.MyApi + '', formData);
  }
  register(formData: any) {
    return this._http.post(environment.MyApi + 'SignUp', formData);
  }
  resendEmail(data: any) {
    return this._http.get(environment.MyApi + 'resendEmail?emailId=' + data);
  }
  ForgetPassword(data: any) {
    return this._http.get(environment.MyApi + 'forgetpassword-verification?emailId=' + data);
  }
  PasswordChange(data: any) {
    return this._http.post(environment.MyApi + 'forgetpassword', data);
  }
  getCustomerDetailes(token: string) {
    return this._http.get(`${environment.MyApi}getcustomerDetails?token=${encodeURIComponent(token)}`);
  }
  logout(): void {
    this.removeTokens();
    localStorage.clear();
    const navigationExtras: NavigationExtras = {
      replaceUrl: true 
    };
  
    this.ngZone.run(() => {
      this._router.navigate(['/auth'], navigationExtras);
    });
    if(this.IntegrationMediumZoom){
      localStorage.setItem('integration_medium','zoom');
    }
    if(this.IntegrationMediumOffice){
      localStorage.setItem('integration_medium','powerpoint');
    }
    this.deleteCookie();
   this._customerPlanService.clearCustomerPlan();
   this.cookieLoading = false;
   this.clearbalancePresentationLimitAvailable();
  }
  removeTokens() {
    localStorage.removeItem('token');
  }
  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue)
  }
  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue)
  }
  getToken() {
    return localStorage.getItem('token')
  }
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }
  GenertateRefreshToken() {
    return this._http.get(environment.MyApi + 'refreshtoken?refreshToken=' + this.getToken())
  }
  SaveNewTokens(accessToken: any, refreshToken: any) {
    this.storeToken(accessToken);
    this.storeRefreshToken(refreshToken)
  }
  isLoggedIn(): boolean {
    return localStorage.getItem('token') != null;
  }
  StoreUserValue(data: any): void {
    localStorage.setItem('userData', JSON.stringify(data));
    this.UserProfile.next(data);
  }
  GetUserValue(): any {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    } else {
      return null;
    }
  }
  setCookie(name: string, value: string, days?: number) {
    let expires = "";
    if (days !== undefined) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    const isOfficeIntegration = this.IntegrationMediumOffice || localStorage.getItem("integration_medium") === "powerpoint";
    
    let domain = "";
    if (environment.Name === 'LOCAL') {
      domain = "";
    } else if (isOfficeIntegration) {
      domain = "; domain=.slidone.com; secure; SameSite=None; path=/";
    } else {
      domain = "; domain=.slidone.com; secure; SameSite=Lax; path=/";
    }
    document.cookie = `${name}=${value}${expires}${domain}`;
  }

  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }

  checkAndSetCookie(name: string, value: string, days?: number) {
    const cookieValue = this.getCookie(name);
    if(cookieValue !== value){
    }
    if (cookieValue === null) {
      this.setCookie(name, value, days);
    } else {
    }
  }
  cookieLogin(cookieData: any) {
    return this._http.post(environment.MyApi + 'cookie-login', cookieData);
  }
  // deleteExistingCookie(){
  //   document.cookie = 'user_Guid' +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  // }
  deleteCookie() {
    const tokenName = `${environment.Name.toLowerCase()}token`;
    const domain = window.location.hostname.includes('localhost') ? 'localhost' : '.slidone.com';
    document.cookie = `${tokenName}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
  
  customerDetail(data:any){
    var payload = data;
    this.getCustomerDetailes(payload).subscribe(
      (response: any) => {
        const PROFILE = new Profile;
        PROFILE.ProfileId = response?.customerId;
        PROFILE.ProfileEMail = response?.email;
        PROFILE.ProfileFirstName = response?.firstName;
        PROFILE.ProfileSecondName = response?.lastName;
        PROFILE.ProfileRole = response?.customerRoleName;
        PROFILE.TeamId = response?.teamId;
        PROFILE.ProfileImgUrl = response?.imageURL;
        PROFILE.PlanName = response?.planName;
        PROFILE.PlanId = response?.planId;
        PROFILE.ParticipationLimit = response?.customerPlan?.participants_per_presentation;
        PROFILE.RewardId = response?.rewardId;
        this.profileValue = response;
        this.UserProfile.next(PROFILE);
        this.userEmail =  response?.email;
        this._customerPlanService.setCustomerPlan(response?.customerPlan);
        this.checkAndSetCookie(`${environment.Name.toLowerCase()}token`, response.token, 30);
      },
      (error: any) => {
        this.cookieLoading = false;
        console.error('Error fetching customer details:', error);
      }
    );
    
  }
  isbalancePresentationLimit$ = this.isbalancePresentationLimitSubject.asObservable();
  setbalancePresentationLimitAvailable(value: boolean) {
    this.isbalancePresentationLimitSubject.next(value);
  }
  clearbalancePresentationLimitAvailable(): void {
    this.isbalancePresentationLimitSubject.next(false); 
  }
}
