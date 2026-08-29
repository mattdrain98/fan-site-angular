//------------------GLOBAL STATS------------------\\
export interface HomeStatsDto {
  totalMembers: number;
  totalPosts:   number;
  totalForums:  number;
  totalReplies: number;
}

//------------------FORUMS------------------\\
export interface ForumDto extends AuthorDto {
  forumId: number;
  forumTitle: string;
  description?: string;
  postsCount: number;
}

export interface AddForumDto {
  title: string;
  description?: string;
}

//------------------POSTS------------------\\
export interface PostDto extends AuthorDto {
  postId: number;
  title: string;
  content: string;
  totalLikes: number;
  repliesCount: number;
  forumId?: number;
  forumName?: string;
  postImages?: PostImageDto[];
}

export interface PostDetailDto extends PostDto {
  replies: PostReplyDto[];
  likes: LikeDto[];
  userHasLiked: boolean;
}

export interface PostImageDto {
  id: number;
  url: string;
}

export interface AddPostDto {
  title: string;
  content: string;
  forumId: number;
  imageUrls: string[];
}

export interface EditPostDto {
  title: string;
  content?: string;
  newImageUrls?: string[]; 
}

//------------------POST REPLIES------------------\\
export interface PostReplyDto extends AuthorDto {
  id: number;
  postId: number;
  replyContent: string;
}

export interface ReplyDetailDto {
  id: number;
  replyContent: string;
  datePosted: string;
  authorId: string;
  authorName: string;
  authorImagePath?: string;
  authorRating: number;
  postId: number;
  postTitle: string;
}

//------------------LIKES------------------\\
export interface LikeDto {
  id?: number;
  user?: { id: string; userName: string };
}

//------------------SCREENSHOTS------------------\\
export interface ScreenshotDto extends AuthorDto {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  slug: string;
}

//------------------PROFILES------------------\\
export interface ProfileDto {
  userId: string;
  userName: string;
  userRating: string;
  profileImageUrl?: string;
  memberSince: string;
  following: number;
  followers: number;
  follows: FollowDto[];
  followings: FollowDto[];
  profileComments: ProfileCommentDto[];
  bio?: string;
  isFollowing: boolean;
  roles?: string[];
  isHidden?: boolean;
}

export interface ProfileCommentDto extends AuthorDto {
  id?: number;
  commentContent: string;
  profileUserImageUrl?: string;
  profileUserName: string;
  profileUserId: string;
  profileUserRating: number;
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
export interface SearchResultDto {
  posts: PostDto[];      
  searchQuery: string;
  emptySearchResults: boolean;
  page: number;         
  totalPages: number;
  totalPosts: number;
  forum? : ForumDto; 
}

//------------------MEDIA------------------\\
export interface MediaDto extends AuthorDto {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  mediaType: 'screenshot' | 'clip' | 'artwork' | string;
  slug: string;
}

//------------------NOTIFICATIONS------------------\\
export interface NotificationDto {
  id: number;
  message: string;
  link: string;
  isRead: boolean;
  type: string;
  createdOn: string;
}

//------------------AUTHOR------------------\\
export interface AuthorDto {
  authorId: string;
  authorName: string;
  authorRating: number;
  authorImagePath?: string;
  datePosted: string;
}