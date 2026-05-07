import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDto } from '../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private auth     = inject(AuthService);
  private router   = inject(Router);
  private notifSvc = inject(NotificationService);

  currentUser$ = this.auth.currentUser$;

  menuOpen          = false;
  dropdownOpen      = false;
  mobileUserOpen    = false;
  postsDropdownOpen = false;
  notifOpen         = false;
  badgePulse        = false;

  notifications: NotificationDto[] = [];
  notifLoading = false;
  unreadCount  = 0;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.notifSvc.unreadCount$.subscribe(c => this.unreadCount = c),
      this.notifSvc.newNotif$.subscribe(() => {
        this.badgePulse = false;
        setTimeout(() => this.badgePulse = true, 0);
        setTimeout(() => this.badgePulse = false, 600);
      }),
      this.auth.currentUser$.subscribe(user => {
        if (user) {
          this.notifSvc.startPolling();
        } else {
          this.notifSvc.stopPolling();
          this.notifications = [];
          this.notifOpen = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleNotif(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) {
      this.dropdownOpen = false;
      this.postsDropdownOpen = false;
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notifLoading = true;
    this.notifSvc.getAll().subscribe({
      next:  n  => { this.notifications = n; this.notifLoading = false; },
      error: () => { this.notifLoading = false; }
    });
  }

  onNotifClick(notif: NotificationDto): void {
    this.notifOpen = false;
    if (!notif.isRead) {
      notif.isRead = true;
      this.notifSvc.markAsRead(notif.id).subscribe();
    }
    if (notif.link) this.router.navigateByUrl(notif.link);
  }

  markAllAsRead(): void {
    this.notifSvc.markAllAsRead().subscribe(() =>
      this.notifications.forEach(n => n.isRead = true)
    );
  }

  deleteNotification(notif: NotificationDto, e: Event): void {
    e.stopPropagation();
    this.notifSvc.delete(notif.id, !notif.isRead).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notif.id);
    });
  }

  notifIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'like':            return 'favorite';
      case 'reply':           return 'reply';
      case 'follow':          return 'person_add';
      case 'comment':
      case 'profile_comment': return 'chat_bubble';
      default:                return 'notifications';
    }
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.dropdownOpen = false;
      this.router.navigate(['/login']);
    });
  }

  isPostsRouteActive(): boolean {
    return this.router.url.startsWith('/top-posts') || this.router.url.startsWith('/latest-posts');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const t = e.target as HTMLElement;
    if (!t.closest('.nav-dropdown'))                                  this.dropdownOpen      = false;
    if (!t.closest('.notif-wrap'))                                    this.notifOpen         = false;
    if (!t.closest('.nav-links') && !t.closest('.nav-toggler'))       this.menuOpen          = false;
  }
}
