import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-integrations',
    templateUrl: './integrations.component.html',
    styleUrls: ['./integrations.component.scss'],
    standalone: false
})
export class IntegrationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
