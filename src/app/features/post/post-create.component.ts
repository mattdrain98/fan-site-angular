import { Component, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { ImageUploadService } from '../../core/services/image-upload.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { PostService } from 'src/app/core/services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from 'src/app/core/services/services';
import { firstValueFrom } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css',
  imports: [FormsModule]
})
export class PostCreateComponent implements OnInit{
  @ViewChild('contentInput') contentInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('hiddenFileInput') hiddenFileInput!: ElementRef<HTMLInputElement>;

  title = '';
  content = '';
  uploadedImages: { id: string; url: string }[] = [];
  isPasting = false;
  isProcessingDrop = false;
  isDragOver = false; 
  forumId!: number;
  forumName = '';
  errors: string[] = [];

  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private forumService = inject(ForumService);  
  private toastService = inject(ToastService);  
  private router = inject(Router);
  private location = inject(Location);

  constructor(private imageUploadService: ImageUploadService) {}

  ngOnInit(): void {
    this.forumId = +this.route.snapshot.paramMap.get('forumId')!;
    this.forumService.getById(this.forumId).subscribe({
      next: (result) => this.forumName = result.forum?.forumTitle ?? 'Unknown Forum',
      error: () => {
        this.toastService.error('Failed to load forum');
      }
    });
  }

  /**
   * Handle paste events - detects images and uploads them
   */
  onContentPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      this.uploadPastedImages(imageFiles);
    }
  }

  /**
   * Upload images from paste or drag
   */
  async uploadPastedImages(files: File[]): Promise<void> {
    this.isPasting = true;
    try {
      const urls = await this.imageUploadService.uploadMultipleImages(files);
    
      urls.forEach((url) => {
        const imageId = Math.random().toString();
        this.uploadedImages.push({ id: imageId, url });
        this.insertImagePlaceholder(imageId);
      });
    } catch (error) {
      console.error('Upload failed:', error);
      this.toastService.error('Failed to upload images. Please try again.');
    } finally {
      this.isPasting = false;
    }
  }
  /**
   * Handle drag over content area
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.contentInput?.nativeElement) {
      this.contentInput.nativeElement.classList.add('drag-over');
    }
  }

  /**
   * Handle drag leave content area
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.contentInput?.nativeElement) {
      this.contentInput.nativeElement.classList.remove('drag-over');
    }
  }

  /**
   * Handle drop event - accept image files
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  
    if (this.isProcessingDrop) return;
    this.isProcessingDrop = true;
  
    if (this.contentInput?.nativeElement) {
      this.contentInput.nativeElement.classList.remove('drag-over');
    }
  
    const files = event.dataTransfer?.files;
    if (!files) {
      this.isProcessingDrop = false;
      return;
    }
  
    const imageFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      }
    }
  
    if (imageFiles.length > 0) {
      this.uploadPastedImages([imageFiles[0]]);
    }
  
    setTimeout(() => {
      this.isProcessingDrop = false;
    }, 100);
  }

  /**
   * Insert image placeholder text at cursor position
   */
  insertImagePlaceholder(imageId: string): void {
    const textarea = this.contentInput?.nativeElement;
    if (!textarea) return;
  
    const cursorPos = textarea.selectionStart;
    const textBefore = this.content.substring(0, cursorPos);
    const textAfter = this.content.substring(cursorPos);
  
    // Use index of uploaded images as the position
    const imageIndex = this.uploadedImages.length - 1;
    const placeholder = `[Image-${imageIndex}-${imageId}]`;
    this.content = textBefore + placeholder + '\n' + textAfter;
  
    setTimeout(() => {
      const newCursorPos = cursorPos + placeholder.length + 1;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  }

  /**
   * Remove an image
   */
  removeImage(id: string): void {
    // Remove from uploaded images
    this.uploadedImages = this.uploadedImages.filter(img => img.id !== id);

    // Remove placeholder from content
    this.content = this.content.replace(`[Image-${id}]\n`, '').replace(`[Image-${id}]`, '');
  }
  
  /**
   * Submit post with images
   */
submitPost(): void {
  if (!this.title.trim()) {
    this.toastService.warning('Please enter a title');
    return;
  }

  if (!this.content.trim() && this.uploadedImages.length === 0) {
    this.toastService.warning('Please add some content or images');
    return;
  }

  const postData = {
    title: this.title,
    forumId: this.forumId, 
    content: this.content,
    imageUrls: this.uploadedImages.map(img => img.url)
  };

  console.log('Submitting post:', postData);

  this.postService.add(postData).subscribe({
    next: () => {
      this.title = '';
      this.content = '';
      this.uploadedImages = [];
      this.toastService.success('Post created successfully!');
      this.router.navigate(['/forum', this.forumId]);
    },
    error: (error) => {
      console.error('Failed to create post:', error);
      this.toastService.error('Failed to create post. Please try again.');
    }
  });
}

  /**
   * Open file dialog
   */
  openFileDialog(): void {
    this.hiddenFileInput.nativeElement.click();
  }

  /**
   * Handle file input change
   */
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      this.uploadPastedImages(imageFiles);
    }

    event.target.value = '';
  }

  goBack(): void {
    this.location.back();
  }
}