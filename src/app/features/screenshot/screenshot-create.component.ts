import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenshotService } from '../../core/services/services';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-screenshot-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './screenshot-create.component.html',
  styleUrl: './screenshot-create.component.css'
})
export class ScreenshotCreateComponent {
  private svc = inject(ScreenshotService);
  private router = inject(Router);
  private toasterService = inject(ToastService);  
  
  model = { title: '', content: '' };
  selectedFile: File | null = null;
  errors: string[] = [];

  onFileChange(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.svc.add(this.model.title, this.model.content, this.selectedFile ?? undefined).subscribe({
      next: () => {        
        this.router.navigate(['/screenshots']);
        this.toasterService.success('Screenshot uploaded successfully');
      },
      error: () => this.toasterService.error('Failed to upload screenshot')
    });
  }
}
