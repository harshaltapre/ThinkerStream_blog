import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle } from "lucide-react";
import type { CommentWithPost } from "@shared/schema";

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useQuery<CommentWithPost[]>({
    queryKey: ["/api/comments", { postId }],
    queryFn: async () => {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="h-5 w-5" />
            <span className="text-lg font-semibold">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="h-5 w-5" />
            <span className="text-lg font-semibold">No comments yet</span>
          </div>
          <p className="text-muted-foreground">Be the first to leave a comment!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="h-5 w-5" />
          <span className="text-lg font-semibold">Comments ({comments.length})</span>
        </div>
        
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <div key={comment.id}>
              <div className="comment-thread">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {comment.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-semibold text-foreground">{comment.name}</h5>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt!), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-foreground mb-3 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
              {index < comments.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
