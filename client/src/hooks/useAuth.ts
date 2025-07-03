import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { LoginData, User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("sessionId")
  );

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("sessionId");
          setSessionId(null);
          return null;
        }
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
    enabled: !!sessionId,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      const { sessionId: newSessionId } = data;
      localStorage.setItem("sessionId", newSessionId);
      setSessionId(newSessionId);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (sessionId) {
        await apiRequest("POST", "/api/auth/logout", {});
      }
    },
    onSuccess: () => {
      localStorage.removeItem("sessionId");
      setSessionId(null);
      queryClient.clear();
      setLocation("/admin/login");
    },
  });

  const login = async (credentials: LoginData) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading: isLoading || loginMutation.isPending,
    isAuthenticated: !!user,
    login,
    logout,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}
