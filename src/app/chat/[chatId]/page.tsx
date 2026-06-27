import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getChat } from "@/lib/queries/chat";
import { AppShell } from "@/components/layout/app-shell";
import { ChatRoom } from "@/components/chat/chat-room";

export const metadata = { title: "Chat · CoFoundr" };

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getChat(chatId, user.id);
  if (!data) notFound();

  return (
    <AppShell>
      <div className="-mx-4 -mt-6 -mb-24 md:mx-auto md:my-0 max-w-2xl">
        <ChatRoom
          chatId={chatId}
          currentUserId={user.id}
          other={data.other}
          initialMessages={data.chat.messages}
          initialOtherReadAt={data.otherLastReadAt}
        />
      </div>
    </AppShell>
  );
}
