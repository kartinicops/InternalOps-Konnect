"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Nav } from "@/components/nav";
import API from "@/services/api"; // Adjust path if needed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query params


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message
  
    const csrfToken = document.cookie
      .split("; ")
      .find(row => row.startsWith("csrftoken="))
      ?.split("=")[1];
  
    try {
      const response = await API.post(
        "/api/login/",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken, // Include CSRF token in the headers
          },
          withCredentials: true, // Make sure cookies are sent with the request
        }
      );
  
      if (response.status === 200) {
        const { token, is_staff } = response.data; // Anggap bahwa token diterima dalam response
        localStorage.setItem("auth_token", token); // Menyimpan token di localStorage
  
        const nextPage = searchParams.get("next") || (is_staff ? "/admin-dashboard" : "/projects");
        router.replace(nextPage); // Redirect user setelah login sukses
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
      setPassword(""); // Reset password input untuk keamanan
    }
  };
  
  
  
  

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
