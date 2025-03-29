'use client'
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Nav } from "@/components/nav";
import API from "@/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Improved CSRF token retrieval
  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      setError("CSRF token is missing. Please refresh the page.");
      return;
    }

    try {
      const response = await API.post("/api/login/", 
        { 
          email, 
          password 
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Store authentication information more securely
        const { token, user } = response.data;
        
        // Use sessionStorage for more secure token storage
        sessionStorage.setItem("auth_token", token);
        sessionStorage.setItem("user_info", JSON.stringify(user));
        
        // Set a flag to indicate the user is authenticated
        localStorage.setItem("is_authenticated", "true");

        // Redirect to the intended page or default to profile
        const nextPage = searchParams.get("next") || "/profile";
        router.replace(nextPage);
      }
    } catch (err: any) {
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        setError(err.response.data.detail || "Login failed. Please check your credentials.");
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request
        setError("An unexpected error occurred. Please try again.");
      }
      setPassword("");
    }
  };

  // Logout function (can be used globally)
  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      
      await API.post("/api/logout/", 
        {},
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );

      // Clear all authentication-related storage
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user_info");
      localStorage.removeItem("is_authenticated");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Even if logout API call fails, clear local storage
      sessionStorage.clear();
      localStorage.removeItem("is_authenticated");
      router.push("/login");
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = localStorage.getItem("is_authenticated") === "true";
      const authToken = sessionStorage.getItem("auth_token");

      if (isAuthenticated && authToken) {
        // Optional: Validate token with backend
        // You might want to add an endpoint to validate the token
        return true;
      }
      return false;
    };

    // If already authenticated, redirect to profile
    if (checkAuthStatus()) {
      router.replace("/profile");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}