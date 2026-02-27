import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { NewUsersComponent } from './features/auth/new-users.component';
import { ForumIndexComponent } from './features/forum/forum-index.component';
import { ForumTopicComponent } from './features/forum/forum-topic.component';
import { ForumCreateComponent } from './features/forum/forum-create.component';
import { PostIndexComponent } from './features/post/post-index.component';
import { PostCreateComponent, PostEditComponent, UserPostsComponent, TopPostsComponent } from './features/post/post-extra.components';
import { ReplyCreateComponent } from './features/reply/reply-create.component';
import { ScreenshotIndexComponent, UserScreenshotsComponent } from './features/screenshot/screenshot.components';
import { ScreenshotCreateComponent } from './features/screenshot/screenshot-create.component';
import { ProfileDetailComponent } from './features/profile/profile-detail.component';
import { EditBioComponent, EditUsernameComponent, FollowersComponent, FollowingComponent, ProfileCommentCreateComponent } from './features/profile/profile-extra.components';
import { SearchResultsComponent } from './features/search/search-results.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account/change-password', component: ChangePasswordComponent },
  { path: 'new-users', component: NewUsersComponent },
  { path: 'forum', component: ForumIndexComponent },
  { path: 'forum/create', component: ForumCreateComponent },
  { path: 'forum/:id', component: ForumTopicComponent },
  { path: 'post/create/:forumId', component: PostCreateComponent },
  { path: 'post/edit/:id', component: PostEditComponent },
  { path: 'post/:id', component: PostIndexComponent },
  { path: 'posts/mine', component: UserPostsComponent },
  { path: 'top-posts', component: TopPostsComponent },
  { path: 'reply/create/:postId', component: ReplyCreateComponent },
  { path: 'screenshots', component: ScreenshotIndexComponent },
  { path: 'screenshots/create', component: ScreenshotCreateComponent },
  { path: 'screenshots/mine', component: UserScreenshotsComponent },
  { path: 'profile/:id', component: ProfileDetailComponent },
  { path: 'profile/edit-bio/:id', component: EditBioComponent },
  { path: 'profile/edit-username/:id', component: EditUsernameComponent },
  { path: 'profile/followers/:id', component: FollowersComponent },
  { path: 'profile/following/:id', component: FollowingComponent },
  { path: 'profile-comment/create/:id', component: ProfileCommentCreateComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
