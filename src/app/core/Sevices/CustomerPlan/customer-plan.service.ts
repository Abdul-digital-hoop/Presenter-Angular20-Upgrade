import { Injectable } from '@angular/core';
import { CustomerLimitationsCount, CustomerPlan } from '../../Models/customer-plan.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerPlanService {
  public customerPlan = new CustomerPlan();
  public customerLimitationCount= new CustomerLimitationsCount();
  
  constructor() { }

  setCustomerPlan(plan: CustomerPlan): void {
    this.customerPlan = plan;
  }

  getCustomerPlan(): CustomerPlan | null {
    return this.customerPlan;
  }

  clearCustomerPlan(): void {
    this.customerPlan = null; 
  }

  setCustomerLimitationsCounts(item:CustomerLimitationsCount){
    this.customerLimitationCount = item;
  }
  setCustomerPresentationLimite(limit:number){
    this.customerLimitationCount.balancePresentationLimit = limit;
  }
  getCustomerLimitationsCounts(){
    return this.customerLimitationCount;
    
  }
  clearCustomerLimitationsCounts(): void {
    this.customerLimitationCount = null; 
  }
}
