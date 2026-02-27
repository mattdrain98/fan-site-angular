import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../core/services/services';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-edit.component.html'
})
export class PostEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private router = inject(Router);

  postId!: number;
  model = { title: '', content: '' };
  forumName = '';
  errors: string[] = [];

  ngOnInit(): void {
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(this.postId).subscribe(p => {
      this.model.title = p.title;
      this.model.content = p.postContent;
      this.forumName = p.forumName;
    });
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.postService.edit(this.postId, this.model.title, this.model.content).subscribe({
      next: () => this.router.navigate(['/post', this.postId]),
      error: () => this.errors = ['Failed to edit post']
    });
  }
}
