import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReplyService } from '../../core/services/services';
import { PostReplyDto } from '../../core/models';

@Component({
  selector: 'app-reply-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reply-create.component.html'
})
export class ReplyCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private replyService = inject(ReplyService);
  private router = inject(Router);

  template: PostReplyDto | null = null;
  replyContent = '';
  errors: string[] = [];

  ngOnInit(): void {
    const postId = +this.route.snapshot.paramMap.get('postId')!;
    this.replyService.getTemplate(postId).subscribe(t => this.template = t);
  }

  submit(form: NgForm): void {
    if (form.invalid || !this.template) return;
    const payload: PostReplyDto = { ...this.template, replyContent: this.replyContent };
    this.replyService.add(payload).subscribe({
      next: res => this.router.navigate(['/post', res.postId]),
      error: () => this.errors = ['Failed to submit reply']
    });
  }
}
