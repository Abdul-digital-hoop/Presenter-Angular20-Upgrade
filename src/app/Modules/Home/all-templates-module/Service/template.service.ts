import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  pageNumber: number = 1;
  numberOfRecords: number = 9;
  isPublished: boolean = true;
  selectedCategory = "All Templates";
  searchTerm: string = "";
  templatesList: any[];
  categoryList: any[];
  isOnPageLoad: boolean = false;
  constructor(private _http: HttpClient,
    private router: Router,
    private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.isPublished = params['isPublished'] !== undefined ? params['isPublished'] === 'true' : true;
      this.selectedCategory = params['selectedCategory'] || 'All Templates';
    });
  }
  // Add method to update query params
  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        isPublished: this.isPublished,
        selectedCategory: this.selectedCategory
      },
      queryParamsHandling: 'merge'
    });
  }
  getTemplates(pageNumber: number, numberOfRecords: number, isPublished: boolean, categoryName: string, searchTerm: string): Observable<any> {
    return this._http.get<any>(environment.MyApi + `get-all-new-templates?pageNumber=${pageNumber}&numberOfRecords=${numberOfRecords}&isPublished=${isPublished}&categoryName=${encodeURIComponent(categoryName)}&searchTerm=${encodeURIComponent(searchTerm)}`)
  }
  getCategory(): Observable<any> {
    return this._http.get<any>(environment.MyApi + 'get-all-categories');
  }
  convertPresentation(id: string): Observable<any> {
    return this._http.post(environment.MyApi + `convert-presentation?templateId=${id}`, null);
  }
 
  publishTemplate(payload: any) {
    return this._http.put(environment.MyApi + 'publish-templates', payload);
  }

  cancelPublishTemplate(id: string): Observable<any> {
    return this._http.put(`${environment.MyApi}cancel-published?templateId=${id}`, {});
  }
  getAllTemplates(pageNumber: number, numberOfRecords: number, isPublished: boolean, categoryName: string, searchTerm: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTemplates(pageNumber, numberOfRecords, isPublished, categoryName, searchTerm)
        .subscribe(
          (response) => {
            if(response){
              this.templatesList =response;
              resolve(response);
            }
            else{
              console.log("Invalid Response");
              resolve(response);
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  onScrollTemplates(pageNumber: number, numberOfRecords: number, isPublished: boolean, categoryName: string, searchTerm: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTemplates(pageNumber, numberOfRecords, isPublished, categoryName, searchTerm)
        .subscribe(
          (response) => {
            if(response){
              this.templatesList =[...this.templatesList,...response];
              resolve(response);
            }
            else{
              console.log("Invalid Response");
              resolve(response);
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  getAllCategory(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCategory()
        .subscribe(
          (response) => {
            if(response){
              this.categoryList = response;
              resolve(response);
            }
            else{
              console.log("Invalid Response");
              resolve(response);
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  deleteTemplate(id: string): Observable<any> {
    return this._http.delete(environment.MyApi + `delete-template?templateId=${id}`,{});
  }
  editTemplateConfirmation(id:string): Observable<any>{
    return this._http.put(environment.MyApi + `edit-template-confirmation?templateId=${id}`,{});
  }
  getTemplateAdmin(id:string,isPresentation:boolean){
    return this._http.get(environment.MyApi + `get-template-admin?templateId=${id}&isPresentation=${isPresentation}`,{});
  }
  // This endpoints another copy is template service keep your change both sides
  getSlideTypesForTemplate(id:string, isPresentations:boolean){
    return this._http.get(environment.MyApi + `get-template-slideTypes?templateId=${id}&isPresentations=${isPresentations}`,{});
  }
}
