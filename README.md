# Home Page
1. Created a landing page displaying total users, posts, forums, and replies. Also includes trending posts (anything posted in last 24 hours), most recent posts, and most popular forums (forums that contain most posts).
2. Home page also includes latest gaming moments which are just screenshots being displayed from the screenshots page. 
<img width="2559" height="1304" alt="HomePage" src="https://github.com/user-attachments/assets/ae4cb5a8-7daf-4bc8-abea-e7a87ef03f84" />

# Screenshots Page
1. Created image uploads using Azure Blob storage. Users are able to click on images to expand them, with the description being displayed underneath. 
<img width="2559" height="1304" alt="ScreenshotsPage" src="https://github.com/user-attachments/assets/b4b0f87f-1bda-46bf-8f55-49febea884a7" />
<img width="2559" height="1304" alt="ScreenshotDisplay" src="https://github.com/user-attachments/assets/bc52692f-7986-4e13-a9c1-d86844f2d5db" />

# Forum Page
1. Created forum page which users can create themselves.
2. Users can edit or delete their created forums, admins/moderators can also delete any forums.
3. Pagination used (this is used on any list pages on the website). 
<img width="2560" height="1301" alt="ForumPage" src="https://github.com/user-attachments/assets/cfd97cd8-d1d0-41b7-89d0-f0e0215fbc96" />

# Forum Display
1. Forums include a chat that the user can choose to ignore, or choose to join (this is stored separately since there are plans to create a "My Chats" section for a user to interact which the chats they have joined).
2. The forum chat uses SignalR to dynamically update the chat, as well as create a typing indicator to show when users are typing. This is also limited to display 2 users, anymore should say "multiple users typing". 
3. Users can choose to post within these forums, allowed them to also edit or delete these posts after they are created. 
<img width="2560" height="1303" alt="ForumListingPage" src="https://github.com/user-attachments/assets/2501b5fc-8504-4a4b-a417-ae57667dabf5" />


# New Users Page
1. Nothing too fancy, just a simple EF query to pull the last 10 users who joined the site. This is meant to increase interactivity on the website.
2. User pages also include the Following page, and Followers page since users can follow each other. 
<img width="2560" height="1301" alt="NewUsers" src="https://github.com/user-attachments/assets/77328cb4-b487-4511-8295-fd5260de193c" />

