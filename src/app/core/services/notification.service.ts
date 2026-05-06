import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NotificationDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/notifications`;

  private _unreadCount = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this._unreadCount.asObservable();

  private pollSub?: Subscription;

  startPolling(): void {
    if (this.pollSub) return;
    this.fetchUnreadCount();
    this.pollSub = interval(30_000)
      .pipe(switchMap(() => this.http.get<{ count: number }>(`${this.base}/unread-count`)))
      .subscribe({ next: r => this._unreadCount.next(r.count) });
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
    this._unreadCount.next(0);
  }

  fetchUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.base}/unread-count`)
      .subscribe({ next: r => this._unreadCount.next(r.count) });
  }

  getAll(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.base);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/read`, {}).pipe(
      tap(() => {
        const c = this._unreadCount.value;
        if (c > 0) this._unreadCount.next(c - 1);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.base}/read-all`, {}).pipe(
      tap(() => this._unreadCount.next(0))
    );
  }

  delete(id: number, wasUnread: boolean): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => {
        if (wasUnread) {
          const c = this._unreadCount.value;
          if (c > 0) this._unreadCount.next(c - 1);
        }
      })
    );
  }
}
