import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-templates-edit',
  templateUrl: './templates-edit.component.html',
  styleUrls: ['./templates-edit.component.scss']
})
export class TemplatesEditComponent implements OnInit {
  @Input() templateCard! :any;

  constructor() { }

  ngOnInit(): void {
  }

  public readonly template_Status = {
    private: "Private",
    waitingForApproval: "Waiting for approval",
    approved: "Approved",
    rejected: "Rejected",
    public: "Public"
  };

}
