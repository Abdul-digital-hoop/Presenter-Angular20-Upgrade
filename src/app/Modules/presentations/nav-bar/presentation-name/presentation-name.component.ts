// angular import
import { Component, OnInit } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Constants } from 'src/app/utility/constants';

@Component({
  selector: 'app-presentation-name',
  templateUrl: './presentation-name.component.html',
  styleUrls: ['./presentation-name.component.scss']
})
export class PresentationNameComponent implements OnInit {
  constantVariable = Constants;
  constructor(public workSpaceService:WorkspaceService,public presentationService: PresentationService) { }
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
    updatePresentationName(name:any){
     let presentationName = this.presentationNameValidation(name);
     var updatePresentationNameDTO = {
      presentationId:this.workSpaceService.presentationId,
      presentationName:presentationName,
      isTemplate: this.workSpaceService.isTemplate
     }
     this.presentationService.updatePresentationNameInWorkSpace(updatePresentationNameDTO).subscribe(
      (response: any) => {
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
    }
  //#endregion API Call
     presentationNameValidation(name:any):string{
      let presentationName = name != "" ?  name : this.workSpaceService.questions == "" ? this.constantVariable.DEFAULT_PRESENTATION_NAME :this.workSpaceService.questions;
      this.workSpaceService.presentationName = presentationName ;
      return this.workSpaceService.presentationName ;
    }
  //#region Without API Call

  //#endregion Without API Call

//#endregion Component Level functions

//#region Common Methods
isFocused(input: any): boolean {
  return input === document.activeElement;
}
//#endregion Common Metods

}
