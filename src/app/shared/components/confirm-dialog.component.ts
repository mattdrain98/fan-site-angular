import { Component, inject } from '@angular/core';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  template: `
  @if (confirmService.visible()) {
    <div class="confirm-overlay" (click)="confirmService.decline()">
      <div class="confirm-box" (click)="$event.stopPropagation()">
        <i class="material-icons confirm-icon">help_outline</i>
        <p class="confirm-message">{{ confirmService.message() }}</p>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" (click)="confirmService.decline()">Cancel</button>
          <button class="confirm-btn ok" (click)="confirmService.accept()">Confirm</button>
        </div>
      </div>
    </div>
  }
`,
styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);
}