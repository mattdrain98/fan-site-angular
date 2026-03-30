import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReplyService {
  private base = `${environment.apiBaseUrl}/reply`;

  constructor(private http: HttpClient) {}

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