import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, Location, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PostService } from 'src/app/core/services/post.service';
import { ReplyService } from 'src/app/core/services/reply.service';
import { AuthService } from '../../core/services/auth.service';
import { ImageUploadService } from 'src/app/core/services/image-upload.service';
import { PostDetailDto, PostReplyDto } from '../../core/models';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';

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
  private postService = inject(PostService);
  private replyService = inject(ReplyService);
  private imageUploadService = inject(ImageUploadService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  auth = inject(AuthService);

  @ViewChild('editTextarea') editTextarea!: ElementRef<HTMLTextAreaElement>;

  post: PostDetailDto | null = null;
  currentUser$ = this.auth.currentUser$;
  canModerate = this.auth.canModerate();

  editingReplyId: number | null = null;
  editReplyContent = '';

  isEditingPost = false;
  editPostContent = '';
  editPostTitle = '';
  isDragOver = false;

  isUploadingImage = false;
  uploadError = '';
  newImageUrls: string[] = [];

  isReplying = false;
  newReplyContent = '';
  isReplyVisible = false;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(id).subscribe({
      next: p => this.post = p,
      error: () => this.toastService.error('Failed to load post')
    });
  }

  getFormattedContent(): SafeHtml {
    if (!this.post) return this.sanitizer.bypassSecurityTrustHtml('');

    let content = this.post.content;

    if (this.post.postImages && this.post.postImages.length > 0) {
      this.post.postImages.forEach((image, index) => {
        const placeholder = `[Image-${index}-${image.id}]`;
        const imageHtml = `<img src="${image.url}" alt="Post image" class="inline-post-image" style="max-width: 100%; max-height: 250px; height: auto; margin: 1rem 0; border-radius: 10px; border: 1px solid #e2e8f0; display: block;" />`;
        content = content.split(placeholder).join(imageHtml);
      });
    }

    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

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

    const seen = new Set<string>();
    const uniqueFiles = imageFiles.filter(f => {
      const key = `${f.name}-${f.size}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueFiles.length === 0) {
      this.toastService.warning('Please drop image files only.');
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
    this.uploadError = '';
    this.isUploadingImage = true;

    for (const file of files) {
      const validation = this.imageUploadService.validateImage(file);
      if (!validation.valid) {
        this.toastService.error(validation.error!);
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
      this.toastService.error('Failed to upload image. Please try again.');
    } finally {
      this.isUploadingImage = false;
    }
  }

  startEditPost(): void {
    if (!this.post) return;
    this.isEditingPost = true;
    this.editPostTitle = this.post.title ?? '';
    this.editPostContent = this.post.content ?? '';
    this.newImageUrls = [];
    this.uploadError = '';
  }

  cancelEditPost(): void {
    this.isEditingPost = false;
    this.editPostTitle = this.post?.title ?? '';
    this.editPostContent = this.post?.content ?? '';
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
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.postService.getById(id).subscribe(p => {
          this.post = p;
          this.isEditingPost = false;
          this.newImageUrls = [];
          this.uploadError = '';
          this.toastService.success('Post updated successfully');
        });
      },
      error: () => this.toastService.error('Failed to update post')
    });
  }

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
        this.toastService.error('Error saving your like. Please try again.');
      }
    });
  }

  animateBurst() {
    const btn = document.getElementById('likeBtn');
    if (!btn) return;
    const burst = btn.querySelector('.burst-circles') as HTMLElement;
    if (!burst) return;
    burst.innerHTML = '';

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

  async deletePost(): Promise<void> {
    if (!this.post) return;
    const confirmed = await this.confirmService.confirm('Delete this post?');
    if (confirmed) {
      this.postService.delete(this.post.postId).subscribe({
        next: () => this.location.back(),
        error: () => this.toastService.error('Failed to delete post')
      });
    }
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
          this.toastService.success('Reply posted');
        });
      },
      error: () => this.toastService.error('Failed to submit reply')
    });
  }

  startEditReply(reply: PostReplyDto): any { 
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
        this.toastService.success('Reply updated');
        this.cancelEditReply();
      },
      error: () => this.toastService.error('Failed to update reply')
    });
  }

  async deleteReply(replyId: number): Promise<void> {
    if (!this.post) return;
    const confirmed = await this.confirmService.confirm('Delete this reply?');
    if (confirmed) {
      this.replyService.delete(replyId).subscribe({
        next: () => {
          this.post!.replies = this.post!.replies.filter(r => r.id !== replyId); 
          this.toastService.success('Reply deleted');
        },
        error: () => this.toastService.error('Failed to delete reply')
      });
    }
  }

  notSignedIn(): void { this.toastService.warning('Please sign in'); }
  goBack(): void { this.location.back(); }
}