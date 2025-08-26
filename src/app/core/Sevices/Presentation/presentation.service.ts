import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as signalR from "@microsoft/signalr";
import { settingVariables } from 'src/app/utility/SettingVariables';
import { AccountService } from '../account.service';
@Injectable({
  providedIn: 'root'
})
export class PresentationService {
 
  categoryList: any[];
  GetAllSlides: any;
  public slidesType = new BehaviorSubject<any[]>(null);
  public tabType = "Slide Type";
  newmeetingUUID: string = '';
  audimeetingUUID: string = '';
  isOnPageLoad: boolean = false;
  presentationId: string = '';
  slideId: string = '';
  url: string;
  selectedRouterLinkSubject = new BehaviorSubject<string>('');
  private searchTermSubject = new BehaviorSubject<any>(null);
  searchTerm$ = this.searchTermSubject.asObservable();
  valuesArray: any[]=[];
  private presentationSource = new BehaviorSubject<any[]>([]);
  presentation$ = this.presentationSource.asObservable();
  constructor(private _fb: FormBuilder, private _http: HttpClient, private _router: Router,
    private _accountService: AccountService,
    private componentFactoryResolver: ComponentFactoryResolver) {
    this.RenderSlideData();
  }
  RenderSlideData() {
    var slideDataString = localStorage.getItem('slideType');
    if (slideDataString) {
      const SLIDEDATA = JSON.parse(slideDataString);
      this.slidesType.next(SLIDEDATA);
    }
  }
  setPresentation(data: any[]) {
    this.presentationSource.next(data);
  }

  getPresentationValue() {
    return this.presentationSource.value;
  }
  // getslideBase64String(url: any) {
  //   return this._http.get(environment.MyApi + 'S3/download?url=' + url);
  // }

