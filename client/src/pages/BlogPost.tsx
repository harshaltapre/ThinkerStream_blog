import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Eye, Calendar, Clock, Share2 } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import CategoryTag from "@/components/CategoryTag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PostWithRelations } from "@shared/schema";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "0");

  const { data: post, isLoading, error } = useQuery<PostWithRelations>({
    queryKey: ["/api/posts", postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      return response.json();
    },
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-80 bg-muted rounded mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const readingTime = Math.ceil(post.content.length / 1000);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article className="bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <img
              src={post.featuredImage || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"}
              alt={post.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-2 mb-4">
                {post.featured && (
                  <Badge className="featured-badge text-white">Featured</Badge>
                )}
                {post.category && (
                  <CategoryTag category={post.category} />
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {post.title}
              </h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {post.author?.username?.charAt(0).toUpperCase() || "T"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {post.author?.username || "ThinkerStream"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {format(new Date(post.createdAt!), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{post.viewCount || 0} views</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="blog-content prose prose-lg max-w-none dark:prose-invert">
              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-6 font-medium">
                  {post.excerpt}
                </p>
              )}
              <div className="whitespace-pre-wrap text-foreground">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="border-t border-border pt-8 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground font-medium">Share this post:</span>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12 space-y-8">
          <CommentList postId={postId} />
          <CommentForm postId={postId} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
