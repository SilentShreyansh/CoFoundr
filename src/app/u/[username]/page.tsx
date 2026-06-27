import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Linkedin,
  Github,
  Globe,
  Settings,
  CalendarDays,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getProfileByUsername } from "@/lib/queries/users";
import { getFeedPosts } from "@/lib/queries/posts";
import { initials, EXPERIENCE_LABELS } from "@/lib/labels";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/post-card";
import { MessageButton } from "@/components/chat/message-button";
import { FollowButton } from "@/components/profile/follow-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, image: true, profile: { select: { headline: true, bio: true } } },
  });
  if (!user) return { title: "Profile not found · CoFoundr" };
  const description = user.profile?.headline ?? user.profile?.bio?.slice(0, 160) ?? `@${username} on CoFoundr`;
  return {
    title: `${user.name} (@${username}) · CoFoundr`,
    description,
    openGraph: {
      title: user.name,
      description,
      images: user.image ? [user.image] : undefined,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const isOwner = viewer?.id === profile.id;
  const isFollowing =
    viewer && !isOwner
      ? !!(await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewer.id,
              followingId: profile.id,
            },
          },
        }))
      : false;
  const { items: posts } = await getFeedPosts(
    { authorId: profile.id, pageSize: 20 },
    viewer?.id,
  );

  const p = profile.profile;
  const links = [
    { url: p?.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { url: p?.githubUrl, icon: Github, label: "GitHub" },
    { url: p?.websiteUrl, icon: Globe, label: "Website" },
  ].filter((l) => l.url);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-none border-x-0 border-y sm:rounded-xl sm:border bg-card shadow-xs">
          {/* Cover image banner */}
          <div className="relative h-28 sm:h-40 w-full bg-gradient-to-r from-primary/20 via-violet-500/20 to-teal-500/20">
            {/* Visual pattern ornament */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
          
          <div className="px-4 sm:px-6 pb-6">
            {/* Avatar and main profile header stack */}
            <div className="relative -mt-10 sm:-mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <Avatar className="size-20 sm:size-28 border-4 border-background bg-background shadow-md">
                {profile.image && <AvatarImage src={profile.image} alt={profile.name} />}
                <AvatarFallback className="text-2xl font-bold bg-muted">
                  {initials(profile.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Stacked actions on mobile */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {isOwner ? (
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px] px-4 font-medium cursor-pointer">
                    <Link href="/settings/profile">
                      <Settings className="h-4 w-4 mr-1.5" /> Edit profile
                    </Link>
                  </Button>
                ) : (
                  viewer && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <FollowButton
                        targetUserId={profile.id}
                        initialFollowing={isFollowing}
                        className="flex-1 sm:flex-none min-h-[40px] px-4 font-medium"
                      />
                      <MessageButton 
                        userId={profile.id} 
                        className="flex-1 sm:flex-none min-h-[40px] px-4 font-medium"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Profile identity info */}
            <div className="mt-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{profile.name}</h1>
              <p className="text-sm text-muted-foreground font-medium">@{profile.username}</p>
              {p?.headline && <p className="mt-2 text-sm sm:text-base font-medium text-foreground/90">{p.headline}</p>}
            </div>

            {p?.bio && <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{p.bio}</p>}

            {/* Stats section */}
            <div className="grid grid-cols-3 gap-2 border-y border-border/60 py-3 my-4 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{profile._count.posts}</p>
                <p className="text-xs text-muted-foreground">Ideas</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{profile._count.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{profile._count.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Metadata (Location, Join date) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              {p?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0" /> {p.location}
                </span>
              )}
              {p?.experienceLevel && (
                <span className="bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded text-xs font-semibold">
                  {EXPERIENCE_LABELS[p.experienceLevel]}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 shrink-0" />
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Social links */}
            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-accent text-muted-foreground hover:text-foreground transition-colors min-h-[32px]"
                  >
                    <l.icon className="h-3.5 w-3.5" /> {l.label}
                  </a>
                ))}
              </div>
            )}

            {/* Skills section */}
            {profile.skills.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <Badge key={s.skill.id} variant="secondary" className="text-xs font-medium px-2.5 py-0.5">
                      {s.skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Startup interests */}
            {p?.startupInterests && p.startupInterests.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Interested in
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.startupInterests.map((i) => (
                    <Badge key={i} variant="outline" className="text-xs font-medium px-2.5 py-0.5">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ideas posts list */}
        <div>
          <h2 className="mb-3 px-4 sm:px-0 text-lg font-semibold text-foreground">
            Ideas ({profile._count.posts})
          </h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {posts.length === 0 && (
              <p className="px-4 sm:px-0 text-sm text-muted-foreground">No published ideas yet.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