  getCategory(): Observable<any> {
    return this._http.get<any>(environment.MyApi + 'get-all-categories');
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

  getslideBase64String(data: any){
      return this._http.get(environment.MyApi +`get-image-url?presentationId=${data.presentationId}&slideId=${data.slideId}&imageType=${data.imageType}&themeId=${data.themeId}&isTemplate=${data.isTemplate}`,data);
  }
  CreatePresentation(presentationData: any) {
    return this._http.post(environment.MyApi + 'presentation', presentationData);
  }
  GetPresentationId(PresentationId: any) {
    return this._http.get(environment.MyApi + 'get-presentation?slideId=' + PresentationId);
  }
  
  GetAllPresentation() {
    return this._http.get(environment.MyApi + 'get-all-presentations');
  }
  GetSlideTypes() {
    return this._http.get(environment.MyApi + 'slidetype');
  }
  CreateSlide(slideData: any) {
    return this._http.post(environment.MyApi + 'slide', slideData);
  }
  UpdateToPresent(presentationId: any, slideId: any) {
    return this._http.get(environment.MyApi + 'present-slide?presentationId=' + presentationId + "&slideId=" + slideId);
  }
  StopPresent(data: any) {
    return this._http.put(environment.MyApi + 'present-slide', data);
  }
  GetPresentationSingalRResult(presentId: any, slideId: any) {
    return this._http.get(environment.MyApi + 'slide?presentationId=' + presentId + '&slideId=' + slideId);
  }
  // GetPrePresentationSingalRResult(presentId: any, slideId: any) {
  //   return this._http.get(environment.MyApi + 'dist/slide?presentationId=' + presentId + '&slideId=' + slideId);
  // }
  AppendSlide(data: any) {
    return this._http.put(environment.MyApi + 'appendslide', data);
  }
  
  ActiveSlide(data: any) {
    return this._http.post(environment.MyApi + 'activeslide', data);
  }
  deleteSlide(slideData: any){
    return this._http.post(environment.MyApi +'slide/delete', slideData)
  }

  
  deleteLeaderBoardSlide(slideData: any){
    return this._http.post(environment.MyApi +'leader-board-delete', slideData)
  }
  swapSlide(data: any){
    return this._http.put(environment.MyApi +'slides/swap', data)
  }
  GetPresentationSlide(encryptedSlideId: string) {
    return this._http.get(environment.AudienceApi + 'slide?encryptedSlideId=' + encryptedSlideId);
  }
  getPresentationDetailsByCode(data: any) {
    return this._http.get(environment.AudienceApi + 'slide?encryptedSlideId=' + data);
  }
  saveQuestions(payload: any) {
    return this._http.put(environment.MyApi + 'questions', payload);
  }
  showQuestion(payload: any) {
    return this._http.put(environment.MyApi + 'showQuestion', payload);
  }
  SlideShowResultsPercentage(data: any) {
    return this._http.post(environment.MyApi + 'slide/showresultspercentage', data);
  }
  showBlankScreen(data: any) {
    return this._http.post(environment.MyApi + 'blankscreen', data);
  }
  moderateAnswersUpdate(payload: any) {
    return this._http.put(environment.MyApi + 'moderateanswers', payload);
  }
  deleteQA(data: any){
    return this._http.delete(environment.MyApi + 'deleteQA', { body: data });
  }
  updateCountDown(payload: any) {
    return this._http.put(environment.MyApi + 'slides/starttimer', payload);
  }
  resetAllAnswers(payload: any) {
    return this._http.put(environment.MyApi + 'reset-moderateanswers', payload);
  }
  showCorrectAnswer(payload: any) {
    return this._http.put(environment.MyApi + 'showcorrectanswer', payload);
  }
  HideShowResults(data: any) {
    return this._http.post(environment.MyApi + 'slide/showresults', data);
  }
  HideShowResponse(data: any) {
    return this._http.post(environment.MyApi + 'slide-allowresponse', data);
  }
  startEndDrumRoll(data: any) {
    return this._http.post(environment.MyApi + 'drum-roll', data);
  }
  bulletButtonOption(data: any) {
    return this._http.post(environment.MyApi + 'bullet-option-count', data);
  }
  updateIsPresent(data: any) {
    return this._http.put(environment.MyApi + 'reset-timer', data);
  }
  startSpinTheWheel(data: any) {
    return this._http.post(environment.MyApi + 'spin-the-wheel', data);
  }
  breatherExercise(data: any) {
    return this._http.post(environment.MyApi + 'breather-slide', data);
  }
  AllowAudienceComment(data: any) {
    return this._http.post(environment.MyApi + 'slide/allowaudiencecomments', data);
  }
  GetQrCodeById(PresentationId: any) {
    return this._http.get(environment.MyApi + 'slideqrcode?presentationId=' + PresentationId);
  }
  UpdatePresentationPhase(data: any) {
    return this._http.post(environment.MyApi + 'presentationphase', data);
  }
  UpdateMutipletimeAnswer(data: any) {
    return this._http.post(environment.MyApi + 'presentationanswerphase', data);
  }
  HideResults(data: any) {
    return this._http.post(environment.MyApi + 'presentationhideresult', data);
  }
  QuestionUpdate(data: any) {
    return this._http.post(environment.MyApi + 'slideaudiencequestion', data);
  }
  AllowOthersQuestionsViewUpdates(data: any) {
    return this._http.post(environment.MyApi + 'allowseeaudiencequestions', data);
  }
  AudienceGiveComment(data: any) {
    return this._http.post(environment.MyApi + 'presentationaudiencecomment', data);
  }
 
  RemoveSlideImage(data: any) {
    return this._http.post(environment.MyApi + 'slides/removeslideimage', data);
  }
  RemoveSlideThemesImage(data: any) {
    return this._http.post(environment.MyApi + 'slides/removethemeimage', data);
  }
  GetChartType() {
    return this._http.get(environment.MyApi + 'charttype');
  }
  UpdateChartType(data: any) {
    return this._http.post(environment.MyApi + 'slide/chartupdate', data);
  }
  StartTimer(data: any) {
    return this._http.post(environment.MyApi + 'slides/starttimer', data);
  }
  StartQuizz(data: any) {
    return this._http.post(environment.MyApi + 'slide/selectanswers/start', data);
  }
  timesUP(data: any) {
    return this._http.post(environment.MyApi + 'slide/selectanswers/timesup', data);
  }
  timeStart(data: any) {
    return this._http.post(environment.MyApi + 'slide/selectanswers/timestart', data);
  }
  showAccessCode(data: any) {
    return this._http.post(environment.MyApi + 'slide/instructionbar', data);
  }
  nextOption(data: any) {
    return this._http.post(environment.MyApi + 'slide/options/items', data);
  }
  TypeAnswersResultCorrectorWrong(data: any) {
    return this._http.post(environment.MyApi + 'slide/typeanswers-result-correctorwrong', data);
  }
  TypeAnswersResultHideandShow(data: any) {
    return this._http.post(environment.MyApi + 'slide/typeanswers-result-hideandshow', data);
  }
  ImportFile(data: any) {
    return this._http.post(environment.ImportAPI + 'importfile', data);
  }
  convertPPTtoPNG(data: any){
    return this._http.post(environment.ImportAPI + 'convertPPTtoPNG', data );
  }
  //#region Custom Grid
  getCustomGrid() {
    return this._http.get(environment.MyApi + 'GetGridCustomTemplate');
  }
  setCustomGrid(data: any) {
    return this._http.post(environment.MyApi + 'GridCustomTemplate', data);
  }
  editCustomGrid(data: any) {
    return this._http.put(environment.MyApi + 'UpdateGridCustomTemplate', data);
  }
  deleteCustomGrid(data: any) {
    return this._http.post(environment.MyApi + 'DeleteGridCustomTemplate', data)
  }
  showCorrectAnswers(payload: any) {
    return this._http.post(environment.MyApi + 'showcorrectanswers', payload);
  }
  moderateResponse(payload: any) {
    return this._http.post(environment.MyApi + 'moderate-response', payload);
  }
  resetModerateResponse(payload: any) {
    return this._http.post(environment.MyApi + 'reset-moderate-response', payload);
  }
  //#endregion Custom Grid
  updateComment(data: any) {
    return this._http.put(environment.MyApi + 'slides/comment', data);
  }
  setPresentationId(presentationId: string): void {
    this.presentationId = presentationId;
  }
  setSlideId(slideId: string) {
    this.slideId = slideId;
  }
  setMeetingUUID(uuid: string): void {
    this.newmeetingUUID = uuid;
  }
  getMeetingUUID(): string {
    return this.newmeetingUUID;
  }
  InsertMeeting(presentationId: string, slideId: string, meetingUUID: string): Observable<any> {
    const data = {

      PresentationId: presentationId,
      MeetingUUID: meetingUUID,
      SlideId: slideId
    };
    return this._http.post(environment.MyApi + 'insertmeeting', data);
  }
  updateMeeting(presentationId: string, meetingUUID: string, code: string, url: string) {
    const data = {
      presentationId: presentationId,
      meetingUUID: meetingUUID,
      code: code,
      url: url
    };
    return this._http.put(environment.MyApi + 'updatemeeting', data);
  }
  getPresDetails(data: any) {
    data = {

      PresentationId: data.PresentationId,
      MeetingUUID: data.MeetingUUID,
      SlideId: data.SlideId
    };
    return this._http.post(environment.MyApi + 'checkpresdetails', data);
  }
  setZoomClientData(profileId: string, profileRole: string, rewardId: string, planId: string, planName: string, profileEmail: string, meetingUUID: string) {
    const data = {
      Profile_Id: profileId,
      Profile_Role: profileRole,
      Profile_Email: profileEmail,
      Reward_Id: rewardId,
      Plan_Id: planId,
      Plan_Name: planName,
      meetingUUID: meetingUUID
    };
    return this._http.post(environment.MyApi + 'set-zoomclient', data);
  }
  getMeetingDetails(data: string) {
    const token = this._accountService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this._http.get(environment.MyApi + 'get-meeting?meetingId=' + data, { headers });
  }
  getZoomToken(data: any): Observable<string> {
    return this._http.get(environment.MyApi + 'set-token?meetingId=' + data, { responseType: 'text' });
  }
  CreateNewGSlide(data: any): Observable<string> {
    return this._http.post(environment.MyApi + 'create-new-gslide', data, { responseType: 'text' });
  }
  setRole(role: string) {
    localStorage.setItem('role', role);
  }
  getRole() {
    return localStorage.getItem('role');
  }
  setAudienceUrl(url: string) {
    this.url = url;
  }
  getAudienceUrl() {
    return this.url;
  }
  setPresentationUrl(url: string) {
    localStorage.setItem('url', url);
  }
  getPresentationUrl(): string {

    return localStorage.getItem('url');
  }
  currentPresentationId() {
    return localStorage.getItem('presentationId');
  }
  SelectAnswerOptionUpdate(data:any){
    return this._http.put(environment.MyApi + 'slide/selectAnswer-result-update', data);
  }
  isFasterResultsUpdate(data:any){
    return this._http.put(environment.MyApi + 'slide/quiz-result-update', data);
  }
  RecentPresentation(){
    return this._http.get(environment.MyApi + 'recent-presentations');
  }
  ProfanityFilterUpdate(languageDTO:any){
    return this._http.post(environment.MyApi + 'add-profanity-language', languageDTO);
  }
  ProfanityFilterBulkUpdate(selectAllProfanityLanguageDTO:any){
    return this._http.put(environment.MyApi + 'update-all-profanity-language', selectAllProfanityLanguageDTO);
  }
  GetPresentationProfanityFilter(presentationId:any){
    return this._http.get(environment.MyApi + 'presentation-profanity-languages?presentationId='+ presentationId);
  }
  hideAndShowQR(payload:any){
    return this._http.put(environment.MyApi + 'hideandshowQRcode', payload);
  }

  GetParticipationDetails(presentationId:string){
    return this._http.get(environment.MyApi + 'participantDetails?presentationId=' + presentationId);
  }
  Getquestion(PresentationId: any) {
    return this._http.get(environment.MyApi + 'get-question?presentationId=' + PresentationId);
  }
  GetQuizDetails(presentationId:string){
    return this._http.get(environment.MyApi + 'quizDetails?presentationId=' + presentationId);
  }

  CreateFolder(data: any) : Observable<string>{
    return this._http.post(environment.MyApi + 'folder', data,{ responseType: 'text' });
  }
  Folderlist() {
    return this._http.get(environment.MyApi + 'folderlist');
  }
  RestorePresentationlist(){
    return this._http.get(environment.MyApi+'getRestorePresentation');
  }
  FolderRename(id: string, folderName: string): Observable<any> {
    return this._http.put(environment.MyApi + `folderupdate?id=${id}&folderName=${folderName}`, {});
  }
  PresentationRename(id: string, folderName: string): Observable<any> {
    return this._http.put(environment.MyApi + `presentationrename?id=${id}&folderName=${folderName}`, {});
  }
  FolderDelete(id:string):Observable<any>{
    return this._http.delete(environment.MyApi+`folderdelete?id=${id}`)
  }
  PresentationDelete(id:string):Observable<any>{
    return this._http.delete(environment.MyApi+`presentationdelete?id=${id}`)
  }
  folderPresentationDelete(id:string,folderid:any):Observable<any>{
    return this._http.delete(environment.MyApi+`folderpresentationdelete?id=${id}&folderid=${folderid}`)
  }
  RestorePresentation(id: string): Observable<any> {
    return this._http.put(environment.MyApi + `restorepresentation?id=${id}`,{});
  }
  PresentationMovedToFolder(folderId: string,PresentationId: string): Observable<any> {
      const data = {
        folderId: folderId,
        presentationId:PresentationId
      };
      return this._http.put(environment.MyApi + `presentationmove?id=${folderId}&presentationId=${PresentationId}`,data);
    }
    FolderToFolder(folderId:string):Observable<any>{
      return this._http.get(environment.MyApi + `foldermovepresentation?id=${folderId}`);
    }
    FolderMoveFolder(folderId :string):Observable<any>{
      return this._http.get(environment.MyApi+'foldermovefolder')
    }
    FolderMoveToFolder(currentFolderIds:string,folderId: any, folderId2: any): Observable<any> {
    var currentFolderId = currentFolderIds || ""; 
    const data = {
      currentFolderId : currentFolderId,
      selectedSourceFolder: folderId,
      selectedDestinationFolder: folderId2
    };
    return this._http.put(environment.MyApi + `foldermovetofolder?currentFolderId=${currentFolderId}&selectedDestinationFolder=${folderId2}&selectedSourceFolder=${folderId}`, data);
  }
  getSubFolderDetails(folderId: any): Observable<any> {
    return this._http.get(environment.MyApi + 'GetSubFoldersDetails', { params: { id: folderId } });
  }

  setErrorMargin(data:any){
    return this._http.post(environment.MyApi + 'update-errormargin',data);
  }
  exportExcel(data: any) {
    return this._http.post(environment.MyApi + 'export-result-excel', data);
  }
  exportPDF(data: any) {
    return this._http.post(environment.MyApi + 'export-result-pdf', data);
  }
  renamePresentation(presentationId: string, presentationName: string): Observable<any> {
    const data = {
      presentationId: presentationId,
      presentationName: presentationName
    };

    return this._http.post(environment.MyApi + 'update-presentationName', data);
  }
  // duplicatePresentation(presentationId: string): Observable<any> {
  //   return this._http.put(environment.MyApi + `duplicate-presentation?presentationId=${presentationId}`, {});
  // }
  duplicatePresentation(data: any) {
    return this._http.post(environment.MyApi + 'duplicate-presentation',data);
  }
  subfolderduplicatePresentation(folderId: string,presentationId:string): Observable<any> {
    return this._http.put(environment.MyApi + `duplicate-folderpresentation?folderid=${folderId}&presentationId=${presentationId}`, {});
  }

  addTemplate(form, presentationId) {
    const payload = {
      Type: form.Type,
      CategoryId: Number(form?.CategoryName?.id),
      presentationId: presentationId,
      Description: form.Description,
      slideId :form.SlideId
    }
    return this._http.post(environment.MyApi + `convert-template`, payload);
  }
  GetTemplates(){
    return this._http.get(environment.MyApi + 'popular-template');
  }
  GetCharts(name: string, pageNumber: number, numberofRecords: number) {
    return this._http.get(`${environment.MyApi}popular-feature-template?name=${name}&pageNumber=${pageNumber}&numberofRecords=${numberofRecords}`);
}
  getPublishedTemplates(){
    return this._http.get(environment.MyApi +'published-templates?pageNumber=1&pageSize=100')
  }
  updatePublishTemplate(id: string) {
    return this._http.put(environment.MyApi + `publishing-templates?id=${id}`, {});
  }
  Updatescreenshot(slideData: any) {
    return this._http.put(environment.MyApi + 'slide/updatescreenshot', slideData);
  }
  setData(data: any) {
    this.searchTermSubject.next(data);
  }
  getData() {
    return this.searchTermSubject.value;
  }
  UseTemplate(id: string): Observable<any> {
    const payload = { Id: id };
    return this._http.post(environment.MyApi + `convert-presentation?templateId=${id}`, null);
  }
  createPopularFeature(slideTypeName: string,slideId:string,index:number): Observable<any> {
    return this._http.post(environment.MyApi + `create-popular-feature?popularSlideType=${slideTypeName}&slideTypeId=${slideId}&index=${index}`, null);
  }
  GetPopularSlideTypes() {
    return this._http.get(environment.MyApi + 'popular-slidetype');
  }
  GetAllPresentationWithDate() {
    return this._http.get(environment.MyApi + 'get-all-presentations');
  }
  GetAllPresentationLazyload(pageNumber: number, pageSize: number,searchTerm:string): Observable<any[]> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm.toString());

