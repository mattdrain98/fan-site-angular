import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'confirm-email', loadComponent: () => import('./features/auth/confirm-email.component').then(m => m.ConfirmEmailComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'account/change-password', loadComponent: () => import('./features/auth/change-password.component').then(m => m.ChangePasswordComponent) },
  { path: 'new-users', loadComponent: () => import('./features/auth/new-users.component').then(m => m.NewUsersComponent) },
  { path: 'forum', loadComponent: () => import('./features/forum/forum-index.component').then(m => m.ForumIndexComponent) },
  { path: 'forum/create', loadComponent: () => import('./features/forum/forum-create.component').then(m => m.ForumCreateComponent) },
  { path: 'forum/:id', loadComponent: () => import('./features/forum/forum-topic.component').then(m => m.ForumTopicComponent) },
  { path: 'post/create/:forumId', loadComponent: () => import('./features/post/post-create.component').then(m => m.PostCreateComponent) },
  { path: 'post/:id', loadComponent: () => import('./features/post/post-index.component').then(m => m.PostIndexComponent) },
  { path: 'posts/mine', loadComponent: () => import('./features/post/user-posts.component').then(m => m.UserPostsComponent) },
  { path: 'top-posts', loadComponent: () => import('./features/post/top-posts.component').then(m => m.TopPostsComponent) },
  { path: 'latest-posts', loadComponent: () => import('./features/post/latest-posts.component').then(m => m.LatestPostsComponent) },
  { path: 'liked', loadComponent: () => import('./features/post/liked-posts.component').then(m => m.LikedPostsComponent) },
  { path: 'screenshots', loadComponent: () => import('./features/screenshot/screenshot-index.component').then(m => m.ScreenshotIndexComponent) },
  { path: 'screenshots/create', loadComponent: () => import('./features/screenshot/screenshot-create.component').then(m => m.ScreenshotCreateComponent) },
  { path: 'screenshots/mine', loadComponent: () => import('./features/screenshot/user-screenshots.component').then(m => m.UserScreenshotsComponent) },
  { path: 'profile/followers/:id', loadComponent: () => import('./features/profile/followers.component').then(m => m.FollowersComponent) },
  { path: 'profile/following/:id', loadComponent: () => import('./features/profile/following.component').then(m => m.FollowingComponent) },
  { path: 'profile/:id', loadComponent: () => import('./features/profile/profile-detail.component').then(m => m.ProfileDetailComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: '**', redirectTo: '' }
];
