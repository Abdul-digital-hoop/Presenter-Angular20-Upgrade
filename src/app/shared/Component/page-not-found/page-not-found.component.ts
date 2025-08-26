import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from 'src/app/core/Sevices/account.service';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.scss'],
    standalone: false
})
export class PageNotFoundComponent implements OnInit {

  constructor(private _accountservice: AccountService,) { }

  ngOnInit(): void {
  }
  @HostListener('document:click', ['$event'])
  clickout(event) {
    this._accountservice.logout();
  }
}
