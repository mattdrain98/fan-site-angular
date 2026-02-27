import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HomeService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);
  private router = inject(Router);

  latestPosts: PostListingModel[] = [];
  searchQuery = '';
  loading = true;

  ngOnInit(): void {
    this.homeService.getHomeIndex().subscribe({
      next: data => { this.latestPosts = data.latestPosts; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }
}
