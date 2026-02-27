import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchService } from '../../core/services/services';
import { SearchResultModel } from '../../core/models';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './search-results.component.html'
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);

  result: SearchResultModel | null = null;
  searchQuery = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] ?? '';
      if (this.searchQuery) this.search();
    });
  }

  search(): void {
    this.searchService.search(this.searchQuery).subscribe(r => this.result = r);
  }

  submit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }
}
