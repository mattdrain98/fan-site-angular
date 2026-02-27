import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'account/change-password', loadComponent: () => import('./features/auth/change-password.component').then(m => m.ChangePasswordComponent) },
  { path: 'new-users', loadComponent: () => import('./features/auth/new-users.component').then(m => m.NewUsersComponent) },
  { path: 'forum', loadComponent: () => import('./features/forum/forum-index.component').then(m => m.ForumIndexComponent) },
  { path: 'forum/create', loadComponent: () => import('./features/forum/forum-create.component').then(m => m.ForumCreateComponent) },
  { path: 'forum/:id', loadComponent: () => import('./features/forum/forum-topic.component').then(m => m.ForumTopicComponent) },
  { path: 'post/create/:forumId', loadComponent: () => import('./features/post/post-create.component').then(m => m.PostCreateComponent) },
  { path: 'post/edit/:id', loadComponent: () => import('./features/post/post-edit.component').then(m => m.PostEditComponent) },
  { path: 'post/:id', loadComponent: () => import('./features/post/post-index.component').then(m => m.PostIndexComponent) },
  { path: 'posts/mine', loadComponent: () => import('./features/post/user-posts.component').then(m => m.UserPostsComponent) },
  { path: 'top-posts', loadComponent: () => import('./features/post/top-posts.component').then(m => m.TopPostsComponent) },
  { path: 'reply/create/:postId', loadComponent: () => import('./features/reply/reply-create.component').then(m => m.ReplyCreateComponent) },
  { path: 'screenshots', loadComponent: () => import('./features/screenshot/screenshot-index.component').then(m => m.ScreenshotIndexComponent) },
  { path: 'screenshots/create', loadComponent: () => import('./features/screenshot/screenshot-create.component').then(m => m.ScreenshotCreateComponent) },
  { path: 'screenshots/mine', loadComponent: () => import('./features/screenshot/user-screenshots.component').then(m => m.UserScreenshotsComponent) },
  { path: 'profile/:id', loadComponent: () => import('./features/profile/profile-detail.component').then(m => m.ProfileDetailComponent) },
  { path: 'profile/edit-bio/:id', loadComponent: () => import('./features/profile/edit-bio.component').then(m => m.EditBioComponent) },
  { path: 'profile/edit-username/:id', loadComponent: () => import('./features/profile/edit-username.component').then(m => m.EditUsernameComponent) },
  { path: 'profile/followers/:id', loadComponent: () => import('./features/profile/followers.component').then(m => m.FollowersComponent) },
  { path: 'profile/following/:id', loadComponent: () => import('./features/profile/following.component').then(m => m.FollowingComponent) },
  { path: 'profile-comment/create/:id', loadComponent: () => import('./features/profile/profile-comment-create.component').then(m => m.ProfileCommentCreateComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search-results.component').then(m => m.SearchResultsComponent) },
  { path: '**', redirectTo: '' }
];
