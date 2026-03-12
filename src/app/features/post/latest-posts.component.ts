import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { PostListingModel } from '../../core/models';

@Component({
  selector: 'app-latest-posts',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, AsyncPipe],
  templateUrl: './latest-posts.component.html',
  styleUrl: './latest-posts.component.css'
})
export class LatestPostsComponent implements OnInit {
  private postService = inject(PostService);
  private router = inject(Router);
  auth = inject(AuthService);

  latestPosts: PostListingModel[] = [];
  searchQuery = '';
  loading = true;
  currentUser$ = this.auth.currentUser$;

  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1 || page > 100) return;
    this.loading = true;

    this.postService.getLatestPosts(page).subscribe({
      next: data => {
        this.latestPosts = data.posts;
        this.currentPage = data.page;
        this.totalPages = Math.min(data.totalPages, 100);
        this.totalPosts = data.totalPosts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deletePost(postId: number): void {
    if (!confirm('Delete this post?')) return;
    this.postService.delete(postId).subscribe({
      next: () => this.loadPage(this.currentPage),
      error: () => alert('Failed to delete post')
    });
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }
}