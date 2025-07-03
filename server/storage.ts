import {
  users,
  categories,
  tags,
  posts,
  postTags,
  comments,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Tag,
  type InsertTag,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type PostWithRelations,
  type CommentWithPost,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Tag operations
  getTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag>;
  deleteTag(id: number): Promise<void>;
  
  // Post operations
  getPosts(filters?: { category?: number; featured?: boolean; status?: string }): Promise<PostWithRelations[]>;
  getPost(id: number): Promise<PostWithRelations | undefined>;
  getPostBySlug(slug: string): Promise<PostWithRelations | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  incrementViewCount(id: number): Promise<void>;
  
  // Post-Tag operations
  addTagToPost(postId: number, tagId: number): Promise<void>;
  removeTagFromPost(postId: number, tagId: number): Promise<void>;
  getPostTags(postId: number): Promise<Tag[]>;
  
  // Comment operations
  getComments(postId?: number, status?: string): Promise<CommentWithPost[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  
  // Analytics
  getStats(): Promise<{
    totalPosts: number;
    totalComments: number;
    totalViews: number;
    totalCategories: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private tags: Map<number, Tag>;
  private posts: Map<number, Post>;
  private postTags: Map<number, { postId: number; tagId: number }>;
  private comments: Map<number, Comment>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentTagId: number;
  private currentPostId: number;
  private currentPostTagId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.posts = new Map();
    this.postTags = new Map();
    this.comments = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentTagId = 1;
    this.currentPostId = 1;
    this.currentPostTagId = 1;
    this.currentCommentId = 1;
    
    // Initialize with admin user and sample data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@thinkspeak.com",
      password: "admin123", // In production, this would be hashed
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample categories
    const categories = [
      { name: "Development", description: "Web development and programming" },
      { name: "AI & ML", description: "Artificial Intelligence and Machine Learning" },
      { name: "Cloud", description: "Cloud computing and infrastructure" },
      { name: "Design", description: "UI/UX and design principles" },
      { name: "DevOps", description: "DevOps and deployment strategies" },
    ];

    categories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        name: cat.name,
        description: cat.description,
        createdAt: new Date(),
      };
      this.categories.set(category.id, category);
    });

    // Create sample tags
    const tagNames = ["React", "TypeScript", "Node.js", "AWS", "Docker", "MongoDB", "GraphQL", "Python"];
    tagNames.forEach(name => {
      const tag: Tag = {
        id: this.currentTagId++,
        name,
        createdAt: new Date(),
      };
      this.tags.set(tag.id, tag);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      ...insertCategory,
      id: this.currentCategoryId++,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error("Category not found");
    }
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const tag: Tag = {
      ...insertTag,
      id: this.currentTagId++,
      createdAt: new Date(),
    };
    this.tags.set(tag.id, tag);
    return tag;
  }

  async updateTag(id: number, updateData: Partial<InsertTag>): Promise<Tag> {
    const tag = this.tags.get(id);
    if (!tag) {
      throw new Error("Tag not found");
    }
    const updatedTag = { ...tag, ...updateData };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: number): Promise<void> {
    this.tags.delete(id);
  }

  // Post operations
  async getPosts(filters?: { category?: number; featured?: boolean; status?: string }): Promise<PostWithRelations[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters?.category) {
      posts = posts.filter(post => post.categoryId === filters.category);
    }
    
    if (filters?.featured !== undefined) {
      posts = posts.filter(post => post.featured === filters.featured);
    }
    
    if (filters?.status) {
      posts = posts.filter(post => post.status === filters.status);
    }
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    // Add relations
    const postsWithRelations = await Promise.all(
      posts.map(async (post) => {
        const category = post.categoryId ? this.categories.get(post.categoryId) : undefined;
        const author = post.authorId ? this.users.get(post.authorId) : undefined;
        const tags = await this.getPostTags(post.id);
        const commentCount = Array.from(this.comments.values()).filter(
          comment => comment.postId === post.id && comment.status === "approved"
        ).length;
        
        return {
          ...post,
          category,
          author,
          tags,
          commentCount,
        };
      })
    );
    
    return postsWithRelations;
  }

  async getPost(id: number): Promise<PostWithRelations | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const category = post.categoryId ? this.categories.get(post.categoryId) : undefined;
    const author = post.authorId ? this.users.get(post.authorId) : undefined;
    const tags = await this.getPostTags(post.id);
    const commentCount = Array.from(this.comments.values()).filter(
      comment => comment.postId === post.id && comment.status === "approved"
    ).length;
    
    return {
      ...post,
      category,
      author,
      tags,
      commentCount,
    };
  }

  async getPostBySlug(slug: string): Promise<PostWithRelations | undefined> {
    const post = Array.from(this.posts.values()).find(p => p.slug === slug);
    if (!post) return undefined;
    
    return this.getPost(post.id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const post: Post = {
      ...insertPost,
      id: this.currentPostId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
    };
    this.posts.set(post.id, post);
    return post;
  }

  async updatePost(id: number, updateData: Partial<InsertPost>): Promise<Post> {
    const post = this.posts.get(id);
    if (!post) {
      throw new Error("Post not found");
    }
    const updatedPost = { ...post, ...updateData, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
    // Also delete related post-tags and comments
    Array.from(this.postTags.entries()).forEach(([key, postTag]) => {
      if (postTag.postId === id) {
        this.postTags.delete(key);
      }
    });
    Array.from(this.comments.entries()).forEach(([key, comment]) => {
      if (comment.postId === id) {
        this.comments.delete(key);
      }
    });
  }

  async incrementViewCount(id: number): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.viewCount = (post.viewCount || 0) + 1;
      this.posts.set(id, post);
    }
  }

  // Post-Tag operations
  async addTagToPost(postId: number, tagId: number): Promise<void> {
    const postTag = {
      postId,
      tagId,
    };
    this.postTags.set(this.currentPostTagId++, postTag);
  }

  async removeTagFromPost(postId: number, tagId: number): Promise<void> {
    Array.from(this.postTags.entries()).forEach(([key, postTag]) => {
      if (postTag.postId === postId && postTag.tagId === tagId) {
        this.postTags.delete(key);
      }
    });
  }

  async getPostTags(postId: number): Promise<Tag[]> {
    const tagIds = Array.from(this.postTags.values())
      .filter(pt => pt.postId === postId)
      .map(pt => pt.tagId);
    
    return tagIds.map(tagId => this.tags.get(tagId)).filter(Boolean) as Tag[];
  }

  // Comment operations
  async getComments(postId?: number, status?: string): Promise<CommentWithPost[]> {
    let comments = Array.from(this.comments.values());
    
    if (postId) {
      comments = comments.filter(comment => comment.postId === postId);
    }
    
    if (status) {
      comments = comments.filter(comment => comment.status === status);
    }
    
    // Sort by creation date (newest first)
    comments.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    // Add post relation
    const commentsWithPost = comments.map(comment => {
      const post = this.posts.get(comment.postId!);
      return {
        ...comment,
        post: post ? { id: post.id, title: post.title } : undefined,
      };
    });
    
    return commentsWithPost;
  }

  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment: Comment = {
      ...insertComment,
      id: this.currentCommentId++,
      createdAt: new Date(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async updateComment(id: number, updateData: Partial<InsertComment>): Promise<Comment> {
    const comment = this.comments.get(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    const updatedComment = { ...comment, ...updateData };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
  }

  // Analytics
  async getStats(): Promise<{
    totalPosts: number;
    totalComments: number;
    totalViews: number;
    totalCategories: number;
  }> {
    const totalPosts = this.posts.size;
    const totalComments = this.comments.size;
    const totalViews = Array.from(this.posts.values()).reduce((sum, post) => sum + (post.viewCount || 0), 0);
    const totalCategories = this.categories.size;
    
    return {
      totalPosts,
      totalComments,
      totalViews,
      totalCategories,
    };
  }
}

export const storage = new MemStorage();
