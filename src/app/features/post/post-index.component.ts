import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, Location, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from 'src/app/core/services/post.service'; 
import { ReplyService } from 'src/app/core/services/reply.service';
import { AuthService } from '../../core/services/auth.service';
import { PostIndexModel, PostReplyDto, PostEditModel } from '../../core/models';

@Component({
  selector: 'app-post-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './post-index.component.html'
})
export class PostIndexComponent implements OnInit {
  constructor(private location: Location) {}

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private replyService = inject(ReplyService);
  auth = inject(AuthService);

  post: PostIndexModel | null = null;
  currentUser$ = this.auth.currentUser$;
  errors: string[] = [];

  // Reply inline editing
  editingReplyId: number | null = null;
  editReplyContent = '';

  // Post inline editing
  isEditingPost = false;
  editPostContent = '';

  // Inline reply creation
  isReplying = false;
  newReplyContent = '';

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(id).subscribe(p => this.post = p);
  }

  // ── Like ──────────────────────────────────────────────
  toggleLike() {
    if (!this.post) return;
    this.post.userHasLiked = !this.post.userHasLiked;
    this.post.totalLikes += this.post.userHasLiked ? 1 : -1;
    if (this.post.userHasLiked) this.animateBurst();
    this.postService.toggleLike(this.post.id).subscribe({
      next: (totalLikes: number) => { this.post!.totalLikes = totalLikes; },
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
      span.style.setProperty('--x', Math.cos(rad) * radius + 'px');
      span.style.setProperty('--y', Math.sin(rad) * radius + 'px');
      burst.appendChild(span);
      setTimeout(() => span.remove(), 400);
    }
    btn.classList.add('pop');
    setTimeout(() => btn.classList.remove('pop'), 300);
  }

  // ── Post edit ─────────────────────────────────────────
  startEditPost(): void {
    if (!this.post) return;
    this.isEditingPost = true;
    this.editPostContent = this.post.postContent;
  }

  cancelEditPost(): void {
    this.isEditingPost = false;
    this.editPostContent = '';
  }

  saveEditPost(): void {
    if (!this.post) return;
    this.postService.edit(this.post.id, { title: this.post.title, content: this.editPostContent }).subscribe({
      next: () => {
        this.post!.postContent = this.editPostContent;
        this.cancelEditPost();
      },
      error: () => this.errors = ['Failed to update post']
    });
  }

  deletePost(): void {
    if (!this.post || !confirm('Delete this post?')) return;
    this.postService.delete(this.post.id).subscribe({
      next: () => this.location.back(),
      error: () => this.errors = ['Failed to delete post']
    });
  }

  // ── Reply create ──────────────────────────────────────
  startReply(): void {
    this.isReplying = true;
  }

  cancelReply(): void {
    this.isReplying = false;
    this.newReplyContent = '';
  }

  submitReply(): void {
    if (!this.post || !this.newReplyContent.trim()) return;
    this.replyService.addReply(this.post.id, this.newReplyContent).subscribe({
      next: () => {
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.postService.getById(id).subscribe(p => {
          this.post = p;
          this.cancelReply();
        });
      },
      error: () => this.errors = ['Failed to submit reply']
    });
  }

  // ── Reply edit ────────────────────────────────────────
  startEditReply(reply: any): void {
    this.editingReplyId = reply.id;
    this.editReplyContent = reply.replyContent;
  }

  cancelEditReply(): void {
    this.editingReplyId = null;
    this.editReplyContent = '';
  }

  saveEditReply(replyId: number): void {
    this.replyService.edit(replyId, this.editReplyContent).subscribe({
      next: () => {
        const reply = this.post?.replies.find(r => r.id === replyId);
        if (reply) reply.replyContent = this.editReplyContent;
        this.cancelEditReply();
      },
      error: () => this.errors = ['Failed to update reply']
    });
  }

  deleteReply(replyId: number): void {
    if (!confirm('Delete this reply?') || !this.post) return;
    this.replyService.delete(replyId).subscribe({
      next: () => { this.post!.replies = this.post!.replies.filter(r => r.id !== replyId); },
      error: () => this.errors = ['Failed to delete reply']
    });
  }

  notSignedIn(): void { alert('Please sign in'); }
  goBack(): void { this.location.back(); }
}