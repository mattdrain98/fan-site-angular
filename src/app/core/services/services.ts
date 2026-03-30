import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PostDetailDto, PostReplyDto,
  ScreenshotDto, ProfileDto, ProfileCommentDto,
  SearchResultDto,
  PostDto,
  ForumDto
} from '../models';

// ── Forum ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/forum`;

  getAll(): Observable<ForumDto[]> {
    return this.http.get<ForumDto[]>(this.base);
  }

  getById(id: number, searchQuery?: string, page: number = 1): Observable<SearchResultDto> {
    let params = new HttpParams()
      .set('page', page.toString());
    if (searchQuery) params = params.set('searchQuery', searchQuery);
    return this.http.get<SearchResultDto>(`${this.base}/${id}`, { params });
  }

  create(title: string, description?: string): Observable<unknown> {
    return this.http.post(this.base, { title, description });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

// ── Post ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/posts`;

  getById(id: number): Observable<PostDetailDto> {
    return this.http.get<PostDetailDto>(`${this.base}/${id}`);
  }

  getUserPosts(page: number = 1): Observable<{ posts: PostDto[]; page: number; totalPages: number; totalUserPosts: number }> {
    return this.http.get<{ posts: PostDto[]; page: number; totalPages: number; totalUserPosts: number }>(
      `${this.base}/user?page=${page}&pageSize=6`
    );
  }

  getTopPosts(page: number = 1): Observable<PostDto[]> {
    return this.http.get<{ posts: PostDto[] }>(`${this.base}/top?page=${page}`)
      .pipe(map(response => response.posts));
  }

  getLatestPosts(page: number = 1): Observable<{ posts: PostDto[]; page: number; totalPages: number; totalPosts: number }> {
    return this.http.get<{ posts: PostDto[]; page: number; totalPages: number; totalPosts: number }>(
      `${this.base}/latest?page=${page}`
    );
  }

  getLikedPosts(page: number = 1): Observable<{ posts: PostDto[]; page: number; totalPages: number; totalPosts: number }> {
    return this.http.get<{ posts: PostDto[]; page: number; totalPages: number; totalPosts: number }>(
      `${this.base}/liked?page=${page}&pageSize=6`
    );
  }

  add(title: string, content: string, forumId: number): Observable<PostDto> {
    return this.http.post<PostDetailDto>(this.base, { title, content, forumId });
  }

  edit(id: number, title: string, content: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, { title, content });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleLike(postId: number): Observable<number> {
    return this.http.post<number>(`${this.base}/${postId}/likes`, {});
  }
}

// ── Reply ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ReplyService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/reply`;

  getTemplate(postId: number): Observable<PostReplyDto> {
    return this.http.get<PostReplyDto>(`${this.base}/create/${postId}`);
  }

  add(payload: PostReplyDto): Observable<{ message: string; postId: number }> {
    return this.http.post<{ message: string; postId: number }>(`${this.base}/add`, payload);
  }
}

// ── Screenshot ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ScreenshotService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/screenshot`;

  getAll(): Observable<ScreenshotDto[]> {
    return this.http.get<ScreenshotDto[]>(this.base);
  }

  getUserScreenshots(): Observable<ScreenshotDto[]> {
    return this.http.get<ScreenshotDto[]>(`${this.base}/user`);
  }

  add(title: string, content: string, imageFile?: File): Observable<{ message: string; screenshotId: number }> {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    if (imageFile) fd.append('imageFile', imageFile);
    return this.http.post<{ message: string; screenshotId: number }>(this.base, fd);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}

// ── Profile ────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/profile`;

  getProfile(id: string): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${this.base}/${id}`);
  }

  toggleFollow(id: string): Observable<{ followers: number; following: number }> {
    return this.http.post<{ followers: number; following: number }>(`${this.base}/UpdateFollows/${id}`, {});
  }

  getFollowers(id: string): Observable<{ userName: string; followersCount: number; followers: string[] }> {
    return this.http.get<any>(`${this.base}/Followers/${id}`);
  }

  getFollowing(id: string): Observable<{ userName: string; followingCount: number; following: string[] }> {
    return this.http.get<any>(`${this.base}/Following/${id}`);
  }

  editBio(userId: string, bio: string, userName: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/EditBio`, { userId, bio, userName });
  }

  editUsername(userId: string, userName: string, bio?: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/EditUsername`, { userId, userName, bio });
  }

  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.base}/UploadProfileImage`, fd);
  }
}

// ── Profile Comment ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProfileCommentService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/profilecomment`;

  getTemplate(profileUserId: string): Observable<ProfileCommentDto> {
    return this.http.get<ProfileCommentDto>(`${this.base}/${profileUserId}`);
  }

  add(payload: ProfileCommentDto): Observable<ProfileCommentDto> {
    return this.http.post<ProfileCommentDto>(this.base, payload);
  }
}

// ── Search ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  search(query: string): Observable<SearchResultDto> {
    return this.http.get<SearchResultDto>(`${environment.apiBaseUrl}/search`, {
      params: new HttpParams().set('query', query)
    });
  }
}
