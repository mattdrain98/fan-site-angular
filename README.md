# FanWebsite — Angular Frontend

Full Angular 17 conversion of all Razor views. Every component maps 1-to-1 to its original `.cshtml` file.

## View → Component Map

| Razor View | Angular Component |
|---|---|
| `_Layout.cshtml` | `AppComponent` + `NavbarComponent` |
| `Home/Index.cshtml` | `HomeComponent` |
| `Account/Login.cshtml` | `LoginComponent` |
| `Account/Register.cshtml` | `RegisterComponent` |
| `Account/ChangePassword.cshtml` | `ChangePasswordComponent` |
| `Account/NewUsers.cshtml` | `NewUsersComponent` |
| `Forum/Index.cshtml` | `ForumIndexComponent` |
| `Forum/Topic.cshtml` | `ForumTopicComponent` |
| `Forum/Create.cshtml` | `ForumCreateComponent` |
| `Post/Index.cshtml` | `PostIndexComponent` |
| `Post/Create.cshtml` | `PostCreateComponent` |
| `Post/Edit.cshtml` | `PostEditComponent` |
| `Post/UserPosts.cshtml` | `UserPostsComponent` |
| `Post/TopPosts.cshtml` | `TopPostsComponent` |
| `Reply/Create.cshtml` | `ReplyCreateComponent` |
| `Screenshot/Index.cshtml` | `ScreenshotIndexComponent` |
| `Screenshot/UserScreenshots.cshtml` | `UserScreenshotsComponent` |
| `Screenshot/Create.cshtml` | `ScreenshotCreateComponent` |
| `Profile/Detail.cshtml` | `ProfileDetailComponent` |
| `Profile/EditBio.cshtml` | `EditBioComponent` |
| `Profile/EditUserName.cshtml` | `EditUsernameComponent` |
| `Profile/Followers.cshtml` | `FollowersComponent` |
| `Profile/Following.cshtml` | `FollowingComponent` |
| `ProfileComment/Create.cshtml` | `ProfileCommentCreateComponent` |
| `Search/Results.cshtml` | `SearchResultsComponent` |

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Set your API URL
`src/environments/environment.ts`:
```ts
apiBaseUrl: 'https://localhost:7001/api'  // your Web API port
```

### 3. Copy your static assets
Copy from your MVC project's `wwwroot/` into `src/assets/`:
```
wwwroot/css/site.css        → src/assets/css/site.css
wwwroot/css/images.css      → src/assets/css/images.css
wwwroot/images/             → src/assets/images/
wwwroot/videos/             → src/assets/videos/
```

### 4. CORS in Program.cs (required for cookie auth)
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("Angular", policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());   // ← essential for cookie auth
});

app.UseCors("Angular");         // before UseAuthentication
app.UseAuthentication();
app.UseAuthorization();
```

### 5. Run
```bash
ng serve   # http://localhost:4200
```

---

## Auth Notes

Your API uses **ASP.NET Identity cookie auth** (not JWT). The `CredentialsInterceptor` 
sends `withCredentials: true` on every request so the browser includes the auth cookie 
automatically. No token storage needed.

After login, call a `/api/account/me` endpoint (you'll need to add this) to get the 
current user's id, username, and imagePath to store in `AuthService.currentUser$`.
This powers the navbar dropdown and own-content checks throughout the app.

A minimal endpoint to add to `AccountController`:
```csharp
[HttpGet("me")]
[Authorize]
public async Task<ActionResult> Me()
{
    var user = await _userManager.GetUserAsync(User);
    if (user == null) return Unauthorized();
    return Ok(new { userId = user.Id, userName = user.UserName, imagePath = user.ImagePath });
}
```

Then in `AuthService.login()`, after the login succeeds, call `/api/account/me` and 
pass the result to `setCurrentUser()`.

---

## Top Posts

Your API doesn't currently have a `GET /api/post/top` endpoint.
`TopPostsComponent` calls it — add this to `PostController`:
```csharp
[HttpGet("top")]
public ActionResult<IEnumerable<PostListingModel>> GetTopPosts()
{
    var posts = postService.GetAll()
        .OrderByDescending(p => p.TotalLikes)
        .Take(20)
        .Select(post => new PostListingModel { ... });
    return Ok(posts);
}
```
