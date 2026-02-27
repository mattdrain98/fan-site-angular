import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PostIndexModel,
  PostListingModel,
  NewPostModel,
  PostEditModel,
  PostTopicModel
} from '../models';

@Injectable({ providedIn: 'root' })
export class PostService {
  private base = `${environment.apiBaseUrl}/post`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/post/{id}
   * Returns: PostIndexModel
   * Includes: id, title, authorName, authorId, authorRating, authorImageUrl,
   *           date, postContent, replies (PostReplyModel[]), totalLikes,
   *           likes, forumId, forumName, userHasLiked
   */
  getById(id: number): Observable<PostIndexModel> {
    return this.http.get<PostIndexModel>(`${this.base}/${id}`);
  }

  /**
   * GET /api/post/user
   * Returns posts belonging to the currently logged-in user
   * Returns: PostListingModel[]
   * Fields: id, title, authorId, authorName, authorRating, datePosted,
   *         forumId, forumName, totalLikes, repliesCount
   */
  getUserPosts(): Observable<PostListingModel[]> {
    return this.http.get<PostListingModel[]>(`${this.base}/user`);
  }

  /**
   * POST /api/post
   * Body: { title, content, forumId }
   * Returns: PostIndexModel (201 Created)
   * Requires auth
   */
  add(payload: NewPostModel): Observable<PostIndexModel> {
    return this.http.post<PostIndexModel>(this.base, payload);
  }

  /**
   * POST /api/post/search
   * Body: { searchQuery: string }
   * Returns: PostListingModel[]
   */
  search(searchQuery: string): Observable<PostListingModel[]> {
    return this.http.post<PostListingModel[]>(`${this.base}/search`, { searchQuery });
  }

  /**
   * POST /api/post/{id}/likes
   * Toggles like for the current user (add if not liked, remove if already liked)
   * Returns: number (new total likes count)
   * Requires auth
   */
  toggleLike(postId: number): Observable<number> {
    return this.http.post<number>(`${this.base}/${postId}/likes`, {});
  }

  /**
   * PUT /api/post/{id}
   * Body: { title, content }
   * Returns: 204 No Content
   * Requires auth
   */
  edit(id: number, payload: PostEditModel): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }

  /**
   * DELETE /api/post/{id}
   * Returns: 204 No Content
   * Requires auth
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
