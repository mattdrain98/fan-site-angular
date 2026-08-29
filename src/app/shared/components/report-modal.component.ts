import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportDialogService } from 'src/app/core/services/report-dialog.service';
import { ToastService } from 'src/app/core/services/toast.service';

const REASONS = [
  'Spam or advertising',
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Inappropriate content',
  'Misinformation',
  'Other',
];

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
  @if (reportService.visible()) {
    <div class="report-overlay" (click)="reportService.close()">
      <div class="report-box" (click)="$event.stopPropagation()">
        <div class="report-header">
          <i class="material-icons">flag</i>
          <span>Report Content</span>
          <button class="report-close" (click)="reportService.close()">
            <i class="material-icons">close</i>
          </button>
        </div>

        @if (reportService.context(); as ctx) {
          <p class="report-subtitle">
            Reporting: <strong>{{ ctx.contentType }}{{ ctx.contentLabel ? ' — ' + ctx.contentLabel : '' }}</strong>
          </p>
        }

        <div class="report-reasons">
          @for (r of reasons; track r) {
            <button
              class="reason-btn"
              [class.selected]="selectedReason === r"
              (click)="selectedReason = r">
              {{ r }}
            </button>
          }
        </div>

        <textarea
          class="report-details"
          [(ngModel)]="details"
          placeholder="Additional details (optional)"
          rows="3">
        </textarea>

        <div class="report-actions">
          <button class="report-cancel" (click)="reportService.close()">Cancel</button>
          <button class="report-submit" [disabled]="!selectedReason || submitting" (click)="submit()">
            @if (submitting) { <i class="material-icons spin">sync</i> } @else { Submit Report }
          </button>
        </div>
      </div>
    </div>
  }
  `,
  styleUrl: './report-modal.component.css'
})
export class ReportModalComponent {
  reportService = inject(ReportDialogService);
  private toast = inject(ToastService);

  reasons = REASONS;
  selectedReason = '';
  details = '';
  submitting = false;

  submit(): void {
    const ctx = this.reportService.context();
    if (!ctx || !this.selectedReason) return;

    this.submitting = true;
    this.reportService.submit({
      targetUserId: ctx.targetUserId,
      contentType: ctx.contentType,
      contentId: ctx.contentId,
      reason: this.selectedReason,
      details: this.details || undefined,
    }).subscribe({
      next: res => {
        this.toast.success(res.message);
        this.selectedReason = '';
        this.details = '';
        this.submitting = false;
        this.reportService.close();
      },
      error: err => {
        this.toast.error(err.error?.message ?? 'Failed to submit report');
        this.submitting = false;
      }
    });
  }
}
