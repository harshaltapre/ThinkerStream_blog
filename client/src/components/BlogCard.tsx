import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import type { PostWithRelations } from "@shared/schema";
import CategoryTag from "./CategoryTag";

interface BlogCardProps {
  post: PostWithRelations;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const readingTime = Math.ceil(post.content.length / 1000);

  return (
    <Card className="overflow-hidden card-hover">
      <div className="relative">
        <img
          src={post.featuredImage || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex space-x-2">
          {featured && (
            <Badge className="featured-badge text-white">Featured</Badge>
          )}
          {post.category && (
            <CategoryTag category={post.category} />
          )}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm text-muted-foreground">
            {format(new Date(post.createdAt!), "MMM d, yyyy")}
          </span>
        </div>
        
        <Link href={`/post/${post.id}`}>
          <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt || post.content.substring(0, 150) + "..."}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {post.author?.username?.charAt(0).toUpperCase() || "T"}
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {post.author?.username || "ThinkerStream"}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.viewCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentCount || 0}</span>
            </div>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
