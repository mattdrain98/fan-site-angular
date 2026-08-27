import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ForumService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ForumDto } from '../../core/models';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';

@Component({
  selector: 'app-forum-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './forum-index.component.html',
  styleUrl: './forum-index.component.css'
})
export class ForumIndexComponent implements OnInit {
  private forumService = inject(ForumService);
  private auth = inject(AuthService);
  private confirmService = inject(ConfirmService);

  forums: ForumDto[] = [];
  currentUser$ = this.auth.currentUser$;
  isAdmin = this.auth.isAdmin();
  currentPage = 1;
  totalPages = 1;
  totalForums = 0;

  get pageNumbers(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    if (page < 1) return;
    this.forumService.getAll(page).subscribe(res => {
      this.forums = res.forums;
      this.currentPage = res.page;
      this.totalPages = res.totalPages;
      this.totalForums = res.totalForums;
    });
  }

  async delete(id: number): Promise<void> {
    const confirmed = await this.confirmService.confirm('Delete this forum?');
    if (confirmed) {
      this.forumService.delete(id).subscribe(() => {
        this.forums = this.forums.filter(f => f.forumId !== id);
        this.totalForums--;
      });
    }
  }
}
