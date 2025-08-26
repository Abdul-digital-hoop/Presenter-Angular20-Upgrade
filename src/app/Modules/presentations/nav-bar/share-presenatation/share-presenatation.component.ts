// angular import
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-share-presenatation',
    templateUrl: './share-presenatation.component.html',
    styleUrls: ['./share-presenatation.component.scss'],
    standalone: false
})
export class SharePresenatationComponent implements OnInit {
  shareTabNumber: any = 1;
  constructor() { }

//#region LifeCycle Hooks
   ngOnChanges() {
    //console.log("AppComponent: OnChanges");
  }

  ngOnInit(): void{
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
    selectTabForShare(Tab:any) {
      // Change tab name
      this.shareTabNumber = Tab;
    }
  //#endregion Without API Call
  
//#endregion Component Level functions

//#region Common Methods

//#endregion Common Metods
 
}
