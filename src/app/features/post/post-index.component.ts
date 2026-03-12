import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, Location, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PostService } from 'src/app/core/services/post.service';
import { ReplyService } from 'src/app/core/services/reply.service';
import { AuthService } from '../../core/services/auth.service';
import { ImageUploadService } from 'src/app/core/services/image-upload.service';
import { PostIndexModel } from '../../core/models';

@Component({
  selector: 'app-post-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './post-index.component.html',
  styleUrl: './post-index.component.css'
})
export class PostIndexComponent implements OnInit {
  constructor(
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private replyService = inject(ReplyService);
  private imageUploadService = inject(ImageUploadService);
  auth = inject(AuthService);

  @ViewChild('editTextarea') editTextarea!: ElementRef<HTMLTextAreaElement>;

  post: PostIndexModel | null = null;
  currentUser$ = this.auth.currentUser$;
  errors: string[] = [];

  // Reply inline editing
  editingReplyId: number | null = null;
  editReplyContent = '';

  // Post inline editing
  isEditingPost = false;
  editPostContent = '';
  editPostTitle = '';
  isDragOver = false; 

  // Image upload during edit
  isUploadingImage = false;
  uploadError = '';
  newImageUrls: string[] = [];

  // Inline reply creation
  isReplying = false;
  newReplyContent = '';
  isReplyVisible = false;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(id).subscribe(p => this.post = p);
  }

