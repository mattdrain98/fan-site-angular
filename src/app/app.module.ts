import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CredentialsInterceptor } from './core/interceptors/credentials.interceptor';

// Shared
import { NavbarComponent } from './shared/components/navbar.component';

// Auth
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { NewUsersComponent } from './features/auth/new-users.component';

// Home
import { HomeComponent } from './features/home/home.component';

// Forum
import { ForumIndexComponent } from './features/forum/forum-index.component';
import { ForumTopicComponent } from './features/forum/forum-topic.component';
import { ForumCreateComponent } from './features/forum/forum-create.component';

// Post
import { PostIndexComponent } from './features/post/post-index.component';
import { PostCreateComponent, PostEditComponent, UserPostsComponent, TopPostsComponent } from './features/post/post-extra.components';

// Reply
import { ReplyCreateComponent } from './features/reply/reply-create.component';

// Screenshot
import { ScreenshotIndexComponent, UserScreenshotsComponent } from './features/screenshot/screenshot.components';
import { ScreenshotCreateComponent } from './features/screenshot/screenshot-create.component';

// Profile
import { ProfileDetailComponent } from './features/profile/profile-detail.component';
import { EditBioComponent, EditUsernameComponent, FollowersComponent, FollowingComponent, ProfileCommentCreateComponent } from './features/profile/profile-extra.components';

// Search
import { SearchResultsComponent } from './features/search/search-results.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent, RegisterComponent, ChangePasswordComponent, NewUsersComponent,
    HomeComponent,
    ForumIndexComponent, ForumTopicComponent, ForumCreateComponent,
    PostIndexComponent, PostCreateComponent, PostEditComponent, UserPostsComponent, TopPostsComponent,
    ReplyCreateComponent,
    ScreenshotIndexComponent, UserScreenshotsComponent, ScreenshotCreateComponent,
    ProfileDetailComponent, EditBioComponent, EditUsernameComponent, FollowersComponent, FollowingComponent, ProfileCommentCreateComponent,
    SearchResultsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
