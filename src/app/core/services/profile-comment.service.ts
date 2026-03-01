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

  addComment(payload: ProfileCommentDto): Observable<ProfileCommentDto> {
    return this.http.post<ProfileCommentDto>(this.base, payload);
  }

  edit(id: number, content: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, { content });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}