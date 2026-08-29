import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApplicationUser } from '../models';

export interface CurrentUser {
  userId: string;
  userName: string;
  imagePath?: string;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiBaseUrl}/account`;
  private userSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.userSubject.asObservable();

  get currentUser(): CurrentUser | null { return this.userSubject.value; }

  /** Call once on app startup to restore session and evict expired tokens. */
  initAuth(): void {
    const token = this.getToken();
    if (!token) {
      this.clearState();
      return;
    }
    if (this.isTokenExpired(token)) {
      this.clearState();
      return;
    }
    const stored = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    if (stored) {
      this.userSubject.next(JSON.parse(stored));
    }
  }

  login(payload: { userName: string; password: string; rememberMe: boolean }): Observable<{ message: string; token: string }> {
    return this.http.post<{ message: string; user: CurrentUser; token: string }>(`${this.base}/login`, payload).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token, payload.rememberMe);
        }
        if (response.user) {
          this.setCurrentUser(response.user, payload.rememberMe);
        }
      })
    );
  }

  register(userName: string, email: string, password: string, file?: File): Observable<string> {
    const fd = new FormData();
    fd.append('UserName', userName);
    fd.append('Email', email);
    fd.append('Password', password);
    fd.append('ConfirmPassword', password);
    if (file) fd.append('file', file);
    return this.http.post(`${this.base}/register`, fd, { responseType: 'text' });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/logout`, {}).pipe(
      finalize(() => this.clearState())
    );
  }

  /** Called by the interceptor on 401 — clears state without an API call. */
  forceLogout(): void {
    this.clearState();
    this.router.navigate(['/login']);
  }

  changePassword(password: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/change-password`, { password, newPassword });
  }

  editProfile(userName?: string, file?: File): Observable<{ message: string }> {
    const fd = new FormData();
    if (userName) fd.append('userName', userName);
    if (file) fd.append('file', file);
    return this.http.post<{ message: string }>(`${this.base}/edit-profile`, fd);
  }

  setCurrentUser(user: CurrentUser, persist = true): void {
    this.userSubject.next(user);
    const store = persist ? localStorage : sessionStorage;
    store.setItem(USER_KEY, JSON.stringify(user));
  }

  setToken(token: string, persist = true): void {
    const store = persist ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isInRole(role: string): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload['role']
        ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (Array.isArray(roles)) return roles.includes(role);
      return roles === role;
    } catch {
      return false;
    }
  }

  isAdmin(): boolean { return this.isInRole('Admin'); }
  canModerate(): boolean { return this.isInRole('Admin') || this.isInRole('Moderator'); }

  getTokenPayload(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return null; }
  }

  getLatestUsers(): Observable<ApplicationUser[]> {
    return this.http.get<ApplicationUser[]>(`${this.base}/new-users`);
  }

  confirmEmail(userId: string, token: string): Observable<string> {
    return this.http.get(`${this.base}/confirm-email`, {
      params: { userId, token },
      responseType: 'text'
    });
  }

  resendConfirmation(email: string): Observable<string> {
    return this.http.post(`${this.base}/resend-confirmation`,
      JSON.stringify(email),
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
    );
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post(`${this.base}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<string> {
    return this.http.post(`${this.base}/reset-password`, { email, token, newPassword }, { responseType: 'text' });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // `exp` is Unix seconds
      return payload['exp'] * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private clearState(): void {
    this.userSubject.next(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}
