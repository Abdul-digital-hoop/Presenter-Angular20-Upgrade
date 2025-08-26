import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { RemoteTabString } from 'src/app/utility/constants';

@Component({
    selector: 'app-remote-navbar',
    templateUrl: './remote-navbar.component.html',
    styleUrls: ['./remote-navbar.component.scss'],
    standalone: false
})
export class RemoteNavbarComponent implements OnInit {
  @Input('isAllQuestionsAnswered') public isAllQuestionsAnswered: boolean;
  public RemoteTabString = RemoteTabString;
  public activeTab = this.RemoteTabString.Present;
  //public isAllQuestionsAnswered:boolean=false;
  @Output() activeTabChange = new EventEmitter(); 
  constructor(public workspaceService: WorkspaceService) {
   }

  ngOnInit(): void {
    this.changeRemoteChange(this.activeTab);
   // this.isAllQuestionsAnswered = this.workspaceService.presentationQuestions.every(x=>x.isAnswered == true);
  }
  changeRemoteChange(tabName:string){
    this.activeTab = tabName;
    this.activeTabChange.emit(this.activeTab);
  }
  changeQuestionsNotifications(value:boolean){
    this.isAllQuestionsAnswered = value;
  }
}
