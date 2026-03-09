import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationUser } from '../models';

export interface CurrentUser {
  userId: string;
  userName: string;
  imagePath?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/account`;
  private userSubject = new BehaviorSubject<CurrentUser | null>(this.loadStored());
  currentUser$ = this.userSubject.asObservable();

  get currentUser(): CurrentUser | null { return this.userSubject.value; }

  login(payload: { userName: string; password: string; rememberMe: boolean }): Observable<{ message: string; token: string }> {
    return this.http.post<{ message: string; user: CurrentUser; token: string }>(`${this.base}/login`, payload).pipe(
      tap(response => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
        if (response.token) {
          this.setToken(response.token);  // ✅ Store token
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
      tap(() => {
        this.userSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');  // ✅ Remove token
      })
    );
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

  setCurrentUser(user: CurrentUser): void {
    this.userSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // ✅ NEW - Token management
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadStored(): CurrentUser | null {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s) : null;
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
}