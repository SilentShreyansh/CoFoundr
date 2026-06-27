import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getEditableProfile } from "@/lib/queries/users";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import type { ProfileInput } from "@/lib/validations/profile";

export const metadata = { title: "Edit profile · CoFoundr" };

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getEditableProfile(user.id);
  if (!data) redirect("/login");

  const defaults: Partial<ProfileInput> = {
    name: data.name,
    image: data.image ?? "",
    headline: data.profile?.headline ?? "",
    bio: data.profile?.bio ?? "",
    location: data.profile?.location ?? "",
    linkedinUrl: data.profile?.linkedinUrl ?? "",
    githubUrl: data.profile?.githubUrl ?? "",
    websiteUrl: data.profile?.websiteUrl ?? "",
    experienceLevel: data.profile?.experienceLevel ?? undefined,
    startupInterests: data.profile?.startupInterests ?? [],
    skills: data.skills.map((s) => s.skill.name),
    openToCofound: data.profile?.openToCofound ?? true,
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Edit profile</h1>
        <ProfileForm defaultValues={defaults} />
      </div>
    </AppShell>
  );
}
