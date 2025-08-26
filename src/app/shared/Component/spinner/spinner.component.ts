import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit,AfterViewInit {
  @Input() theme: any;
  @Input() spinnerColor: string='#363a3c';
  constructor(public workSpaceService:WorkspaceService) { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
  }
  getBackgroundColorWithOpacity(colorCode: any, opacity: any): string {
    let rgb: number[];
    // Check if the input is a hex code
    if (colorCode?.startsWith('#')) {
      rgb = this.hexToRgb(colorCode);
    } else {
      // Assume it's an rgb string
      rgb = colorCode?.match(/\d+/g).map(Number);
    }
    // Calculate the contrast color
    const contrastRgb = rgb?.map((val) => (val > 128 ? 0 : 255));
    // Return the contrast color with opacity
    return `rgba(${contrastRgb?.join(', ')}, ${opacity})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];
    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }
    return rgb;
  }
}