  getFormattedContent(): SafeHtml {
    if (!this.post) return this.sanitizer.bypassSecurityTrustHtml('');

    let content = this.post.postContent;

    if (this.post.postImages && this.post.postImages.length > 0) {
      this.post.postImages.forEach((image, index) => {
        const placeholder = `[Image-${index}-${image.id}]`;
        const imageHtml = `<img src="${image.url}" alt="Post image" class="inline-post-image" style="max-width: 100%; max-height: 250px; height: auto; margin: 1rem 0; border-radius: 10px; border: 1px solid #e2e8f0; display: block;" />`;
        content = content.split(placeholder).join(imageHtml);
      });
    }

    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  // ── Image upload during edit ──
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
  
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
  
    if (imageFiles.length > 0) {
      event.preventDefault();
      this.processImageFiles(imageFiles);
    }
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    console.log('Raw files:', imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

    const seen = new Set<string>();
    const uniqueFiles = imageFiles.filter(f => {
      const key = `${f.name}-${f.size}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log('Unique files:', uniqueFiles.length);

    if (uniqueFiles.length === 0) {
      this.uploadError = 'Please drop image files only.';
      return;
    }

    await this.processImageFiles([uniqueFiles[0]]);
  }

  async onEditImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    await this.processImageFiles(Array.from(input.files));
    input.value = '';
  }

  private async processImageFiles(files: File[]): Promise<void> {
    console.log('processImageFiles called', files.length)
    this.uploadError = '';
    this.isUploadingImage = true;

    for (const file of files) {
      const validation = this.imageUploadService.validateImage(file);
      if (!validation.valid) {
        this.uploadError = validation.error!;
        this.isUploadingImage = false;
        return;
      }
    }

    try {
      const urls = await this.imageUploadService.uploadMultipleImages(files);

      for (const url of urls) {
        this.newImageUrls.push(url);

        const existingCount = this.post?.postImages?.length ?? 0;
        const newIndex = existingCount + this.newImageUrls.length - 1;
        const placeholder = `[Image-${newIndex}-temp]`;

        const textarea = this.editTextarea?.nativeElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = this.editPostContent.substring(0, start);
          const after = this.editPostContent.substring(end);
          this.editPostContent = before + '\n' + placeholder + '\n' + after;

          setTimeout(() => {
            const newPos = start + placeholder.length + 2;
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos;
            textarea.focus();
          }, 0);
        } else {
          this.editPostContent += '\n' + placeholder;
        }
      }
    } catch (err) {
      this.uploadError = 'Failed to upload image. Please try again.';
    } finally {
      this.isUploadingImage = false;
    }
  }

  // ── Post editing ──

  startEditPost(): void {
    if (!this.post) return;
    this.isEditingPost = true;
    this.editPostTitle = this.post.title ?? '';
    this.editPostContent = this.post.postContent ?? '';
    this.newImageUrls = [];
    this.uploadError = '';
  }

  cancelEditPost(): void {
    this.isEditingPost = false;
    this.editPostTitle = this.post?.title ?? '';
    this.editPostContent = this.post?.postContent ?? '';
    this.newImageUrls = [];
    this.uploadError = '';
  }

  saveEditPost(): void {
    if (!this.post) return;
    this.postService.edit(this.post.postId, {
      title: this.editPostTitle,
      content: this.editPostContent,
      newImageUrls: this.newImageUrls
    }).subscribe({
      next: () => {
        // Reload the post to get updated images with real IDs
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.postService.getById(id).subscribe(p => {
          this.post = p;
          this.isEditingPost = false;
          this.newImageUrls = [];
          this.uploadError = '';
        });
      },
      error: () => this.errors = ['Failed to update post']
    });
  }

  // ── Everything below stays the same ──

  toggleLike() {
    if (!this.post) return;
    this.post.userHasLiked = !this.post.userHasLiked;
    this.post.totalLikes += this.post.userHasLiked ? 1 : -1;
    if (this.post.userHasLiked) this.animateBurst();
    this.postService.toggleLike(this.post.postId).subscribe({
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
    const burst = btn.querySelector('.burst-circles') as HTMLElement;
    if (!burst) return;
    burst.innerHTML = '';

    // Inner ring particles
    const colors = ['#ff4d6d', '#ff8fa3', '#ffccd5'];
    for (let i = 0; i < 12; i++) {
      const span = document.createElement('span');
      const angle = (360 / 12) * i;
      const rad = angle * (Math.PI / 180);
      const x = Math.cos(rad) * 28;
      const y = Math.sin(rad) * 28;
      const size = i % 2 === 0 ? 5 : 4;
      const color = colors[i % 3];
      span.style.cssText = `
        position:absolute; top:0; left:0;
        width:${size}px; height:${size}px;
        border-radius:50%; background:${color};
        box-shadow: 0 0 4px ${color};
        opacity:1; z-index:9999;
        animation: burstOut 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        --x:${x}px; --y:${y}px;
      `;
      burst.appendChild(span);
    }

    // Outer ring particles
    for (let i = 0; i < 10; i++) {
      const span = document.createElement('span');
      const angle = (360 / 10) * i + 18;
      const rad = angle * (Math.PI / 180);
      const x = Math.cos(rad) * 46;
      const y = Math.sin(rad) * 46;
      const color = i % 2 === 0 ? '#ff758f' : '#ffb3c1';
      span.style.cssText = `
        position:absolute; top:0; left:0;
        width:${i % 3 === 0 ? 4 : 3}px; height:${i % 3 === 0 ? 4 : 3}px;
        border-radius:50%; background:${color};
        box-shadow: 0 0 3px ${color};
        opacity:1; z-index:9999;
        animation: burstOut 0.55s cubic-bezier(0.16,1,0.3,1) 70ms forwards;
        --x:${x}px; --y:${y}px;
      `;
      burst.appendChild(span);
    }

    setTimeout(() => burst.innerHTML = '', 900);

    btn.classList.remove('pop');
    void (btn as HTMLElement).offsetWidth;
    btn.classList.add('pop');
    setTimeout(() => btn.classList.remove('pop'), 600);
  }

  deletePost(): void {
    if (!this.post || !confirm('Delete this post?')) return;
    this.postService.delete(this.post.postId).subscribe({
      next: () => this.location.back(),
      error: () => this.errors = ['Failed to delete post']
    });
  }

  startReply(): void {
    this.isReplying = true;
    setTimeout(() => this.isReplyVisible = true, 10);
  }

  cancelReply(): void {
    this.isReplyVisible = false;
    setTimeout(() => {
      this.isReplying = false;
      this.newReplyContent = '';
    }, 10);
  }

  submitReply(): void {
    if (!this.post || !this.newReplyContent.trim()) return;
    this.replyService.addReply(this.post.postId, this.newReplyContent).subscribe({
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