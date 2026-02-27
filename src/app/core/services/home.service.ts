import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomeIndexModel } from '../models';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private base = `${environment.apiBaseUrl}/home`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/home
   * Returns: HomeIndexModel
   * Fields: latestPosts (PostListingModel[] — latest 10), searchQuery (empty string)
   * Each PostListingModel includes: id, title, authorName, authorId, authorRating,
   *   totalLikes, datePosted, repliesCount, forum (ForumListingModel), forumName
   */
  getHomeIndex(): Observable<HomeIndexModel> {
    return this.http.get<HomeIndexModel>(this.base);
  }
}
