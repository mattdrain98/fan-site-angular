import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './latest-posts.component.html'
})
export class LatestPostsComponent implements OnInit {
  private postService = inject(PostService);
  private router = inject(Router);

  latestPosts: PostListingModel[] = [];
  searchQuery = '';
  loading = true;

  ngOnInit(): void {
    this.postService.getLatestPosts().subscribe({
      next: data => { this.latestPosts = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }
}
