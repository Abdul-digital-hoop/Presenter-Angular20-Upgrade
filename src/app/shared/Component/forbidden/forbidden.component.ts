import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from 'src/app/core/Sevices/account.service';

@Component({
    selector: 'app-forbidden',
    templateUrl: './forbidden.component.html',
    styleUrls: ['./forbidden.component.scss'],
    standalone: false
})
export class ForbiddenComponent implements OnInit {

  constructor( private _accountservice: AccountService,) { }

  ngOnInit(): void {
  }
  @HostListener('document:click', ['$event'])
  clickout(event) {
    this._accountservice.logout();
  }
}
