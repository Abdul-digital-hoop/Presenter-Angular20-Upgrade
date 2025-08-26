import { Component, Output, EventEmitter, Input, EnvironmentInjector, ViewChild, ElementRef } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { PresentationThemeService } from 'src/app/core/Sevices/Presentation/presentation-theme.service';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
import { PresentationService } from 'src/app/core/Sevices/Presentation/presentation.service';
import { WorkSignalRServiceService } from 'src/app/core/Sevices/WorkSpace/work-signal-rservice.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorMessages, SuccessMessages } from 'src/app/core/SuccessResponse';
import { getErrorMessage, getMessage } from 'src/app/core/SuccessMessageHandler';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-ai-modal',
    templateUrl: './ai-modal.component.html',
    styleUrls: ['./ai-modal.component.scss'],
    animations: [
        trigger('stageAnimation', [
            transition(':increment', [
                query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
                group([
                    query(':leave', [
                        animate('300ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
                    ], { optional: true }),
                    query(':enter', [
                        style({ transform: 'translateX(100%)', opacity: 0 }),
                        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
                    ], { optional: true })
                ])
            ]),
            transition(':decrement', [
                query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
                group([
                    query(':leave', [
                        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
                    ], { optional: true }),
                    query(':enter', [
                        style({ transform: 'translateX(-100%)', opacity: 0 }),
                        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
                    ], { optional: true })
                ])
            ])
        ])
    ],
    standalone: false
})
export class AiModalComponent {
  @Input() isShowModal: boolean = false;
  @Input() startStage: number = 1;
  @Output() onClose = new EventEmitter<void>();
  promptForm: FormGroup;
  refinedPromptForm: FormGroup;
  environmentDetails = environment;

  currentStage: number = this.startStage;
  refinedUserPrompt: string = '';
  aiResponse: string = '';
  isLoading: boolean = false;
  isRefineLoading: boolean = false;
  hints: string[] = [
    'Team Building',
    'Team Building in Sports: Boosting Teamwork and Fun',
    'Cool Tips to Build Stronger Team Bonds',
    'Fun Ways to Build Teams at Work',
    'Top Tricks for Creating a Tight-Knit Team'
  ];
  @ViewChild('slideCountInput') slideInputRef!: ElementRef<HTMLInputElement>;
  numberOfSlides: number = 10;
  minNumberOfSlides: number = 5;
  maxNumberOfSlides: number = 20;
  editMode: boolean = false;
  isAddInstructionSlide: boolean = true;
  isAddImages: boolean = true;
  allThemes: any[] = [];
  selectedThemeName: string = 'Slid Light';
  useOriginalProgressLoading: boolean = false;
  loadingProgress: number = 0;
  progressMessages: string[] = ["🚀 Starting your presentation planning process..."];
  loadingInterval: any;
  private hubConnection: signalR.HubConnection;
  private pendingImageUploads = 0;
  private imageUploadsCompleted = new Subject<void>();

  constructor(
    public workSpaceService: WorkspaceService,
    public presentationThemeService: PresentationThemeService,
    private formBuilder: FormBuilder,
    private _presentationservice: PresentationService,
    private workSpaceSignalRService: WorkSignalRServiceService,
    private _router: Router,
    private _toastr: ToastrService
  ) {
    this.getThemes();
    this.promptForm = this.formBuilder.group({
      userPrompt: ['',[Validators.required, Validators.maxLength(10000)]],
    });
    this.refinedPromptForm = this.formBuilder.group({
      userPrompt: ['', [Validators.required, Validators.maxLength(10000)]],
      isAddInstructionSlide: [true],
      isAddImages: [true]
    });
  }

  getThemes(){
    if(this.allThemes && this.allThemes.length > 0) return;
    this.presentationThemeService.getCustomerThemesAndDefaultThemes().then(() => {
      this.allThemes = this.presentationThemeService.defaultThemes;
    });
  }

  close() {
    this.reset();
    this.onClose.emit();
  }

  ngOnInit(): void {
    // console.log("Component Created")
  }

  ngOnDestroy(): void {
    this.reset();
  }

  reset() {
    this.isShowModal = false;
    this.currentStage = this.startStage;
    this.refinedUserPrompt = '';
    this.promptForm.reset();
    this.refinedPromptForm.reset();
    this.aiResponse = '';
    this.isLoading = false;
    this.promptForm.reset();
    this.numberOfSlides = 10;
    this.workSpaceService.presentationId = '';
    this.refinedPromptForm.patchValue({ isAddImages: true, isAddInstructionSlide: true });
    this.resetThemeSelection();
    this.resetLoadingState();
    this.resetAiHubConnection();
  }

  resetAiHubConnection() {
    if(this.hubConnection){
      this.hubConnection.off('Connected');
      this.hubConnection.off('ReceivePresentationProgress');
      this.disconnectSignalR()
    }
  }

