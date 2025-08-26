import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TemplateService } from '../Service/template.service';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-templates',
    templateUrl: './templates.component.html',
    styleUrls: ['./templates.component.scss'],
    standalone: false
})
export class TemplatesComponent implements OnInit, OnDestroy {
  customerLimitationCount: any;
  contentsloading: boolean = false;
  hasMoreTemplates: boolean;
  searchloading: boolean = false;
  templateSection: boolean;
  cardSectionLoading: boolean = false;
  private destroy$ = new Subject<void>();
  cardsPerRow: number = 3; // Default value
  numberOfRecords: number = 9; // Default value

  constructor(
    public _templateService: TemplateService,
    private _customerPlanService: CustomerPlanService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.setupResponsiveLayout();
    this.cardSectionLoading = true;
    this._templateService.isOnPageLoad = true;
    this._templateService.pageNumber = 1;
    this._templateService.numberOfRecords = this.numberOfRecords;
    this.templateSection = this._templateService.isPublished;
    
    forkJoin([this.getAllTemplatesOnPageLoad(), this.getAllCategory()]).subscribe({
      next: () => {
        this._templateService.isOnPageLoad = false;
      },
      error: (error) => {
        console.error(error);
        this._templateService.isOnPageLoad = false;
      }
    });
    this.customerLimitationCount = this._customerPlanService.getCustomerLimitationsCounts();
  }

  private setupResponsiveLayout() {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.cardsPerRow = 1;
          this.numberOfRecords = 6;
        } else if (result.breakpoints[Breakpoints.Small]) {
          this.cardsPerRow = 2;
          this.numberOfRecords = 6;
        } else if (result.breakpoints[Breakpoints.Medium]) {
          this.cardsPerRow = 3;
          this.numberOfRecords = 6;
        } else if (result.breakpoints[Breakpoints.Large]) {
          this.cardsPerRow = 3;
          this.numberOfRecords = 9;
        } else if (result.breakpoints[Breakpoints.XLarge]) {
          this.cardsPerRow = 4;
          this.numberOfRecords = 12;
        }
        // Update the service with new number of records
        this._templateService.numberOfRecords = this.numberOfRecords;
        
        // If we're not on initial load, refresh the templates
        if (!this._templateService.isOnPageLoad) {
          this._templateService.pageNumber = 1;
          this._templateService.templatesList = [];
          this.getAllTemplatesUpdateQuery();
        }
      });
  }

  getAllTemplatesOnPageLoad(){
    this._templateService.getAllTemplates(
      this._templateService.pageNumber,
      this._templateService.numberOfRecords,
      this._templateService.isPublished,
      this._templateService.selectedCategory,
      this._templateService.searchTerm).then((response:any)=>{
        this.hasMoreTemplates = true;
        this._templateService.isOnPageLoad = false;
        this.cardSectionLoading = false;
      }).finally(() => {
        this._templateService.isOnPageLoad = false;
        this.cardSectionLoading = false;
      })
  }

  loadMoreTemplates(): void {
    this._templateService.pageNumber++; 
    this._templateService.onScrollTemplates(
      this._templateService.pageNumber,
      this._templateService.numberOfRecords,
      this._templateService.isPublished,
      this._templateService.selectedCategory,
      this._templateService.searchTerm).then((response:any)=>{
      }).finally(() => {
        
      })
  }
  
  getAllCategory(){
    this._templateService.getAllCategory().then((response:any)=>{
      this._templateService.isOnPageLoad = false;
    }).finally(() => {
      this._templateService.isOnPageLoad = false;
    })
  }
  getAllTemplatesUpdateQuery(){
    this.hasMoreTemplates = false;
    this._templateService.getAllTemplates(
      this._templateService.pageNumber,
      this._templateService.numberOfRecords,
      this._templateService.isPublished,
      this._templateService.selectedCategory,
      this._templateService.searchTerm).then((response:any)=>{
        this.hasMoreTemplates = true;
        this.searchloading = false;
        this.cardSectionLoading = false;
      }).catch((error) => {
        console.error('Error loading templates:', error);
        this.cardSectionLoading = false;
        this.searchloading = false;
      });
  }
  categoryChanged(newCategory:string){
    this._templateService.selectedCategory = newCategory;
    this._templateService.updateQueryParams();
    this.getAllTemplatesUpdateQuery();
  }
  switchTemplateToggle(isPublished:boolean){
    this._templateService.isPublished = isPublished;
    this.templateSection = isPublished;
    this._templateService.pageNumber = 1;
    this._templateService.templatesList = [];
    this.cardSectionLoading = true;
    this._templateService.updateQueryParams();
    this.getAllTemplatesUpdateQuery();
  }
  customerSearch(searchKey:string){
    this.searchloading = true;
    this._templateService.searchTerm = searchKey;
    this._templateService.pageNumber = 1;
    this._templateService.templatesList = [];
    this.cardSectionLoading = true;
    this.setupResponsiveLayout();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._templateService.searchTerm = '';
    this._templateService.isPublished = true;
    this._templateService.selectedCategory = "All Templates";
  }
  updateTemplateList(removedTemplateId: any) {
    this._templateService.templatesList = this._templateService.templatesList.filter(item => item.templateId !== removedTemplateId); 
  }
}
