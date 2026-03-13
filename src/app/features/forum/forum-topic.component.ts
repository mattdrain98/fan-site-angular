import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ForumService, PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ForumTopicModel } from '../../core/models';
import { DatePipe } from '@angular/common';
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
  topic: ForumTopicModel | null = null;
  searchQuery = '';
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void {
    this.forumId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(searchQuery?: string): void {
    this.forumService.getById(this.forumId, searchQuery).subscribe(t => this.topic = t);
  }

  search(): void { this.load(this.searchQuery); }

  async deletePost(postId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm('Delete this post?');
    if (confirmed) {
      this.toastService.success('Post deleted successfully');
      this.postService.delete(postId).subscribe(() => {
        if (this.topic) {
          this.topic.posts = this.topic.posts.filter(p => p.id !== postId);
        }
      });
    }
  }

  navigateToProfile(event: MouseEvent, authorId: string) {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/profile', authorId]);
  }
}
