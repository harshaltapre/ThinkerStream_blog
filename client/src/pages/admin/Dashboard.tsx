import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, MessageCircle, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { PostWithRelations } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in as an admin to access this page.",
        variant: "destructive",
      });
      setLocation("/admin/login");
    }
  }, [user, authLoading, setLocation, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: recentPosts } = useQuery<PostWithRelations[]>({
    queryKey: ["/api/admin/posts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.username}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stats-card text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Total Posts</p>
                    <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
                  </div>
                  <FileText className="w-8 h-8 text-white/80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalViews || 0}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Comments</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalComments || 0}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Categories</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalCategories || 0}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Posts</CardTitle>
                <Button className="btn-gradient">
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts?.slice(0, 5).map((post) => (
                      <tr key={post.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{post.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          {post.category && (
                            <Badge variant="secondary" className="category-tag">
                              {post.category.name}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={post.status === "published" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(post.createdAt!), "MMM d, yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
