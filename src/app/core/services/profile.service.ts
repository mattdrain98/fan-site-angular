import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileModel, ProfileEditModel } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = `${environment.apiBaseUrl}/profile`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/profile/{id}
   * Returns: ProfileModel
   * Fields: userId, userName, userRating, profileImageUrl, memberSince,
   *         following, followers, follows, followings, profileComments, bio
   */
  getProfile(userId: string): Observable<ProfileModel> {
    return this.http.get<ProfileModel>(`${this.base}/${userId}`);
  }

  /**
   * POST /api/profile/UpdateFollows/{id}
   * Toggles follow/unfollow for the target user
   * Returns: { followers: number, following: number }
   * Requires auth
   */
  toggleFollow(userId: string): Observable<{ followers: number; following: number }> {
    return this.http.post<{ followers: number; following: number }>(
      `${this.base}/UpdateFollows/${userId}`, {}
    );
  }

  /**
   * GET /api/profile/Followers/{id}
   * Returns: { userName, followersCount, followers: string[] }
   */
  getFollowers(userId: string): Observable<{ userName: string; followersCount: number; followers: string[] }> {
    return this.http.get<{ userName: string; followersCount: number; followers: string[] }>(
      `${this.base}/Followers/${userId}`
    );
  }

  /**
   * GET /api/profile/Following/{id}
   * Returns: { userName, followingCount, following: string[] }
   */
  getFollowing(userId: string): Observable<{ userName: string; followingCount: number; following: string[] }> {
    return this.http.get<{ userName: string; followingCount: number; following: string[] }>(
      `${this.base}/Following/${userId}`
    );
  }

  /**
   * PUT /api/profile/EditBio
   * Body: { userId, bio, userName }
   * Returns: { message: string }
   * Requires auth
   */
  editBio(payload: ProfileEditModel): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/EditBio`, payload);
  }

  /**
   * PUT /api/profile/EditUsername
   * Body: { userId, bio, userName }
   * Returns: { message: string }
   * Note: server signs the user out after username change — redirect to login
   * Requires auth
   */
  editUsername(payload: ProfileEditModel): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/EditUsername`, payload);
  }

  /**
   * POST /api/profile/UploadProfileImage
   * Body: FormData — field: file (image)
   * Returns: { imageUrl: string } (Azure Blob URL)
   * Requires auth
   */
  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.base}/UploadProfileImage`, fd);
  }
}
