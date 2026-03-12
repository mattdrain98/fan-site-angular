import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.css'
})
export class UserPostsComponent implements OnInit {
  private postService = inject(PostService);

  posts: PostListingModel[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1 || page > 100) return;
    this.loading = true;

    this.postService.getUserPosts(page).subscribe({
      next: data => {
        this.posts = data.posts;
        this.currentPage = data.page;
        this.totalPages = Math.min(data.totalPages, 100);
        this.totalPosts = data.totalUserPosts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
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

  delete(id: number): void {
    if (confirm('Delete this post?')) {
      this.postService.delete(id).subscribe(() => this.loadPage(this.currentPage));
    }
  }
}