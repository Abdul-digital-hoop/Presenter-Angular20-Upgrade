import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MetaService } from 'src/app/core/Sevices/meta.service';

@Component({
  selector: 'app-signup-verification',
  templateUrl: './signup-verification.component.html',
  styleUrls: ['./signup-verification.component.scss']
})
export class SignupVerificationComponent implements OnInit {

  EmailVerifiedStatus : boolean;
  constructor(
    private route: ActivatedRoute,
    private _metaService: MetaService
  ) { }

  ngOnInit(): void {
    const metaConfig = this._metaService.getAuthPageMeta('verification');
    this._metaService.updateMetaTags(metaConfig.title, metaConfig.description, metaConfig.ogtitle, metaConfig.ogImage, metaConfig.ogdescription);

    this.EmailVerifiedStatus = false;
    this.route.queryParams.subscribe(params => {
      const emailVerified = params['email'] === 'verified';
      if (emailVerified) {
        this.EmailVerifiedStatus = true;
      } 
    });
  }

}
