import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerPlan } from 'src/app/core/Models/customer-plan.model';
import { Profile } from 'src/app/core/Models/profile.model';
import { CustomerPlanService } from 'src/app/core/Sevices/CustomerPlan/customer-plan.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { AccountService } from 'src/app/core/Sevices/account.service';
import { MasterSlideTypeName, ViewResult } from 'src/app/utility/constants';

declare let zoomSdk: any;
declare const _IntegrationMediumZoom: boolean;
@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.scss']
})
export class ViewResultComponent implements OnInit {
  presentationname:any;
  userPresentation: any[] = [];
  userresult: any[] = [];
  PresentationId: string;
  userSlide: any[] = [];
  questions: any[] = [];
  question: any[] = [];
  Like: any[] = [];
  Answer: any[] = [];
  questions1: any[] = [];
  question1: any[] = [];
  recentQuest: any[] = [];
  Like1: any[] = [];
  Answer1: any[] = [];
  questionvalue:any[] = [];
  questionSort:any[] = [];
  showUnanswered: boolean = false;
  selectedOrder: string = 'by_recent';
  slideId: string;
  participationquestion: any[]=[];
  participantDetails: any[]=[];
  quizDetails:any[]=[];
  totalUsers:number =0;
  percentageUsersWithZeroPoints: number;
  imageUrl: any;
  IntegrationMediumZoom: boolean = _IntegrationMediumZoom
  showSlideSelection = false;
  userName: string;
  public profile: Profile;
  screenshotimageurl:any;
  showAll: boolean = false;
  selectedSlides: any[] = [];
  selectedCount = 0;
  // In your component class
  showAllRows = false;
  visibleRowCount = 4;
  displayedQuestions: string[] = [];
  questioncount: any;
  totalResponseCount: number;
  quizParticipant: boolean;
  profileImage: any;
  activeTab = 'participation-contents';
  svgImages: string[] = [];
  activeSection = 'Summary';
  responseSummary: any=[];
  choices: any;
  optionsResponseCount: any;
  typeData: any;
  masterSlideTypeName = MasterSlideTypeName;
  viewResult = ViewResult;
  quizLeaderboard: any;
  customerPlan:CustomerPlan
  showQuizNotification: boolean = false;
  participantCountValue : number;
  isLoading: boolean = true;
  isLoadingExcelButton: boolean = true;
  unansweredQuestions = [];
  allAnswersEmpty: boolean;
  questImageUrl: any[] = [];
  constructor(private _presentationservice: PresentationService,
    private _activateRouter: ActivatedRoute,
    private _router: Router,
    private _sanitizer: DomSanitizer,
    private _accountservice: AccountService,
    public workSpaceService:WorkspaceService,
    private http: HttpClient,
    public _toastr: ToastrService,public _customerPlanService: CustomerPlanService
    ) {
    this.PresentationId = this._activateRouter.snapshot.paramMap.get("id");
    this.workSpaceService.presentationId = this.PresentationId ;
    this.customerPlan =_customerPlanService.getCustomerPlan();
   }

