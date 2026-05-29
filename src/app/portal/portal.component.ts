import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss']
})
export class PortalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spaceCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  frameCount = 241;
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
    this.checkIntroVisibility();
  }

  preloadImages() {
    for (let i = 0; i < this.frameCount; i++) {
      const img = new Image();
      // Format number with 6 digits padding (e.g. 000000, 000001, 000240)
      const frameNum = i.toString().padStart(6, '0');
      img.src = `assets/space/frame_${frameNum}.webp`;
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount === this.frameCount) {
          this.imagesLoaded = true;
          this.drawFrame(0);
        }
      };
      img.onerror = () => {
        // Increment count so load errors don't stall the animation
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
    this.checkIntroVisibility();
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
        this.updateSpaceFrame();
        this.frameUpdatePending = false;
      });
    }
  }

  updateSpaceFrame() {
    if (this.images.length === 0) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;

    // Map scroll percentage to frame index (0 to 240)
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
        return; // No images loaded at all yet
      }
    }

    // Set canvas dimensions to the actual WebP intrinsic dimensions
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  updateSpotlight() {
    const container = document.querySelector('.portal-container') as HTMLElement;
    if (container) {
      container.style.setProperty('--mouse-x', `${this.mouseX}px`);
      container.style.setProperty('--mouse-y', `${this.mouseY}px`);
    }
  }

  initScrollReveal() {
    // SSR guard
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      const revealElements = document.querySelectorAll('.reveal-element');
      revealElements.forEach(el => el.classList.add('in-view'));
      return;
    }

    const options = {
      root: null,
      rootMargin: '0px 0px -50% 0px', // Trigger animations when elements cross the vertical center
      threshold: 0
    };

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          // Fade out elements when scrolling back, keeping intro items at the top exempt
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          if (entry.target.classList.contains('intro-titles') || entry.target.classList.contains('scroll-indicator')) {
            if (scrollTop >= 150) {
              entry.target.classList.remove('in-view');
            }
          } else {
            entry.target.classList.remove('in-view');
          }
        }
      });
    }, options);

    const revealElements = document.querySelectorAll('.reveal-element');
    revealElements.forEach(el => this.revealObserver?.observe(el));
  }

  checkIntroVisibility() {
    if (typeof document === 'undefined') return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const introTitles = document.querySelector('.intro-titles');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // Force visibility when near the top of the viewport
    if (scrollTop < 150) {
      introTitles?.classList.add('in-view');
      scrollIndicator?.classList.add('in-view');
    }
  }

  redirectTo(path: string) {
    window.open(path, "_blank");
  }

  ngOnDestroy(): void {
    if (this.revealObserver) {
      this.revealObserver.disconnect();
    }
  }
}
