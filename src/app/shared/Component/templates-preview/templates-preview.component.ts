import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { Router } from '@angular/router';
import { TemplateService } from 'src/app/Modules/Home/all-templates-module/Service/template.service';
declare var $: any;
@Component({
    selector: 'app-templates-preview',
    templateUrl: './templates-preview.component.html',
    styleUrls: ['./templates-preview.component.scss'],
    standalone: false
})
export class TemplatesPreviewComponent {
  @Input() createdBy! : string;
  @Input() SlideImage! : string;
  @Input() templateDetails: any;
  @Input() templateDescription: string = '';
  @Input() slideCount: number = 0;
  @Input() downloadCount: number = 0;
  @Input() categoryName: string = '';
  @Input() templateId: string = '';
  @Input() index: number = 0;
  @Input() usedTemplateIndex: number = -1;
  @Input() isUseTemplate: boolean = false;
  @Input() customerLimitation: any;
  @Output() useTemplateEvent = new EventEmitter<{templateId: string, index: number}>();

  constructor(
    private _templateService: TemplateService,
    private workSpaceService: WorkspaceService,
    private _router: Router
  ) { }

  ngOnInit(): void {
  }
  ngOnDestroy() {
    this.clearModal();
  }
  clearModal() {
    $('.modal').modal('hide');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').css('padding-right', '');
  }
  useTemplate(id: string, index: any) {
    if (this.customerLimitation.balancePresentationLimit > 0) {
      this.isUseTemplate = true;
      this.usedTemplateIndex = index;
      this._templateService.convertPresentation(id).subscribe(
        (response) => {
          this.isUseTemplate = false;
          this.workSpaceService.activeSlideId = response.activeSlideId;
          this.workSpaceService.presentationId = response.presentationId;
          localStorage.setItem('slideVisualizationId', response.visualizationId);
          this._router.navigate(['/WorkSpace/edit'], {
            queryParams: { id: response.presentationId }
          }).then(() => {
            this.usedTemplateIndex = -1
          });
        },
        (error: any) => {
          this.isUseTemplate = false;
          this.usedTemplateIndex = -1;
          console.error('Error:', error);
        }
      );
    }
  }
} 