  ngOnInit(): void {    
    
   // this.GetAllPresentation();
    // this.Present( this.PresentationId ,this.slideId);
    // this.Getquestion( this.PresentationId );
    // this.GetPresentationId( this.PresentationId );
    // this.GetParticipationDetails( this.PresentationId);
    // this.GetQuizDetails(this.PresentationId);
    this.loadDataSequentially(this.PresentationId);
    if(this.IntegrationMediumZoom){
      zoomSdk.getMeetingUUID()
        .then((result) => {
          const newmeetingUUID = result.meetingUUID;
          this._presentationservice.setMeetingUUID(newmeetingUUID);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      
      zoomSdk.getUserContext()
        .then((result) => {
          if (result && result.role) {
            const role = result.role;
            this._presentationservice.setRole(role);
          }
        });
      }
      this._accountservice.UserProfile.subscribe((userData) => {
        this.profile = userData;
        this.profileImage = userData.ProfileImgUrl;
        if (userData.ProfileSecondName) {
          this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase() + userData.ProfileSecondName.charAt(0).toLocaleUpperCase();
        } else {
          this.userName = userData.ProfileFirstName.charAt(0).toLocaleUpperCase()
        }
      });
      this.setActiveTab(this.activeTab);
      this.unansweredQuestions = this.getunansweredQuestions();
  }
  loadDataSequentially(presentationId: string) {
    this.Getquestion(presentationId, () => {
      this.GetPresentationId(presentationId, () => {
        this.customerPlan = this._customerPlanService.getCustomerPlan();
        this.GetParticipationDetails(presentationId, () => {
          this.GetQuizDetails(presentationId, () => {
            this.isLoading = false; 
          });
        });
      });
    });
  }
  logout() {
    this._accountservice.logout();
  }
  // GetAllPresentation() {
  //   this._presentationservice.GetAllPresentation().subscribe(
  //     (response: any[]) => {
  //       this.userPresentation = response.reduce((allSlides, presentation) => allSlides.concat(presentation.slide), []);

      
  //     },
  //     (error: any) => {
  //       console.log(error);
  //     }
  //   );
    
  // }

  Getquestion(presentationId,callback: () => void) {
    this._presentationservice.Getquestion(presentationId).subscribe(
      (responses: any[]) => {
        // Check if the response is an array
        if (Array.isArray(responses)) {
          // Initialize arrays before the loop
          this.question = [];
          this.questions = [];
          this.Like = [];
          this.Answer = [];
          this.question1 = [];
          this.recentQuest =[];
          this.questions1 = [];
          this.Like1= [];
          this.Answer1 = [];
          this.questImageUrl = [];
          this.questionSort = responses;
          responses.forEach((apiResponse, i) => {
            if (apiResponse) {
              this.questionvalue = apiResponse;
              
              this.question.unshift(apiResponse.questionAsked);
              this.questions.unshift(apiResponse.questionTexts);
              this.Like.unshift(apiResponse.likesCounts);
              this.Answer.unshift(apiResponse.isAnswered);
              this.question1[i] = apiResponse.questionAsked;
              this.questions1[i] = apiResponse.questionTexts;
              this.Like1[i] = apiResponse.likesCounts;
              this.Answer1[i] = apiResponse.isAnswered;
              this.recentQuest[i] = apiResponse.createdOn
              this.sortQuestions(this.selectedOrder);
              this.questioncount = this.questions.length;
              this.questImageUrl.unshift(apiResponse.imageUrl);
            } else {
              console.log('Null response object at index', i);
            }
          });
        } else {
          console.log('Invalid response format');
        }
        callback();
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  
  


  sortQuestions(order: string): void {
    if (order === 'by_upvotes') {
      const likesOrder = this.Like.map((_, index) => index);
      likesOrder.sort((a, b) => this.Like[b] - this.Like[a]);
  
      this.questions = likesOrder.map(index => this.questions[index]);
      this.question = likesOrder.map(index => this.question[index]);
      this.Like = likesOrder.map(index => this.Like[index]);
      this.Answer = likesOrder.map(index => this.Answer[index]);
      this.questImageUrl = likesOrder.map(index => this.questImageUrl[index]);
    } else if (order === 'by_recent') {
      // this.questions =this.questions1;
      // this.question = this.question1;
      // this.Like =  this.Like1;
      // this.Answer = this.Answer1;
      // this.recentQuest = this.recentQuest;
      const validQuestions = this.questionSort.filter(q => q.createdOn);
    
      this.questionSort = validQuestions.sort((a, b) => {
        return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
      });  
      this.question = this.questionSort.map(q => q.questionAsked);
      this.questions = this.questionSort.map(q => q.questionTexts);
      this.Like = this.questionSort.map(q => q.likesCounts);
      this.Answer = this.questionSort.map(q => q.isAnswered);
      this.questImageUrl = this.questionSort.map(q => q.imageUrl);
    } 
  }
  


  GetPresentationId(presentationId,callback: () => void) {
    
    this.workSpaceService.storeActiveSlideDetails().then(() => {
      this.userSlide = this.workSpaceService.slideListArray || [];
      this.presentationname = this.workSpaceService.presentationName;
      this.participationquestion = this.userSlide.map((slide: any) => slide.questions);
      this.screenshotimageurl = this.userSlide.map((slide: any) => slide.resultscreenshot);
      this.participantCountValue = this.workSpaceService.slideParticipantCount;
      callback();
    });
  }    

  
  overallPercentage: number;

  GetParticipationDetails(PresentationId, callback: () => void) {
    this._presentationservice.GetParticipationDetails(PresentationId).subscribe(
      (response: any) => {
        if (response && response.length > 0) { 
          //this.participantDetails = response;
          this.participantDetails = response.filter(item => 
            !((item.getQuestion === "Quiz leaderboard")||
            (item.questionType === "Select Answer") || (item.questionType === "Lineup") ||
            (item.questionType === "Type Answer") || (item.questionType === "Guess the Number Quiz") || (item.questionType === "Multimedia"))
          );
          const allowedTypes = [
            "Quiz leaderboard",
            "Select Answer",
            "Lineup",
            "Type Answer",
            "Guess the Number Quiz"
          ];
          const allMatchExclusions = this.participantDetails.every(item => 
            allowedTypes.includes(item.getQuestion) || allowedTypes.includes(item.questionType)
          );
        
          if (allMatchExclusions) {
            this.activeTab = this.viewResult.QuizContents;
          }
           else {
            this.activeTab = this.viewResult.ParticipationContents;
          }
          this.totalResponseCount = this.calculateTotalResponseCount();
         // this.participantCountValue = response[0].participantCount;
          if((response.getQuestion=="Select Answer" && response.participantCount==0) ||
          (response.getQuestion=="Type Answer" && response.participantCount==0)){
            this.quizParticipant=false;
          }else{
            this.quizParticipant=true;
          }
          this.overallPercentage = this.calculateOverallPercentage();
        } else {
          console.log("Response is empty or null.");
        }
        callback();
      },
      (error: any) => {
        console.log(error?.error);
      }
    );
  }
  calculateTotalResponseCount(): number {
    return this.participantDetails.reduce((total, item) => total + item.responseCount, 0);
  }
  shouldShowMainDiv(): boolean {
    // Implement your condition logic here based on the API response
    // For example, you might want to check if there are any items with participantCount or responseCount greater than 0

    return this.participantDetails.some(item => item.participantCount > 0 || item.responseCount > 0);
}

GetQuizDetails(PresentationId: string, callback: () => void) {
  this._presentationservice.GetQuizDetails(PresentationId).subscribe(
    (response: any) => {
      if (response && response.length > 0) {   
        // Assign the response to quizDetails
        this.quizDetails = response;
        this.quizLeaderboard = [];
        // Access leaderboard values from quizDetails
        const leaderboardValues = this.quizDetails[0].leaderboardValues;
         this.totalUsers = this.quizDetails[0].totalUsers;
          const usersWithZeroPoints = leaderboardValues.filter(item => item.score !== 0).length;

         // Calculate percentage
         this.percentageUsersWithZeroPoints = (usersWithZeroPoints / this.totalUsers) * 100;
        // Process leaderboard values
        leaderboardValues.forEach(item => {
          // You can perform any additional operations or logic here
        });
        this.quizLeaderboard = this.quizDetails[0].leaderboardValues.sort((a,b)=>b.score - a.score);
      }
      callback();
    },
    (error: any) => {
      console.log(error?.error);
    }
  );
}
findPosition(item: any): number {
  const sortedResponses = this.quizDetails[0]?.leaderboardValues.slice().sort((a, b) => b.points - a.points);
  return sortedResponses.findIndex(responseItem => responseItem.UserName === item.UserName);
}
findHighestPoints(leaderboardValues: any[]): number {
  const highestPoints = Math.max(...leaderboardValues.map(item => item.points), 0);
  return highestPoints;
}
findSecondHighestPoints(leaderboardValues: any[]): number {
  const uniquePoints = [...new Set(leaderboardValues.map(item => item.points))]; // Get unique points
  const secondHighestPoints = Math.max(...uniquePoints.slice(1), 0); // Get second highest points
  return secondHighestPoints;
}

findThirdHighestPoints(leaderboardValues: any[]): number {
  const uniquePoints = [...new Set(leaderboardValues.map(item => item.points))]; // Get unique points
  const thirdHighestPoints = Math.max(...uniquePoints.slice(2), 0); // Get third highest points
  return thirdHighestPoints;
}

calculateOverallPercentage(): number {
  if (this.participantDetails && this.participantDetails.length > 0) {
    let totalPercentage = 0;
    let validPercentageCount = 0;

    for (let i = 0; i < this.participantDetails.length; i++) {
      const participant = this.participantDetails[i];

      if (participant.getQuestion !== "Leaderboard") {
        const participantCount = participant.participantCount || 0;
        const responseCount = participant.responseCount;
        if (participantCount > 0 && responseCount > 0) {
          const percentage = (responseCount / participantCount) * 100;
          totalPercentage += percentage;
          validPercentageCount++; 
        }
      }
    }
    if (validPercentageCount === 0) {
      return 0;
    }
    return totalPercentage / validPercentageCount;
  }
  return 0;
}




isDataValid(participant: any): boolean {
  return (
    participant &&
    Array.isArray(this.participantDetails) &&
    this.participantDetails.length > 0 &&
    (participant.participantCount !== 0 || participant.responseCount !== 0)
  );
}


RemoveTitleFromSVG(data: any): string {
  const imgURL = data;
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(imgURL, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  const titleElement = svgElement.querySelector('title');
  if (titleElement) {
    titleElement.remove();
  }
  const modifiedSVGString = new XMLSerializer().serializeToString(svgElement);
  return modifiedSVGString;
  
}
GetSVGtoIMG(data: any) {
  var modifiedSVG = this.RemoveTitleFromSVG(data);
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(modifiedSVG, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  svgElement.setAttribute('width', '20px');
  svgElement.setAttribute('height', '20px');
  const serializer = new XMLSerializer();
  const updatedSVG = serializer.serializeToString(svgElement);
  return this._sanitizer.bypassSecurityTrustHtml(updatedSVG);
}
 
ToPresent(id:string,slideid:string){

}
onCheckboxChange(event: any, item: any) {
  item.checked = event.target.checked;

  if (item.checked) {
    // Add the selected slide to the array
    this.selectedSlides.push(item);
  } else {
    // Remove the selected slide from the array
    const index = this.selectedSlides.indexOf(item);
    if (index !== -1) {
      this.selectedSlides.splice(index, 1);
    }
  }

  // Update the count of selected checkboxes
  this.selectedCount = this.selectedSlides.length;

  this.showSlideSelection = this.selectedCount > 0;
}

clearSelection() {
  // Clear the selected slides array
  this.selectedSlides = [];
  this.selectedCount = 0; // Reset the count
  this.showSlideSelection = false;

  // Uncheck all checkboxes
  this.userSlide.forEach((item: any) => {
    item.checked = false;
  });
}


getSelectedLabel() {
  if (this.selectedCount === 1) {
    return 'slide';
  } else {
    return 'slides';
  }
}
getDisplayedSlidesCount() {
  if (this.showAll) {
    return this.userSlide.length;
  } else {
    // Show the first 3 slides if not in 'Show All' mode
    return Math.min(this.userSlide.length, 3);
  }
}

isInteger(value: number): boolean {
  return Number.isInteger(value);
}
openImageInNewTab(imageUrl: string): void {
  window.open(imageUrl, '_blank');
}
openImageInHighNewTab(imageUrl: string): void {
 window.open(imageUrl, '_blank', 'width=3840,height=2160');
}
currentClickedItem: any;

showMenu: boolean = false;
view(event: MouseEvent, item) {
  event.stopPropagation();

  // Toggle the visibility of the context menu
  this.showMenu = !this.showMenu;

  if (this.showMenu) {
    // If the context menu is being opened, store the clicked item
    this.currentClickedItem = item;

    const contextMenu = document.getElementById('download-' + item);
    if (contextMenu) {
      const maxMenuWidth = 200;
      const maxMenuHeight = 200;
      const menuWidth = contextMenu.offsetWidth;
      const maxX = Math.min(window.innerWidth - maxMenuWidth, window.innerWidth);
      const menuX = event.clientX > maxX ? maxX : event.clientX;
      const maxY = Math.min(window.innerHeight - maxMenuHeight, window.innerHeight);
      const menuY = event.clientY > maxY ? maxY : event.clientY;

      contextMenu.style.display = 'block';
      // Adjust the position if needed
      // contextMenu.style.left = menuX + 'px';
      // contextMenu.style.top = menuY + 'px';
    }
  } else {
    // If the context menu is being closed, reset the clicked item
    this.currentClickedItem = null;
    this.closeviewMenu();
  }
}

closeviewMenu() {
  this.showMenu = false;

  const viewMenus = document.getElementsByClassName('view-menu') as HTMLCollectionOf<HTMLElement>;
  for (let i = 0; i < viewMenus.length; i++) {
    const viewMenu = viewMenus[i];
    viewMenu.style.display = 'none';
  }
}
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  this.closeviewMenu();
}
@HostListener('window:scroll', ['$event'])
onScroll(event: Event) {
  this.closeviewMenu();
}
truncateText(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  } else {
    return text.substring(0, limit) + '.....';
  }
}
// In your component class
getVisibleRows(): any[] {
  return this.showAllRows ? this.participantDetails : this.participantDetails.slice(0, this.visibleRowCount);
}

toggleShowMore(): void {
  this.showAllRows = !this.showAllRows;
}

shouldShowButton(): boolean {
  return this.participantDetails.length > this.visibleRowCount;
}
ShowButton(): boolean {
  return this.questions.length >= 4;
}
exportExcel(presentationId: any): void {
  if(this.customerPlan?.excel_export){
    if(this.participantCountValue == 0){
      return;
    }
    if(this.isLoadingExcelButton == false){
      return;
    }
    this.isLoadingExcelButton = false;
    const payload = { Id: presentationId };
    const button = document.getElementById('exportExcelbtn') as HTMLButtonElement;
    button.disabled = true;
    this._presentationservice.exportExcel(payload).subscribe(
      (response: any) => {
        const decodedData = atob(response[0].base64);
        const byteNumbers = new Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
          byteNumbers[i] = decodedData.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${this.presentationname }`;
  
        anchor.click();
        button.disabled = false;
        URL.revokeObjectURL(url);
        this.isLoadingExcelButton = true;
      },
      (error: any) => {
        console.log(error);
        button.disabled = false;
        this.isLoadingExcelButton = true;
      }
    );
  }else{
    this._toastr.info("Upgrade your plan to export results.", "", {
      timeOut: 3000,
    });
  }
  
}

toggleShowQuestionMore() {
  this.showAllRows = !this.showAllRows;
}
toggleUnanswered() {
  if(this.showUnanswered){
    this.allAnswersEmpty = this.questionSort.every(ans => ans.isAnswered === true);
    this.showAllRows = !this.showAllRows;
  }
  
}
shouldDisplayQuestion(index: number): boolean {
  return (!this.showUnanswered || !this.Answer[index]) && (this.showAllRows || index < 3);
}
getunansweredQuestions() {
  return this.questions
    .map((q, index) => ({
      index,
      text: q
    }))
    .filter(q => !this.Answer[q.index]); // Filter only unanswered questions
}


exportPDF(presentationId: any): void {
  const payload = { Id: presentationId };
  const button = document.getElementById('exportPDFbtn') as HTMLButtonElement;
  button.disabled = true;
  const presentationName = this.presentationname; // Store presentation name
  this._presentationservice.exportPDF(payload).subscribe(
    (response: any) => {
      if(response!=null){
      const decodedData = atob(response[0].base64);
      const byteNumbers = new Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        byteNumbers[i] = decodedData.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Open the PDF in a new window/tab
      const newTab = window.open(url, '_blank');
      if (newTab !== null) {
        // Listen for the load event on the new tab's window object
        newTab.addEventListener('load', () => {
          // Set the title of the new tab to your presentation name
          newTab.document.title = `${presentationName}.pdf`;
        });
      } else {
        alert('Popup blocked! Please allow popups for this site.');
      }

      button.disabled = false;
    //  URL.revokeObjectURL(url);
    }
    else{
      console.log("No questions found for the provided presentationId.");
    }
  },
    (error: any) => {
      console.error(error);
      button.disabled = false;
    }
  );
}
downloadSS(){
  const selectedItems = this.userSlide.filter(item => item.checked);
 const screenshotData = selectedItems.map(item => ({
  resultscreenshot: item.resultscreenshot,
  presentationName: this.presentationname 
}));
  
  this._presentationservice.sendScreenshot(screenshotData).subscribe(
    (response: any) => {
        if (response) {
          const base64String = response;
          const decodedData = atob(base64String);
          const byteNumbers = new Array(decodedData.length);
          for (let i = 0; i < decodedData.length; i++) {
              byteNumbers[i] = decodedData.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const presentationName = this.presentationname.replace(/\s+/g, ''); 
          const blobUrl = URL.createObjectURL(blob);
          const newTab = window.open(blobUrl, '_blank');
          if (newTab === null) {
              alert('Popup blocked! Please allow popups for this site.');
          }
      } else {
          console.error('Invalid response received:', response);
         
      }
    },
    (error: any) => {
      console.error('Error sending screenshot:', error);
    }
  );
  
}
ngAfterViewInit(){
}
setActiveTab(tab: string) {
  this.activeTab = tab;
  // if((this.activeTab != this.viewResult.QuizContents)){
  //   this.showQuizNotification = false;
  // }else{
  //   this.showQuizNotification = true;
  // }
}
setActiveSection(section:string){
  this.activeSection = section;
  if(this.activeSection == ViewResult.Response){
    //this._router.navigate(['/presentation/'+this.PresentationId + '/view-results-response']);
  // const payload = {presentationId:this.PresentationId};
  // this._presentationservice.ResponseSummary(this.PresentationId).subscribe(
  //   (response: any) => {
  //       this.responseSummary = response;
  //       // for(let i=0;i<=response.length;i++){
  //       //   this.choices = response[i].choices;
  //       //   this.typeData = response[i].typeData;
  //       // }
       
  //       // this.choices = response.choices;
  //       // this.optionsResponseCount = response.optionsResponseCount;
  //   });
  }
}
images = [
  { url: 'assets/images/first-medal-result.svg' },
  { url: 'assets/images/second-medal-result.svg' },
  { url: 'assets/images/third-medal-result.svg' }
];
// loadSvgImages() {
//   const svgFiles = [
//     'assets/Images/first-rank.png',
//     'assets/Icon/second-rank.svg',
//     'assets/Icon/third-rank.svg'
//   ];

//   const requests = svgFiles.map(file => this.http.get(file, { responseType: 'text' }).toPromise());
  
//   Promise.all(requests)
//     .then(images => {
//       this.svgImages = images.map(imgURL => this.parseSvg(imgURL));
//       console.log('Loaded SVG Images:', this.svgImages);

//     })
//     .catch(err => {
//       console.error('Error loading SVG files:', err);
//     });
// }

// parseSvg(imgURL: string, height: string = '100', width: string = '100'): string {
//   const parser = new DOMParser();
//   const svgDoc = parser.parseFromString(imgURL, 'image/svg+xml');
//   const svgElement = svgDoc.documentElement;

//   // Set the desired height and width
//   svgElement.setAttribute('height', height);
//   svgElement.setAttribute('width', width);

//   // Optional: Add any additional classes or styles
//   svgElement.setAttribute('class', 'custom-svg-class');

//   return svgElement.outerHTML; // Convert back to string for binding
// }

}
