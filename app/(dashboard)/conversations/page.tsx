"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRestaurant } from "@/hooks/use-restaurant";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MessageSquare, Send, Search, Paperclip, FileText } from "lucide-react";
import { toast } from "sonner";

/* ── Media rendering components ─────────────────────────────────── */

function MediaImage({ storageId, caption }: { storageId: string; caption?: string }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as Id<"_storage"> });
  if (!url)
    return (
      <div
        className="h-48 w-64 animate-pulse rounded-lg"
        style={{ background: "var(--border-light)" }}
      />
    );
  return (
    <div>
      <img
        src={url}
        alt={caption || "Image"}
        className="max-w-64 max-h-72 rounded-lg object-cover cursor-pointer"
        onClick={() => window.open(url, "_blank")}
      />
      {caption && <p className="mt-1 text-sm">{caption}</p>}
    </div>
  );
}

function MediaAudio({ storageId }: { storageId: string }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as Id<"_storage"> });
  if (!url)
    return (
      <div
        className="h-10 w-48 animate-pulse rounded-lg"
        style={{ background: "var(--border-light)" }}
      />
    );
  return <audio controls src={url} className="max-w-64" />;
}

function MediaVideo({ storageId }: { storageId: string }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as Id<"_storage"> });
  if (!url)
    return (
      <div
        className="h-48 w-64 animate-pulse rounded-lg"
        style={{ background: "var(--border-light)" }}
      />
    );
  return <video controls src={url} className="max-w-64 max-h-72 rounded-lg" />;
}

function MediaDocument({ storageId, metadata }: { storageId: string; metadata?: any }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as Id<"_storage"> });
  const filename = metadata?.filename || "Document";
  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
      style={{ background: "rgba(200,150,62,0.08)", color: "var(--accent)" }}
    >
      <FileText className="h-4 w-4" />
      {filename}
    </a>
  );
}

/** Placeholder shown when a media message is still being downloaded / processed */
function MediaPending({ messageType }: { messageType: string }) {
  const label =
    messageType === "image"
      ? "Image"
      : messageType === "audio"
        ? "Audio"
        : messageType === "video"
          ? "Video"
          : messageType === "document"
            ? "Document"
            : "Media";

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
      style={{ background: "var(--border-light)", color: "var(--text-muted)" }}
    >
      <div
        className="h-4 w-4 animate-spin rounded-full border-2"
        style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent)" }}
      />
      {label} downloading&hellip;
    </div>
  );
}

export default function ConversationsPage() {
  const restaurant = useRestaurant();
  const conversations = useQuery(
    api.conversations.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const [selectedId, setSelectedId] = useState<Id<"conversations"> | null>(
    null
  );
  const isMobile = useIsMobile();

  if (!restaurant) return null;

  // On mobile, show either the list or the thread — not both
  const showList = !isMobile || !selectedId;
  const showThread = !isMobile || !!selectedId;

  return (
    <div className="animate-fade-up flex h-[calc(100vh-7rem)] gap-4">
      {/* Conversation list */}
      {showList && (
        <div
          className="w-full md:w-80 shrink-0 overflow-y-auto rounded-2xl"
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
                <p className="mt-1 text-xs px-4 text-center" style={{ color: "var(--text-muted)" }}>When customers message via WhatsApp, conversations show up automatically.</p>
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
                    minHeight: "44px",
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
      )}

      {/* Message thread */}
      {showThread && (
        <div
          className="flex flex-1 flex-col overflow-hidden rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          {selectedId ? (
            <>
              {/* Mobile back button */}
              {isMobile && (
                <div
                  className="flex items-center gap-2 px-4 py-3 md:hidden"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                >
                  <button
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors"
                    style={{ color: "var(--text-secondary)", minWidth: "44px", minHeight: "44px" }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </button>
                </div>
              )}
              <MessageThread conversationId={selectedId} />
            </>
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
      )}
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
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const markRead = useMutation(api.conversations.markRead);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show image preview
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }

    setUploading(true);
    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Determine message type from MIME type
      let messageType: "image" | "document" | "audio" | "video" = "document";
      if (file.type.startsWith("image/")) messageType = "image";
      else if (file.type.startsWith("audio/")) messageType = "audio";
      else if (file.type.startsWith("video/")) messageType = "video";

      // Send message with media
      await sendMessage({
        conversationId,
        content: file.name,
        messageType,
        mediaStorageId: storageId,
      });

      toast.success("File sent");
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      setPreviewUrl(null);
      e.target.value = "";
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
                  {/* ── Media-aware message content ── */}
                  {msg.messageType === "image" && msg.mediaStorageId ? (
                    <MediaImage storageId={msg.mediaStorageId} caption={msg.content} />
                  ) : msg.messageType === "audio" && msg.mediaStorageId ? (
                    <MediaAudio storageId={msg.mediaStorageId} />
                  ) : msg.messageType === "video" && msg.mediaStorageId ? (
                    <MediaVideo storageId={msg.mediaStorageId} />
                  ) : msg.messageType === "document" && msg.mediaStorageId ? (
                    <MediaDocument storageId={msg.mediaStorageId} metadata={msg.metadata} />
                  ) : msg.messageType && msg.messageType !== "text" && !msg.mediaStorageId && msg.messageType !== "location" && msg.messageType !== "template" ? (
                    /* Media still downloading — storageId not yet populated */
                    <MediaPending messageType={msg.messageType} />
                  ) : msg.messageType === "location" ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content || "Location shared"}</p>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
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
        {/* Image preview banner */}
        {previewUrl && (
          <div
            className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "var(--surface-warm)", border: "1px solid var(--border-light)" }}
          >
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-16 w-16 rounded-lg object-cover"
            />
            <span className="flex-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Uploading&hellip;
            </span>
            <button
              onClick={() => {
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />

        <div className="flex items-center gap-2">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 rounded-lg p-2 transition-colors"
            style={{ color: "var(--text-muted)" }}
            title="Attach file"
          >
            {uploading ? (
              <div
                className="h-5 w-5 animate-spin rounded-full border-2"
                style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent)" }}
              />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </button>

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
            className="shrink-0 rounded-xl px-4 py-2 text-white transition-all"
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
