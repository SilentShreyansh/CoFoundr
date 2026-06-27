"use client";

import PusherClient from "pusher-js";

let client: PusherClient | null = null;

export const realtimeEnabled = !!process.env.NEXT_PUBLIC_PUSHER_KEY;

// Memoized browser Pusher client; null when not configured (callers fall back to polling).
export function getPusherClient(): PusherClient | null {
  if (!realtimeEnabled) return null;
  if (client) return client;
  client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
    authEndpoint: "/api/pusher/auth",
  });
  return client;
}
