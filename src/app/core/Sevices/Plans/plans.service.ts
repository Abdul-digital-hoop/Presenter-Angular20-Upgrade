import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class PlansService {

  constructor(private _http: HttpClient, private _router: Router,) {
  }
  getPlanDetails() {
    return this._http.get(environment.MyApi + 'get-pricing-details');
  }
  sendPlanIdToApi(plan_id: any) {
    if(environment.PaymentGateway == 'stripe')
    {
      return this._http.post(environment.MyApi + 'stripe-checkout/' + plan_id, {});
    }
    else
    {
      return this._http.post(environment.MyApi + 'razor-pay-checkout/' + plan_id, {});
    }
  }
}
