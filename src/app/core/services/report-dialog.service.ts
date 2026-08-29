import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface ReportContext {
  targetUserId: string;
  contentType: 'Post' | 'Reply' | 'Screenshot' | 'ProfileComment' | 'User';
  contentId?: number;
  contentLabel?: string;
}

export interface ReportDto {
  id: number;
  reporterId: string;
  reporterName: string;
  targetUserId: string;
  targetUserName: string;
  contentType: string;
  contentId: number | null;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReportDialogService {
  private readonly base = `${environment.apiBaseUrl}/reports`;

  visible = signal(false);
  context = signal<ReportContext | null>(null);

  constructor(private http: HttpClient) {}

  open(ctx: ReportContext): void {
    this.context.set(ctx);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.context.set(null);
  }

  submit(payload: { targetUserId: string; contentType: string; contentId?: number; reason: string; details?: string }) {
    return this.http.post<{ message: string }>(this.base, payload);
  }

  getReports(status = 'Pending', page = 1) {
    return this.http.get<{ reports: ReportDto[]; total: number; page: number; totalPages: number }>(
      `${this.base}?status=${status}&page=${page}`
    );
  }

  reviewReport(id: number, action: 'reviewed' | 'dismissed', note?: string) {
    return this.http.post<{ status: string }>(`${this.base}/${id}/review`, { action, note });
  }
}
