import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ScreenshotService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ScreenshotDto } from '../../core/models';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';

@Component({
  selector: 'app-screenshot-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe],
  templateUrl: './screenshot-index.component.html',
  styleUrl: './screenshot-index.component.css'
})
export class ScreenshotIndexComponent implements OnInit {
  private svc = inject(ScreenshotService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  auth = inject(AuthService);

  screenshots: ScreenshotDto[] = [];
  lightboxSrc = '';
  lightboxCaption = '';
  showModal = false;
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: s => this.screenshots = s,
      error: () => this.toastService.error('Failed to load screenshots')
    });
  }

  openModal(src: string, caption: string): void {
    this.lightboxSrc = src;
    this.lightboxCaption = caption;
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  async delete(id: number): Promise<void> {
    const confirmed = await this.confirmService.confirm('Delete this screenshot?');
    if (confirmed) {
      this.svc.delete(id).subscribe({
        next: () => {
          this.screenshots = this.screenshots.filter(s => s.id !== id);
          this.toastService.success('Screenshot deleted');
        },
        error: () => this.toastService.error('Failed to delete screenshot')
      });
    }
  }
}