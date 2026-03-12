//------------------GLOBAL STATS------------------\\
export interface HomeStatsDto {
  totalMembers: number;
  totalPosts:   number;
  totalForums:  number;
  totalReplies: number;
}

//------------------FORUMS------------------\\
export interface ForumListingModel {
  id: number;
  name: string;
  description?: string;
  authorId: string;
  authorName: string;
  authorRating: string;
}

export interface ForumTopicModel {
  posts: PostListingModel[];
  forum: ForumListingModel;
  searchQuery?: string;
}

export interface ForumDto {
  forumId: number;
  forumTitle: string;
  description?: string;
  userId: string;
  userName: string;
  userRating: number;
  postsCount: number;
}

//------------------POSTS------------------\\
export interface PostListingModel {
  id: number;
  title: string;
  authorId: string;
  authorName: string;
  authorRating: number;
  totalLikes: number;
  datePosted: string;
  repliesCount: number;
  forum?: ForumListingModel;
  forumId?: number;
  forumName?: string;
  postImages?: PostImageDto[];
}

export interface PostIndexModel {
  postId: number;
  title: string;
  authorName: string;
  authorId: string;
  authorRating: number;
  authorImageUrl?: string;
  date: string;
  postContent: string;
  replies: PostReplyModel[];
  totalLikes: number;
  likes: LikeModel[];
  forumId: number;
  forumName: string;
  userHasLiked: boolean;
  postImages?: PostImageDto[];
}

export interface PostImageDto {
  id: number;
  url: string;
}

export interface NewPostModel {
  title: string;
  content: string;
  forumId: number;
  imageUrls: string[];
}

export interface PostTopicModel {
  forumId: number;
  forumName: string;
  posts: PostListingModel[];
}

export interface PostEditModel {
  title: string;
  content: string;
  newImageUrls?: string[];
}

export interface EditPostDto {
  title: string;
  content?: string;
}

//------------------POST REPLIES------------------\\
export interface PostReplyModel {
  id: number;
  authorImageUrl?: string;
  authorName: string;
  authorId: string;
  authorRating: number;
  date: string;
  replyContent: string;
  postId: number;
  postContent: string;
  postTitle: string;
  forumId: number;
  forumName: string;
}

export interface PostReplyDto {
  postId: number;
  postTitle: string;
  postContent: string;
  replyContent: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string;
  authorRating: number;
  date: string;
  forumId: number;
  forumName: string;
}

//------------------LIKES------------------\\
export interface LikeModel {
  id?: number;
  user?: { id: string; userName: string };
}

//------------------SCREENSHOTS------------------\\
export interface ScreenshotDto {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRating: number;
  datePosted: string;
  imageUrl: string;
  slug: string;
}

//------------------PROFILES------------------\\
export interface ProfileModel {
  userId: string;
  userName: string;
  userRating: string;
  profileImageUrl?: string;
  memberSince: string;
  following: number;
  followers: number;
  follows: FollowDto[];
  followings: FollowDto[];
  profileComments: ProfileCommentDto [];
  bio?: string;
  isFollowing: boolean; 
}

export interface ProfileCommentDto  {
  id?: number;
  profileUserImageUrl?: string;
  profileUserName: string;
  profileUserId: string;
  profileUserRating: number;
  date?: string;
  commentContent: string;
  commentUserImagePath?: string;
  commentUserName?: string;
  commentUserRating?: number;
  commentUserId: string;
}

export interface FollowDto {
  id: string;
  userName: string;
  imagePath?: string;
  rating: number;
  memberSince: string;
}

export interface ApplicationUser {
  id: string;
  userName: string;
  email: string;
  imagePath?: string;
  rating: number;
  memberSince: string;
  followers: number;
  following: number;
}

export interface ProfileEditModel {
  userId: string;
  userName: string;
  bio?: string;
}

//------------------SEARCH------------------\\
export interface SearchResultModel {
  posts: PostListingModel[];
  searchQuery: string;
  emptySearchResults: boolean;
}

export interface MediaDto {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorRating: number;
  datePosted: string;   // ISO 8601 string from the API — pipe through date pipe in templates
  imageUrl: string;
  mediaType: 'screenshot' | 'clip' | 'artwork' | string;  // extend as your backend grows
  slug: string;
}