import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScreenshotDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ScreenshotService {
  private base = `${environment.apiBaseUrl}/screenshot`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/screenshot
   * Returns: ScreenshotDto[]
   * Fields: id, title, content, authorId, authorName, authorRating,
   *         datePosted, imageUrl, slug
   */
  getAll(): Observable<ScreenshotDto[]> {
    return this.http.get<ScreenshotDto[]>(this.base);
  }

  /**
   * GET /api/screenshot/user
   * Returns screenshots for the currently logged-in user
   * Returns: ScreenshotDto[]
   * Requires auth
   */
  getUserScreenshots(): Observable<ScreenshotDto[]> {
    return this.http.get<ScreenshotDto[]>(`${this.base}/user`);
  }

  /**
   * POST /api/screenshot
   * Body: FormData — fields: title (string), content (string), imageFile (File)
   * Returns: { message: string, screenshotId: number }
   * Requires auth
   */
  add(title: string, content: string, imageFile?: File): Observable<{ message: string; screenshotId: number }> {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    if (imageFile) fd.append('imageFile', imageFile);
    return this.http.post<{ message: string; screenshotId: number }>(this.base, fd);
  }

  /**
   * DELETE /api/screenshot/{id}
   * Returns: { message: string }
   * Requires auth
   */
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
