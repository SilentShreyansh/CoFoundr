"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Home,
  Bookmark,
  Plus,
  MessageSquare,
  Search,
  Trophy,
  Sparkles,
  LayoutDashboard,
  Shield,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavBell } from "@/components/layout/nav-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavUser {
  id: string;
  name: string;
  username: string;
  image?: string | null;
  role?: string;
}

const desktopLinks = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/leaderboard", label: "Top", icon: Trophy },
  { href: "/chat", label: "Messages", icon: MessageSquare },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isChatRoom = pathname.startsWith("/chat/") && pathname.split("/").filter(Boolean).length >= 2;

  const bottomLinks = [
    { href: "/feed", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/posts/new", label: "Create", icon: Plus, isAction: true },
    { href: "/chat", label: "Messages", icon: MessageSquare },
    { href: `/u/${user.username}`, label: "Profile", icon: UserIcon },
  ];

  const drawerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/saved", label: "Saved posts", icon: Bookmark },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/settings/profile", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <header className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur",
        isChatRoom && "hidden md:block"
      )}>
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/feed" className="flex items-center gap-2 font-semibold">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="font-bold">CoFoundr</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {desktopLinks.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
                    active ? "text-foreground font-semibold" : "text-muted-foreground",
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/posts/new">
                <Plus /> <span>New idea</span>
              </Link>
            </Button>
            <NavBell userId={user.id} />
            <ThemeToggle />
            
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
                    <Avatar>
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${user.username}`}>
                      <UserIcon /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/discover">
                      <Sparkles /> Discover
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      <Settings /> Edit profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {!isChatRoom && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around h-16 pb-safe md:hidden shadow-lg select-none">
          {bottomLinks.map((l) => {
            const active = pathname === l.href || (!l.isAction && pathname.startsWith(l.href));
            if (l.isAction) {
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-center bg-primary text-primary-foreground h-11 w-11 rounded-full shadow-md active:scale-95 transition-transform"
                  aria-label={l.label}
                >
                  <Plus className="h-5 w-5" />
                </Link>
              );
            }
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-center gap-1 transition-all"
              >
                <div className="relative flex items-center justify-center">
                  <l.icon
                    className={cn(
                      "h-5 w-5 transition-all",
                      active ? "text-primary scale-110" : "text-muted-foreground"
                    )}
                  />
                  {active && (
                    <span className="absolute -bottom-2.5 h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile Sidebar Slide-in Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-background border-r border-border flex flex-col shadow-2xl md:hidden overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link
                  href="/feed"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 font-semibold"
                >
                  <Rocket className="h-5 w-5 text-primary" />
                  <span className="font-bold">CoFoundr</span>
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Identity */}
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </div>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 py-4 px-2 space-y-1">
                {drawerLinks.map((l) => {
                  const active = pathname.startsWith(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                        active ? "bg-accent text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      <l.icon className="h-4 w-4" />
                      {l.label}
                    </Link>
                  );
                })}

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                      pathname.startsWith("/admin") ? "bg-accent text-foreground font-semibold" : "text-muted-foreground"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin panel
                  </Link>
                )}
              </div>

              {/* Drawer Footer / Logout */}
              <div className="p-4 border-t border-border mt-auto">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
