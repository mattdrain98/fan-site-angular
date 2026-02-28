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
}

export interface PostIndexModel {
  id: number;
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
}

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

export interface LikeModel {
  id?: number;
  user?: { id: string; userName: string };
}

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
  profileComments: ProfileCommentModel[];
  bio?: string;
}

export interface FollowDto {
  id: string;
  userName: string;
  imagePath?: string;
  rating: number;
  memberSince: string;
}

export interface ProfileCommentModel {
  id?: number;
  authorImageUrl?: string;
  authorName: string;
  authorId: string;
  authorRating: number;
  date?: string;
  commentContent: string;
  otherUserImagePath?: string;
  otherUserName?: string;
  otherUserRating?: number;
  userId: string;
}

export interface HomeIndexModel {
  latestPosts: PostListingModel[];
  searchQuery: string;
}

export interface SearchResultModel {
  posts: PostListingModel[];
  searchQuery: string;
  emptySearchResults: boolean;
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