import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

class UFO {
  width: number = 100;
  height: number = 60;
  x: number;
  y: number;
  speed: number;
  direction: number = 1;
  hit: boolean = false;
  hitTimer: number = 0;
  image: HTMLImageElement;
  ufoImage: HTMLImageElement;
  ufoHitImage: HTMLImageElement;

  constructor(canvas: HTMLCanvasElement, ufoImage: HTMLImageElement, ufoHitImage: HTMLImageElement) {
    this.x = Math.random() * (canvas.width - this.width);
    this.y = canvas.height * 0.2 + Math.random() * (canvas.height * 0.25);
    this.speed = 2 + (Math.random() * 3);
    this.image = ufoImage;
    this.ufoImage = ufoImage;
    this.ufoHitImage = ufoHitImage;
  }

  update(canvas: HTMLCanvasElement) {
    this.x += this.speed * this.direction;
    
    if (this.x <= 0 || this.x + this.width >= canvas.width) {
      this.direction *= -1;
    }
    
    if (this.hit && this.hitTimer <= 0) {
      this.hit = false;
      this.image = this.ufoImage;
    } else if (this.hit) {
      this.hitTimer--;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  activateHitEffect() {
    if (!this.hit) {
      this.hit = true;
      this.hitTimer = 60;
      this.image = this.ufoHitImage;
    }
  }
}

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  
  private gameLoop: any;
  private timeUpdateInterval: any;
  private gameStartTime: number | null = null;
  private gameStarted: boolean = false;
  private gameActive: boolean = true;
  public score: number = 0;
  public timeRemaining: number = 60;
  private imagesLoaded: number = 0;
  private requiredImages: number = 5;

  private backgroundImage = new Image();
  private playerImage = new Image();
  private ufoImage = new Image();
  private ufoHitImage = new Image();
  private missileImage = new Image();
  
  private player = {
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    speed: 3
  };
  
  private missiles: any[] = [];
  private missileProps = {
    width: 30,
    height: 40,
    speed: 4
  };

  private numUfos: number = 3;
  private ufos: UFO[] = [];
  private keys = {
    left: false,
    right: false,
    space: false
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.backgroundImage.src = 'assets/images/space_pixel.jpeg';
    this.backgroundImage.onload = () => this.handleImageLoad();

    this.playerImage.src = 'assets/images/spaceship_pixel.png';
    this.playerImage.onload = () => this.handleImageLoad();

    this.ufoImage.src = 'assets/images/UFO_fresh_pixel.png';
    this.ufoImage.onload = () => this.handleImageLoad();

    this.ufoHitImage.src = 'assets/images/explosion.png';
    this.ufoHitImage.onload = () => this.handleImageLoad();

    this.missileImage.src = 'assets/images/misslejp_pixel.png';
    this.missileImage.onload = () => this.handleImageLoad();

    const storedNumUfos = localStorage.getItem('numUfos');
    const storedTime = localStorage.getItem('playTime');
    if (storedNumUfos) this.numUfos = parseInt(storedNumUfos);
    if (storedTime) this.timeRemaining = parseInt(storedTime);
  }

  ngOnInit() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.player.x = canvas.width / 2;
    this.player.y = canvas.height - 100;
  }

  handleImageLoad() {
    this.imagesLoaded++;
    if (this.imagesLoaded === this.requiredImages) {
      this.startGame();
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.keys.left = true;
    if (e.key === 'ArrowRight') this.keys.right = true;
    if (e.key === ' ') {
      e.preventDefault();
      if (!this.keys.space) this.fireMissile();
      this.keys.space = true;
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.keys.left = false;
    if (e.key === 'ArrowRight') this.keys.right = false;
    if (e.key === ' ') this.keys.space = false;
  }

  fireMissile() {
    if (this.missiles.length === 0) {
      this.missiles.push({
        x: this.player.x + this.player.width / 2 - this.missileProps.width / 2,
        y: this.player.y,
        width: this.missileProps.width,
        height: this.missileProps.height
      });
    }
  }

  updatePlayer() {
    const canvas = this.canvasRef.nativeElement;
    if (this.keys.left) {
      this.player.x = Math.max(0, this.player.x - this.player.speed);
    }
    if (this.keys.right) {
      this.player.x = Math.min(canvas.width - this.player.width, this.player.x + this.player.speed);
    }
  }

  updateMissiles() {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      this.missiles[i].y -= this.missileProps.speed;

      if (this.missiles[i].y + this.missiles[i].height < 0) {
        this.missiles.splice(i, 1);
        this.score = Math.max(0, this.score - 25);
        continue;
      }

      for (const ufo of this.ufos) {
        if (this.checkCollision(this.missiles[i], ufo) && !ufo.hit) {
          this.missiles.splice(i, 1);
          ufo.activateHitEffect();
          this.score += 100;
          break;
        }
      }
    }
  }

  checkCollision(rect1: any, rect2: any): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.drawImage(this.backgroundImage, 0, 0, canvas.width, canvas.height);
    this.ctx.drawImage(this.playerImage, this.player.x, this.player.y, 
      this.player.width, this.player.height);
    
    this.missiles.forEach(missile => {
      this.ctx.drawImage(this.missileImage, missile.x, missile.y, 
        missile.width, missile.height);
    });

    this.ufos.forEach(ufo => ufo.draw(this.ctx));

    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Time: ${this.timeRemaining}`, canvas.width - 100, 30);
  }

  startGame() {
    if (this.gameStarted) return;
    
    this.gameStarted = true;
    this.gameActive = true;
    this.score = 0;
    this.missiles = [];
    this.ufos = Array(this.numUfos).fill(null).map(() => 
      new UFO(this.canvasRef.nativeElement, this.ufoImage, this.ufoHitImage)
    );
    
    this.gameStartTime = Date.now();

    // Game loop for movement and drawing
    this.gameLoop = setInterval(() => {
      if (!this.gameActive) return;
      this.updatePlayer();
      this.updateMissiles();
      this.ufos.forEach(ufo => ufo.update(this.canvasRef.nativeElement));
      this.draw();
    }, 1000 / 60);

    // Separate interval for time updates
    this.timeUpdateInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    clearInterval(this.timeUpdateInterval);

    const canvas = this.canvasRef.nativeElement;
    const selectedTime = this.timeRemaining / 60;
    this.score = Math.floor(this.score / selectedTime);
    this.score -= (this.numUfos - 1) * 50;
    this.score = Math.max(0, this.score);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, canvas.width / 2, canvas.height / 2 + 50);

    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      const scoreData = {
        punctuation: this.score,
        ufos: this.numUfos,
        disposedTime: 60 - this.timeRemaining
      };

      this.http.post('http://wd.etsisi.upm.es:10000/records', scoreData, { headers })
        .subscribe({
          next: () => console.log('Score saved'),
          error: (error) => console.error('Error saving score:', error)
        });
    }
  }

  ngOnDestroy() {
    clearInterval(this.gameLoop);
    clearInterval(this.timeUpdateInterval);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
}