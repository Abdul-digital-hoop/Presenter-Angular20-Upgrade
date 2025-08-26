import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
@Pipe({
    name: 'slideThemes',
    pure: true,
    standalone: false
})
export class SlideThemesPipe implements PipeTransform {
  constructor(public workSpaceService: WorkspaceService) { }

  transform(slideThemes: any,presentationTheme:any): any {
    if (slideThemes) {
      if (slideThemes.slideResetTheme) {
        let slideTheme = this.workSpaceService.setSlideThemes(slideThemes);
        return slideTheme;
      } else {
        if(presentationTheme){
          let presentationThemes =  this.workSpaceService.setPresentationThemes(presentationTheme);
          return presentationThemes;
        }
        else{
          return this.workSpaceService.presentationTheme;
        }
      }
    }
  }
}
