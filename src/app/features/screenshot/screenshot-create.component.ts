import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenshotService } from '../../core/services/services';

@Component({
  selector: 'app-screenshot-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './screenshot-create.component.html'
})
export class ScreenshotCreateComponent {
  private svc = inject(ScreenshotService);
  private router = inject(Router);

  model = { title: '', content: '' };
  selectedFile: File | null = null;
  errors: string[] = [];

  onFileChange(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.svc.add(this.model.title, this.model.content, this.selectedFile ?? undefined).subscribe({
      next: () => this.router.navigate(['/screenshots']),
      error: () => this.errors = ['Failed to upload screenshot']
    });
  }
}
