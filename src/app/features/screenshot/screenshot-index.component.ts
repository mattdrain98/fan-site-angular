import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ScreenshotService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ScreenshotDto } from '../../core/models';

@Component({
  selector: 'app-screenshot-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './screenshot-index.component.html'
})
export class ScreenshotIndexComponent implements OnInit {
  private svc = inject(ScreenshotService);
  auth = inject(AuthService);

  screenshots: ScreenshotDto[] = [];
  lightboxSrc = '';
  lightboxCaption = '';
  showModal = false;
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void { this.svc.getAll().subscribe(s => this.screenshots = s); }

  openModal(src: string, caption: string): void {
    this.lightboxSrc = src; this.lightboxCaption = caption; this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  delete(id: number): void {
    if (confirm('Delete?')) this.svc.delete(id).subscribe(() => this.screenshots = this.screenshots.filter(s => s.id !== id));
  }
}
