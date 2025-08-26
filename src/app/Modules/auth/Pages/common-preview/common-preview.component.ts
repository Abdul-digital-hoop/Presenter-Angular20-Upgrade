import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { TemplateService } from 'src/app/Modules/Home/all-templates-module/Service/template.service';

@Component({
    selector: 'app-common-preview',
    templateUrl: './common-preview.component.html',
    styleUrls: ['./common-preview.component.scss'],
    standalone: false
})
export class CommonPreviewComponent implements OnInit {
   templateDetails:any;
   isDataLoaded = false;
   isHeaderCollapsed = false;
    isPresentation: boolean=false;

  constructor(private _templateService : TemplateService,
      private route: ActivatedRoute) { }

  ngOnInit(): void {
    const templateId = this.route.snapshot.queryParamMap.get('templateId') || '';
    this.isPresentation = this.route.snapshot.queryParamMap.get('isPresentation') === 'true';
    document.body.style.overflow = 'hidden';
    if (templateId) {
      this._templateService.getTemplateAdmin(templateId,this.isPresentation).subscribe((response:any) => {
        if(response.isPresentation){
          this.templateDetails = response?.presentationSlidesDTO;
        }else{
          this.templateDetails = response?.templateDescriptionDTO;
        }
        this.isDataLoaded = true; 
      });
    }
  }

  toggleHeader() {
    this.isHeaderCollapsed = !this.isHeaderCollapsed;
  }

  ngAfterViewInit() {
  }
  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }
}
