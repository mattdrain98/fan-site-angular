import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { PostService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { PostIndexModel } from '../../core/models';

@Component({
  selector: 'app-post-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './post-index.component.html'
})
export class PostIndexComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  auth = inject(AuthService);

  post: PostIndexModel | null = null;
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(id).subscribe(p => this.post = p);
  }

  toggleLike(): void {
    if (!this.post) return;
    this.postService.toggleLike(this.post.id).subscribe(newTotal => {
      if (this.post) {
        this.post.totalLikes = newTotal;
        this.post.userHasLiked = !this.post.userHasLiked;
      }
    });
  }

  deleteReply(replyId: number): void {
    if (confirm('Delete this reply?') && this.post) {
      this.post.replies = this.post.replies.filter(r => r.id !== replyId);
    }
  }

  notSignedIn(): void {
    alert('Please sign in');
  }
}
