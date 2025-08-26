import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TemplateService } from '../Service/template.service';

@Component({
  selector: 'app-templates-header',
  templateUrl: './templates-header.component.html',
  styleUrls: ['./templates-header.component.scss']
})
export class TemplatesHeaderComponent implements OnInit {
  @Input() searchTerm: string = '';
  @Input() searchLoading: boolean = false;
  @Input() isPublished: boolean;
  @Input() categoryList: any[];
  @Input() selectedCategory: string;
  @Output() customerSearchTerm: EventEmitter<any> = new EventEmitter<any>();
  @Output() switchTemplateToggle: EventEmitter<any> = new EventEmitter<any>();
  @Output() categorySelected: EventEmitter<string> = new EventEmitter<string>();

  constructor(public _templateService: TemplateService) { }

  ngOnInit(): void {
  }

  onSearchInput() {
    this.customerSearchTerm.emit(this.searchTerm);
  }
  
  onSearchChange() {
    if (this.searchTerm.trim() === '') {
      this.customerSearchTerm.emit(this.searchTerm);
    }
  }
  
  switchToggle() {
    this.isPublished = !this.isPublished;
    this.switchTemplateToggle.emit(this.isPublished);
  }

  onCategorySelect(category: string) {
    this.categorySelected.emit(category);
  }
}
