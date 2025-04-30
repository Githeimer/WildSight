"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react"; // fallback icon
import { cn } from "@/lib/utils"; // assuming you're using shadcn setup with className merging

export default function SignInPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            <span className="text-black">Wild</span>
            <span className="text-green-600">Sight</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to your dashboard</p>
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-sm font-medium"
          onClick={handleGoogleSignIn}
        >
         <img src="https://img.icons8.com/color/512/google-logo.png" alt="google logo" className="h-8 " />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
