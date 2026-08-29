import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from 'src/app/core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileCommentService } from 'src/app/core/services/profile-comment.service';
import { AdminService } from '../../core/services/services';
import { ProfileDto, ProfileCommentDto } from '../../core/models';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';
import { ReportDialogService } from 'src/app/core/services/report-dialog.service';
import { switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css'
})
export class ProfileDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private commentService = inject(ProfileCommentService);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  auth = inject(AuthService);
  reportService = inject(ReportDialogService);

  profile: ProfileDto | null = null;
  currentUser$ = this.auth.currentUser$;
  isFollowing = false;
  isOwnProfile = false;
  currentUser: any;
  isAdmin = this.auth.isAdmin();
  togglingRoles = new Set<string>();
  isHidingAccount = false;

  editingCommentId: number | null | undefined = null;
  editContent = '';
  isEditingBio = false;
  editBioContent = '';

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

    forkJoin({
      profile: this.profileService.getProfile(id),
      roles: this.profileService.getRoles(id).pipe(catchError(() => of<string[]>([])))
    }).subscribe({
      next: ({ profile, roles }) => {
        this.profile = { ...profile, roles };
        this.profile.profileComments = profile.profileComments.reverse();
        const cu = this.auth.currentUser;
        if (cu) {
          this.isOwnProfile = cu.userId === profile.userId;
          this.isFollowing = profile.isFollowing;
        }
      },
      error: () => this.toastService.error('Failed to load profile')
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
        this.toastService.error('Failed to update follow status');
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profileService.uploadProfileImage(file).subscribe({
      next: res => {
        if (this.profile) this.profile.profileImageUrl = res.imageUrl;
        this.toastService.success('Profile image updated');
      },
      error: () => this.toastService.error('Failed to upload image')
    });
  }

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

  submitComment(profileUserId: string): void {
    if (!this.profile || !this.newCommentContent.trim()) return;
  
    this.commentService.addComment({
      profileUserId,
      commentContent: this.newCommentContent
    }).pipe(
      switchMap(() => this.profileService.getProfile(profileUserId))
    ).subscribe({
      next: p => {
        this.profile = p;
        this.profile.profileComments = [...p.profileComments].reverse();
        this.cancelComment();
        this.toastService.success('Comment posted');
      },
      error: () => this.toastService.error('Failed to submit comment')
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
        this.toastService.success('Comment updated');
        this.cancelEdit();
      },
      error: () => this.toastService.error('Failed to update comment')
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm('Delete this comment?');
    if (confirmed) {
      this.commentService.delete(commentId).subscribe({
        next: () => {
          if (this.profile) {
            this.profile.profileComments = this.profile.profileComments.filter(c => c.id !== commentId);
          }
          this.toastService.success('Comment deleted');
        },
        error: () => this.toastService.error('Failed to delete comment')
      });
    }
  }

  async toggleRole(role: string): Promise<void> {
    if (!this.profile) return;
    const currentRoles = this.profile.roles ?? [];
    const hasRole = currentRoles.includes(role);
    const action = hasRole ? `remove ${role} from` : `make`;
    const confirmed = await this.confirmService.confirm(
      `Are you sure you want to ${action} ${this.profile.userName}${hasRole ? '' : ' a'} ${role}?`
    );
    if (!confirmed) return;

    this.togglingRoles.add(role);
    const call = hasRole
      ? this.adminService.removeRole(this.profile.userId, role)
      : this.adminService.assignRole(this.profile.userId, role);

    call.subscribe({
      next: res => {
        this.toastService.success(res.message);
        if (this.profile) {
          this.profile.roles = hasRole
            ? currentRoles.filter(r => r !== role)
            : [...currentRoles, role];
        }
        this.togglingRoles.delete(role);
        // Verify with server and self-correct if the write didn't persist
        const userId = this.profile?.userId;
        if (userId) {
          this.adminService.getUserRoles(userId).subscribe({
            next: rolesRes => {
              if (this.profile) this.profile.roles = rolesRes.roles;
            }
          });
        }
      },
      error: () => {
        this.toastService.error('Failed to update role');
        this.togglingRoles.delete(role);
      }
    });
  }

  toggleHidden(): void {
    if (!this.profile) return;
    this.isHidingAccount = true;
    this.profileService.toggleHidden(this.profile.userId).subscribe({
      next: res => {
        if (this.profile) this.profile.isHidden = res.isHidden;
        this.toastService.success(res.isHidden ? 'Account hidden' : 'Account unhidden');
        this.isHidingAccount = false;
      },
      error: () => {
        this.toastService.error('Failed to update visibility');
        this.isHidingAccount = false;
      }
    });
  }

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
        this.toastService.success('Bio updated');
        this.cancelEditBio();
      },
      error: () => this.toastService.error('Failed to update bio')
    });
  }
}