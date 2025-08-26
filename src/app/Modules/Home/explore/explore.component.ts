import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  isPowerPoinPopupVisible: boolean = false;
  isZoomPopupVisible: boolean = false;
  isGsPopupVisible: boolean= false;
  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }
  openBox(boxType: string) {
  }
  pptopenPopup() {
    this.isPowerPoinPopupVisible = true;
  }
  zoomopenPopup(){
    this.isZoomPopupVisible =true;
  }
  googleslidesopenPopup(){
    this.isGsPopupVisible = true;
  }
  closePopup() {
    this.isPowerPoinPopupVisible = false;
    this.isZoomPopupVisible = false;
    this.isGsPopupVisible = false;
  }
}
