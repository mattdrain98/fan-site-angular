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

  toggleLike() {
    if (!this.post) return;

    this.post.userHasLiked = !this.post.userHasLiked;
    this.post.totalLikes += this.post.userHasLiked ? 1 : -1;

    if (this.post.userHasLiked) {
      this.animateBurst();
    }

    this.postService.toggleLike(this.post.id).subscribe({
      next: (totalLikes: number) => {
        this.post!.totalLikes = totalLikes;
      },
      error: () => {
        this.post!.userHasLiked = !this.post!.userHasLiked;
        this.post!.totalLikes += this.post!.userHasLiked ? 1 : -1;
        alert('Error saving your like. Please try again.');
      }
    });
  }
  animateBurst() {
    const btn = document.getElementById('likeBtn');
    if (!btn) return;

    const burst = btn.querySelector('.burst-circles')!;
    burst.innerHTML = '';

    const numCircles = 8;
    const radius = 20;

    for (let i = 0; i < numCircles; i++) {
      const span = document.createElement('span');

      const angle = (360 / numCircles) * i;
      const rad = angle * (Math.PI / 180);
      const x = Math.cos(rad) * radius + 'px';
      const y = Math.sin(rad) * radius + 'px';

      span.style.setProperty('--x', x);
      span.style.setProperty('--y', y);

      burst.appendChild(span);

      setTimeout(() => span.remove(), 400);
    }

    btn.classList.add('pop');
    setTimeout(() => btn.classList.remove('pop'), 300);
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
