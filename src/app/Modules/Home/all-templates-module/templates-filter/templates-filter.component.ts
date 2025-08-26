import { Component, EventEmitter, Output, Input, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-templates-filter',
  templateUrl: './templates-filter.component.html',
  styleUrls: ['./templates-filter.component.scss']
})
export class TemplatesFilterComponent implements OnInit {
  @Input() categoryList: any[];
  @Input() isPublished: boolean;
  @Input() selectedCategory: string='';
  @Output() categorySelected: EventEmitter <any> = new EventEmitter <any>();
  @Output() switchTemplateToggle: EventEmitter <any> = new EventEmitter <any>();
  public cutomerSelectedTemplates:string=null;
  showAllCategories = false;
  initialCategoriesToShow = 5;
  showSearch = false;
  searchText = '';
  filteredCategories: any[] = [];
  private searchSubject = new Subject<string>();
  isDropdownOpen = false;

  constructor() {
    this.updateInitialCategories();
    this.setupSearchDebounce();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(searchText => {
      this.filterCategories(searchText);
    });
  }

  private filterCategories(searchText: string) {
    if (searchText) {
      this.filteredCategories = this.categoryList.filter(category => 
        category.categoryName.toLowerCase().includes(searchText.toLowerCase())
      );
    } else {
      this.filteredCategories = this.categoryList;
    }
  }

  clearSearch() {
    this.searchText = '';
    this.filteredCategories = this.categoryList;
    this.searchSubject.next('');
  }

  @HostListener('window:resize')
  onResize() {
    this.updateInitialCategories();
  }

  private updateInitialCategories() {
    if (window.innerWidth >= 1300) {
      this.initialCategoriesToShow = 8;
    } else if (window.innerWidth >= 992) {
      this.initialCategoriesToShow = 6;
    } else if (window.innerWidth >= 768) {
      this.initialCategoriesToShow = 5;
    } else {
      this.initialCategoriesToShow = 4;
    }
  }

  toggleShowAll() {
    this.showAllCategories = !this.showAllCategories;
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.clearSearch();
    }
  }

  onSearchChange() {
    this.searchSubject.next(this.searchText);
  }

  ngOnInit(): void {
    this.filteredCategories = this.categoryList;
  }
  changeCategory(categoryName:string){
    this.cutomerSelectedTemplates = null;
    this.categorySelected.emit(categoryName);
    this.closeDropdown();
  }
  switchToggle(){
    this.isPublished = !this.isPublished;
    this.switchTemplateToggle.emit(this.isPublished);
  }
  onDropdownTemplateSelect(categoryName:string){
    this.cutomerSelectedTemplates = categoryName;
    this.categorySelected.emit(categoryName);
  }
  
  ngOnDestroy() {
    this.searchSubject.complete();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.clearSearch();
    }
  }

  closeDropdown() {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.clearSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const dropdown = document.querySelector('.category-dropdown');
    
    if (dropdown && !dropdown.contains(clickedElement)) {
      this.closeDropdown();
    }
  }
}
