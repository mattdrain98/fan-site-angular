import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = `${environment.apiBaseUrl}/presence`;

  getOnline(userIds: string[]): Observable<string[]> {
    if (!userIds.length || !this.auth.isLoggedIn()) return of([]);
    const ids = [...new Set(userIds)].join(',');
    return this.http.get<{ onlineUserIds: string[] }>(`${this.base}/online?userIds=${ids}`)
      .pipe(map(r => r.onlineUserIds));
  }
}
