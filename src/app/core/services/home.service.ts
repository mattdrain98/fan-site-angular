import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ForumDto, HomeStatsDto, PostDto, ScreenshotDto } from '../models';  // reuse your existing model

@Injectable({ providedIn: 'root' })
export class HomeService {
  private base = `${environment.apiBaseUrl}/home`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/home/latest?count=10
   * Latest posts for the home page panel
   */
  getLatestPosts(count: number = 10): Observable<PostDto[]> {
    const params = new HttpParams().set('count', count);
    return this.http.get<PostDto[]>(`${this.base}/latest-posts`, { params });
  }

  /**
   * GET /api/home/top?count=5&days=7
   * Top posts by likes within the last N days
   */
  getTopPosts(count: number = 5, days: number = 7): Observable<PostDto[]> {
    const params = new HttpParams()
      .set('count', count)
      .set('days', days);
    return this.http.get<PostDto[]>(`${this.base}/top`, { params });
  }

    /**
     * GET /api/media/latest?count=8
     * Returns the N most recent media posts, for use on the home page
     * Returns: MediaDto[]
     */
    getLatestScreenshots(count: number = 8): Observable<ScreenshotDto[]> {
      const params = new HttpParams().set('count', count);
      return this.http.get<ScreenshotDto[]>(`${this.base}/screenshots`, { params });
    }

     /**
     * GET /api/media/top-forums?count=5
     * Returns the N top forums, for use on the home page
     * Returns: ForumDto[]
     */
    getMostActive(count: number = 5): Observable<ForumDto[]> {
      const params = new HttpParams().set('count', count);
      return this.http.get<ForumDto[]>(`${this.base}/top-forums`, { params });
    }

    /**
   * GET /api/home/stats
   * Real counts for members, posts, forums, replies
   */
    getStats(): Observable<HomeStatsDto> {
      return this.http.get<HomeStatsDto>(`${this.base}/stats`);
    }
}