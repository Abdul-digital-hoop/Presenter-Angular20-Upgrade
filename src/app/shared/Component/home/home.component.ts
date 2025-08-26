import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { settingVariables } from 'src/app/utility/SettingVariables';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  presentationCode: string = '';
  validPresentationCode: boolean = true;
  presentationForm: FormGroup;
  private ngUnsubscribe = new Subject<void>();
  environmentDetails = environment;
  settingVariable = settingVariables;
  audienceUIUrl: string;
  isLoading: boolean = false;
  constructor(
    private _presentationService: PresentationService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.presentationForm = this._formBuilder.group({
      joinPresentationCode: ['', Validators.required],
    });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.unsubscribe();
  }
  hideJoinPresentation(): void {
    var element = document.getElementById('joinPresentation');
    element.classList.add('d-block');
  }
  showJoinPresentation() {
    var element = document.getElementById('joinPresentation');
    element.classList.remove('d-block');
  }
  joinPresentation() {
    this.isLoading = true;
    var presentationCode = this.presentationForm.get(
      'joinPresentationCode'
    ).value.trim();
    this._presentationService
      .getPresentationDetailsByCode(presentationCode)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res.isPresentation) {
            this.validPresentationCode = true;
          }
          var redirectUrl = this.environmentDetails.AudienceDomain + res.url;
          window.open(redirectUrl, '_blank');
        },
        (error: any) => {
          this.isLoading = false;
          this.validPresentationCode = false;
          console.log(error);
        }
      );
  }
}
