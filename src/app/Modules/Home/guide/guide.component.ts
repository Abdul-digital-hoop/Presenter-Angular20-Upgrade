import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {

  constructor() { }
  ngOnInit(): void {
   
  }
  scroll(direction: 'left' | 'right') {
    const element = document.getElementById('content');
    if (element) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      element.scrollBy({ top: 0, left: scrollAmount, behavior: 'smooth' });
    }
  }

}
