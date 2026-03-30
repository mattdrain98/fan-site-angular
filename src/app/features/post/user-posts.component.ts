import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostService } from '../../core/services/services';
import { PostDto, ProfileDto } from '../../core/models';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.css'
})
export class UserPostsComponent implements OnInit {
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  posts: PostDto[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1 || page > 100) return;
    this.loading = true;

    this.postService.getUserPosts(page).subscribe({
      next: data => {
        this.posts = data.posts;
        this.currentPage = data.page;
        this.totalPages = Math.min(data.totalPages, 100);
        this.totalPosts = data.totalUserPosts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Failed to load posts');
      }
    });
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  async delete(id: number, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = await this.confirmService.confirm('Delete this post?');
    if (confirmed) {
      this.postService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Post deleted successfully');
          this.loadPage(this.currentPage);
        },
        error: () => this.toastService.error('Failed to delete post')
      });
    }
  }
}