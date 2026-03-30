import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileCommentDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfileCommentService {
  private base = `${environment.apiBaseUrl}/profilecomment`;
  constructor(private http: HttpClient) {}

  getCommentTemplate(profileUserId: string): Observable<ProfileCommentDto> {
    return this.http.get<ProfileCommentDto>(`${this.base}/${profileUserId}`);
  }

  addComment(payload: { profileUserId: string; commentContent: string }): Observable<void> {
    return this.http.post<void>(`${this.base}/add`, payload);
  }

  edit(id: number, commentContent: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, { commentContent });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}