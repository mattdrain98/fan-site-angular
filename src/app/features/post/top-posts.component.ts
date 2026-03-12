import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { PostListingModel } from '../../core/models';

@Component({
  selector: 'app-top-posts',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe],
  templateUrl: './top-posts.component.html',
  styleUrl: './top-posts.component.css'
})
export class TopPostsComponent implements OnInit {
  private postService = inject(PostService);
  auth = inject(AuthService);

  posts: PostListingModel[] = [];
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void {
    this.postService.getTopPosts().subscribe(p => this.posts = p);
  }

  deletePost(postId: number): void {
    if (!confirm('Delete this post?')) return;
    this.postService.delete(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
      },
      error: () => alert('Failed to delete post')
    });
  }
}