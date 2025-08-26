import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersettingsService } from 'src/app/core/Sevices/usersettings.service';
import { find, get, pull } from 'lodash';
import { TeamService } from 'src/app/core/Sevices/Team/team.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Profile } from 'src/app/core/Models/profile.model';
import { Router } from '@angular/router';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';

declare var $: any;
@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.scss'],
    standalone: false
})

export class TeamComponent implements OnInit {
  createteampopupvisible: boolean = false;
  tags: string[] = [];
  @ViewChild('tagInput') tagInputRef: ElementRef;
  forms: FormGroup;
  errorMessage: any = '';
  teamInfo: any;
  private teamSubscription: Subscription;
  invitations: any[] = [];
  memberCount: number = 0;
  invitationCount: number = 0;
  isLoading: boolean = false;
  withdraw: boolean = false;
  Leaveteam: boolean = false;
  removeteammember: boolean = false;
  Leaveteammember: boolean = false;
  inviteId:any;
  email:any;
  teamname:any;
  username:any;
  currentUserRole:any;
  currentUserName: any;
  currentUserEmail: any;
  isDesktop: boolean = window.innerWidth >= 720;
  constructor(    private _usersettingservice: UsersettingsService,
    private teamservice: TeamService,
    private fb: FormBuilder,
    private _toastr: ToastrService,
    private _router: Router,
    private elementRef: ElementRef
  ) {
      this.getTeamInfo();
     }

