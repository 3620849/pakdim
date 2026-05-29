import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-dim',
  templateUrl: './dim.component.html',
  styleUrls: ['./dim.component.scss']
})
export class DimComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gearCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  frameCount = 151;
  images: HTMLImageElement[] = [];
  imagesLoaded = false;
  loadedCount = 0;
  mouseX = 0;
  mouseY = 0;
  private revealObserver: IntersectionObserver | null = null;

  constructor() { }

  ngOnInit(): void {
    this.preloadImages();
  }

  ngAfterViewInit(): void {
    if (this.imagesLoaded) {
      this.drawFrame(0);
    }
    this.initScrollReveal();
  }

  preloadImages() {
    for (let i = 1; i <= this.frameCount; i++) {
      const img = new Image();
      // Format number with 3 digits padding (e.g. 001, 010, 100)
      const frameNum = i.toString().padStart(3, '0');
      img.src = `assets/gears/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount === this.frameCount) {
          this.imagesLoaded = true;
          this.drawFrame(0);
        }
      };
      img.onerror = () => {
        // Gracefully handle load error, increment count to not block rendering
        this.loadedCount++;
        if (this.loadedCount === this.frameCount) {
          this.imagesLoaded = true;
          this.drawFrame(0);
        }
      };
      this.images.push(img);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.requestFrameUpdate();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.updateSpotlight();
  }

  private frameUpdatePending = false;
  requestFrameUpdate() {
    if (!this.frameUpdatePending) {
      this.frameUpdatePending = true;
      requestAnimationFrame(() => {
        this.updateGearFrame();
        this.frameUpdatePending = false;
      });
    }
  }

  updateGearFrame() {
    if (this.images.length === 0) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // Calculate total scrollable height
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;

    // Map scroll percentage to frame index (0 to 150)
    const frameIndex = Math.min(
      this.frameCount - 1,
      Math.floor(scrollFraction * this.frameCount)
    );

    this.drawFrame(frameIndex);
  }

  findNearestLoadedFrame(index: number): HTMLImageElement | null {
    // Search outwards from the target index to find any loaded image
    let step = 0;
    while (step < this.frameCount) {
      const prev = index - step;
      if (prev >= 0 && this.images[prev] && this.images[prev].complete) {
        return this.images[prev];
      }
      const next = index + step;
      if (next < this.frameCount && this.images[next] && this.images[next].complete) {
        return this.images[next];
      }
      step++;
    }
    return null;
  }

  drawFrame(index: number) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = this.images[index];
    if (!img || !img.complete) {
      const nearest = this.findNearestLoadedFrame(index);
      if (nearest) {
        img = nearest;
      } else {
        return;
      }
    }

    // Make canvas display at full intrinsic size of image
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  updateSpotlight() {
    const container = document.querySelector('.dim-container') as HTMLElement;
    if (container) {
      container.style.setProperty('--mouse-x', `${this.mouseX}px`);
      container.style.setProperty('--mouse-y', `${this.mouseY}px`);
    }
  }

  redirectTo(path: string) {
    window.open(path, "_blank");
  }

  initScrollReveal() {
    const options = {
      root: null,
      rootMargin: '0px 0px -50% 0px', // Active region is top half of screen; reveals/hides at 50% viewport height
      threshold: 0
    };

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, options);

    const revealElements = document.querySelectorAll('.reveal-element');
    revealElements.forEach(el => this.revealObserver?.observe(el));
  }

  ngOnDestroy(): void {
    if (this.revealObserver) {
      this.revealObserver.disconnect();
    }
  }
}
