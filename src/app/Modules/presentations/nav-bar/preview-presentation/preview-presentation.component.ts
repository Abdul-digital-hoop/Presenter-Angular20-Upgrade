// angular import
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-preview-presentation',
  templateUrl: './preview-presentation.component.html',
  styleUrls: ['./preview-presentation.component.scss']
})
export class PreviewPresentationComponent implements OnInit {

  constructor() { }
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
  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods

//#endregion Common Metods

}
