import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';

@Component({
    selector: 'app-leaderboard-champion',
    templateUrl: './leaderboard-champion.component.html',
    styleUrls: ['./leaderboard-champion.component.scss'],
    standalone: false
})
export class LeaderboardChampionComponent implements OnInit, AfterViewInit {

  @Input('LeaderBoard') public LeaderBoard: any;
  @Input('themes') public theme: any;
  leaderboardPlayers: any[] = [];
  leaderBoardPointsBackgroundColor: any = "";
  topThreePlayers: any[] = [];
  
  private ctx!: CanvasRenderingContext2D;
  private bubbleParticles: any[] = [];
  private images: HTMLImageElement[] = [];
  private imagePaths: string[] = [
    'assets/new-icons/leaderboard/Vector-1.svg',
    'assets/new-icons/leaderboard/Vector-2.svg',
    'assets/new-icons/leaderboard/Vector-3.svg',
    'assets/new-icons/leaderboard/Vector-4.svg',
    'assets/new-icons/leaderboard/Vector-5.svg',
    'assets/new-icons/leaderboard/Vector-6.svg',
    'assets/new-icons/leaderboard/Vector-7.svg',
    'assets/new-icons/leaderboard/Vector-8.svg',
    'assets/new-icons/leaderboard/Vector-9.svg',
    'assets/new-icons/leaderboard/Vector-10.svg',
    'assets/new-icons/leaderboard/Vector-11.svg',
    'assets/new-icons/leaderboard/Vector-12.svg',
    'assets/new-icons/leaderboard/Vector-13.svg',
    'assets/new-icons/leaderboard/Vector-14.svg',
    'assets/new-icons/leaderboard/Vector-15.svg',
    'assets/new-icons/leaderboard/Vector-16.svg',
    'assets/new-icons/leaderboard/Vector-17.svg',
    'assets/new-icons/leaderboard/Vector-18.svg',
    'assets/new-icons/leaderboard/Vector-19.svg',
    'assets/new-icons/leaderboard/Vector-20.svg',
    'assets/new-icons/leaderboard/Vector-21.svg',
    'assets/new-icons/leaderboard/Vector-22.svg',
    'assets/new-icons/leaderboard/Vector-23.svg',
    'assets/new-icons/leaderboard/Vector-24.svg',
    'assets/new-icons/leaderboard/Vector-25.svg',
    'assets/new-icons/leaderboard/Vector-26.svg',
    'assets/new-icons/leaderboard/Vector-27.svg',
    'assets/new-icons/leaderboard/Vector-28.svg',
    'assets/new-icons/leaderboard/Vector-29.svg',
    'assets/new-icons/leaderboard/Vector-30.svg'
  ];


  constructor(public workSpaceService: WorkspaceService) {}

  ngOnInit(): void {
    this.leaderBoardPointsBackgroundColor = this.workSpaceService?.ContrastColorForCMT;
    this.leaderBoardUsers();
  }

  ngAfterViewInit(): void {
    const canvas = document.getElementById('confettiCanvas') as HTMLCanvasElement;
    const container = document.getElementById('canvasContainer') as HTMLDivElement;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.resizeCanvas(canvas, container);
    this.preloadImages(); // Start image preloading
  }

  ngOnChanges() {
    this.leaderBoardUsers();
  }

  leaderBoardUsers() {
    this.leaderboardPlayers = [];
    this.topThreePlayers = [];
    var leaderboardPlayers = this.workSpaceService.presentationQuizPlayerList.sort((a, b) => b.score - a.score);
    if(leaderboardPlayers.length >=1){
      for (var i = 0; i < leaderboardPlayers.length; i++) {
        if (leaderboardPlayers[i].score > 0 && i==0) {
          this.topThreePlayers.push(leaderboardPlayers[i]);
        }
        else{
          this.leaderboardPlayers.push(leaderboardPlayers[i]);
        }
      }
    }
  }
  getBackgroundColorWithOpacity(colorCode: any, opacity: any): string {
    let rgb: number[];
    // Check if the input is a hex code
    if (colorCode?.startsWith('#')) {
      rgb = this.hexToRgb(colorCode);
    } else {
      // Assume it's an rgb string
      rgb = colorCode?.match(/\d+/g).map(Number);
    }
    // Calculate the contrast color
    const contrastRgb = rgb?.map((val) => (val > 128 ? 0 : 255));
    // Return the contrast color with opacity
    return `rgba(${contrastRgb?.join(', ')}, ${opacity})`;
  }
  private hexToRgb(hex: string): number[] {
    const hexValue = hex?.replace(/^#/, '');
    const rgb = [];

    for (let i = 0; i < 3; i++) {
      rgb?.push(parseInt(hexValue.substr(i * 2, 2), 16));
    }    
    return rgb;
  }


  private resizeCanvas(canvas: HTMLCanvasElement, container: HTMLDivElement): void {
    canvas.width = container.clientWidth;  // Set canvas width to container width
    canvas.height = container.clientHeight; // Set canvas height to container height
  }

  private preloadImages(): void {
    let loadedImages = 0;
    const totalImages = this.imagePaths.length;

    this.imagePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          this.startAnimation(); // Start animation after images are loaded
        }
      };
      this.images.push(img);
    });
  }

  private createBubbleParticle(): any {
    const canvas = document.getElementById('confettiCanvas') as HTMLCanvasElement;
    return {
      x: Math.random() * canvas.width,  // Access width from HTMLCanvasElement
      y: canvas.height,                   // Access height from HTMLCanvasElement
      speed: Math.random() * 8 + 1,
      angle: Math.random() * 360,
      gravity: 0.03,
      image: this.images[Math.floor(Math.random() * this.images.length)]
    };
  }

  private updateBubbleParticle(particle: any): void {
    particle.y -= particle.speed; // Move particles upwards
    particle.x += Math.sin(particle.angle) * 1.5;
    particle.speed -= particle.gravity;

    const canvas = document.getElementById('confettiCanvas') as HTMLCanvasElement;

    // Reset particle when it goes off-screen
    if (particle.y < 0) {
      particle.y = canvas.height; // Reset y position to bottom of the container
      particle.x = Math.random() * canvas.width; // Reset x position within canvas width
      particle.image = this.images[Math.floor(Math.random() * this.images.length)];
    }
  }

  private drawBubbleParticle(particle: any): void {
    const fixedSize = 10;
    this.ctx.drawImage(particle.image, particle.x, particle.y, fixedSize, fixedSize);
  }

  private burstBubbles(): void {
    for (let i = 0; i < 200; i++) {
      this.bubbleParticles.push(this.createBubbleParticle());
    }
  }

  private animateBubbles(canvas: HTMLCanvasElement): void {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.bubbleParticles.forEach((particle) => {
      this.updateBubbleParticle(particle);
      this.drawBubbleParticle(particle);
    });

    requestAnimationFrame(() => this.animateBubbles(canvas));
  }

  private startAnimation(): void {
    if (this.topThreePlayers.length > 0) {
      this.burstBubbles();
      const canvas = document.getElementById('confettiCanvas') as HTMLCanvasElement;
      this.animateBubbles(canvas);
    }
  }

  updatePresentationPoints(points:any){
    this.leaderboardPlayers = points;
  }
}
