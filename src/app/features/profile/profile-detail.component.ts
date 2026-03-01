import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ProfileModel, ProfileCommentDto } from '../../core/models';
import { ProfileCommentService } from 'src/app/core/services/profile-comment.service';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './profile-detail.component.html'
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.profileService.getProfile(id).subscribe(p => {
      this.profile = p;
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
    this.commentService.delete(commentId).subscribe({
      next: () => {
        if (this.profile) {
          this.profile.profileComments = this.profile.profileComments.filter(c => c.id !== commentId);
        }
      },
      error: () => this.errors = ['Failed to delete comment']
    });
  }
}
