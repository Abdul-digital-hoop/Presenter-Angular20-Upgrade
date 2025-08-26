import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { PlansService } from 'src/app/core/Sevices/Plans/plans.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { PrizeString } from 'src/app/utility/constants';
import { environment } from 'src/environments/environment';
import { SaveMoreComponent } from '../save-more/save-more.component';

declare const Tawk_API: any;
interface ApiResponse {
  stripeCheckoutURL?: string;
  subscriptionId?: string;
}
@Component({
  selector: 'app-myplan',
  templateUrl: './myplan.component.html',
  styleUrls: ['./myplan.component.scss']
})
export class MyplanComponent implements OnInit {
  isSkeleton: boolean = true;
  isloading: boolean = false;
  public profile: Profile;
  public response: object;
  monthlyPlans: any[] = [];
  yearlyPlans: any[] = [];
  stripeCheckoutURL: string;
  amountValidity: any;
  @ViewChild('targetPlans', { static: false }) targetPlans  !: ElementRef;
  @ViewChild('targetFeatures', { static: false }) targetFeatures  !: ElementRef;
  showSuccessModal: boolean = false;
  showFailedModal: boolean = false;
  @ViewChild(SaveMoreComponent) saveMoreComponent!: SaveMoreComponent;
  constructor(private _toastr: ToastrService,private renderer: Renderer2, private el: ElementRef , private _planservice : PlansService , private _accountservice : AccountService , private cdr: ChangeDetectorRef) {}
  isMonthlySelected = true;
  isIndividualSelected = true;
  allPlans:any[]=[];
  priceString = PrizeString;
  paymentGateway = environment.PaymentGateway;
  private razorpayScript: HTMLScriptElement | null = null;
  ngOnInit(): void {
    this.razorpayScript = document.createElement('script');
    this.razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
    this.razorpayScript.type = 'text/javascript';
    this.razorpayScript.async = true;
    document.body.appendChild(this.razorpayScript);
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
    });
    this._planservice.getPlanDetails().subscribe(
      (response: any) => {
        this.allPlans = response.plans;
        const PROFILE = this.createProfileFromResponse(response);
        const freePlan = response.plans.find(x => x.plan_name === this.priceString.PlanFree);
        const paidMonthlyPlans = this.processPlansData(
          response.plans.filter(x => x.plan_name !== this.priceString.PlanFree), 
          this.priceString.Monthly
        );
        this.monthlyPlans = freePlan ? [freePlan, ...paidMonthlyPlans] : paidMonthlyPlans;
        this.yearlyPlans = this.processPlansData(
          response.plans.filter(x => x.plan_type === this.priceString.Individual), 
          this.priceString.Yearly
        );
        if (freePlan) {
          this.yearlyPlans.unshift(freePlan);
        }
        this.isSkeleton = false;
        if (this.saveMoreComponent) {
          this.saveMoreComponent.yearlyPlans = this.yearlyPlans;
        }
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  ngOnDestroy(): void {
    if (this.razorpayScript) {
      document.body.removeChild(this.razorpayScript);
    }
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.innerWidth < 991) {
      return;
    }
  
    const section = this.el.nativeElement.querySelector('#sticky-section');
    const stickySection = this.el.nativeElement.querySelector('.plan-sticky-sec');
    const stickydummysection = this.el.nativeElement.querySelector('.sticky-dummy');
    const sectionOffset = 752;
    const scrollTop = window.pageYOffset;
  
    if (scrollTop > sectionOffset) {
      this.renderer.addClass(section, 'sticky');
      this.renderer.setStyle(stickySection, 'flex', '0.8');
      this.renderer.setStyle(stickydummysection, 'display', 'block');
    } else {
      this.renderer.removeClass(section, 'sticky');
      this.renderer.removeStyle(stickySection, 'flex');
      this.renderer.setStyle(stickydummysection, 'display', 'none');
    }
  }
  togglePlan(isMonthly: boolean) {
    this.isMonthlySelected = isMonthly;
    const freePlan = this.allPlans.find(x => x.plan_name === this.priceString.PlanFree);
    const filteredYearlyPlans = this.allPlans.filter(x => 
      x.plan_type === this.priceString.Individual && 
      x.recurring_type === this.priceString.Yearly
    );
    this.yearlyPlans = this.processPlansData(filteredYearlyPlans, this.priceString.Yearly)
      .sort((a, b) => a.order_priority - b.order_priority);
    if (freePlan) {
      this.yearlyPlans.unshift(freePlan);
    }
    if (this.saveMoreComponent) {
      this.saveMoreComponent.yearlyPlans = [...this.yearlyPlans];
    }
  }
  handlePlanButtonClick(planId: any , planName:any) {
    if(planName == this.priceString.PlanEnterprise){
      if (typeof Tawk_API !== "undefined" && Tawk_API.maximize) {
        Tawk_API.maximize(); // Open the Tawk widget
      } else {
        console.error("Tawk_API is not ready. Make sure the widget is loaded.");
      }
    }
    else if (!this.isDisabled(planId,planName)) {
      this.getCheckOutSession(planId);
    }
  }  
  isDisabled(planId:Number,planName:any): boolean {
    var isDisabled = false;
    if(planName == this.priceString.PlanFree){
      isDisabled = true;
    }
    return isDisabled;
  }
  getCheckOutSession(plan_id: any): void {
    this.isloading = true;
    this._planservice.sendPlanIdToApi(plan_id)
      .subscribe(
        (response: ApiResponse) => {
          if(this.paymentGateway == 'stripe'){
            const stripeCheckoutURL = response.stripeCheckoutURL;
            if (stripeCheckoutURL) {
              // Store the plan_id in session storage for success/failure handling
              sessionStorage.setItem('current_plan_id', plan_id.toString());
              window.location.href = stripeCheckoutURL;
            } else {
              console.error('Error: stripeCheckoutURL is not defined in the response.');
              this._toastr.error("Unable to create checkout session. Please try again.", "", {
                timeOut: 5000,
              });
            }
            this.isloading = false;
            this.cdr.detectChanges();
          }else{
            this.triggerCheckout(response);
          }
        },
        error => {
          console.error('Error sending plan ID:', error);
          this.isloading = false;
          this.cdr.detectChanges();
          this._toastr.error("Failed to initiate payment. Please try again.", "", {
            timeOut: 5000,
          });
        }
      );
  }
  triggerCheckout(response: ApiResponse) {
    const options = {
      key: environment.razorpayKey,
      subscription_id: response.subscriptionId,
      name: 'Slidone',
      description: 'Subscription Plan',
      handler: (paymentResponse: any) => {
        if(paymentResponse.razorpay_payment_id){
          this.handlePaymentSuccess();
          this._toastr.success("Payment successful. Please wait while we process your subscription.", "", {
            timeOut: 5000,
          });
        }else{
          this.handlePaymentFailure();
          this._toastr.error("Payment was failed. Please try again later.","", {
            timeOut: 5000,
          });
        }
      },
      prefill: {
        name: this.profile?.ProfileFirstName + ' ' + this.profile?.ProfileSecondName,
        email: this.profile?.ProfileEMail
      },
      theme: {
        color: '#F37254'
      },
      modal: {
        ondismiss: () => {
          this.handlePaymentFailure();
          console.warn('Payment was cancelled by the user.');
          this._toastr.error("Payment was cancelled. Please try again if you wish to complete the subscription.","", {
            timeOut: 5000,
          });
        }
      }
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    this.isloading = false;
    this.cdr.detectChanges();
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

  scrollToPlans() {
    this.targetPlans.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.targetPlans.nativeElement.focus();
  }
  scrollToFeatures() {
    this.targetFeatures.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.targetFeatures.nativeElement.focus();
  }
  toggleType(isIndividual: boolean){
    this.isIndividualSelected = isIndividual;
    this.isMonthlySelected = isIndividual;
    const freePlan = this.allPlans.find(x => x.plan_name === this.priceString.PlanFree);
    const planType = isIndividual ? this.priceString.Individual : this.priceString.Education;
    const filteredYearlyPlans = this.allPlans.filter(x => 
      x.plan_type === planType && 
      x.recurring_type === this.priceString.Yearly
    );
    this.yearlyPlans = this.processPlansData(filteredYearlyPlans, this.priceString.Yearly)
      .sort((a, b) => a.order_priority - b.order_priority);
    if (freePlan) {
      this.yearlyPlans.unshift(freePlan);
    }
    if (this.saveMoreComponent) {
      this.saveMoreComponent.yearlyPlans = [...this.yearlyPlans];
    }
  }
  handlePaymentSuccess() {
    // this.isloading = false;
    this.showSuccessModal = true;
  }

  handlePaymentFailure() {
    // this.isloading = false;
    this.showFailedModal = true;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  closeFailedModal() {
    this.showFailedModal = false;
  }

  contactSupport() {
    this.showFailedModal = false;
  }

  private createProfileFromResponse(response: any): Profile {
    const PROFILE = new Profile;
    PROFILE.ProfileId = this.profile?.ProfileId;
    PROFILE.ProfileEMail = this.profile?.ProfileEMail;
    PROFILE.ProfileFirstName = this.profile?.ProfileFirstName;
    PROFILE.ProfileSecondName = this.profile?.ProfileSecondName;
    PROFILE.ProfileRole = this.profile?.ProfileRole;
    PROFILE.ProfileImgUrl = this.profile?.ProfileImgUrl;
    PROFILE.TeamId = this.profile?.TeamId;
    PROFILE.PlanName = this.profile?.PlanName;
    PROFILE.PlanId = this.profile?.PlanId;
    PROFILE.ParticipationLimit = response.customerPlan.participants_per_presentation;
    return PROFILE;
  }
}