    // Use <any[]> to explicitly tell HttpClient that the response is an array of any
    return this._http.get<any[]>(environment.MyApi + 'get-all-presentations', { params });
}

  ChangeIsShowOption(data:any) {
    return this._http.put(environment.MyApi + 'update-isshowoption',data);
  }
  ActiveSlidewithscreenshot(data: any) {
    return this._http.post(environment.MyApi + 'activeslidewithscreenshot', data);
  }
    sendScreenshot(screenshotData: { resultscreenshot: string, presentationName: string }[]): Observable<any> {
    // Extract presentationName from the first object in screenshotData
    const presentationName = screenshotData.length > 0 ? screenshotData[0].presentationName : '';
  
    // Extract ScreenshotUrls from screenshotData
    const screenshotUrls = screenshotData.map(data => data.resultscreenshot);
  
    const payload = { 
      ScreenshotUrls: screenshotUrls,
      PresentationName: presentationName
    };
  
    return this._http.post(environment.MyApi + 'screenshot-pdf', payload, { responseType: 'text' });
  }
  Movetoteamspace(id: string,presentationId:string): Observable<any> {
    return this._http.post(environment.MyApi + `movetoteam?id=${id}&presentationId=${presentationId}`,null);
}
sendInvitations(data: any) {
  return this._http.post(environment.MyApi + 'invitetoedit', data);
}
getInvitationsDetails(presentationId: any){
  return this._http.get(environment.MyApi + 'getinvitedetails?presentationId='+ presentationId);
}
updateinvitedetails(data: any){
  return this._http.put(environment.MyApi + 'updateinvitedetails',data);
}
removeinvitedetails(data:any){
  return this._http.delete(environment.MyApi + 'removeinvitedetails', { body: data });
}
private slideStatus = new BehaviorSubject<any>(null);
slideData$ = this.slideStatus.asObservable();
updateSlideStatus(data:any): void {
  this.slideStatus.next(data);
}

