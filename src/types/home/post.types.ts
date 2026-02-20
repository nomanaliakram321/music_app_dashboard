export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface UsePostsResult {
  posts: Post[];
  isLoading: boolean;
  handleCreatePost: () => void;
  isPosting: boolean;
}
