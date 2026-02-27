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

login(payload: { userName: string; password: string; rememberMe: boolean }): Observable<{ message: string }> {
  return this.http.post<{ message: string; user: CurrentUser }>(`${this.base}/login`, payload).pipe(
    tap(response => {
      if (response.user) {
        this.setCurrentUser(response.user);
      }
    })
  );
}

  register(userName: string, email: string, password: string, file?: File): Observable<{ message: string; userId: string }> {
    const fd = new FormData();
    fd.append('userName', userName);
    fd.append('email', email);
    fd.append('password', password);
    if (file) fd.append('file', file);
    return this.http.post<{ message: string; userId: string }>(`${this.base}/register`, fd);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/logout`, {}).pipe(
      tap(() => {
        this.userSubject.next(null);
        localStorage.removeItem('currentUser');
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

  getLatestUsers(): Observable<ApplicationUser[]> {
    return this.http.get<ApplicationUser[]>(`${this.base}/new-users`);
  }

  setCurrentUser(user: CurrentUser): void {
    this.userSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private loadStored(): CurrentUser | null {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s) : null;
  }
}
