import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ForumService } from '../../core/services/services';

@Component({
  selector: 'app-forum-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forum-create.component.html'
})
export class ForumCreateComponent {
  private forumService = inject(ForumService);
  private router = inject(Router);

  model = { title: '', description: '' };
  errors: string[] = [];
  users: any;
  defaultImage: any;

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.forumService.create(this.model.title, this.model.description).subscribe({
      next: () => this.router.navigate(['/forum']),
      error: () => this.errors = ['Failed to create forum']
    });
  }
}
