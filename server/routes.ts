import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  contactSchema, 
  insertPostSchema, 
  insertCategorySchema, 
  insertTagSchema, 
  insertCommentSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session middleware
  interface Session {
    userId?: number;
    isAdmin?: boolean;
  }
  
  const sessions = new Map<string, Session>();
  
  app.use((req, res, next) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId && sessions.has(sessionId)) {
      (req as any).session = sessions.get(sessionId);
    }
    next();
  });

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const sessionId = Math.random().toString(36).substring(2, 15);
      sessions.set(sessionId, { userId: user.id, isAdmin: user.isAdmin });
      
      res.json({ 
        sessionId, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          isAdmin: user.isAdmin 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { category, featured, status } = req.query;
      const filters: any = {};
      
      if (category) filters.category = parseInt(category as string);
      if (featured !== undefined) filters.featured = featured === 'true';
      if (status) filters.status = status as string;
      else filters.status = 'published'; // Only show published posts for public
      
      const posts = await storage.getPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Only show published posts for public (unless admin)
      const isAdmin = (req as any).session?.isAdmin;
      if (post.status !== 'published' && !isAdmin) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementViewCount(id);
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.get("/api/posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Only show published posts for public (unless admin)
      const isAdmin = (req as any).session?.isAdmin;
      if (post.status !== 'published' && !isAdmin) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementViewCount(post.id);
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.get("/api/comments", async (req, res) => {
    try {
      const { postId } = req.query;
      const comments = await storage.getComments(
        postId ? parseInt(postId as string) : undefined,
        'approved' // Only show approved comments for public
      );
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = contactSchema.parse(req.body);
      // Here you would typically send an email or store the contact message
      console.log("Contact form submission:", contactData);
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Admin routes
  app.get("/api/admin/posts", requireAdmin, async (req, res) => {
    try {
      const { category, featured, status } = req.query;
      const filters: any = {};
      
      if (category) filters.category = parseInt(category as string);
      if (featured !== undefined) filters.featured = featured === 'true';
      if (status) filters.status = status as string;
      
      const posts = await storage.getPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/admin/posts", requireAdmin, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        ...postData,
        authorId: (req as any).session.userId,
      });
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create post" });
      }
    }
  });

  app.put("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const postData = insertPostSchema.partial().parse(req.body);
      const post = await storage.updatePost(id, postData);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update post" });
      }
    }
  });

  app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.get("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.get("/api/admin/tags", requireAdmin, async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.post("/api/admin/tags", requireAdmin, async (req, res) => {
    try {
      const tagData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tag" });
      }
    }
  });

  app.put("/api/admin/tags/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tagData = insertTagSchema.partial().parse(req.body);
      const tag = await storage.updateTag(id, tagData);
      res.json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update tag" });
      }
    }
  });

  app.delete("/api/admin/tags/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTag(id);
      res.json({ message: "Tag deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });

  app.get("/api/admin/comments", requireAdmin, async (req, res) => {
    try {
      const { postId, status } = req.query;
      const comments = await storage.getComments(
        postId ? parseInt(postId as string) : undefined,
        status as string
      );
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.put("/api/admin/comments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commentData = insertCommentSchema.partial().parse(req.body);
      const comment = await storage.updateComment(id, commentData);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update comment" });
      }
    }
  });

  app.delete("/api/admin/comments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
