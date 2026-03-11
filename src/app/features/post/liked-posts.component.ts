import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liked-posts',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './liked-posts.component.html',
  styleUrl: './liked-posts.component.css'
})

export class LikedPostsComponent implements OnInit {
  
  likedPosts: PostListingModel[] = [];
  searchQuery = '';
  loading = true;

  private postService = inject(PostService);
  private router = inject(Router);

  ngOnInit(): void {
    this.postService.getLikedPosts().subscribe({
      next: data => { this.likedPosts = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }
}
