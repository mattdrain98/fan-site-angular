import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { PostListingModel } from '../../core/models';
import { Router } from '@angular/router';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-top-posts',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe],
  templateUrl: './top-posts.component.html',
  styleUrl: './top-posts.component.css'
})
export class TopPostsComponent implements OnInit {
  private postService = inject(PostService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);
  auth = inject(AuthService);

  posts: PostListingModel[] = [];
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void {
    this.postService.getTopPosts().subscribe({
      next: p => this.posts = p,
      error: () => this.toastService.error('Failed to load top posts')
    });
  }

  async deletePost(postId: number, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = await this.confirmService.confirm('Delete this post?');
    if (confirmed) {
      this.postService.delete(postId).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== postId);
          this.toastService.success('Post deleted successfully');
        },
        error: () => this.toastService.error('Failed to delete post')
      });
    }
  }

  navigateToProfile(event: MouseEvent, authorId: string) {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/profile', authorId]);
  }
}