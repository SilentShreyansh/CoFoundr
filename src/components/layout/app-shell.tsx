import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Navbar } from "@/components/layout/navbar";

// Server shell for authenticated pages: guards the session and renders the nav.
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar
        user={{
          id: user.id,
          name: user.name ?? "User",
          username: user.username,
          image: user.image,
          role: user.role,
        }}
      />
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-24 md:py-6">{children}</div>
    </div>
  );
}
