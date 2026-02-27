import { Component, OnInit } from '@angular/core';
import { ScreenshotService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ScreenshotDto } from '../../core/models';

// ── All Screenshots (Screenshot/Index.cshtml) ─────────────────────────────
import { Component as C1 } from '@angular/core';
@C1({ selector: 'app-screenshot-index', templateUrl: './screenshot-index.component.html' })
export class ScreenshotIndexComponent implements OnInit {
  screenshots: ScreenshotDto[] = [];
  lightboxSrc = '';
  lightboxCaption = '';
  showModal = false;
  currentUser$ = this.auth.currentUser$;

  constructor(private svc: ScreenshotService, public auth: AuthService) {}

  ngOnInit(): void { this.svc.getAll().subscribe(s => this.screenshots = s); }

  openModal(src: string, caption: string): void {
    this.lightboxSrc = src; this.lightboxCaption = caption; this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }

  delete(id: number): void {
    if (confirm('Delete?')) this.svc.delete(id).subscribe(() => this.screenshots = this.screenshots.filter(s => s.id !== id));
  }
}

// ── User Screenshots (Screenshot/UserScreenshots.cshtml) ──────────────────
import { Component as C2 } from '@angular/core';
@C2({ selector: 'app-user-screenshots', templateUrl: './user-screenshots.component.html' })
export class UserScreenshotsComponent implements OnInit {
  screenshots: ScreenshotDto[] = [];
  lightboxSrc = '';
  lightboxCaption = '';
  showModal = false;
  currentUser$ = this.auth.currentUser$;

  constructor(private svc: ScreenshotService, public auth: AuthService) {}

  ngOnInit(): void { this.svc.getUserScreenshots().subscribe(s => this.screenshots = s); }

  openModal(src: string, caption: string): void {
    this.lightboxSrc = src; this.lightboxCaption = caption; this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }

  delete(id: number): void {
    if (confirm('Delete?')) this.svc.delete(id).subscribe(() => this.screenshots = this.screenshots.filter(s => s.id !== id));
  }
}