  ngOnInit(): void {
    this.forms = this.fb.group({
      tag: ['', [Validators.email]]
    });
    const userData = localStorage.getItem('userData');
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('#accordionExample').collapse({
      toggle: true
    });
  }
 
  
  ngAfterViewInit(): void {
    if (this.isDesktop) {
      $("body").tooltip({ selector: '[data-bs-toggle=tooltip]' });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop = window.innerWidth >= 720;
    if (this.isDesktop) {
      $("body").tooltip({ selector: '[data-bs-toggle=tooltip]' });
    } else {
      $('[data-bs-toggle="tooltip"]').tooltip('dispose');
    }
  }
  openPopup() {
    this.createteampopupvisible = true;
    this.errorMessage = '';
    this.tags = [];
  }
 
  closePopup() {
    this.isLoading = false;
    this.createteampopupvisible = false;
    this.withdraw = false;
    this.Leaveteam = false;
    this.removeteammember = false;
    this.Leaveteammember = false;
    this.errorMessage = '';
    this.tags = [];
  }
  inviteMember() {
    this.isLoading = true;
    const invalidEmails = this.tags.filter(email => !this.isValidEmail(email));
    if (invalidEmails.length > 0) {
      const message = getErrorMessage(ErrorMessages.TeamSection8000,ErrorMessages.TeamSection8006);
      this._toastr.error(message, "", {
       timeOut: 5000,
     });
      this.isLoading = false;
      return;
    }
    this.errorMessage = '';
  
    if (this.tags.length > 0) {
      const invitedEmails = this.tags;
      const role = document.getElementById('selectedRoles').innerText;
      const teamId = this.teamInfo.id;
      const teamdata = {
        teamid: teamId,
        email: invitedEmails,
        role: role
      };
  
      this.teamservice.InviteMember(teamdata).subscribe(
        (response: any) => {
          const [lastInvitation] = response.invitations.slice(-1);
          if (lastInvitation) {
            this.invitations.push(lastInvitation);
          }
          this.invitationCount = this.invitations.filter(item => item.joinDate === null).length;
          this.isLoading = false;
          const message = getMessage(SuccessMessages.TeamSection8000,SuccessMessages.TeamSection8001); 
          this._toastr.success(message, "", {
            timeOut: 5000,
          });
          this.closePopup();
          this.tags = [];
        },
        error => {
          const message = getErrorMessage(ErrorMessages.TeamSection8000,ErrorMessages.TeamSection8001);
          this._toastr.error(message, "", {
            timeOut: 5000,
          });
          this.isLoading = false;
        }
      );
    }
  }
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  changeRole(role) {
    document.getElementById("selectedRoles").textContent = role;
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    const inputValue: string = this.forms.controls.tag.value;
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
          this.forms.controls.tag.setValue('');
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
  getTeamInfo() {
    this.teamSubscription = this.teamservice.onMyTeamMenuClick().subscribe(
      (teamInfo: any) => {
        if (teamInfo) {
          this.teamInfo = teamInfo;
          this.invitations = teamInfo.invitations || [];
          this.memberCount = this.invitations.filter(item => item.isJoin == true).length;
          this.invitationCount = this.invitations.filter(item => item.isJoin === false).length;
  
          const userData = localStorage.getItem('userData');
          if (userData) {
            const profileData = JSON.parse(userData);
            const currentUserEmail = profileData.ProfileEMail; 
            const currentUserInvitation = this.invitations.find(invitation => invitation.email === currentUserEmail);
            if (currentUserInvitation) {
              this.currentUserRole = currentUserInvitation.role;
              this.currentUserName = currentUserInvitation.name;
              this.currentUserEmail=currentUserInvitation.email;
            } else {
              console.log('Current user not found in invitations');
            }
          }
        }
      },
      error => {
        console.error('Failed to fetch team information:', error);
      }
    );
  }
  
  

  ngOnDestroy(): void {
    if (this.teamSubscription) {
      this.teamSubscription.unsubscribe();
    }
  }
  copyText(elementId: string) {
    const copyText = document.getElementById(elementId);
    if (copyText) {
      const range = document.createRange();
      range.selectNode(copyText);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      
      const copiedMessage = document.createElement('span');
      copiedMessage.innerText = 'Copied the text: ' + copyText.textContent;
      document.getElementById('gfg')?.appendChild(copiedMessage); 
      this._toastr.success(`Link copied successfully`, "", {
        timeOut: 5000,
      });
    }
  }
  removeid:string;
  removeInvite(inviteId: string) {
    this.isLoading = true;
    const tooltipElement = this.elementRef.nativeElement.querySelector('[data-bs-toggle="tooltip"]');
    if (tooltipElement) {
      const tooltipInstance = tooltipElement._tooltip;
      if (tooltipInstance) {
        tooltipInstance.hide();
      }
    }
    this.removeid = this.teamInfo.id;
    const teamdata = {
      teamID: this.removeid,
      inviteId: inviteId,
    };
    this.teamservice.Invitewithdrawal(teamdata).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.withdraw=false;
        this.invitations = this.invitations.filter(invitation => invitation.inviteId !== inviteId);
        this.invitationCount--;
        const message = getMessage(SuccessMessages.TeamSection8000,SuccessMessages.TeamSection8002); 
        this._toastr.success(message, "", { timeOut: 5000 });
      },
      error => {
        const message = getErrorMessage(ErrorMessages.TeamSection8000,ErrorMessages.TeamSection8002); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
      }
    );
  }
  
