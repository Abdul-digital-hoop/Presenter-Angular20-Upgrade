import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
@Component({
    selector: 'app-access-code',
    templateUrl: './access-code.component.html',
    styleUrls: ['./access-code.component.scss'],
    standalone: false
})
export class AccessCodeComponent implements OnInit {
  @Input() presentationURL: string;
  @Input() presentationCode: string;
  @Input() fontSize: number;
  copied:boolean=false;
  constructor(private clipboard: Clipboard) { }

  ngOnInit(): void {
  }
  copyToClipboard() {
    if (this.presentationURL) {
      this.clipboard.copy(this.presentationURL);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }
}
