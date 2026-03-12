import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liked-posts',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, AsyncPipe],
  templateUrl: './liked-posts.component.html',
  styleUrl: './liked-posts.component.css'
})
export class LikedPostsComponent implements OnInit {
  private postService = inject(PostService);
  private router = inject(Router);

  likedPosts: PostListingModel[] = [];
  searchQuery = '';
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

    this.postService.getLikedPosts(page).subscribe({
      next: data => {
        this.likedPosts = data.posts;
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