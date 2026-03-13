import { Component, effect, inject, ViewEncapsulation } from '@angular/core';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="app-toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="app-toast app-toast-{{ toast.type }}" [class.dismissing]="isDismissing(toast.id)">
          <i class="material-icons">{{ iconMap[toast.type] }}</i>
          <span>{{ toast.message }}</span>
          <button class="app-toast-close" (click)="dismiss(toast.id)">
            <i class="material-icons">close</i>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  toastService = inject(ToastService);
  dismissingIds = new Set<number>();

  iconMap: Record<string, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  dismiss(id: number) {
    this.dismissingIds.add(id);
    setTimeout(() => {
      this.dismissingIds.delete(id);
      this.toastService.dismiss(id);
    }, 200);
  }

  isDismissing(id: number) {
    return this.dismissingIds.has(id);
  }

  constructor() {
    effect(() => {
      console.log('toasts array:', this.toastService.toasts());
    });
  }
}
