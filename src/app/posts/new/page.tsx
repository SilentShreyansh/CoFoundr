import { AppShell } from "@/components/layout/app-shell";
import { PostForm } from "@/components/post/post-form";

export const metadata = { title: "New idea · CoFoundr" };

export default function NewPostPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold">Share a startup idea</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Describe what you&apos;re building and the people you need.
        </p>
        <PostForm />
      </div>
    </AppShell>
  );
}
