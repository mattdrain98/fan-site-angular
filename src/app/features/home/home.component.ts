import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForumDto, PostDto, ScreenshotDto } from 'src/app/core/models';
import { HomeService } from 'src/app/core/services/home.service';

interface QuickStat {
  icon: string;
  value: string;
  label: string;
}

interface ActiveForum {
  id: number;
  name: string;
  postCount: number;
  memberCount: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterLink, DatePipe, DecimalPipe]
})
export class HomeComponent implements OnInit, OnDestroy {

  private homeService = inject(HomeService);

  quickStats: QuickStat[] = [];

  latestScreenshots: ScreenshotDto[] = [];
  topPosts:          PostDto[] = [];
  latestPosts:       PostDto[] = [];
  topForums:         ForumDto[] = [];

  // ── Screenshot slideshow state ─────────────────────────────────────────
  activeShot      = 0;
  prevShotIndex        = -1;
  shotTextVisible = false;
  showShotProgress = true;
  private readonly shotAutoplayMs = 5000;
  private shotInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.homeService.getStats().subscribe(s => {
      this.quickStats = [
        { icon: 'group',       value: this.formatStat(s.totalMembers), label: 'Members'  },
        { icon: 'article',     value: this.formatStat(s.totalPosts),   label: 'Posts'    },
        { icon: 'forum',       value: this.formatStat(s.totalForums),  label: 'Forums'   },
        { icon: 'chat_bubble', value: this.formatStat(s.totalReplies), label: 'Replies'  },
      ];
    });
    this.homeService.getTopPosts(5).subscribe(p => this.topPosts = p);
    this.homeService.getLatestPosts(5).subscribe(p => this.latestPosts = p);
    this.homeService.getMostActive(8).subscribe(f => this.topForums = f);
    this.homeService.getLatestScreenshots().subscribe(s => {
      this.latestScreenshots = s;
      if (s.length) {
        this.shotTextVisible = true;
        this.startShotAutoplay();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopShotAutoplay();
  }

  // ── Slideshow controls ─────────────────────────────────────────────────
  goToShot(index: number): void {
    if (index === this.activeShot) return;
    this.prevShotIndex        = this.activeShot;
    this.activeShot      = index;
    this.shotTextVisible  = false;
    this.showShotProgress = false;
    setTimeout(() => {
      this.shotTextVisible  = true;
      this.showShotProgress = true;
    }, 160);
    this.restartShotAutoplay();
  }

  nextShot(): void {
    this.goToShot((this.activeShot + 1) % this.latestScreenshots.length);
  }

  prevShot(): void {
    this.goToShot(
      (this.activeShot - 1 + this.latestScreenshots.length) % this.latestScreenshots.length
    );
  }

  private formatStat(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (value >= 1_000)     return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return value.toString();
  }
  
  private startShotAutoplay(): void {
    this.shotInterval = setInterval(() => this.nextShot(), this.shotAutoplayMs);
  }

  private stopShotAutoplay(): void {
    if (this.shotInterval) {
      clearInterval(this.shotInterval);
      this.shotInterval = null;
    }
  }

  private restartShotAutoplay(): void {
    this.stopShotAutoplay();
    this.startShotAutoplay();
  }
}