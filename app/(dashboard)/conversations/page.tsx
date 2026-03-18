"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { MessageSquare, Send, Search } from "lucide-react";
import { toast } from "sonner";

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
    <div className="animate-fade-up flex h-[calc(100vh-7rem)] gap-4">
      {/* Conversation list */}
      <div
        className="w-80 shrink-0 overflow-y-auto rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}
      >
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <h2
            className="text-lg tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Conversations
          </h2>
        </div>
        <div>
          {conversations === undefined ? (
            <p
              className="py-8 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Loading...
            </p>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <MessageSquare className="mb-3 h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Conversations will appear here</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>When customers message via WhatsApp, conversations show up automatically.</p>
            </div>
          ) : (
            conversations.map((conv: any, index: number) => (
              <button
                key={conv._id}
                onClick={() => setSelectedId(conv._id)}
                className="w-full px-4 py-3 text-left transition-colors"
                style={{
                  background:
                    selectedId === conv._id
                      ? "rgba(200,150,62,0.08)"
                      : "transparent",
                  borderBottom:
                    index < conversations.length - 1
                      ? "1px solid var(--border-light)"
                      : undefined,
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== conv._id) {
                    e.currentTarget.style.background = "var(--surface-warm)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== conv._id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {conv.leadName}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                      }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className="mt-1 truncate text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {conv.lastMessagePreview ?? "No messages"}
                  </p>
                  <span
                    className="ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium"
                    style={{
                      background: "rgba(200,150,62,0.08)",
                      color: "var(--accent)",
                    }}
                  >
                    {conv.channel}
                  </span>
                </div>
                {conv.lastMessageAt && (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(conv.lastMessageAt).toLocaleString()}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}
      >
        {selectedId ? (
          <MessageThread conversationId={selectedId} />
        ) : (
          <div
            className="flex flex-1 items-center justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="text-center">
              <MessageSquare
                className="mx-auto mb-2 h-12 w-12"
                style={{ opacity: 0.4 }}
              />
              <p className="text-sm">Select a conversation to view messages</p>
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
    try {
      await sendMessage({ conversationId, content: input });
      setInput("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages === undefined ? (
          <p
            className="py-8 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Loading...
          </p>
        ) : messages.length === 0 ? (
          <p
            className="py-8 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
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
                  className="max-w-[70%] rounded-2xl px-4 py-2"
                  style={
                    msg.direction === "outbound"
                      ? {
                          background:
                            "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                          color: "#fff",
                        }
                      : {
                          background: "var(--surface-warm)",
                          color: "var(--text-primary)",
                        }
                  }
                >
                  <p className="text-sm">{msg.content}</p>
                  <div
                    className="mt-1 flex items-center gap-1 text-xs"
                    style={{
                      color:
                        msg.direction === "outbound"
                          ? "rgba(255,255,255,0.7)"
                          : "var(--text-muted)",
                    }}
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
      <div
        className="p-4"
        style={{ borderTop: "1px solid var(--border-light)" }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl px-4 py-2 text-sm outline-none transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
          />
          <button
            onClick={handleSend}
            className="rounded-xl px-4 py-2 text-white transition-all"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
