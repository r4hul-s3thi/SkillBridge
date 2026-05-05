import { useState, useRef, useEffect } from "react"
import { Send, MessageSquare, Search, Sparkles, Circle } from "lucide-react"
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

  const effectiveConversations =
    conversations.length > 0
      ? conversations
      : matches.map((m, i) => ({
          id: m.id,
          participant: m.matchedUser,
          lastMessage: "Say hello! 👋",
          lastMessageAt: new Date(Date.now() - i * 60000).toISOString(),
          unreadCount: 0,
        }))

  const [selectedId, setSelectedId] = useState<number | null>(
    effectiveConversations[0]?.id ?? null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeUsers = effectiveConversations.slice(0, 5)

  const selected = effectiveConversations.find((c) => c.id === selectedId)

  useEffect(() => {
    if (!selected) return
    messageService
      .getMessages(selected.participant.id)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
  }, [selected?.participant.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || !selected) return
    const text = input.trim()
    setInput("")

    const myMsg: Message = {
      id: Date.now(),
      senderId: user?.id ?? 1,
      receiverId: selected.participant.id,
      message: text,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await messageService.sendMessage(selected.participant.id, text)
      setMessages((prev) => [...prev, res.data])
    } catch {
      setMessages((prev) => [...prev, myMsg])
    }

    const delay = getReplyDelay()
    setTimeout(() => setIsTyping(true), 300)
    setTimeout(() => {
      setIsTyping(false)
      const replyText = getAutoReply(selected.participant.id, text)
      const replyMsg: Message = {
        id: Date.now() + 1,
        senderId: selected.participant.id,
        receiverId: user?.id ?? 1,
        message: replyText,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, replyMsg])
    }, delay)
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

  const onlineCount = activeUsers.filter((c) => isOnline(c.participant.id)).length

  return (
    <div className="max-w-6xl space-y-4">
      <div className="animate-fade-up flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="h-6 w-6 text-primary" />
            Messages
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Keep your learning conversations flowing with matched peers.
          </p>
        </div>
        <div className="dashboard-card flex items-center gap-2 rounded-full border-0 px-4 py-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {effectiveConversations.length} active conversation
          {effectiveConversations.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="inbox-shell animate-fade-up-1 flex h-[calc(100vh-220px)] min-h-[540px] overflow-hidden">
        {/* Sidebar */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border/50 bg-white/38 backdrop-blur-xl dark:bg-white/[0.03]">
          <div className="space-y-3 border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Inbox
              </p>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                {effectiveConversations.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                readOnly
                value=""
                placeholder="Search coming soon..."
                className="h-10 rounded-2xl border-border/60 bg-background/70 pl-9 text-sm shadow-sm"
              />
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/68 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Online now
                </p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {onlineCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeUsers.map((conv) => (
                  <button
                    key={`active-${conv.id}`}
                    onClick={() => setSelectedId(conv.id)}
                    className="active-user-pill flex items-center gap-2 rounded-full px-2.5 py-2 text-left"
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={conv.participant.name}
                        avatar={conv.participant.avatar}
                        size="sm"
                      />
                      <span className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${isOnline(conv.participant.id) ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                    </div>
                    <span className="max-w-[84px] truncate text-xs font-medium">
                      {conv.participant.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {effectiveConversations.map((conv, index) => {
                const active = selectedId === conv.id
                const online = isOnline(conv.participant.id)
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`conversation-card animate-fade-up flex w-full items-center gap-3 rounded-2xl p-3 text-left ${active ? "active" : ""}`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={conv.participant.name}
                        avatar={conv.participant.avatar}
                        size="md"
                      />
                      <span className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${online ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {conv.participant.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {format(new Date(conv.lastMessageAt), "h:mm a")}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {active && isTyping ? "typing..." : conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
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
          <div className="chat-thread flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-border/50 bg-background/40 px-4 py-4 backdrop-blur-xl">
              <div className="relative">
                <UserAvatar
                  name={selected.participant.name}
                  avatar={selected.participant.avatar}
                  size="md"
                />
                <span className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${isOnline(selected.participant.id) ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {selected.participant.name}
                </p>
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Circle className={`h-2 w-2 fill-current ${isTyping ? "text-amber-400" : isOnline(selected.participant.id) ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                  {isTyping ? "typing..." : isOnline(selected.participant.id) ? "Online" : "Offline"}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Skill chat
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-5">
              <div className="space-y-4">
                {threadMessages.length === 0 && (
                  <div className="mx-auto max-w-sm rounded-3xl border border-dashed border-border/60 bg-background/60 px-5 py-8 text-center shadow-sm">
                    <MessageSquare className="mx-auto h-10 w-10 opacity-35" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No messages yet. Start a conversation and break the ice.
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
                    <div key={msg.id} className="animate-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
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
                          <UserAvatar
                            name={selected.participant.name}
                            avatar={selected.participant.avatar}
                            size="sm"
                          />
                        )}
                        <div className={`max-w-[72%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${isMe ? "chat-bubble-me rounded-br-md" : "chat-bubble-other rounded-bl-md"}`}>
                          <p>{msg.message}</p>
                          <p className={`mt-1 text-[11px] ${isMe ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isTyping && (
                  <div className="animate-fade-up flex items-end justify-start gap-2">
                    <UserAvatar
                      name={selected.participant.name}
                      avatar={selected.participant.avatar}
                      size="sm"
                    />
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

            <div className="border-t border-border/50 bg-background/45 p-4 backdrop-blur-xl">
              <div className="dashboard-card flex items-center gap-3 rounded-[24px] border-0 p-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selected.participant.name}...`}
                  className="h-11 rounded-2xl border-border/50 bg-background/70 text-sm shadow-none"
                />
                <Button
                  size="sm"
                  className="gradient-bg-animated h-11 rounded-2xl px-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="space-y-3 text-center">
              <MessageSquare className="mx-auto h-10 w-10 opacity-30" />
              <p className="text-sm">Connect with someone on Matches to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
