import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-payment-failure',
    templateUrl: './payment-failure.component.html',
    styleUrls: ['./payment-failure.component.scss'],
    standalone: false
})
export class PaymentFailureComponent implements OnInit {

  constructor(
    private router: Router,
    private _toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Check if we have a plan_id in session storage
    const planId = sessionStorage.getItem('current_plan_id');
    
    if (planId) {
      this._toastr.error("Payment was unsuccessful. Please try again.", "", {
        timeOut: 5000,
      });
      
      // Clear the session storage
      sessionStorage.removeItem('current_plan_id');
    } else {
      this._toastr.error("Payment was cancelled or failed. Please try again.", "", {
        timeOut: 5000,
      });
    }
  }

  retryPayment(): void {
    const planId = sessionStorage.getItem('current_plan_id');
    if (planId) {
      this.router.navigate(['/myplan']);
    } else {
      this.router.navigate(['/myplan']);
    }
  }

  goToMyPlan(): void {
    this.router.navigate(['/myplan']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
