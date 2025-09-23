import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../NetworkService/network.service';
import { WorkspaceService } from './workspace.service';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subscription, delay, interval, retryWhen, takeWhile, tap } from 'rxjs';
import { MasterSlideTypeName } from 'src/app/utility/constants';
import { RemoteAccessNotificationService } from '../remote-access-notification.service';
import { RemoteAccessCommunicationService } from '../remote-access-communication.service';

@Injectable({
  providedIn: 'root'
})
export class WorkSignalRServiceService {
  presentationHub: any;
  environmentDetails = environment;

  // Network Status Variales
  private networkStatusSubscription: Subscription;
  private isOnlineSubject: BehaviorSubject<boolean>;
  public isOnline$: Observable<boolean>;
  private retrySubscription: Subscription;
  private isMoveSlidesSubscribed: boolean = false;
  private isProcessing = false; // Prevent overlapping executions
  private lastExecutionTime = 0; // Track the last execution time
  private visibilityChangeHandler: () => void;
  constructor(private _networkService: NetworkService, private _workspaceservice: WorkspaceService, private _remoteAccessNotificationService: RemoteAccessNotificationService, private _remoteAccessCommunicationService: RemoteAccessCommunicationService) {
    //this.setupPageVisibilityListener();
   }

  callSignalR() {
    this.presentationHub = new signalR.HubConnectionBuilder()
      .withUrl(this.environmentDetails.SignalRDomain + 'result',{
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .configureLogging(signalR.LogLevel.None)
      .withAutomaticReconnect([0, 5000, 10000, 30000])
      .build();
    this.presentationHub.serverTimeoutInMilliseconds = 60 * 60 * 1000;
    if (this.presentationHub.state != signalR.HubConnectionState.Connected) {
      // Start The Connection
      this.startConnection(this._workspaceservice.presentationId);
      // * On Connections Start
      this.getCommentsFromAudience();
      this.getQuestionsFromAudience();
      this.getPresentationQuestionsFromAudience();
      this.getReactionsFromAudience();
      this.getResponseFromAudience();
      this.participantCount();
      this.addandRemoveQuizPlayers();
      this.quizAnswersSubmited();
      this.getLikeForQuestionFromAudience();
      this.GetMoveSlides();
      this.isLastSlideOn();
      this.updateContent();
      this.hideandShowResults();
      this.HideandShowResponse();
      this.UpdateSlidePrecentage();
      this.UpdateSlideVisualizationsTypeChange();
      this.multipleChoicesResponseOn();
      this.selectAnswerResponseOn();
      this.typeAnswerResponseOn();
      this.guessTheNumberQuizResponseOn();
      this.lineupResponseOn();
      this.GuesstheNumberResponseOn();
      this.OpenEndedResponseOn();
      this.WordCloudResponseOn();
      this.scalesResponseOn();
      this.truthOrLieResponseOn();
      this.trafficLightsResponseOn();
      this.thisOrThatResponseOn();
      this.rankingResponseOn();
      this.removeQuizPlayers();
      // Remote
      this.UpdateAccessCodeOn();
      this.EnableDisableQuestionsOn();
      this.EnableDisableCommentsOn();
      this.multipleChoiceCorrectAnswersOn();
      this.timerCountDown();
      this.hideShowQRCodeOn();
      this.OnlyQAEnableQuestionOn();
      this.openQAOn();
      this.openQAWithIndexOn();
      this.markAsAnsweredPinQuestionOn();
      this.moderateResponseUpdateOn();
      this.resetModerateResponseUpdateOn();
      this.startQuizForRemoteOn();
      this.typeAnswersCorrectorWrongUpdateOn();
      this.typeAnswerShowAndHideUpdateOn();
      this.blankScreenUpdateOn();
      this.resetResultOn();
      // Remote Access
      this.remoteAccessRequestedOn();
      this.remoteAccessApprovedOn();
      this.remoteAccessRejectedOn();
    }
    // Reconnect when the hub is disconnect 
    this.presentationHub.onreconnecting((error) => {
      console.warn("SignalR reconnecting...", error);
    });
    this.presentationHub.onreconnected((connectionId) => {
      // Optionally, rejoin groups or reinitialize state here
      this.reconnect();
    });
    this.presentationHub.onclose(() => {
      this.reconnect();
    });
  }
  private async startConnection(presentationId: any) {
    try {
      if (this.presentationHub.state === signalR.HubConnectionState.Disconnected) {
        await this.presentationHub.start();
        console.log("Start Connection");
        await this.createGroup(presentationId,"1","Presenters");
      } else if (this.presentationHub.state === signalR.HubConnectionState.Connecting) {
        await new Promise((resolve) => {
          const checkConnection = setInterval(() => {
            if (this.presentationHub.state === signalR.HubConnectionState.Connected) {
              clearInterval(checkConnection);
              resolve(true);
            } else if (this.presentationHub.state === signalR.HubConnectionState.Disconnected) {
              clearInterval(checkConnection);
              resolve(false);
            }
          }, 100);
        });
      }
    } catch (err) {
      console.error('Error while starting connection:', err);
      try {
        await this.presentationHub.stop();
        await this.presentationHub.start();
        await this.createGroup(presentationId,"1","Presenters");
      } catch (retryErr) {
        console.error('Error during connection retry:', retryErr);
        throw retryErr;
      }
    }
  }
  private reconnect() {
    if (this.presentationHub.state != signalR.HubConnectionState.Connected) {
      this.startConnection(this._workspaceservice.presentationId);
    }
    else {
      return;
    }
  }
  stopConnection() {
    return new Promise<void>((resolve, reject) => {
      if (this.presentationHub) {
        this.presentationHub.stop().then((value: any) => console.log('SignalR connection stopped'));
        this.presentationHub = null; 
        resolve();
      }
      else {
        resolve();
      }
    });
  }
  // Network Validations Methods
  netWorkValidation() {
    this.isOnlineSubject = new BehaviorSubject<boolean>(this._networkService.isNetworkStatus());
    this.isOnline$ = this.isOnlineSubject.asObservable();

    // Start SignalR connection when network becomes online
    this.networkStatusSubscription = this._networkService.onlineStatus$.subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);
      if (isOnline) {
        this.callSignalR();
      } else {
        // this.stopConnection();
      }
    });
  }
  private setupPageVisibilityListener() {
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }
  private async handleVisibilityChange() {
    if (this._workspaceservice.presentationMode) {
      document.addEventListener('visibilitychange', async () => {
        const now = Date.now();
        if (now - this.lastExecutionTime < 5000) {
          return;
        }
        if (!this.isProcessing) {
          this.isProcessing = true; // Lock execution
          this.lastExecutionTime = now; // Update last execution time
          try {
            if (document.visibilityState === 'visible') {
              await this.stopConnection();
              await this.callSignalR();
            }
          } catch (error) {
            console.error('Error during visibility change:', error);
          } finally {
            this.isProcessing = false; // Unlock execution
          }
        }
      });
    }
  }
  // ? On Connections
  getCommentsFromAudience() {
    this.presentationHub.on("ReceiveCommentFromAudience", (comment: string) => {
      this._workspaceservice.getComments(comment);
    });
  }
  getQuestionsFromAudience() {
    this.presentationHub.on("GetQuestions", (data: any) => {
      this._workspaceservice.getQuestions().finally(() => {
        this._workspaceservice.getQuestionBehavioursSubject.next(data);
      });
    })
  }
  getPresentationQuestionsFromAudience() {
    this.presentationHub.on("PresentationQuestions", (data: any) => {
      this._workspaceservice.getPresentationQuestions(data);
      this._workspaceservice.getQuestionBehavioursSubject.next(data);
    })
  }
  getReactionsFromAudience() {
    this.presentationHub.on("AddReactions", (data: any) => {
      this._workspaceservice.getReactions(data);
    })
  }
  getResponseFromAudience() {
    //this._workspaceservice.isGetResponseSignalR = true;
    this.presentationHub.on("ReceiveMessageFromAudience", (data: any) => {
      this._workspaceservice.isGetResponseSignalR = true;
      this._workspaceservice.getVotingResult();
    })
  }

  participantCount() {
    this.presentationHub.on("ParticipantCount", (data: any) => {
        if (Number(data.participantCount) > Number(this._workspaceservice.slideParticipantCount)) {
          this._workspaceservice.slideParticipantCount = data.participantCount;
        }
    })
  }
  private pendingPlayerUpdates: any[] = [];
  private playerUpdateInterval: any = null;

  addandRemoveQuizPlayers() {
    this.presentationHub.on("AddandRemoveQuizPlayers", (data: any) => {
      console.log("AddandRemoveQuizPlayers", data);
      if (data != null && data.player != null) {
        setTimeout(() => {
          this.tryUpdatePlayerList(data.player);
        }, 1500);
        // this.startPlayerUpdateRetryMechanism();
      }
    });
  }
  
  private tryUpdatePlayerList(player: any) {
    if (this._workspaceservice.dynamicComponent_Clone && 
        this._workspaceservice.dynamicComponent_Clone.instance && 
        typeof this._workspaceservice.dynamicComponent_Clone.instance.updatePlayerlist === 'function') {
      
      this._workspaceservice.dynamicComponent_Clone.instance.updatePlayerlist(player);
      return true;
    } else {
      this.pendingPlayerUpdates.push(player);
      return false;
    }
  }
  private tryRemovePlayerList(playerId: any) {
    if (this._workspaceservice.dynamicComponent_Clone && 
        this._workspaceservice.dynamicComponent_Clone.instance && 
        typeof this._workspaceservice.dynamicComponent_Clone.instance.removePlayerFromList === 'function') {
      this._workspaceservice.dynamicComponent_Clone.instance.removePlayerFromList(playerId);
    }
  }
  private startPlayerUpdateRetryMechanism() {
    if (this.playerUpdateInterval) {
      return;
    }
    
    this.playerUpdateInterval = setInterval(() => {
      if (this.pendingPlayerUpdates.length === 0) {
        clearInterval(this.playerUpdateInterval);
        this.playerUpdateInterval = null;
        return;
      }
      
      if (this._workspaceservice.dynamicComponent_Clone && 
          this._workspaceservice.dynamicComponent_Clone.instance && 
          typeof this._workspaceservice.dynamicComponent_Clone.instance.updatePlayerlist === 'function') {
          const successfulUpdates = [];
          this.pendingPlayerUpdates.forEach((player, index) => {
          try {
            this._workspaceservice.dynamicComponent_Clone.instance.updatePlayerlist(player);
            successfulUpdates.push(index);
          } catch (error) {
          }
        });
        
        for (let i = successfulUpdates.length - 1; i >= 0; i--) {
          this.pendingPlayerUpdates.splice(successfulUpdates[i], 1);
        }
        
      }
    }, 500);
  }
  removeQuizPlayers() {
    this.presentationHub.on("RemoveQuizPlayers", (data: any) => {
      this.tryRemovePlayerList(data.audienceId);
      // this._workspaceservice.slideParticipantCount = this._workspaceservice.slideParticipantCount-1;
      // this.startPlayerUpdateRetryMechanism();
    })
  }

  quizAnswersSubmited() {
    this.presentationHub.on("quizAnswersSubmited", (data: any) => {
      this._workspaceservice.getQuizPlayerResponse();
    })
  }
  // * ========= Remote On ============
  GetMoveSlides() {
    this.presentationHub.on("MoveNextandPreviousSlideRemote", (data: any) => {
      this._workspaceservice.moveNextSlideBehavioursSubject.next(data);
    })
  }
  isLastSlideOn() {
    this.presentationHub.on("IsLastSlide", (data: any) => {
      this._workspaceservice.isLastBehavioursSubject.next(data);
    })
  }
  updateContent() {
    this.presentationHub.on("UpdateContent", (data: any) => {
      this._workspaceservice.updateContentBehavioursSubject.next(data);
    });
  }
  hideandShowResults() {
    this.presentationHub.on("hideandshowResults", (data: any) => {
      this._workspaceservice.hideandShowResultsBehavioursSubject.next(data);
    });
  }
  HideandShowResponse() {
    this.presentationHub.on("HideandShowResponse", (data: any) => {
      this._workspaceservice.hideandShowResponseBehavioursSubject.next(data);
    });
  }
  UpdateSlidePrecentage() {
    this.presentationHub.on("EnableDisablePercentage", (data: any) => {
      this._workspaceservice.updatePercentageBehavioursSubject.next(data);
    });
  }
  UpdateSlideVisualizationsTypeChange() {
    this.presentationHub.on("VisualizationsTypeChange", (data: any) => {
      this._workspaceservice.updateVisualizationsTypeChangeBehavioursSubject.next(data);
    });
  }
  multipleChoicesResponseOn() {
    this.presentationHub.on("MultipleChoicesResponse", (data: any) => {
      if(!this._workspaceservice.isPreviewMode){
        this._workspaceservice.multipleChoicesResponseUpdate(data);
      }
      else
      {
        this._workspaceservice.isGetResponseSignalR = true;
        this._workspaceservice.getVotingResult();
      }
      
    });
  }
  GuesstheNumberResponseOn() {
    this.presentationHub.on("GuesstheNumberResponse", (data: any) => {
      if (this._workspaceservice.guessTheNumberResults) {
        this._workspaceservice.guessTheNumberUpdate(data);
      }
    });
  }
  
  selectAnswerResponseOn() {
    this.presentationHub.on("SelectAnswerResponse", (data: any) => {
      this._workspaceservice.selectAnswerResponseUpdate(data);
    });
  }
  typeAnswerResponseOn() {
    this.presentationHub.on("TypeAnswerResponse", (data: any) => {
      this._workspaceservice.typeAnswerResponseUpdate(data);
    });
  }
  guessTheNumberQuizResponseOn() {
    this.presentationHub.on("GuessTheNumberQuizResponse", (data: any) => {
      this._workspaceservice.guessTheNumberQuizResponseUpdate(data);
    });
  }
  lineupResponseOn() {
    this.presentationHub.on("LineupResponse", (data: any) => {
      this._workspaceservice.lineupResponseUpdate(data);
    });
  }
  OpenEndedResponseOn() {
    this.presentationHub.on("OpenEndedResponse", (data: any) => {
      this._workspaceservice.openEndedResponseUpdate(data);
    });
  }
  WordCloudResponseOn() {
    this.presentationHub.on("WordCloudResponse", (data: any) => {
      this._workspaceservice.wordCloudResponseUpdate(data);
    });
  }
  scalesResponseOn() {
    this.presentationHub.on("ScalesResponse", (data: any) => {
      if(!this._workspaceservice.isPreviewMode){
        this._workspaceservice.scalesResponseUpdate(data);
      }
      else
      {
        this._workspaceservice.isGetResponseSignalR = true;
        this._workspaceservice.getVotingResult();
      }
    });
  }
  truthOrLieResponseOn() {
    this.presentationHub.on("TruthOrLieResponse", (data: any) => {
      if(!this._workspaceservice.isPreviewMode){
        this._workspaceservice.truthOrLieResponseUpdate(data);
      }
      else
      {
        this._workspaceservice.isGetResponseSignalR = true;
        this._workspaceservice.truthOrLieResponseUpdate(data);
      }
    });
  }
  trafficLightsResponseOn() {
    this.presentationHub.on("TrafficLightsResponse", (data: any) => {
      if(!this._workspaceservice.isPreviewMode){
        this._workspaceservice.trafficLightsResponseUpdate(data);
      }
      else
      {
        this._workspaceservice.isGetResponseSignalR = true;
        this._workspaceservice.getVotingResult();
      }
      
    });
  }
  rankingResponseOn() {
    this.presentationHub.on("RankingResponse", (data: any) => {
      if(!this._workspaceservice.isPreviewMode){
        this._workspaceservice.rankingResponseUpdate(data);
      }
      else
      {
        this._workspaceservice.isGetResponseSignalR = true;
        this._workspaceservice.getVotingResult();
      }
    });
  }
  thisOrThatResponseOn() {
    this.presentationHub.on("ThisOrThatResponse", (data: any) => {
      this._workspaceservice.thisOrThatUpdate(data);
    });
  }
  UpdateAccessCodeOn() {
    this.presentationHub.on("UpdateAccessBar", (data: any) => {
      this._workspaceservice.updateAccessCodeBehavioursSubject.next(data);
    });
  }
  EnableDisableQuestionsOn() {
    this.presentationHub.on("EnableDisableQuestions", (data: any) => {
      this._workspaceservice.enableDisableQuestionsBehavioursSubject.next(data);
    });
  }
  EnableDisableCommentsOn() {
    this.presentationHub.on("EnableDisableComments", (data: any) => {
      this._workspaceservice.enableDisableCommentsBehavioursSubject.next(data);
    });
  }
  multipleChoiceCorrectAnswersOn() {
    this.presentationHub.on("MultipleChoiceCorrectAnswers", (data: any) => {
      this._workspaceservice.multipleChoicesCorrectAnswersBehavioursSubject.next(data);
    });
  }
  timerCountDown() {
    this.presentationHub.on("TimerCountDown", (data: any) => {
      this._workspaceservice.timerCountDownBehavioursSubject.next(data);
    });
  }
  hideShowQRCodeOn() {
    this.presentationHub.on("HideShowQACode", (data: any) => {
      this._workspaceservice.hideShowQRDownBehavioursSubject.next(data);
    });
  }
  OnlyQAEnableQuestionOn() {
    this.presentationHub.on("OnlyQAEnableQuestion", (data: any) => {
      this._workspaceservice.onlyQAEnableBehavioursSubject.next(data);
    });
  }
  openQAOn() {
    this.presentationHub.on("OpenQA", (data: any) => {
      this._workspaceservice.openQABehavioursSubject.next(data);
    });
  }
  openQAWithIndexOn() {
    this.presentationHub.on("QuestionChangesUpdate", (data: any) => {
      this._workspaceservice.openQAWithIndexBehavioursSubject.next(data);
    });
  }
  markAsAnsweredPinQuestionOn() {
    this.presentationHub.on("MarkAsAnswerPinQuestion", (data: any) => {
      // Only call getQuestions if we're in the remote view
        this._workspaceservice.getQuestions().finally(() => {
          this._workspaceservice.markAsAnswerPinQuestionBehavioursSubject.next(data);
        });
      
    });
  }
  moderateResponseUpdateOn() {
    this.presentationHub.on("ModerateResponseUpdate", (data: any) => {
      // this._workspaceservice.isGetResponseSignalR = true;
      // this._workspaceservice.getVotingResult();
     if(this._workspaceservice.activeSlideTypeName == MasterSlideTypeName.OPEN_ENDED_SLIDE_TYPE){
      this._workspaceservice.openEndedModerateAnswerUpdate(data);
     }
     else if(this._workspaceservice.activeSlideTypeName == MasterSlideTypeName.WORD_CLOUD_SLIDE_TYPE){
      this._workspaceservice.wordCloudModerateAnswerUpdate(data);
     }
    });
  }
  resetModerateResponseUpdateOn() {
    this.presentationHub.on("ResetModerateResponseUpdate", (data: any) => {
     if(this._workspaceservice.activeSlideTypeName == MasterSlideTypeName.OPEN_ENDED_SLIDE_TYPE){
      this._workspaceservice.resetOpenEndedModerateAnswerUpdate(data);
     }
     else if(this._workspaceservice.activeSlideTypeName == MasterSlideTypeName.WORD_CLOUD_SLIDE_TYPE){
      this._workspaceservice.resetWordCloudModerateAnswerUpdate(data);
     }
    });
  }
  startQuizForRemoteOn() {
    this.presentationHub.on("StartQuizForRemote", (data: any) => {
      this._workspaceservice.startQuizforRemoteBehavioursSubject.next(data);
    });
  }
  typeAnswersCorrectorWrongUpdateOn() {
    this.presentationHub.on("TypeAnswersCorrectorWrongUpdate", (data: any) => {
     this._workspaceservice.getQuizPlayerResponse(true);
    });
  }
  typeAnswerShowAndHideUpdateOn() {
    this.presentationHub.on("TypeAnswerShowAndHideUpdate", (data: any) => {
     this._workspaceservice.getQuizPlayerResponse(true);
    });
  }
  blankScreenUpdateOn() {
    this.presentationHub.on("BlankScreenUpdate", (data: any) => {
      this._workspaceservice.blankScreenUpdateBehavioursSubject.next(data);
    });
  }
  resetResultOn() {
    this.presentationHub.on("ResetResult", (data: any) => {
      this._workspaceservice.resetResultBehavioursSubject.next(data);
    });
  }
  // ? Invokes 
  createGroup(presentationId: any,userId:any,userName:any) {
    this.presentationHub.invoke("AddGroup", presentationId,userId,userName).catch((error: any) => console.log(error));
  }
  enableDisableAudienceComment(resultDDTO: any) {
    this.presentationHub.invoke("EnableDisableComments", resultDDTO).catch((error: any) => console.log(error));
  }
  enableDisableAudienceQuestion(resultDDTO: any) {
    this.presentationHub.invoke("EnableDisableQuestions", resultDDTO).catch((error: any) => console.log(error));
  }
  moveNextandPerviousSlides(resultDDTO: any) {
    this.presentationHub.invoke("MoveNextandPreviousSlide", resultDDTO).catch((error: any) => console.log(error));
  }
  isLastSlide(resultDDTO: any) {
    this.presentationHub.invoke("IsLastSlide", resultDDTO).catch((error: any) => console.log(error));
  }
  openAndCloseResponse(resultDDTO: any) {
    this.presentationHub.invoke("HideandShowResponse", resultDDTO).catch((error: any) => console.log(error));
  }
  hideandshowResults(resultDDTO: any) {
    this.presentationHub.invoke("HideandShowResults", resultDDTO).catch((error: any) => console.log(error));
  }
  quizScreenMaintenance(presentationId: any, screenState: any) {
    this.presentationHub.invoke("quizScreenMaintenance", presentationId, screenState).catch((error: any) => console.log(error));
  }
  quizCreated(quizCreatedDTO: any) {
    try {
      this.presentationHub.invoke("QuizCreated", quizCreatedDTO).catch((error: any) => {
        // Avoid logging the entire error object to prevent accessing restricted properties
        if (error && error.message) {
          console.log('QuizCreated invoke error:', error.message);
        } else {
          console.log('QuizCreated invoke error');
        }
      });
    } catch (e) {
      // Catch synchronous errors, if any
      if (e && e.message) {
        console.log('QuizCreated error:', e.message);
      } else {
        console.log('QuizCreated error');
      }
    }
  }
  async UpdateContent(resultDDTO: any) {
    try {
      if (this.presentationHub.state !== signalR.HubConnectionState.Connected) {
        await this.startConnection(this._workspaceservice.presentationId);
        if (this.presentationHub.state !== signalR.HubConnectionState.Connected) {
          throw new Error('Failed to establish connection');
        }
      }
      await this.presentationHub.invoke("UpdateContent", resultDDTO);
      this.resetResult(this._workspaceservice.presentationId);
    } catch (error) {
      if (this.presentationHub.state !== signalR.HubConnectionState.Connected) {
        try {
          await this.presentationHub.stop();
          await this.startConnection(this._workspaceservice.presentationId);
          if (this.presentationHub.state === signalR.HubConnectionState.Connected) {
            await this.presentationHub.invoke("UpdateContent", resultDDTO);
          } else {
            throw new Error('Failed to reconnect');
          }
        } catch (retryError) {
          console.error('Error in UpdateContent retry:', retryError);
          throw retryError;
        }
      }
    }
  }
  waitingForQuizPlayers(waitingForQuizPlayersDTO: any) {
    this.presentationHub.invoke("waitingForQuizPlayers", waitingForQuizPlayersDTO).catch((error: any) => console.log(error));
  }
  getLikeForQuestionFromAudience() {
    this.presentationHub.on("QaLikes", (data: any) => {
      const question = this._workspaceservice.presentationQuestions.find(q => q.questionId === data.questionId);
      if (question) {
        question.likes =  question.likes + data.likes;
        this._workspaceservice.getPresentationLikeQuestions(question);
        this._workspaceservice.getQuestionBehavioursSubject.next(question);
      }
    });
  }

  // * ========= Remote Invokes ============
  moveNextandPerviousFromRemote(resultDDTO: any) {
    this.presentationHub.invoke("MoveNextandPreviousSlideFromRemote", resultDDTO).catch((error: any) => console.log(error));
  }
  multipleChoiceCorrectAnswersUpdate(resultDDTO: any) {
    this.presentationHub.invoke("MultipleChoiceCorrectAnswersUpdate", resultDDTO).catch((error: any) => console.log(error));
  }

  presentationTimerCountdown(resultDDTO: any) {
    this.presentationHub.invoke("PresentationTimerCountdown", resultDDTO).catch((error: any) => console.log(error));
  }
  hideShowQRCode(resultDDTO: any) {
    this.presentationHub.invoke("hideShowQACode", resultDDTO).catch((error: any) => console.log(error));
  }
  OpenQAModal(resultDDTO: any) {
    this.presentationHub.invoke("OpenQA", resultDDTO).catch((error: any) => console.log(error));
  }
  OpenQAModalQuestionIndex(resultDDTO: any) {
    this.presentationHub.invoke("QuestionChangesUpdate", resultDDTO).catch((error: any) => console.log(error));
  }
  startQuizForRemote(resultDDTO: any) {
    this.presentationHub.invoke("StartQuizForRemote", resultDDTO).catch((error: any) => console.log(error));
  }
  blankScreenUpdate(resultDDTO: any) {
    this.presentationHub.invoke("BlankScreenUpdate", resultDDTO).catch((error: any) => console.log(error));
  }
  resetResult(resultDDTO: any) {
    this.presentationHub.invoke("ResetResult", resultDDTO).catch((error: any) => console.log(error));
  }

  // Remote Access Methods
  remoteAccessRequestedOn() {
    this.presentationHub.on("RequestRemoteAccess", (data: any) => {
      const requestedAt = data.requestedAt ? new Date(data.requestedAt) : new Date();
      const remoteUserId = data.remoteUserId || data.connectionId || `remote-${Date.now()}`;
      
      const request = {
        requestId: remoteUserId,
        presentationId: data.presentationId,
        remoteUserId: remoteUserId,
        remoteUserName: data.remoteUserName,
        connectionId: data.connectionId || '',
        requestedAt: requestedAt,
        hasAccess: false,
        status: 'pending' as const
      };
      
      this._remoteAccessNotificationService.addRequest(request);
    });
  }

  remoteAccessApprovedOn() {
    this.presentationHub.on("RemoteAccessApproved", (data: any) => {
      if(data.presentationId === this._workspaceservice.presentationId && data.remoteUserId === localStorage.getItem(`remote_user_id_${this._workspaceservice.presentationId}`)){
        // Trigger the remote access component to check existing access
        this._remoteAccessCommunicationService.triggerCheckAccess();
        this._remoteAccessCommunicationService.notifyAccessApproved(data);
      }
    });
  }

  remoteAccessRejectedOn() {
    this.presentationHub.on("RemoteAccessRejected", (data: any) => {
      if(data.presentationId === this._workspaceservice.presentationId && data.remoteUserId === localStorage.getItem(`remote_user_id_${this._workspaceservice.presentationId}`)){
        // Notify the remote access component about rejection
        this._remoteAccessCommunicationService.notifyAccessRejected(data);
      }
    });
  }

  // Send remote access request to presenter
  requestRemoteAccess(data: any) {
    this.presentationHub.invoke("RequestRemoteAccess", data).catch((error: any) => console.log(error));
  }

  // Send remote access approval/rejection to remote user
  notifyRemoteAccessDecision(data: any) {
    this.presentationHub.invoke("NotifyRemoteAccessDecision", data).catch((error: any) => console.log(error));
  }

  // Method to set presentationId for auth module context
  setPresentationIdForAuthModule(presentationId: string) {
    this._workspaceservice.presentationId = presentationId;
  }
}