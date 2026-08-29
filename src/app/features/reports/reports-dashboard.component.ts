import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportDialogService, ReportDto } from 'src/app/core/services/report-dialog.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.css'
})
export class ReportsDashboardComponent implements OnInit {
  private reportService = inject(ReportDialogService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  reports: ReportDto[] = [];
  currentStatus = 'Pending';
  currentPage = 1;
  totalPages = 1;
  total = 0;
  loading = false;
  actionLoading: Record<number, boolean> = {};

  readonly statuses = ['Pending', 'Reviewed', 'Dismissed'];

  get pageNumbers(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.reportService.getReports(this.currentStatus, this.currentPage).subscribe({
      next: res => {
        this.reports = res.reports;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load reports');
        this.loading = false;
      }
    });
  }

  setStatus(status: string): void {
    this.currentStatus = status;
    this.currentPage = 1;
    this.load();
  }

  loadPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.load();
  }

  review(report: ReportDto, action: 'reviewed' | 'dismissed'): void {
    this.actionLoading[report.id] = true;
    this.reportService.reviewReport(report.id, action).subscribe({
      next: () => {
        this.toast.success(action === 'reviewed' ? 'Report marked as reviewed' : 'Report dismissed');
        this.reports = this.reports.filter(r => r.id !== report.id);
        this.total = Math.max(0, this.total - 1);
        delete this.actionLoading[report.id];
      },
      error: () => {
        this.toast.error('Action failed');
        delete this.actionLoading[report.id];
      }
    });
  }

  contentLink(report: ReportDto): string | null {
    if (!report.contentId) return null;
    switch (report.contentType) {
      case 'Post': return `/post/${report.contentId}`;
      case 'Reply': return `/reply/${report.contentId}`;
      case 'Screenshot': return `/screenshots/${report.contentId}`;
      default: return null;
    }
  }
}
