import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { NavigationEnd, Router } from '@angular/router';
import { Profile } from 'src/app/core/Models/profile.model';
import { UsersettingsService } from 'src/app/core/Sevices/usersettings.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { MypresentationsService } from '../Home/mypresentations/Service/mypresentations.service';
declare var $: any;
declare const _IntegrationMediumOffice: boolean;
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  userName: string;
  public profile: Profile;
  profileImage:string;
  userid:any;
  customerPlan: CustomerPlan;
  searchTerm: string = '';
  showSearch: boolean = false;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor(private _accountservice: AccountService,
    private _presentationservice: PresentationService,
    private _usersettingservice: UsersettingsService,
    private _router: Router,
    private _customerPlanService: CustomerPlanService,
    private workspaceService: WorkspaceService,
    public _mypresentationsService: MypresentationsService
  ) {
    this._mypresentationsService.searchVisible.subscribe(visible => {
      this.showSearch = visible;
      if (!visible) {
        this.searchTerm = '';
      }
    });
    this._mypresentationsService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
    });
   }

    ngOnInit(): void {
      this._accountservice.UserProfile.subscribe((userData) => {
        this.profile = userData;
        this.profileImage = this.profile?.ProfileImgUrl; 
        if (userData?.ProfileSecondName) {
          this.userName = userData?.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData?.ProfileSecondName.charAt(0).toLocaleUpperCase();
        } else {
          this.userName = userData?.ProfileFirstName.charAt(0).toLocaleUpperCase()
        }
      });
      this._router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.showSearch = this._router.url.includes('app/mypresentations') || this._router.url === '/app/mypresentations';
        }
      });
      this.customerPlan = this._customerPlanService.getCustomerPlan();

    }
    ngAfterViewChecked(){
      if (Object.keys(this.customerPlan || {}).length === 0) {
        this.customerPlan = this._customerPlanService.getCustomerPlan();
      }
    }
    Signout() {
      this._accountservice.logout();

     
    }
  confirmLogout(){
      $('#logoutModal').modal('show');
  }
  closeLogout(){
      $('#logoutModal').modal('hide');
  }
  logout() {
    const payload = {
      description: `The user signout the application`
    };
    this._presentationservice.customerActive(payload).subscribe(
      (response: any) => {})
    $('#logoutModal').modal('hide');
    this._accountservice.logout();
  
  }
  upgrade(){
    this._router.navigateByUrl('app/myplan');
  }
  onSearch() {
    this._mypresentationsService.updateSearch(this.searchTerm);
  }
  onInputChange() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this._mypresentationsService.updateSearch('');
    }
  }
  // sidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }

  // closeSidebar() {
  //   this.isSidebarOpen = false;  
  // }
}
