import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediaDto } from '../models';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private base = `${environment.apiBaseUrl}/media`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/media
   * Returns all media items (images, clips, etc.)
   * Returns: MediaDto[]
   * Fields: id, title, content, authorId, authorName, authorRating,
   *         datePosted, imageUrl, mediaType, slug
   */
  getAll(): Observable<MediaDto[]> {
    return this.http.get<MediaDto[]>(this.base);
  }

  /**
   * GET /api/media/latest?count=8
   * Returns the N most recent media posts, for use on the home page
   * Returns: MediaDto[]
   */
  getLatest(count: number = 8): Observable<MediaDto[]> {
    const params = new HttpParams().set('count', count);
    return this.http.get<MediaDto[]>(`${this.base}/latest`, { params });
  }

  /**
   * GET /api/media/{id}
   * Returns a single media item by id
   * Returns: MediaDto
   */
  getById(id: number): Observable<MediaDto> {
    return this.http.get<MediaDto>(`${this.base}/${id}`);
  }

  /**
   * GET /api/media/slug/{slug}
   * Returns a single media item by slug
   * Returns: MediaDto
   */
  getBySlug(slug: string): Observable<MediaDto> {
    return this.http.get<MediaDto>(`${this.base}/slug/${slug}`);
  }

  /**
   * GET /api/media/user
   * Returns media posted by the currently logged-in user
   * Returns: MediaDto[]
   * Requires auth
   */
  getUserMedia(): Observable<MediaDto[]> {
    return this.http.get<MediaDto[]>(`${this.base}/user`);
  }

  /**
   * POST /api/media
   * Body: FormData — fields: title (string), content (string), imageFile (File)
   * Returns: { message: string, mediaId: number }
   * Requires auth
   */
  add(title: string, content: string, imageFile?: File): Observable<{ message: string; mediaId: number }> {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    if (imageFile) fd.append('imageFile', imageFile);
    return this.http.post<{ message: string; mediaId: number }>(this.base, fd);
  }

  /**
   * PUT /api/media/{id}
   * Body: FormData — fields: title (string), content (string), imageFile? (File)
   * Returns: { message: string }
   * Requires auth — only the post owner or an admin can edit
   */
  update(id: number, title: string, content: string, imageFile?: File): Observable<{ message: string }> {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    if (imageFile) fd.append('imageFile', imageFile);
    return this.http.put<{ message: string }>(`${this.base}/${id}`, fd);
  }

  /**
   * DELETE /api/media/{id}
   * Returns: { message: string }
   * Requires auth — only the post owner or an admin can delete
   */
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}