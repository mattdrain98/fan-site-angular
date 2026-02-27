import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ForumListingModel, ForumTopicModel, AddForumModel } from '../models';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private base = `${environment.apiBaseUrl}/forum`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/forum
   * Returns: ForumListingModel[]
   * Fields: id, name, description, authorId, authorName, authorRating
   */
  getAll(): Observable<ForumListingModel[]> {
    return this.http.get<ForumListingModel[]>(this.base);
  }

  /**
   * GET /api/forum/{id}?searchQuery=xyz
   * Returns: ForumTopicModel { posts: PostListingModel[], forum: ForumListingModel }
   * searchQuery is optional — omit param to get all posts in the forum
   */
  getById(id: number, searchQuery?: string): Observable<ForumTopicModel> {
    let params = new HttpParams();
    if (searchQuery) params = params.set('searchQuery', searchQuery);
    return this.http.get<ForumTopicModel>(`${this.base}/${id}`, { params });
  }

  /**
   * POST /api/forum
   * Body: { title, description? }
   * Returns: the created Forum entity
   * Requires auth (uses User identity server-side)
   */
  create(payload: AddForumModel): Observable<unknown> {
    return this.http.post(`${this.base}`, payload);
  }

  /**
   * DELETE /api/forum/{id}
   * Returns: 204 No Content
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
