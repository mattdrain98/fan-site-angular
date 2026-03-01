import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService, ForumService } from '../../core/services/services';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-create.component.html'
})
export class PostCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private forumService = inject(ForumService);
  private router = inject(Router);

  forumId!: number;
  forumName = '';
  model = { title: '', content: '' };
  errors: string[] = [];

  ngOnInit(): void {
    this.forumId = +this.route.snapshot.paramMap.get('forumId')!;
    this.forumService.getById(this.forumId).subscribe({
      next: (forum) => this.forumName = forum.forum.name,
      error: () => this.errors = ['Failed to load forum']
    });
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.postService.add(this.model.title, this.model.content, this.forumId).subscribe({
      next: () => this.router.navigate(['/forum', this.forumId]),
      error: () => this.errors = ['Failed to create post']
    });
  }
}