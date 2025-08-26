import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
declare var $: any;

@Component({
    selector: 'app-teams-presentations',
    templateUrl: './teams-presentations.component.html',
    styleUrls: ['./teams-presentations.component.scss'],
    standalone: false
})
export class TeamsPresentationsComponent implements OnInit {

  userName: string;
  public profile: Profile;
  myForm: FormGroup;
  isLoading: boolean = false;
  submitted = false;
  userPresentation: any;
  searchTerm: any = '';
  constructor(
    private _accountservice: AccountService,
    private _presentationservice: PresentationService,
    private _formBuilder: FormBuilder,
    private _toastr: ToastrService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
      if (userData.ProfileSecondName) {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
      } else {
        this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase()
      }
    });
    this.myForm = this._formBuilder.group({
      presentationName: ['', Validators.required]
    });
    this.GetAllPresentation();

  }
  get f(): { [key: string]: AbstractControl } {
    return this.myForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.myForm.invalid) {
      return;
    }
    if (this.myForm.valid) {
      this.isLoading = true;
      var payload = this.myForm.value;
      this._presentationservice.CreatePresentation(payload).subscribe(
        (response: any) => {
          this.isLoading = false;
          this.myForm.reset();
          this.submitted = false;
          $('#createNewPresentation').modal('hide');
          this._router.navigateByUrl('/presentation/new-presentation/' + response.id);
        },
        (error: any) => {
          this.isLoading = false;
          $('#createNewPresentation').modal('hide');
          this._toastr.error(error?.error?.message, "Error", {
            timeOut: 15000,
          }
          );
        }
      )
    }
  }


  clearSearch() {
    this.searchTerm = '';
  }
  CancelPresentation() {
    this.myForm.reset();
    this.submitted = false;
  }
  
  GetAllPresentation() {
    this._presentationservice.GetAllPresentation().subscribe(
      (response: any) => {
        this.userPresentation = response.slice().reverse();
      },
      (error: any) => {
        console.log(error);
      }
    )
  }

}
