import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ForumService } from '../../core/services/services';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-forum-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forum-create.component.html',
  styleUrl: './forum-create.component.css'
})

export class ForumCreateComponent {
  private forumService = inject(ForumService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  model = { title: '', description: '' };
  errors: string[] = [];
  users: any;
  defaultImage: any;

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.forumService.create(this.model.title, this.model.description).subscribe({
      next: () => {
        this.router.navigate(['/forum']);
        this.toastService.success('Forum created successfully!');
      },
      error: () => this.toastService.error('Failed to create forum')
    });
  }
}
