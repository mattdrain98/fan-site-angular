import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from 'src/app/core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileModel, ProfileCommentDto } from '../../core/models';
import { ProfileCommentService } from 'src/app/core/services/profile-comment.service';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css'
})
export class ProfileDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private commentService = inject(ProfileCommentService);
  auth = inject(AuthService);

  profile: ProfileModel | null = null;
  currentUser$ = this.auth.currentUser$;
  isFollowing = false;
  isOwnProfile = false;
  currentUser: any;
  errors: string[] = [];

  editingCommentId: number | null | undefined = null;
  editContent = '';
  isEditingBio = false;
  editBioContent = '';

  // Inline comment
  isCommenting = false;
  isCommentVisible = false;
  newCommentContent = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadProfile(id);
    });
  }

  private loadProfile(id: string): void {
    this.profile = null;
    this.isFollowing = false;
    this.isOwnProfile = false;
    this.editingCommentId = null;
    this.editContent = '';
    this.isEditingBio = false;
    this.editBioContent = '';
    this.errors = [];

    this.profileService.getProfile(id).subscribe(p => {
      this.profile = p;
      this.profile.profileComments = p.profileComments.reverse();
      const cu = this.auth.currentUser;
      if (cu) {
        this.isOwnProfile = cu.userId === p.userId;
        this.isFollowing = p.isFollowing;
      }
    });
  }

  toggleFollow(): void {
    if (!this.profile) return;
    this.isFollowing = !this.isFollowing;
    this.profile.followers += this.isFollowing ? 1 : -1;
    this.profileService.toggleFollow(this.profile.userId).subscribe({
      next: res => {
        if (this.profile) this.profile.followers = res.followers;
      },
      error: () => {
        this.isFollowing = !this.isFollowing;
        if (this.profile) this.profile.followers += this.isFollowing ? 1 : -1;
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profileService.uploadProfileImage(file).subscribe(res => {
      if (this.profile) this.profile.profileImageUrl = res.imageUrl;
    });
  }

  // ── Inline comment ────────────────────────────────────
  startComment(): void {
    this.isCommenting = true;
    setTimeout(() => this.isCommentVisible = true, 10);
  }

  cancelComment(): void {
    this.isCommentVisible = false;
    setTimeout(() => {
      this.isCommenting = false;
      this.newCommentContent = '';
    }, 150);
  }

  submitComment(): void {
    if (!this.profile || !this.newCommentContent.trim()) return;
    this.commentService.getCommentTemplate(this.profile.userId).subscribe({
      next: template => {
        const payload: ProfileCommentDto = {
          ...template,
          commentContent: this.newCommentContent
        };
        this.commentService.addComment(payload).subscribe({
          next: () => {
            this.loadProfile(this.profile!.userId);
            this.cancelComment();
          },
          error: () => this.errors = ['Failed to submit comment']
        });
      },
      error: () => this.errors = ['Failed to submit comment']
    });
  }

  // ── Comment edit ──────────────────────────────────────
  startEdit(comment: ProfileCommentDto): void {
    this.editingCommentId = comment.id;
    this.editContent = comment.commentContent;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editContent = '';
  }

  saveEdit(commentId: number): void {
    this.commentService.edit(commentId, this.editContent).subscribe({
      next: () => {
        const comment = this.profile?.profileComments?.find(c => c.id === commentId);
        if (comment) comment.commentContent = this.editContent;
        this.cancelEdit();
      },
      error: () => this.errors = ['Failed to update comment']
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Delete this comment?')) return;
    this.commentService.delete(commentId).subscribe({
      next: () => {
        if (this.profile) {
          this.profile.profileComments = this.profile.profileComments.filter(c => c.id !== commentId);
        }
      },
      error: () => this.errors = ['Failed to delete comment']
    });
  }


  // ── Bio edit ──────────────────────────────────────────
  startEditBio(): void {
    this.isEditingBio = true;
    this.editBioContent = this.profile?.bio || '';
  }

  cancelEditBio(): void {
    this.isEditingBio = false;
    this.editBioContent = '';
  }

  saveEditBio(): void {
    if (!this.profile) return;
    this.profileService.editBio({
      userId: this.profile.userId,
      userName: this.profile.userName,
      bio: this.editBioContent
    }).subscribe({
      next: () => {
        this.profile!.bio = this.editBioContent;
        this.cancelEditBio();
      },
      error: () => this.errors = ['Failed to update bio']
    });
  }
}