//?  NewWorkSpaceAPI

  // ! Change Parameter name
  // ! API call Create
  getSlideDetailList(presentationId: any) {
    return this._http.get(environment.MyApi + 'get-presentation?slideId=' + presentationId);
  }
  activeWorkSpaceSlide(slideData: any){
    return this._http.post(environment.MyApi +'activeworkspaceslides', slideData)
  }
  deleteWorkSpaceSlide(slideData: any){
    return this._http.post(environment.MyApi +'workSpace-slide/delete', slideData)
  }
  createNewSlide(data:any){
    return this._http.post(environment.MyApi + 'createnewslides',data);
  }
  createQuizNewSlide(data:any){
    return this._http.post(environment.MyApi + 'create-quiz-slide',data);
  }
  updateSlideType(data:any) {
    return this._http.post(environment.MyApi + 'update-slideTypes',data);
  }
  applyVisualization(data:any){
    return this._http.post(environment.MyApi + 'apply-visualizations',data);
  }
  updateAnsweredQuestion(data:any){
    return this._http.post(environment.MyApi + 'update-answered-question',data);
  }
  updatePinnedQuestion(data:any){
    return this._http.post(environment.MyApi + 'update-pinned-question',data);
  }
  responseAsPercentage(data:any){
    return this._http.post(environment.MyApi + 'response-percentages',data);
  }
  manageAccessCode(data:any){
    return this._http.post(environment.MyApi + 'manage-accessbar',data);
  }
  applyTextFontAndColor(data:any){
    return this._http.post(environment.MyApi + 'apply-fontandcolors',data);
  }
  slideResetDesign(data:any){
    return this._http.post(environment.MyApi + 'slideresetdesigns',data);
  }
  applyLayout(data:any){
    return this._http.post(environment.MyApi + 'apply-layouts',data);
  }
  applySlideSettings(data:any){
    return this._http.post(environment.MyApi + 'apply-slide-setting',data);
  }
  addOrUpdateQuestionDTO(data:any){
    return this._http.post(environment.MyApi + 'update-questions',data);
  }
  addorUpdateLongerDescription(data:any){
    return this._http.post(environment.MyApi + 'addorupdate-description',data);
  }
  showChooseCorrectAnswers(data:any){
    return this._http.post(environment.MyApi + 'show-choose-correctanswer',data);
  }
  contentImageUpdate(data:any){
    return this._http.post(environment.MyApi + 'content-image-update',data);
  }
  contentImageBackgroundImageOpacity(data:any){
    return this._http.post(environment.MyApi + 'content-image-opacity',data);
  }
  createWorkSpacePresentation(presentationData: any) {
    return this._http.post(environment.MyApi + 'createnewpresentation', presentationData);
  }
  refineUserPrompt(presentationData: any) {
    return this._http.post(environment.MyApi + 'ai/refine-prompt', presentationData);
  }
  createWorkSpacePresentationWithAI(presentationData: any) {
    return this._http.post(environment.MyApi + 'ai/generate-presentation', presentationData);
  }
  getWorkSpacePresentation() {
    return this._http.get(environment.MyApi + 'getallpresentation');
  }
  getPresentation(presentationId: any) {
    return this._http.get(environment.MyApi + 'getpresentation?presentationId='+presentationId);
  }
  updatePresentationNameInWorkSpace(data:any){
    return this._http.post(environment.MyApi + 'update-presentationName-inworkSpace',data);
  }
  updatePresentationSpeakerNote(data:any){
    return this._http.post(environment.MyApi + 'updatepresentationspeakernotes',data);
  }
  updatePresentationSettings(data:any){
    return this._http.post(environment.MyApi + 'updatepresentationsetting',data);
  }
  updatePresentationSettingsLanguagePerference(data:any){
    return this._http.post(environment.MyApi + 'updatepresentationlanguagepreferences',data);
  }
  updatePersentationReactions(data:any){
    return this._http.post(environment.MyApi + 'add-reaction-presentation',data);
  }
  addOptions(data:any){
    return this._http.post(environment.MyApi + 'add-option',data);
  }
  deleteOptions(data:any){
    return this._http.post(environment.MyApi + 'delete-option',data);
  }
  updateOptions(data:any){
    return this._http.post(environment.MyApi + 'update-option',data);
  }
  updateOptionsMarkAnswers(data:any){
    return this._http.post(environment.MyApi + 'update-options-markanswer',data);
  }
  selectMultipleOptions(data:any){
    return this._http.post(environment.MyApi + 'select-multiple-options',data);
  }
  presenterStarTimer(data:any){
    return this._http.post(environment.MyApi + 'presenter-starts-timer',data);
  }
  presenterEnableQuestion(data:any){
    return this._http.post(environment.MyApi + 'presenter-enable-questions',data);
  }
  OnlyQAEnableQuestion(data:any){
    return this._http.post(environment.MyApi + 'presenter-qaenable-questions',data);
  }
  presenterEnableComment(data:any){
    return this._http.post(environment.MyApi + 'presenter-enable-comments',data);
  }
  SlideEnableComment(data:any){
    return this._http.post(environment.MyApi + 'Slide-enable-comments',data);
  }
  presenterShowResponse(data:any){
    return this._http.post(environment.MyApi + 'presenter-show-responses',data);
  }
  PresentationLevelShowResponse(data:any){
    return this._http.post(environment.MyApi + 'presentation-level-show-responses',data);
  }
  presenterLockVoting(data:any){
    return this._http.post(environment.MyApi + 'presenter-lock-votings',data);
  }
  presenterShowQRCode(data:any){
    return this._http.post(environment.MyApi + 'presenter-show-qrcodes',data);
  }
  UpdateGuesstheNumber(data:any){
    return this._http.post(environment.MyApi + 'update-guess-the-number',data);
  }
  updatePresentMode(data:any){
    return this._http.post(environment.MyApi + 'update-present-mode',data);
  }
  scalesDimensionsAddorUpdate(data:any){
    return this._http.post(environment.MyApi + 'update-slide-dimensions',data);
  }
  ImportGoogleSlideAddOrUpdate(data:any){
    return this._http.post(environment.MyApi + 'update-slide-importgoogleslides',data);
  }
  scaleIsSkipStatementUpdate(data:any){
    return this._http.post(environment.MyApi + 'update-slide-skip-statement',data);
  }
  OpenEndedMultipleSubmission(data:any){
    return this._http.post(environment.MyApi + 'open-ended-multiple-submission',data);
  }
  UpdateTruthorLieMarkAnswers(data:any){
    return this._http.post(environment.MyApi + 'update-truth-or-lie-markanswer',data);
  }
  UpdateWordCloudParticipant(data:any){
    return this._http.post(environment.MyApi + 'wordcloud-responseper-participant',data);
  }
  updateAboutSlide(data:any){
    return this._http.post(environment.MyApi + 'update-about-slide',data);
  }
  storeScreenshotValue(value: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const index = this.valuesArray.findIndex((val: any) => val.presentationId === value.presentationId && val.slideId === value.slideId);
      if (index !== -1) {
        this.valuesArray[index] = value;
      } else {
        this.valuesArray.push(value);
      }
      resolve();
    });
  }
  RemoveContentImage(data: any) {
    return this._http.post(environment.MyApi + 'remove-content-image', data);
  }
  getStoredScreenshotValues(): any[] {
    const lastValueIndex = this.valuesArray.length - 1;
    const payload = this.valuesArray[lastValueIndex]; 
    this._http.put(environment.MyApi + 'slide/updatescreenshot', payload).subscribe(
      response => {
      },
      error => {
        console.error('API Error:', error);
      }
    );
  
    return payload;
  }
  clearScreenshotValues(): void {
    this.valuesArray = [];
  }
  GetCurrentFolder(folderId: string): Observable<string> {
    return this._http.get(environment.MyApi + 'get-current-folder?folderId='+folderId,{ responseType: 'text' } );
  }
 
  AllowOtherAudienceQuestionsToView(data:any){
    return this._http.post(environment.MyApi + 'allow-other-audience-questions-to-view',data);
  }
  // * Quiz Select Answers API Call
  updateSecondsToAnswers(data:any){
    return this._http.post(environment.MyApi + 'update-seconds-to-answers',data);
  }
  updateMorePointsForCorrectAnswers(data:any){
    return this._http.post(environment.MyApi + 'update-morepointsfor-correctanswers',data);
  }
  updateAddLeaderBoard(data:any){
    return this._http.post(environment.MyApi + 'manage-leaderboard',data);
  }
  updateQuizEnableMusic(data:any){
    return this._http.post(environment.MyApi + 'update-enable-quiz-music',data);
  }
  updateQuizMusic(data:any){
    return this._http.post(environment.MyApi + 'update-quiz-music',data);
  }
  quizStateUpdate(data:any){
    return this._http.post(environment.MyApi + 'quiz-state-update',data);
  }
  typeAnswersResultHideandShowWorkSpace(data:any){
    return this._http.post(environment.MyApi + 'workspace-typeanswers-result-hide-and-show',data);
  }
  typeAnswersResultCorrectandWrongWorkSpace(data:any){
    return this._http.post(environment.MyApi + 'workspace-typeanswers-result-correct-and-wrong',data);
  }
  CheckResponseBeforeTemplate(Id: string){
    return this._http.get(environment.MyApi + 'check-response-before-template?Id=' + Id);
  }
  SlideSwap(data:any){
    return this._http.put(environment.MyApi + 'swapslides',data);
  }
  ImportSlides(data:any){
    return this._http.put(environment.MyApi + 'importSlides',data);
  }
  resetSlideResult(data: any) {
    return this._http.post(environment.MyApi + 'reset-slide-result', data);
  }
  resetPresentationResult(data: any) {
    return this._http.post(environment.MyApi + 'reset-presentation-result', data);
  }
  duplicatePresentationResetResult(data: any) {
    return this._http.post(environment.MyApi + 'duplicate-presentation-reset-result', data);
  }
  updatePreview(data:any){
    return this._http.post(environment.MyApi + 'update-preview',data);
  }
  blankScreenUpdate(data:any){
    return this._http.post(environment.MyApi + 'blank-screen-update',data);
  }
  // * ===== Remote API Call ========
  resetTimer(data: any) {
    return this._http.post(environment.MyApi + 'reset-present-timer', data);
  }
  deleteQuestion(data: any) {
    return this._http.post(environment.MyApi + 'delete-question', data);
  }
  leaderBoardState(data: any) {
    return this._http.post(environment.MyApi + 'leaderboard-status', data);
  }
  responsesSummary(data: any) {
    return this._http.get(environment.MyApi + 'response-summary?presentationId=' + data);
  }
  changePresentationMode(data:any){
    return this._http.post(environment.MyApi + 'change-presentation-mode', data);
  }

  // Theme API Call
  createTheme(data: any) {
    return this._http.post(environment.MyApi + 'theme', data);
  }
  getTheme() {
    return this._http.get(environment.MyApi + 'get-all-theme');
  }
  getThemeById(themeId: any) {
    return this._http.get(environment.MyApi + 'getbyid-theme?themeId=' + themeId);
  }
  GetDefaultThemeById(themeId: any, presentationId: any) {
    return this._http.get(environment.MyApi + 'get-default-theme?themeId=' + themeId + '&PresentationId=' + presentationId);
  }
  editTheme(data: any) {
    return this._http.post(environment.MyApi + 'update-theme-name', data);
  }
  RemoveTheme(id: any) {
    return this._http.delete(environment.MyApi + 'theme?themeId=' + id);
  }
  ResetSlideThemes(data: any) {
    return this._http.post(environment.MyApi + 'slides/themes/reset', data);
  }
  SlideTheme(data: any) {
    return this._http.post(environment.MyApi + 'slide-theme', data);
  }
  SlideThemeUpdate(data: any) {
    return this._http.post(environment.MyApi + 'slide-theme/update', data);
  }
  GetDefaultTheme() {
    return this._http.get(environment.MyApi + 'get-all-defaut-theme');
  }
  applyThemeToPresentation(data:any){
    return this._http.post(environment.MyApi + 'apply-theme-presentation',data);
  }
  applyTheme(data:any){
    return this._http.post(environment.MyApi + 'apply-theme',data);
  }
  getUserThemesAndDefaultThemes(getCustomerThemesParams:any){
    const params = new HttpParams({ fromObject: getCustomerThemesParams });
    return this._http.get(environment.MyApi + 'customer-themes', { params });
  }
  updateThemeLogo(data:any){
    return this._http.post(environment.MyApi + 'update-theme-logo',data);
  }
  updateThemeBackgroundColor(data:any){
    return this._http.post(environment.MyApi + 'update-theme-background-color',data);
  }
  updateThemeBackgroundImage(data:any){
    return this._http.post(environment.MyApi + 'update-theme-background-image',data);
  }
  updateThemeLineColor(data:any){
    return this._http.post(environment.MyApi + 'update-theme-line-color',data);
  }
  updateThemeTextColor(data:any){
    return this._http.post(environment.MyApi + 'update-theme-text-color',data);
  }
  updateThemeFont(data:any){
    return this._http.post(environment.MyApi + 'update-theme-font',data);
  }
  updateThemeVisualizationColors(data:any){
    return this._http.post(environment.MyApi + 'update-theme-visualization-color',data);
  }
  updateThemeBackgroundColorOpacity(data:any){
    return this._http.post(environment.MyApi + 'update-theme-background-color-opacity',data);
  }
  updateThemeTextBold(data: any) {
    return this._http.post(environment.MyApi + 'update-font-bold', data);
  }
  updateThemeTextItalic(data: any) {
    return this._http.post(environment.MyApi + 'update-font-italic', data);
  }
  updateThemeTextUnderline(data: any) {
    return this._http.post(environment.MyApi + 'update-font-underline', data);
  }
  updateFontSize(data: any) {
    return this._http.post(environment.MyApi + 'update-font-size', data);
  }
  updateThemeTextStrikethrough(data: any) {
    return this._http.post(environment.MyApi + 'update-font-strick-through', data);
  }
  removeThemeLogo(data:any){
    return this._http.post(environment.MyApi + 'remove-theme-logo',data);
  }
  removeThemeBackgroundImage(data:any){
    return this._http.post(environment.MyApi + 'remove-theme-background-image',data);
  }
  deleteTheme(id:any){
    const params = new HttpParams({ fromObject: id });
    return this._http.delete(environment.MyApi + 'theme', {params});
  }
  resetThemeToDefault(data: any) {
    return this._http.post(environment.MyApi + 'reset-themes', data);
  }
  getCustomerPresentationLimit(){
    return this._http.get(environment.MyApi + 'get-customer-presentation-limit');
  }
  customerActive(customerData: any) {
    return this._http.post(environment.MyApi + 'customer-activity', customerData);
  }
  updateVisualizationColorOptions(data:any){
    return this._http.post(environment.MyApi + 'update-visualization-color-option',data);
  }
  getPreviewData(id:any,isPresntation){
    return this._http.get(environment.MyApi + 'preview-data?id='+id+'&isPresentation='+isPresntation);
  }
  updateMultimediaData(data:any){
    return this._http.post(environment.MyApi + 'update-multimedia-data',data);
  }
  deleteMultiplePresentations(presentationIds: string[]): Observable<any> {
    return this._http.delete(environment.MyApi + 'delete-multiple-presentations', {
        body: presentationIds
    });
  }
  deleteAllPresentations(): Observable<any> {
      return this._http.delete(environment.MyApi + 'delete-all-presentations');
  }
  // This endpoints another copy is template service keep your change both sides
  getSlideTypesForTemplate(id:string, isPresentations:boolean){
    return this._http.get(environment.MyApi + `get-template-slideTypes?templateId=${id}&isPresentations=${isPresentations}`,{});
  }
  private themeElements = new BehaviorSubject<HTMLElement[]>([]);
  themeElements$ = this.themeElements.asObservable();

  registerThemeElements(elements: HTMLElement[]) {
    this.themeElements.next(elements);
  }

  getThemeElements(): HTMLElement[] {
    return this.themeElements.value;
  }
}

  