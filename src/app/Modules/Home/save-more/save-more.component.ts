import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PlansService } from 'src/app/core/Sevices/Plans/plans.service';
import { ChoosePricePlan, PrizeString } from 'src/app/utility/constants';

@Component({
  selector: 'app-save-more',
  templateUrl: './save-more.component.html',
  styleUrls: ['./save-more.component.scss']
})
export class SaveMoreComponent implements OnInit {
  licenseCount: number = 2;
  selectedPlanCost: number = 0; 
  licenseError: string ="";
  discountPercentage: number = 0;
  finalPrice = 0;
  @Input() yearlyPlans: any[] = [];
  priceString = PrizeString;
  basicPlanAmount: number = 0;
  proPlanAmount: number = 0;
  plans: any[] = [];
  constructor(private _planservice : PlansService) { }

  ngOnInit(): void {
       
}
ngOnChanges(changes: SimpleChanges): void {
  if (changes['yearlyPlans'] && changes['yearlyPlans'].currentValue) {
    this.plans = changes['yearlyPlans'].currentValue;  
    const basicPlan = this.yearlyPlans?.find(y => y?.plan_name === "Basic");
    if (basicPlan) {
      this.basicPlanAmount = basicPlan.plan_amount; 
    }
    const proPlan = this.yearlyPlans?.find(y => y?.plan_name === "Pro");
    if (proPlan) {
      this.proPlanAmount = proPlan.plan_amount; 
    }

    if (this.basicPlanAmount && this.proPlanAmount) {
      this.plans = [
        { 
          name: ChoosePricePlan.BasicYearly, 
          value: this.basicPlanAmount, 
          startDiscount: ChoosePricePlan.BasicStartDiscount,
          endDiscount: ChoosePricePlan.BasicEndDiscount,
          licenseStart: ChoosePricePlan.licenseStart,
          licenseEnd: ChoosePricePlan.licenseEnd 
        },
        { 
          name: ChoosePricePlan.ProYearly, 
          value: this.proPlanAmount, 
          startDiscount: ChoosePricePlan.ProStartDiscount,
          endDiscount: ChoosePricePlan.ProEndDiscount,
          licenseStart: ChoosePricePlan.licenseStart,
          licenseEnd: ChoosePricePlan.licenseEnd 
        }
      ];
    }
  }
}
  calculateAnnualBill(): number {
    if (this.selectedPlanCost === 0) {
      return 0;
    }
    return this.licenseCount * this.selectedPlanCost;
  }
 
  calculateOriginalPrice(): number {
    return this.licenseCount * this.selectedPlanCost;
  }


  setPlan(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = Number(target.value);
  
    const plan = this.plans.find(plan => plan.value === selectedValue);
    if (plan && this.licenseCount > 1) {
      this.selectedPlanCost = plan.value;
      this.calculateDiscount();
    } else {
      this.selectedPlanCost = 0;
      this.discountPercentage = 0;
      this.finalPrice = 0;
    }
  }
  
  validateLicenseCount(event: Event): void {
    const target = event.target as HTMLSelectElement;
     this.licenseCount = Number(target.value); 
    if (this.licenseCount < 2) {
      this.licenseError = 'Please enter a quantity between 2 and 100.';
      //this.licenseCount = 2; 
    } else if (this.licenseCount > 100) {
      this.licenseError = 'Please enter a quantity between 2 and 100.';
      //this.licenseCount = 100; 
    } else {
      this.licenseError = ''; 
    }
    this.calculateDiscount();
  }
  
  calculateDiscountedPrice(): number {
    this.calculateDiscount();
    return this.finalPrice;
  }
  
  calculateDiscount(): void {
    const plan = this.plans.find(plan => plan.value === this.selectedPlanCost);
    if (!plan) {
      this.finalPrice = 0;
      this.discountPercentage = 0;
      return;
    }
  
    const discount =
    this.licenseCount <= 4 ? plan.startDiscount
    : this.licenseCount >= 5
    ? plan.endDiscount
    : 0;
  
    this.discountPercentage = discount;
    const totalCost = this.licenseCount * this.selectedPlanCost;
    const discountAmount = (totalCost * discount) / 100;
    this.finalPrice = totalCost - discountAmount;
  }
  
  calculateSavings(): number {
    const totalCost = this.licenseCount * this.selectedPlanCost;
    return totalCost;
  }
  
  getFormattedDiscountPercentage(): string {
    return this.discountPercentage.toFixed(0); 
  }
  private processPlansData(plans: any[], type: string): any[] {
    return plans
      .filter((plan: any) => plan.recurring_type === type)
      .map((plan: any) => {
        let parsedAmountValidity = "";
        if (plan.amount_validity && plan.amount_validity !== "") {
          try {
            parsedAmountValidity = JSON.parse(plan.amount_validity);
          } catch (e) {
            console.error('Error parsing amount_validity:', e);
            parsedAmountValidity = "";
          }
        }
        return {
          ...plan,
          amount_validity: parsedAmountValidity
        };
      });
  }
}
