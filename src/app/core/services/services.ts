import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ForumListingModel, ForumTopicModel,
  PostIndexModel, PostListingModel, PostReplyDto,
  ScreenshotDto, ProfileModel, ProfileCommentModel,
  HomeIndexModel, SearchResultModel, ApplicationUser
} from '../models';

// ── Forum ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/forum`;

  getAll(): Observable<ForumListingModel[]> {
    return this.http.get<ForumListingModel[]>(this.base);
  }

  getById(id: number, searchQuery?: string): Observable<ForumTopicModel> {
    let params = new HttpParams();
    if (searchQuery) params = params.set('searchQuery', searchQuery);
    return this.http.get<ForumTopicModel>(`${this.base}/${id}`, { params });
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
  private base = `${environment.apiBaseUrl}/post`;

  getById(id: number): Observable<PostIndexModel> {
    return this.http.get<PostIndexModel>(`${this.base}/${id}`);
  }

  getUserPosts(): Observable<PostListingModel[]> {
    return this.http.get<PostListingModel[]>(`${this.base}/user`);
  }

  getTopPosts(): Observable<PostListingModel[]> {
    return this.http.get<PostListingModel[]>(`${this.base}/top`);
  }

  add(title: string, content: string, forumId: number): Observable<PostIndexModel> {
    return this.http.post<PostIndexModel>(this.base, { title, content, forumId });
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

  getProfile(id: string): Observable<ProfileModel> {
    return this.http.get<ProfileModel>(`${this.base}/${id}`);
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

  getTemplate(profileUserId: string): Observable<ProfileCommentModel> {
    return this.http.get<ProfileCommentModel>(`${this.base}/${profileUserId}`);
  }

  add(payload: ProfileCommentModel): Observable<ProfileCommentModel> {
    return this.http.post<ProfileCommentModel>(this.base, payload);
  }
}

// ── Home ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);

  getHomeIndex(): Observable<HomeIndexModel> {
    return this.http.get<HomeIndexModel>(`${environment.apiBaseUrl}/home`);
  }
}

// ── Search ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  search(query: string): Observable<SearchResultModel> {
    return this.http.get<SearchResultModel>(`${environment.apiBaseUrl}/search`, {
      params: new HttpParams().set('query', query)
    });
  }
}
