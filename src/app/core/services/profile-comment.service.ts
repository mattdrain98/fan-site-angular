import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileCommentModel } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfileCommentService {
  private base = `${environment.apiBaseUrl}/profilecomment`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/profilecomment/{id}
   * Returns a pre-filled ProfileCommentModel for the comment form.
   * {id} is the profile owner's userId (string).
   * Returns: ProfileCommentModel with author + target user fields pre-populated.
   * Requires auth
   */
  getCommentTemplate(profileUserId: string): Observable<ProfileCommentModel> {
    return this.http.get<ProfileCommentModel>(`${this.base}/${profileUserId}`);
  }

  /**
   * POST /api/profilecomment
   * Body: ProfileCommentModel — must include: commentContent, userId (profile owner)
   * Returns: 201 Created with the created comment
   * Requires auth
   */
  addComment(payload: ProfileCommentModel): Observable<ProfileCommentModel> {
    return this.http.post<ProfileCommentModel>(this.base, payload);
  }
}
