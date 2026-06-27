import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Rocket className="h-10 w-10 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">404 — Not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          That page doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/feed">Back to feed</Link>
      </Button>
    </div>
  );
}
