import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Trash2, Search, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createAuthorizedRequest } from "@/lib/authUtils";
import type { CommentWithPost } from "@shared/schema";

export default function CommentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: comments, isLoading } = useQuery<CommentWithPost[]>({
    queryKey: ["/api/admin/comments", { status: statusFilter === "all" ? undefined : statusFilter }],
    queryFn: async () => {
      const url = statusFilter === "all" 
        ? "/api/admin/comments"
        : `/api/admin/comments?status=${statusFilter}`;
      const response = await createAuthorizedRequest("GET", url);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await createAuthorizedRequest("PUT", `/api/admin/comments/${id}`, { status });
      if (!response.ok) throw new Error("Failed to update comment");
      return response.json();
    },
    onSuccess: (_, { status }) => {
      const action = status === "approved" ? "approved" : "rejected";
      toast({ title: "Success", description: `Comment ${action} successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await createAuthorizedRequest("DELETE", `/api/admin/comments/${id}`);
      if (!response.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Comment deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredComments = comments?.filter(comment => {
    const matchesSearch = 
      comment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.post?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = (id: number) => {
    updateCommentMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: number) => {
    updateCommentMutation.mutate({ id, status: "rejected" });
  };

  const handleDelete = (id: number) => {
    deleteCommentMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingCount = comments?.filter(c => c.status === "pending").length || 0;
  const approvedCount = comments?.filter(c => c.status === "approved").length || 0;
  const rejectedCount = comments?.filter(c => c.status === "rejected").length || 0;

  if (!user?.isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Comment Management</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Comments</p>
                    <p className="text-2xl font-bold text-foreground">{comments?.length || 0}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Approved</p>
                    <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredComments?.map((comment) => (
                <Card key={comment.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {comment.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{comment.name}</h4>
                            <p className="text-sm text-muted-foreground">{comment.email}</p>
                          </div>
                          {getStatusBadge(comment.status)}
                        </div>
                        
                        <div className="ml-14">
                          <p className="text-foreground mb-2 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                            <span>
                              Post: <span className="text-foreground">{comment.post?.title}</span>
                            </span>
                            <span>
                              {format(new Date(comment.createdAt!), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {comment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(comment.id)}
                                  disabled={updateCommentMutation.isPending}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(comment.id)}
                                  disabled={updateCommentMutation.isPending}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {comment.status === "approved" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(comment.id)}
                                disabled={updateCommentMutation.isPending}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            )}
                            
                            {comment.status === "rejected" && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(comment.id)}
                                disabled={updateCommentMutation.isPending}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-destructive">
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this comment by {comment.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(comment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {filteredComments?.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
