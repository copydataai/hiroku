"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { MessageSquare, Send, Search } from "lucide-react";

export default function ConversationsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const conversations = useQuery(
    api.conversations.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const [selectedId, setSelectedId] = useState<Id<"conversations"> | null>(
    null
  );

  if (!restaurant) return null;

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Conversation list */}
      <div className="w-80 shrink-0 overflow-y-auto rounded-xl bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="divide-y">
          {conversations === undefined ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Loading...
            </p>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <MessageSquare className="mb-2 h-8 w-8" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv._id}
                onClick={() => setSelectedId(conv._id)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  selectedId === conv._id ? "bg-indigo-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {conv.leadName}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {conv.lastMessagePreview ?? "No messages"}
                  </p>
                  <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                    {conv.channel}
                  </span>
                </div>
                {conv.lastMessageAt && (
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(conv.lastMessageAt).toLocaleString()}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex flex-1 flex-col rounded-xl bg-white shadow-sm">
        {selectedId ? (
          <MessageThread conversationId={selectedId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-2 h-12 w-12" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageThread({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  const messages = useQuery(api.messages.listByConversation, {
    conversationId,
  });
  const sendMessage = useMutation(api.messages.send);
  const markRead = useMutation(api.conversations.markRead);
  const [input, setInput] = useState("");

  // Mark as read when viewing
  useEffect(() => {
    markRead({ conversationId });
  }, [conversationId, markRead]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage({ conversationId, content: input });
    setInput("");
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages === undefined ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No messages yet
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg: any) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.direction === "outbound" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.direction === "outbound"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div
                    className={`mt-1 flex items-center gap-1 text-xs ${
                      msg.direction === "outbound"
                        ? "text-indigo-200"
                        : "text-gray-400"
                    }`}
                  >
                    <span>{msg.senderType}</span>
                    <span>&middot;</span>
                    <span>
                      {new Date(msg._creationTime).toLocaleTimeString()}
                    </span>
                    {msg.whatsappStatus && (
                      <>
                        <span>&middot;</span>
                        <span>{msg.whatsappStatus}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
