import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ForumService, PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { SearchResultDto } from '../../core/models';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-forum-topic',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncPipe, DatePipe],
  templateUrl: './forum-topic.component.html',
  styleUrl: './forum-topic.component.css'
})
export class ForumTopicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private forumService = inject(ForumService);
  private postService = inject(PostService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);
  auth = inject(AuthService);

  forumId!: number;
  topic: SearchResultDto | null = null;
  searchQuery = '';
  currentPage = 1;
  currentUser$ = this.auth.currentUser$;

  get pageNumbers(): number[] {
    const total = this.topic?.totalPages ?? 1;
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(total, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void {
    this.forumId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(searchQuery?: string, page: number = 1): void {
    this.forumService.getById(this.forumId, searchQuery, page).subscribe({
      next: t => {
        this.topic = t;
        this.currentPage = t.page;
      },
      error: () => this.toastService.error('Failed to load forum')
    });
  }

  search(): void {
    this.load(this.searchQuery, 1);
  }

  loadPage(page: number): void {
    if (page < 1 || page > (this.topic?.totalPages ?? 1)) return;
    this.load(this.searchQuery, page);
  }

  async deletePost(postId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm('Delete this post?');
    if (confirmed) {
      this.postService.delete(postId).subscribe({
        next: () => {
          if (this.topic) {
            this.topic.posts = this.topic.posts?.filter(p => p.postId !== postId);
          }
          this.toastService.success('Post deleted successfully');
        },
        error: () => this.toastService.error('Failed to delete post')
      });
    }
  }

  navigateToProfile(event: MouseEvent, authorId: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/profile', authorId]);
  }
}