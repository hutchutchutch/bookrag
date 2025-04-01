import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/contexts/toast-context";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  loginWithGoogle: () => void;
  loginAsTestUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

function useLogoutMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const logoutMutation = useLogoutMutation();

  const loginWithGoogle = () => {
    // Use the absolute URL to ensure proper redirects with custom domains
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/api/auth/google`;
    console.log(`Redirecting to Google OAuth: ${baseUrl}/api/auth/google`);
  };

  const loginAsTestUser = async () => {
    try {
      const response = await apiRequest("POST", "/api/test-login");
      queryClient.setQueryData(["/api/user"], response);
      toast({
        title: "Logged in as test user",
        description: "You now have access to all features",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login as test user",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        logoutMutation,
        loginWithGoogle,
        loginAsTestUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}