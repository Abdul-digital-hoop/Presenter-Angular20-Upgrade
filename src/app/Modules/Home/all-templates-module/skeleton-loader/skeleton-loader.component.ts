import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-skeleton-loader',
    templateUrl: './skeleton-loader.component.html',
    styleUrls: ['./skeleton-loader.component.scss'],
    standalone: false
})
export class SkeletonLoaderComponent implements OnInit {
@Input() type : 
'default' | 'card' | 'image'|'category-buttons'|'header-sec'|'line'|
'h1-header-txt'|'search-bar'|'toogle-bar'|'list'
|'h2-header-txt' = 'default';
  constructor() { }

  ngOnInit(): void {
  }

}
