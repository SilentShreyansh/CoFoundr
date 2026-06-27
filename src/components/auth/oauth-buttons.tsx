"use client";

import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.08 1.08-2.77 2.27-5.72 2.27-4.56 0-8.13-3.68-8.13-8.24s3.57-8.24 8.13-8.24c2.46 0 4.26.97 5.59 2.23l2.31-2.31C18.55 2.06 16.07 1 12.48 1 5.86 1 .42 6.24.42 12.86s5.44 11.86 12.06 11.86c3.57 0 6.27-1.17 8.36-3.35 2.15-2.15 2.83-5.18 2.83-7.62 0-.76-.05-1.46-.17-2.04H12.48z"
      />
    </svg>
  );
}

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google", { callbackUrl: "/feed" })}
      >
        <GoogleIcon /> Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("github", { callbackUrl: "/feed" })}
      >
        <Github /> GitHub
      </Button>
    </div>
  );
}
