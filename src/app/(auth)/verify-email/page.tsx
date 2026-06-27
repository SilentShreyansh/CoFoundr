import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmail } from "@/lib/actions/auth";

export const metadata = { title: "Verify email · CoFoundr" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmail(token ?? "");
  const ok = !!result.success;

  return (
    <Card>
      <CardHeader className="items-center text-center">
        {ok ? (
          <CheckCircle2 className="h-10 w-10 text-primary" />
        ) : (
          <XCircle className="h-10 w-10 text-destructive" />
        )}
        <CardTitle className="text-xl">
          {ok ? "Email verified" : "Verification failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          {result.success ?? result.error}
        </p>
        <Link
          href="/login"
          className="inline-block font-medium text-primary hover:underline"
        >
          Go to login
        </Link>
      </CardContent>
    </Card>
  );
}
