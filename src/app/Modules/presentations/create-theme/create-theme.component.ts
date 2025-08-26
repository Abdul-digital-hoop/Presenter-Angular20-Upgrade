import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-create-theme',
    templateUrl: './create-theme.component.html',
    styleUrls: ['./create-theme.component.scss'],
    standalone: false
})
export class CreateThemeComponent implements OnInit {
  // These variables are used to store the theme id and theme data
  public themeId: string;
  public themeData: any;
  public customerRewards:any;
  // This variable is used to control the loader when binding the theme data
  public isBindingTheThemeDataLoader:boolean=false; 

  // Constructor to initialize the component with necessary services and fetch theme data using routing parameters
  constructor(public presentationThemeService: PresentationThemeService, private route: ActivatedRoute,private workSpaceService:WorkspaceService) {
    this.getThemeDataUsingRoutingParams(); // Call to fetch theme data using routing parameters
  }

  ngOnInit(): void {
    // No additional initialization needed as theme data fetching is handled in the constructor
  }

  // Method to fetch theme data using routing parameters
  getThemeDataUsingRoutingParams() {
    this.isBindingTheThemeDataLoader = true;
    // Subscribe to route parameters to get the theme ID
    this.route.params.subscribe(params => {
      this.themeId = params['id']; // Extract theme ID from route parameters
      this.presentationThemeService.customeThemeId = this.themeId;
      // Attempt to find the theme data from the customer themes array
      this.themeData = this.presentationThemeService.customerThemes.find(theme => theme.id === this.themeId);
      // If theme data is not found in customer themes, fetch it by ID
      if (!this.themeData) {
        this.presentationThemeService.getThemeById(this.themeId).then((response: any) => {
          this.themeData = response.data.theme; // Assign the fetched theme data to the component property
          this.customerRewards = response.data.customerRewards;
          this.isBindingTheThemeDataLoader = false;
        });
      }
      else{
        this.isBindingTheThemeDataLoader = false;
      }
    });
    this.route.queryParams.subscribe(queryParams => {
      this.workSpaceService.isTemplate = queryParams['isTemplate']; 
    }); 
  }
  resetThemeDetails(data){
    this.themeData = null;
    this.themeData = data;
  }
}