  leaveTeam(inviteId: string) {
    this.isLoading = true;
    this.removeid = this.teamInfo.id;
    const teamdata = {
      teamID: this.removeid,
      inviteId: inviteId,
    };
    this.teamservice.LeaveTeam(teamdata).subscribe(
      (response: any) => {
        if (response === true) {
          this.Leaveteam=false;
          this.isLoading = false;
          const PROFILE = new Profile();
          PROFILE.TeamId = null;
          localStorage.setItem('teamId', PROFILE.TeamId !== null ? PROFILE.TeamId.toString() : ''); 
          this.teamservice.inviteSuccess.emit();
          this._router.navigate(['/app/dashboard']);
          const message = getMessage(SuccessMessages.TeamSection8000,SuccessMessages.TeamSection8005); 
          this._toastr.success(message, "", { timeOut: 5000 });
      } else {
          console.error('LeaveTeam API returned false');
      }
      },
      error => {
        const message = getErrorMessage(ErrorMessages.TeamSection8000,ErrorMessages.TeamSection8005); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        }); 
      }
    );
  }
  removeMember(inviteId: string) {
    this.isLoading=true;
    this.removeid = this.teamInfo.id;
    const memberdata = {
      teamID: this.removeid,
      inviteId: inviteId,
    };
    this.teamservice.RemoveMember(memberdata).subscribe(
      (response: any) => {
        this.isLoading=false;
        this.removeteammember = false;
        this.invitations = this.invitations.filter(invitation => invitation.inviteId !== inviteId);
        this.memberCount--;
        const message = getMessage(SuccessMessages.TeamSection8000,SuccessMessages.TeamSection8004); 
        this._toastr.success(message, "", { timeOut: 5000 });
      },
      error => {
        const message = getErrorMessage(ErrorMessages.TeamSection8000,ErrorMessages.TeamSection8004); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
      }
    );
  }
  getTimeAgo(joinedDateTime: any): string {
    if (!joinedDateTime) {
      return ''; 
    }
    const utcDate = new Date(joinedDateTime);
    const currentTime = new Date();
    const timeDifferenceInMilliseconds = currentTime.getTime() - utcDate.getTime();
    if (timeDifferenceInMilliseconds <= 0) {
      return '';
    } else if (timeDifferenceInMilliseconds <= 86400000) { 
      const hours = Math.floor(timeDifferenceInMilliseconds / 3600000);
      const minutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);
      const seconds = Math.floor(((timeDifferenceInMilliseconds % 3600000) % 60000) / 1000);
  
      if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else if (minutes > 0) {
        return ` ${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      } else {
        return ` ${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
      }
    } else if (timeDifferenceInMilliseconds <= 172800000 && timeDifferenceInMilliseconds > 86400000) { // Between 24 and 48 hours
      return ' 1 day ago';
    } else if (timeDifferenceInMilliseconds <= 259200000 && timeDifferenceInMilliseconds > 172800000) { // Between 48 and 72 hours
      return ' 2 days ago';
    } else {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return utcDate.toLocaleDateString('en-US', options);
    }
  }
  isCurrentUser(name: string): boolean {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const profileData = JSON.parse(userData);
      const currentUserEmail = profileData.ProfileEMail; 
         const currentUserInvitation = this.invitations.find(invitation => invitation.email === currentUserEmail);
        return name === currentUserInvitation.name;
    }
    return false;
  }
  openwithdraw(id:any,email:any) {
    this.inviteId=id;
    this.email=email;
    this.withdraw = true;

  }
 
  openleaveteam(id:any) {
    this.inviteId=id;
    this.Leaveteam = true;
  }
  openremovemember(id:any,name:any) {
    this.username=name;
    this.inviteId=id;
    this.removeteammember = true;
  }
  openleavemember(id:any,name:any) {
    this.username=name;
    this.inviteId=id;
    this.Leaveteammember = true;
  }
  leaveMember(inviteId: string) {
    this.isLoading=true;
    this.removeid = this.teamInfo.id;
    const memberdata = {
      teamID: this.removeid,
      inviteId: inviteId,
    };
    this.teamservice.RemoveMember(memberdata).subscribe(
      (response: any) => {
        this.isLoading=false;
        this.removeteammember = false;
        this.Leaveteammember = false;
        const PROFILE = new Profile();
        PROFILE.TeamId = null;
        localStorage.setItem('teamId', PROFILE.TeamId !== null ? PROFILE.TeamId.toString() : ''); 
        this.teamservice.inviteSuccess.emit();
        this._router.navigate(['/app/dashboard']);
        const message = getMessage(SuccessMessages.TeamSection8000,SuccessMessages.TeamSection8003); 
        this._toastr.success(message, "", { timeOut: 5000 });
      },
      error => {
        const message = getErrorMessage(ErrorMessages.TeamSection8000,ErrorMessages.TeamSection8003); 
        this._toastr.error(message, "", {
        timeOut: 5000,
        });  
      }
    );
  }
}
