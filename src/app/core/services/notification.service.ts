import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as signalR from '@microsoft/signalr';
import { NotificationDto } from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http    = inject(HttpClient);
  private auth    = inject(AuthService);
  private zone    = inject(NgZone);
  private base    = `${environment.apiBaseUrl}/notifications`;
  private hubUrl  = environment.apiBaseUrl.replace('/api', '') + '/hubs/notifications';

  private _unreadCount = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this._unreadCount.asObservable();

  private _newNotif = new Subject<void>();
  readonly newNotif$ = this._newNotif.asObservable();

  private hubConnection?: signalR.HubConnection;

  startPolling(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.on('ReceiveNotification', () => {
      this.zone.run(() => {
        this._unreadCount.next(this._unreadCount.value + 1);
        this._newNotif.next();
      });
    });

    this.hubConnection.onreconnected(() => this.fetchUnreadCount());

    this.hubConnection.start()
      .then(() => this.fetchUnreadCount())
      .catch(err => console.error('SignalR connection error:', err));
  }

  stopPolling(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
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
