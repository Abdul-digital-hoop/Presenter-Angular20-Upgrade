import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {

  constructor(
    private router: Router,
    private _toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Check if we have a plan_id in session storage
    const planId = sessionStorage.getItem('current_plan_id');
    
    if (planId) {
      this._toastr.success("Payment successful! Your subscription has been activated.", "", {
        timeOut: 5000,
      });
      
      // Clear the session storage
      sessionStorage.removeItem('current_plan_id');
    } else {
      this._toastr.info("Payment completed successfully!", "", {
        timeOut: 5000,
      });
    }
  }

  goToMyPlan(): void {
    this.router.navigate(['/myplan']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
