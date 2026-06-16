import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostService, AdminService } from '../../core/services/services';
import { PostDto } from '../../core/models';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';
import { AuthService } from 'src/app/core/services/auth.service';

interface AdminUser {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  togglingRoles: Set<string>;
}

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.css'
})
export class UserPostsComponent implements OnInit {
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);

  posts: PostDto[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;

  isAdmin = false;
  currentUserId = '';
  showAdminPanel = false;
  adminUsers: AdminUser[] = [];
  loadingAdminUsers = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.currentUser?.userId ?? '';
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1 || page > 100) return;
    this.loading = true;

    this.postService.getUserPosts(page).subscribe({
      next: data => {
        this.posts = data.posts;
        this.currentPage = data.page;
        this.totalPages = Math.min(data.totalPages, 100);
        this.totalPosts = data.totalUserPosts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Failed to load posts');
      }
    });
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  async delete(id: number, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = await this.confirmService.confirm('Delete this post?');
    if (confirmed) {
      this.postService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Post deleted successfully');
          this.loadPage(this.currentPage);
        },
        error: () => this.toastService.error('Failed to delete post')
      });
    }
  }

  toggleAdminPanel(): void {
    this.showAdminPanel = !this.showAdminPanel;
    if (this.showAdminPanel && this.adminUsers.length === 0) {
      this.loadAdminUsers();
    }
  }

  loadAdminUsers(): void {
    this.loadingAdminUsers = true;
    this.adminService.getUsers().subscribe({
      next: users => {
        this.adminUsers = users.map(u => ({ ...u, roles: [], togglingRoles: new Set() }));
        this.adminUsers.forEach(u => this.fetchUserRoles(u));
        this.loadingAdminUsers = false;
      },
      error: () => {
        this.loadingAdminUsers = false;
        this.toastService.error('Failed to load users');
      }
    });
  }

  private fetchUserRoles(user: AdminUser): void {
    this.adminService.getUserRoles(user.id).subscribe({
      next: data => { user.roles = data.roles; }
    });
  }

  async toggleRole(user: AdminUser, role: string): Promise<void> {
    const hasRole = user.roles.includes(role);
    const action = hasRole ? `remove ${role} role from ${user.userName}` : `make ${user.userName} a ${role}`;
    const confirmed = await this.confirmService.confirm(`Are you sure you want to ${action}?`);
    if (!confirmed) return;

    user.togglingRoles.add(role);
    const call = hasRole
      ? this.adminService.removeRole(user.id, role)
      : this.adminService.assignRole(user.id, role);

    call.subscribe({
      next: res => {
        this.toastService.success(res.message);
        user.roles = hasRole ? user.roles.filter(r => r !== role) : [...user.roles, role];
        user.togglingRoles.delete(role);
      },
      error: () => {
        this.toastService.error('Failed to update role');
        user.togglingRoles.delete(role);
      }
    });
  }
}
