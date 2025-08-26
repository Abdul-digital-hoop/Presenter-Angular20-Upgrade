import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TeamService } from 'src/app/core/Sevices/Team/team.service';
import { MypresentationsService } from '../mypresentations/Service/mypresentations.service';
declare const _IntegrationMediumOffice: boolean;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  isActiveTeam: boolean = false;
  inviteClickedSubscription: Subscription;
  inviteSuccessSubscription: Subscription;
  showCreateTeamMenu: boolean = true;
  IntegrationMediumOffice: boolean = _IntegrationMediumOffice;
  constructor(private router: Router, private teamservice: TeamService, public mypresentationsService: MypresentationsService) { 
    this.inviteClickedSubscription = this.teamservice.inviteClicked.subscribe(() => {
      this.isActiveTeam = true;
      this.router.navigate(['/app/team-members']); 
    });

    // Subscribe to inviteSuccess event
    this.inviteSuccessSubscription = this.teamservice.inviteSuccess.subscribe(() => {
      this.checkTeamExists();
    });

    this.checkTeamExists();
  }

  hasTeam: boolean = false;

  ngOnInit(): void {}

  checkTeamExists(): void {
    const teamId = localStorage.getItem('teamId');
    this.hasTeam = !!teamId; // Convert to boolean
  }
  isLinkActive(link: string): boolean {
    return this.router.url.includes(link);
  }
  ngOnDestroy() {
    this.inviteClickedSubscription.unsubscribe();
    this.inviteSuccessSubscription.unsubscribe();
  }

  navigateToUser() {
    let newRouterLink = '/app/mypresentations';

    // Navigate to the root route ('/') first, and then navigate to the newRouterLink
    this.router.navigate(['/']).then(() => {
      this.router.navigate([newRouterLink]);
    });
  }

  openPopup() {
    this.teamservice.openPopup();
  }
  
  onMyTeamMenuClick(){
    this.teamservice.onMyTeamMenuClick();
  }
}
