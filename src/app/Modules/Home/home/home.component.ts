import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { Profile } from 'src/app/core/Models/profile.model';
import { UsersettingsService } from 'src/app/core/Sevices/usersettings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { find, get, pull } from 'lodash';
import { TeamService } from 'src/app/core/Sevices/Team/team.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { getMessage } from 'src/app/core/SuccessMessageHandler';
import { SuccessMessages } from 'src/app/core/SuccessResponse';
import { CustomerLimitationsCount } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
declare const _IntegrationMediumZoom: boolean;
declare const _IntegrationMediumOffice: boolean;
interface TeamResponse {
  id: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  userName: string;
  public profile: Profile;
  profileImage: string;
  isHomeSearch: boolean = true;
  createteampopupvisible: boolean = false;
  tags: string[] = [];
  @ViewChild('tagInput') tagInputRef: ElementRef;
  form: FormGroup;
  errorMessage: any = '';
  defaultTeamName: string = '';
  teamid: any;
  isLoading: boolean = false;
  hasTeam: boolean = false;
  isActiveTeam: boolean = false;
  inviteClickedSubscription: Subscription;
  inviteSuccessSubscription: Subscription;
  showCreateTeamMenu: boolean = true;
  customerPlan: CustomerPlan;
  customerLimitationCount: CustomerLimitationsCount;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor(
    private _accountservice: AccountService,
    private _presentationservice: PresentationService,
    private _usersettingservice: UsersettingsService,
    private fb: FormBuilder,
    private _router: Router,
    private teamservice: TeamService,
    private _toastr: ToastrService,
    private _customerPlanService: CustomerPlanService
  ) {
    this.inviteClickedSubscription = this.teamservice.inviteClicked.subscribe(() => {
      this.isActiveTeam = true;
      this._router.navigate(['/app/team-members']);
    });

    this.inviteSuccessSubscription = this.teamservice.inviteSuccess.subscribe(() => {
      this.checkTeamExists();
    });
    this.checkTeamExists();
    this.customerLimitationCount = this._customerPlanService.getCustomerLimitationsCounts();
    this.customerPlan = this._customerPlanService.getCustomerPlan();
  }

  ngOnInit(): void {
    this.getCustomerPresentationLimit();
    this._accountservice.UserProfile.subscribe((userData) => {
      this.profile = userData;
      this.profileImage = this.profile?.ProfileImgUrl;
      if (userData?.ProfileSecondName) {
        this.userName = userData?.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData?.ProfileSecondName.charAt(0).toLocaleUpperCase();
      } else {
        this.userName = userData?.ProfileFirstName.charAt(0).toLocaleUpperCase()
      }
    });
    this.defaultTeamName = `${this.profile?.ProfileFirstName} ${this.profile?.ProfileSecondName}'s Team`;
    this.teamservice.openPopup$.subscribe(() => {
      this.createteampopupvisible = true;
    });
    this.form = this.fb.group({
      tag: [undefined],
    });
  }
  getCustomerPresentationLimit() {
    this._presentationservice.getCustomerPresentationLimit().subscribe((response: any) => {
      this._customerPlanService.setCustomerPresentationLimite(response?.balancePresentationLimit)
      this._accountservice.setbalancePresentationLimitAvailable(true);
    }, (error) => {
      console.error(error);
      this._accountservice.setbalancePresentationLimitAvailable(true);
    });
  }
  logout() {
    this._accountservice.logout();
  }
  isSidebarOpen = false;

  sidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }


  closePopup() {
    this.isLoading = false;
    this.createteampopupvisible = false;
    this.errorMessage = '';
    this.tags = [];
  }


  changeRole(role) {
    document.getElementById("SelectedRole").textContent = role;
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    const inputValue: string = this.form.controls.tag.value;
    if ((event.code === 'Backspace' || event.key === 'Backspace') && !inputValue) {
      this.removeTag();
      const tagsContainer = document.getElementById("tags-container");
      if (tagsContainer && tagsContainer.children.length === 1) {
        const inviteElement = document.getElementById("invite");
        inviteElement.classList.add("disableds");
      }
      return;
    } else {
      if (event.which === 188 || event.which === 13 || event.which === 108) {
        event.preventDefault();
        if (inputValue.trim() !== '') {
          this.addTag(inputValue.trim());
          this.form.controls.tag.setValue('');
          const inviteElement = document.getElementById("invite");
          inviteElement.classList.remove("disableds");
        }
      }
    }
  }

  addTag(tag: string): void {
    const tagsToAdd = tag.split(',').map(t => t.trim()).filter(Boolean);
    tagsToAdd.forEach(tag => {
      if (tag.length > 0 && !this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    });

    if (this.tags.length === 1) {
      const inviteElement = document.getElementById("invite");
      inviteElement.classList.add("disableds");
    }
  }

  removeTag(tag?: string): void {
    if (!!tag) {
      const index = this.tags.indexOf(tag);
      if (index !== -1) {
        this.tags.splice(index, 1);
      }
    } else {
      if (this.tags.length > 0) {
        this.tags.pop();
        if (this.tags.length === 0) {
          const inviteElement = document.getElementById("invite");
          inviteElement.classList.add("disableds");
        }
      }
    }
  }
  invite() {
    this.isLoading = true;
    const invalidEmails = this.tags.filter(email => !this.isValidEmail(email));
    if (invalidEmails.length > 0) {
      this.errorMessage = 'Invalid email address. Please enter valid email address before inviting.';
      this.isLoading = false;
      return;
    }
    this.errorMessage = '';
    const teamNameInput = document.querySelector('input[formControlName="profilename"]') as HTMLInputElement;
    const enteredTeamName = teamNameInput.value.trim();

    if (this.tags.length > 0) {
      const teamName = enteredTeamName || this.defaultTeamName;
      const invitedEmails = this.tags;
      const role = document.getElementById('SelectedRole').innerText;

      const userData = localStorage.getItem('userData');
      this._accountservice.UserProfile;
      if (userData) {
        const profileData = JSON.parse(userData);
        const currentUserEmail = profileData.ProfileEMail;
        if (invitedEmails.includes(currentUserEmail)) {
          this.errorMessage = 'Cannot invite yourself.';
          this.isLoading = false;
          return;
        }


        const teamdata = {
          teamName: teamName,
          email: invitedEmails,
          role: role
        };

        this.teamservice.CreateTeam(teamdata).subscribe(
          (response: TeamResponse) => {
            this.isLoading = false;
            const PROFILE = new Profile();
            PROFILE.TeamId = response.id;
            localStorage.setItem('teamId', PROFILE.TeamId.toString());
            this.teamservice.inviteSuccess.emit();
            this._router.navigate(['/app/team-members']);
            const message = getMessage(SuccessMessages.TeamSection8000, SuccessMessages.TeamSection8001);
            this._toastr.success(message, "", {
              timeOut: 5000,
            });
            this.closePopup();
            this.tags = [];
          },
          error => {
            console.error('Team creation error : ', error);
            this.errorMessage = error;
            this.isLoading = false;
          }
        );
      }
    }
  }


  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  openPopup() {
    this.teamservice.openPopup();
  }
  onMyTeamMenuClick() {
    this.teamservice.onMyTeamMenuClick();
  }
  checkTeamExists(): void {
    const teamId = localStorage.getItem('teamId');
    this.hasTeam = !!teamId; // Convert to boolean
  }

  ngOnDestroy() {
    this.inviteClickedSubscription.unsubscribe();
    this.inviteSuccessSubscription.unsubscribe();
  }
}
