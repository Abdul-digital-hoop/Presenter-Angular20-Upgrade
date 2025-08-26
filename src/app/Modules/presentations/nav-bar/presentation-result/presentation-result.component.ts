// angular import
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-presentation-result',
    templateUrl: './presentation-result.component.html',
    styleUrls: ['./presentation-result.component.scss'],
    standalone: false
})
export class PresentationResultComponent implements OnInit {
  customerPlan:CustomerPlan;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor( private _router: Router,public _workSpaceService: WorkspaceService,public _customerPlanService: CustomerPlanService) 
  { 
    this.customerPlan = _customerPlanService.getCustomerPlan();
  }
//#region LifeCycle Hooks
  ngOnChanges() {
    //console.log("AppComponent: OnChanges");
  }

  ngOnInit() {
  // console.log("AppComponent: OnInit");
  }

  ngDoCheck() {
  // console.log("AppComponent: DoCheck");
  }

  ngAfterContentInit() {
  // console.log("AppComponent: AfterContentInit");
  }

  ngAfterContentChecked() {
  // console.log("AppComponent:AfterContentChecked");
  }

  ngAfterViewInit() {
  // console.log("AppComponent:AfterViewInit");
  }

  ngAfterViewChecked() {
  // console.log("AppComponent:AfterViewChecked");
  }

  ngOnDestroy() {
  //  console.log("AppComponent:OnDestroy");
  }
//#endregion LifeCycle Hooks

//#region Component Level functions
  //#region API Call
  //#endregion API Call

  //#region Without API Call
  viewResult(){
    if(this.customerPlan?.view_result){
      var id = this._workSpaceService.presentationId;
      this._router.navigateByUrl('/presentation/' + id + '/view-results');
    }
  }
  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods

//#endregion Common Metods

}
