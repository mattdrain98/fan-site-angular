import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SearchResultModel } from '../models';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private base = `${environment.apiBaseUrl}/search`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/search?query=keyword
   * Returns: SearchResultModel
   * Fields: posts (PostListingModel[]), searchQuery, emptySearchResults (boolean)
   */
  searchGet(query: string): Observable<SearchResultModel> {
    const params = new HttpParams().set('query', query);
    return this.http.get<SearchResultModel>(this.base, { params });
  }

  /**
   * POST /api/search
   * Body: { query: string }
   * Returns: SearchResultModel (same shape as GET version)
   * Use this if you prefer POST for search (e.g. avoiding query string logging)
   */
  searchPost(query: string): Observable<SearchResultModel> {
    return this.http.post<SearchResultModel>(this.base, { query });
  }
}
