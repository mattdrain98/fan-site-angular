import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';  
import { ProfileCommentService } from '../../core/services/services';
import { ProfileCommentDto } from '../../core/models';

@Component({
  selector: 'app-profile-comment-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile-comment-create.component.html'
})
export class ProfileCommentCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProfileCommentService);
  private router = inject(Router);

  template: ProfileCommentDto | null = null;
  commentContent = '';
  errors: string[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    console.log('Profile owner ID:', id);
    this.svc.getTemplate(id).subscribe(t => {
      console.log('Template:', t);
      this.template = t;
    });
  }

  submit(form: NgForm): void {
    if (!this.template) return;
    const payload: ProfileCommentDto = { ...this.template, commentContent: this.commentContent };
    this.svc.add(payload).subscribe({
      next: () => this.router.navigate(['/profile', this.template!.commentUserId]),
      error: () => this.errors = ['Failed to submit comment']
    });
  }
}
