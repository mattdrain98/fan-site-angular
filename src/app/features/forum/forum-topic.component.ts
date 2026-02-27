import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ForumService, PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ForumTopicModel } from '../../core/models';

@Component({
  selector: 'app-forum-topic',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncPipe],
  templateUrl: './forum-topic.component.html'
})
export class ForumTopicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private forumService = inject(ForumService);
  private postService = inject(PostService);
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

  deletePost(postId: number): void {
    if (confirm('Delete this post?')) {
      this.postService.delete(postId).subscribe(() => {
        if (this.topic) this.topic.posts = this.topic.posts.filter(p => p.id !== postId);
      });
    }
  }
}
