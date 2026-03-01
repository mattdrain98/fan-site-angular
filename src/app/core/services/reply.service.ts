import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostReplyDto, ProfileCommentDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ReplyService {
  private base = `${environment.apiBaseUrl}/reply`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/reply/create/{postId}
   * Returns a pre-filled PostReplyDto for the reply form.
   * Fields: postId, postTitle, postContent, authorId, authorName,
   *         authorImageUrl, authorRating, date, forumId, forumName
   * Requires auth (uses User.Identity.Name server-side)
   */
  getReplyTemplate(postId: number): Observable<PostReplyDto> {
    return this.http.get<PostReplyDto>(`${this.base}/create/${postId}`);
  }

  /**
   * POST /api/reply/add
   * Body: PostReplyDto (include replyContent + postId at minimum)
   * Returns: { message: string, postId: number }
   * Requires auth
   */
  addReply(postId: number, replyContent: string): Observable<{ message: string; postId: number }> {
    return this.http.post<{ message: string; postId: number }>(`${this.base}/add`, { postId, replyContent });
  }

  edit(id: number, content: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, { content });
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
