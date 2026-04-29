import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PostDto,
  AddPostDto,
  EditPostDto,
  PostDetailDto
} from '../models';

@Injectable({ providedIn: 'root' })
export class PostService {
  private base = `${environment.apiBaseUrl}/posts`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/post/{id}
   * Returns: PostIndexModel
   * Includes: id, title, authorName, authorId, authorRating, authorImageUrl,
   *           date, postContent, replies (PostReplyModel[]), totalLikes,
   *           likes, forumId, forumName, userHasLiked
   */
  getById(id: number): Observable<PostDetailDto> {
    return this.http.get<PostDetailDto>(`${this.base}/${id}`);
  }

  /**
   * GET /api/post/user
   * Returns posts belonging to the currently logged-in user
   * Returns: PostDetailDto[]
   * Fields: id, title, authorId, authorName, authorRating, datePosted,
   *         forumId, forumName, totalLikes, repliesCount
   */
  getUserPosts(): Observable<PostDetailDto[]> {
    return this.http.get<PostDetailDto[]>(`${this.base}/user`);
  }

  /**
   * POST /api/post/create
   * Body: { title, content, forumId, imageUrls }
   * Returns: PostDetailDto (201 Created)
   * Requires auth
   */
  add(payload: AddPostDto): Observable<PostDetailDto> {
    return this.http.post<PostDetailDto>(`${this.base}/create`, payload);
  }

  /**
   * POST /api/post/search
   * Body: { searchQuery: string }
   * Returns: PostListingModel[]
   */
  search(searchQuery: string): Observable<PostDetailDto[]> {
    return this.http.post<PostDetailDto[]>(`${this.base}/search`, { searchQuery });
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
  edit(id: number, payload: EditPostDto): Observable<void> {
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
