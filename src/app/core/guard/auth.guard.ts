import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

import { AccountService } from '../Sevices/account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  CurrentUser: any;
  constructor(private _router: Router, private _service: AccountService) {
    const helper = new JwtHelperService();
    const decoded = helper.decodeToken(this._service.getToken());
    this.CurrentUser = decoded;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    if(token){
    if (this._service.isLoggedIn()) {
      let roles = next.data['permittedRoles'] as Array<string>;
      if (roles) {
        if (this._service.roleMatch(roles)) return true;
        else {
          this._router.navigate(['/']);
          return false;
        }
      }
      return true;
    } else {
      this._router.navigate(['/signin']);
      return false;
    }
  }else{
    this._router.navigate(['/auth']);
    return false;
  }
  }
}