  resetThemeSelection() {
    this.selectedThemeName = 'Slid Light';
  }

  resetLoadingState() {
    this.loadingProgress = 0;

    // Clear loading timeout
    if (this.loadingInterval) {
      clearTimeout(this.loadingInterval);
      this.loadingInterval = null;
    }
    this.progressMessages = ["🚀 Starting your presentation planning process..."];
  }

  nextStage() {
    if (this.currentStage < 4) this.currentStage++;
  }

  prevStage() {
    if (this.currentStage > 1) this.currentStage--;
  }

  increase() {
    if(this.numberOfSlides < this.maxNumberOfSlides) {
      this.numberOfSlides++;
    }
  }

  decrease() {
    if (this.numberOfSlides > this.minNumberOfSlides) {
      this.numberOfSlides--;
    }
  }

  toggleEditModeAndFocus(): void {
    this.editMode = true;
    setTimeout(() => {
      this.slideInputRef?.nativeElement.focus();
    });
  }

  filterNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const isNumber = /^[0-9]$/.test(event.key);

    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  parseInputValue(numericValue: any): void {
    let parsedValue = parseInt(numericValue || '0', 10);

    if (parsedValue <= this.minNumberOfSlides) {
      parsedValue = this.minNumberOfSlides;
    } else if (parsedValue >= this.maxNumberOfSlides) {
      parsedValue = this.maxNumberOfSlides;
    }

    if (isNaN(parsedValue)) {
      this.numberOfSlides = this.minNumberOfSlides;
    }
    else{
      this.numberOfSlides = parsedValue;
    }
  }

  onInputChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const numericValue = input.replace(/\D/g, '');
    this.parseInputValue(numericValue)
  }

  saveEdit(event: any) {
    const newValue = parseInt(event.target.value, 10);
    this.parseInputValue(newValue)
    this.editMode = false;
  }

  refineInitialPrompt() {
    this.handlePromptRefinement(this.promptForm, 'isLoading');
    this.getThemes();
  }

  reRefinePrompt() {
    this.handlePromptRefinement(this.refinedPromptForm, 'isRefineLoading');
  }

  handlePromptRefinement(formGroup: FormGroup, loadingFlag: 'isLoading' | 'isRefineLoading') {
    var tempUserPrompt = formGroup.value.userPrompt?.trim();
    if (!tempUserPrompt) {
      formGroup.get('userPrompt')?.setErrors({ required: true });
      formGroup.get('userPrompt')?.markAsTouched();
      return;
    }

    if (formGroup.valid) {
      this[loadingFlag] = true;

      const payload = { prompt: tempUserPrompt };

      this._presentationservice.refineUserPrompt(payload).subscribe(
        (response: any) => {
          this[loadingFlag] = false;

          if (response?.failed) {
            formGroup.get('userPrompt')?.setErrors({ custom: response.failedReason });
            formGroup.get('userPrompt')?.markAsTouched();
          } else {
            this.refinedPromptForm.patchValue({ userPrompt: response.refinedPrompt, isAddImages: this.refinedPromptForm.value.isAddImages, isAddInstructionSlide: this.refinedPromptForm.value.isAddInstructionSlide });
            if(this.currentStage == 1){
              this.nextStage();
            } 
          }
        },
        (error: any) => {
          this[loadingFlag] = false;
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2005);
          this._toastr.error(message, "", { timeOut: 5000 });
        }
      );
    }
  }

  moveToThemeSelection() {
    var tempUserPrompt = this.refinedPromptForm.value.userPrompt?.trim();
    if (!tempUserPrompt) {
      this.refinedPromptForm.get('userPrompt').setErrors({ required: true });
      this.refinedPromptForm.get('userPrompt').markAsTouched();
      this.refinedPromptForm.get('userPrompt').invalid;
      return;
    }
    this.nextStage();
  }

  generatePresentation(themeId: string = '') {
    var tempUserPrompt = this.refinedPromptForm.value.userPrompt?.trim();
    if (!tempUserPrompt) {
      this.refinedPromptForm.get('userPrompt').setErrors({ required: true });
      this.refinedPromptForm.get('userPrompt').markAsTouched();
      this.refinedPromptForm.get('userPrompt').invalid;
      return;
    }
    if (this.refinedPromptForm.valid) {
      this.isLoading = true;
      var payload = {
        prompt: tempUserPrompt,
        numberOfSlides: this.numberOfSlides,
        isAddInstructionSlide: this.refinedPromptForm.value.isAddInstructionSlide,
        isAddImages: this.refinedPromptForm.value.isAddImages,
        themeId: themeId,
      }
      this.startSignalRConnection().then(connectionId => {
        payload["connectionId"] = connectionId;
        this.useOriginalProgressLoading = true;
        this.createPresentation(payload);
        this.nextStage();
      }).catch(err => {
        this.useOriginalProgressLoading = false;
        this.createPresentation(payload);
      });
    }
  }

  createPresentation(payload: any) {
    this.workSpaceService.activeSlideId = '';
    this.workSpaceService.presentationId = '';
    this._presentationservice.createWorkSpacePresentationWithAI(payload).subscribe(
        (response: any) => {
          if(response?.failed){
            this.isLoading = false;
            this.sendBackOnError(2, this.refinedPromptForm, response?.failedReason || "Failed to generate presentation. Please try again.");
          }
          else{
            this.workSpaceService.presentationId = response?.presentationId;
            this.workSpaceService.activeSlideId = response?.activeSlideId;
            this.isLoading = false;
            this.refinedPromptForm.reset();
            this.waitForAllImagesToUpload().then(() => {
              this._router.navigate(['/WorkSpace/edit'], {
                queryParams: { id: response?.presentationId, medium: 'AI' }
              });
            });
            this.workSpaceSignalRService.netWorkValidation();
          }
        },
        (error: any) => {
          this.isLoading = false;
          this.sendBackOnError(1, this.promptForm, "Encountered an error while generating the presentation. Please try again.");
          const message = getErrorMessage(ErrorMessages.PresentationSection2000, ErrorMessages.Presentation2005);
          this._toastr.error(message, "", {
            timeOut: 5000,
          });
        }
      )
  }

  sendBackOnError(sendBackStage: number, formGroup: FormGroup, sendBackReason: string) {
    this.currentStage = sendBackStage;
    this.resetThemeSelection();
    this.resetLoadingState();
    this.resetAiHubConnection();
    setTimeout(() => {
      const control = formGroup.get('userPrompt');
      if (control) {
        control.setErrors({ custom: sendBackReason });
        control.markAsTouched();
      }
    });
  }

  setSuggestionPrompt(hint: string) {
    this.promptForm.patchValue({ userPrompt: hint });
  }
  
  startSignalRConnection(): Promise<string> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.environmentDetails.SignalRDomain + 'aihub')
      .withAutomaticReconnect()
      .build();

    return new Promise((resolve, reject) => {
      this.hubConnection
        .start()
        .then(() => {
          this.hubConnection.on('Connected', (connectionId: string) => {
            this.registerSignalRCallbacks();
            resolve(connectionId);
          });
        })
        .catch((err: Error) => {
          console.error('SignalR Connection Error:', err);
          reject(err);
        });
    });
  }

  registerSignalRCallbacks() {
    this.hubConnection.on('ReceivePresentationProgress', (progressData: any) => {
      this.progressMessages.pop();
      this.progressMessages.push(progressData);
    });
    this.hubConnection.on('AddImagesToPresentation', (imageUploadData: any) => {
      this.pendingImageUploads++;
      
      this._presentationservice.contentImageUpdate(imageUploadData).subscribe({
        next: () => {
          this.pendingImageUploads--;

          if (this.pendingImageUploads === 0) {
            this.imageUploadsCompleted.next(); // All uploads done
          }
        },
        error: () => {
          this.pendingImageUploads--;

          if (this.pendingImageUploads === 0) {
            this.imageUploadsCompleted.next(); // Even with errors, mark complete
          }
        }
      });
    });
  }

  private waitForAllImagesToUpload(): Promise<void> {
    return new Promise(resolve => {
      if (this.pendingImageUploads === 0) {
        resolve();
      } else {
        const sub = this.imageUploadsCompleted.subscribe(() => {
          resolve();
          sub.unsubscribe();
        });
      }
    });
  }

  async disconnectSignalR(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        return
      } catch (err) {
        return console.error('Error while disconnecting SignalR:', err);
      }
    } else {
      return Promise.resolve();
    }
  }

  applyTheme(themeName: string) {
    const themeObj = this.allThemes.find(t => t.themeName === themeName);
    this.generatePresentation(themeObj?.id || '');
    this.nextStage();
    this.simulateLoading();
  }

  simulateLoading() {
    const maxProgress = 97;

    const updateProgress = () => {
      if (this.loadingProgress < maxProgress) {
        const remaining = maxProgress - this.loadingProgress;
        const increment = Math.min(remaining, Math.floor(Math.random() * 6) + 1); // 1–6%
        this.loadingProgress += increment;

        const nextDelay = Math.floor(Math.random() * 2000) + 4000; // 4–6 sec
        this.loadingInterval = setTimeout(updateProgress, nextDelay);
      }
    };

    updateProgress();
  }

  simulateProgressMessages() {
    const simulatedMessages = [
      'Setting up your deck...',
      'Selecting visual theme...',
      'Analyzing content...',
      'Generating layout...',
      'Adding animations...',
      'Finalizing slides...',
      'Almost done...'
    ];

    let index = 0;

    const interval = setInterval(() => {
      if (index < simulatedMessages.length) {
        this.progressMessages.push(simulatedMessages[index]);

        if (this.progressMessages.length > 6) {
          this.progressMessages.shift();
        }

        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);
  }
}
