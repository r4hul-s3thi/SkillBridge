import { useState, useRef, useEffect, useCallback } from "react"
import { Send, MessageSquare, Search, Sparkles, Circle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { useAppStore } from "@/store/appStore"
import { useAuthStore } from "@/store/authStore"
import { usePresenceStore } from "@/store/presenceStore"
import { messageService } from "@/services/messageService"
import { getAutoReply, getReplyDelay } from "@/lib/autoReply"
import { format } from "date-fns"
import type { Message } from "@/types"

export default function Messages() {
  const { conversations, matches } = useAppStore()
  const { user } = useAuthStore()
  const { isOnline } = usePresenceStore()

  // Use real conversations if available, otherwise fall back to matches
  const effectiveConversations =
    conversations.length > 0
      ? conversations
      : matches.map((m, i) => ({
          id: m.id,
          participant: m.matchedUser,
          lastMessage: "Say hello! 👋",
          lastMessageAt: new Date(Date.now() - i * 3600000).toISOString(),
          unreadCount: 0,
        }))

  const [selectedId, setSelectedId] = useState<number | null>(
    effectiveConversations[0]?.id ?? null
  )
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = effectiveConversations.find((c) => c.id === selectedId)
  const activeUsers = effectiveConversations.slice(0, 6)
  const onlineCount = activeUsers.filter((c) => isOnline(c.participant.id)).length

  const handleSelect = (id: number) => {
    setSelectedId(id)
    setShowChat(true)
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (!selected) return
    setLoading(true)
    setMessages([])
    messageService
      .getMessages(selected.participant.id)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [selected?.participant.id])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = useCallback(async () => {
    if (!input.trim() || !selected || !user) return
    const text = input.trim()
    setInput("")

    const optimistic: Message = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selected.participant.id,
      message: text,
      createdAt: new Date().toISOString(),
    }

    // Optimistically add message
    setMessages((prev) => [...prev, optimistic])

    // Save to backend
    try {
      const res = await messageService.sendMessage(selected.participant.id, text)
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? res.data : m))
      )
    } catch {
      // keep optimistic message
    }

    // Simulate auto-reply
    const delay = getReplyDelay()
    setTimeout(() => setIsTyping(true), 400)
    setTimeout(() => {
      setIsTyping(false)
      const replyText = getAutoReply(selected.participant.id, text)
      const reply: Message = {
        id: Date.now() + 1,
        senderId: selected.participant.id,
        receiverId: user.id,
        message: replyText,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, reply])
    }, delay)
  }, [input, selected, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (typingRef.current) clearTimeout(typingRef.current)
    typingRef.current = setTimeout(() => {}, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === selected?.participant.id) ||
      (m.receiverId === user?.id && m.senderId === selected?.participant.id)
  )

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <div className="animate-fade-up flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Messages
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Keep your learning conversations flowing.
          </p>
        </div>
        <div className="dashboard-card flex items-center gap-2 rounded-full border-0 px-4 py-2 text-sm text-muted-foreground w-fit">
          <Sparkles className="h-4 w-4 text-primary" />
          {effectiveConversations.length} conversation{effectiveConversations.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Chat shell */}
      <div className="inbox-shell animate-fade-up-1 flex h-[calc(100vh-200px)] min-h-[520px] overflow-hidden">

        {/* Sidebar */}
        <div className={`flex flex-col border-r border-border/50 bg-white/38 backdrop-blur-xl dark:bg-white/[0.03] transition-all
          ${showChat ? "hidden sm:flex sm:w-72 md:w-80" : "flex w-full sm:w-72 md:w-80"}`}>

          <div className="space-y-3 border-b border-border/50 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Inbox</p>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                {effectiveConversations.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                readOnly
                placeholder="Search conversations..."
                className="h-9 rounded-2xl border-border/60 bg-background/70 pl-9 text-sm shadow-sm"
              />
            </div>

            {/* Online now */}
            {effectiveConversations.length > 0 && (
              <div className="rounded-2xl border border-white/60 bg-white/68 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">Online now</p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {onlineCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeUsers.map((conv) => (
                    <button
                      key={`active-${conv.id}`}
                      onClick={() => handleSelect(conv.id)}
                      className="active-user-pill flex items-center gap-1.5 rounded-full px-2 py-1.5"
                    >
                      <div className="relative shrink-0">
                        <UserAvatar name={conv.participant.name} avatar={conv.participant.avatar} size="sm" />
                        <span className={`absolute right-0 bottom-0 h-2 w-2 rounded-full border-2 border-background ${isOnline(conv.participant.id) ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                      </div>
                      <span className="max-w-[72px] truncate text-xs font-medium">
                        {conv.participant.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1.5">
              {effectiveConversations.length === 0 && (
                <div className="px-3 py-10 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground">No conversations yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect with someone on{" "}
                    <a href="/matches" className="text-primary underline">Matches</a>.
                  </p>
                </div>
              )}
              {effectiveConversations.map((conv, index) => {
                const active = selectedId === conv.id
                const online = isOnline(conv.participant.id)
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(conv.id)}
                    className={`conversation-card animate-fade-up flex w-full items-center gap-3 rounded-2xl p-3 text-left ${active ? "active" : ""}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar name={conv.participant.name} avatar={conv.participant.avatar} size="md" />
                      <span className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${online ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{conv.participant.name}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {format(new Date(conv.lastMessageAt), "h:mm a")}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {active && isTyping ? "typing..." : conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat thread */}
        {selected ? (
          <div className={`chat-thread flex min-w-0 flex-1 flex-col ${!showChat ? "hidden sm:flex" : "flex"}`}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/50 bg-background/40 px-3 sm:px-4 py-3 backdrop-blur-xl">
              <button
                className="sm:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowChat(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <UserAvatar name={selected.participant.name} avatar={selected.participant.avatar} size="md" />
                <span className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${isOnline(selected.participant.id) ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{selected.participant.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Circle className={`h-2 w-2 fill-current ${isTyping ? "text-amber-400" : isOnline(selected.participant.id) ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                  {isTyping ? "typing..." : isOnline(selected.participant.id) ? "Online" : "Offline"}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shrink-0">
                Skill chat
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 sm:px-5 py-4">
              <div className="space-y-4">
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!loading && threadMessages.length === 0 && (
                  <div className="mx-auto max-w-xs rounded-3xl border border-dashed border-border/60 bg-background/60 px-5 py-8 text-center">
                    <MessageSquare className="mx-auto h-10 w-10 opacity-25 mb-3" />
                    <p className="text-sm font-medium">Start the conversation!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Say hello to {selected.participant.name.split(" ")[0]} 👋
                    </p>
                  </div>
                )}

                {threadMessages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id
                  const showDate =
                    i === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(threadMessages[i - 1].createdAt).toDateString()

                  return (
                    <div key={msg.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                      {showDate && (
                        <div className="my-4 flex items-center gap-3">
                          <Separator className="flex-1 bg-border/70" />
                          <span className="rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                            {format(new Date(msg.createdAt), "MMM d")}
                          </span>
                          <Separator className="flex-1 bg-border/70" />
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && (
                          <UserAvatar name={selected.participant.name} avatar={selected.participant.avatar} size="sm" />
                        )}
                        <div className={`max-w-[75%] sm:max-w-[65%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMe ? "chat-bubble-me rounded-br-md" : "chat-bubble-other rounded-bl-md"}`}>
                          <p>{msg.message}</p>
                          <p className={`mt-1 text-[11px] ${isMe ? "text-white/60" : "text-slate-500 dark:text-slate-400"}`}>
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isTyping && (
                  <div className="animate-fade-up flex items-end justify-start gap-2">
                    <UserAvatar name={selected.participant.name} avatar={selected.participant.avatar} size="sm" />
                    <div className="chat-bubble-other flex items-center gap-1 rounded-3xl rounded-bl-md px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border/50 bg-background/45 p-3 backdrop-blur-xl">
              <div className="dashboard-card flex items-center gap-2 rounded-[20px] border-0 p-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selected.participant.name.split(" ")[0]}...`}
                  className="h-10 rounded-xl border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  size="sm"
                  className="gradient-bg-animated h-10 w-10 rounded-xl p-0 text-slate-950 shadow-lg shadow-cyan-500/20 shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex flex-1 items-center justify-center text-muted-foreground ${showChat ? "flex" : "hidden sm:flex"}`}>
            <div className="space-y-3 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs text-muted-foreground">Choose someone from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
