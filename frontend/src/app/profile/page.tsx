"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Nav } from "@/components/nav";
import API from "@/services/api";
import { AuthService } from "@/app/login/page"; // Import AuthService

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      // Check authentication status first
      if (!AuthService.isAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        // Get CSRF token before making the request
        const csrfToken = await AuthService.getCsrfToken();

        // Make the profile request with credentials
        const response = await API.get("/api/profile/", {
          headers: {
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        });

        // If successful, update user state
        setUser(response.data);
        setLoading(false);
      } catch (err: any) {
        // Detailed error handling
        if (err.response) {
          // The request was made and the server responded with a status code
          if (err.response.status === 401 || err.response.status === 403) {
            // Unauthorized or forbidden - clear auth and redirect to login
            AuthService.logout();
            router.replace("/login");
          } else {
            setError(`Failed to load profile: ${err.response.data.detail || 'Unknown error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError("No response from server. Please check your internet connection.");
        } else {
          // Something happened in setting up the request
          setError("An unexpected error occurred. Please try again.");
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.replace("/login")} className="w-full">
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p><strong>Name:</strong> {user?.user_first_name} {user?.user_last_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}