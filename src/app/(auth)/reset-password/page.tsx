import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Reset password · CoFoundr" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetForm token={token} />
        ) : (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>This reset link is missing its token. Request a new one.</p>
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:underline"
            >
              Request a reset link
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
