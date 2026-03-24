import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { messageService } from '@/services/messageService';
import { getAutoReply, getReplyDelay } from '@/lib/autoReply';
import { format } from 'date-fns';
import type { Message } from '@/types';

export default function Messages() {
  const { conversations, matches } = useAppStore();
  const { user } = useAuthStore();

  // Build conversations from matches if none exist (new user)
  const effectiveConversations = conversations.length > 0
    ? conversations
    : matches.map((m, i) => ({
        id: m.id,
        participant: m.matchedUser,
        lastMessage: 'Say hello! 👋',
        lastMessageAt: new Date(Date.now() - i * 60000).toISOString(),
        unreadCount: 0,
      }));

  const [selectedId, setSelectedId] = useState<number | null>(effectiveConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = effectiveConversations.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selected) return;
    messageService.getMessages(selected.participant.id)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));
  }, [selected?.participant.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selected) return;
    const text = input.trim();
    setInput('');

    // Add my message
    const myMsg: Message = {
      id: Date.now(),
      senderId: user?.id ?? 1,
      receiverId: selected.participant.id,
      message: text,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await messageService.sendMessage(selected.participant.id, text);
      setMessages((prev) => [...prev, res.data]);
    } catch {
      setMessages((prev) => [...prev, myMsg]);
    }

    // Show typing indicator then auto-reply
    const delay = getReplyDelay();
    setTimeout(() => setIsTyping(true), 300);
    setTimeout(() => {
      setIsTyping(false);
      const replyText = getAutoReply(selected.participant.id, text);
      const replyMsg: Message = {
        id: Date.now() + 1,
        senderId: selected.participant.id,
        receiverId: user?.id ?? 1,
        message: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === selected?.participant.id) ||
      (m.receiverId === user?.id && m.senderId === selected?.participant.id)
  );

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Messages
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Chat with your matched peers.</p>
      </div>

      <div className="flex border border-border/60 rounded-xl overflow-hidden h-[calc(100vh-220px)] min-h-[500px] bg-card shadow-xs">
        {/* Conversation List */}
        <div className="w-72 shrink-0 border-r border-border/60 flex flex-col">
          <div className="p-3 border-b border-border/60">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Conversations</p>
          </div>
          <ScrollArea className="flex-1">
            {effectiveConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${
                  selectedId === conv.id ? 'bg-primary/5 border-r-2 border-r-primary' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <UserAvatar name={conv.participant.name} avatar={conv.participant.avatar} size="md" />
                  {/* Online dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium truncate">{conv.participant.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(conv.lastMessageAt), 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedId === conv.id && isTyping ? 'typing...' : conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Thread */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-3 border-b border-border/60 bg-background/50">
              <div className="relative">
                <UserAvatar name={selected.participant.name} avatar={selected.participant.avatar} size="md" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <p className="font-semibold text-sm">{selected.participant.name}</p>
                <p className="text-xs text-green-500 font-medium">
                  {isTyping ? 'typing...' : 'Online'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {threadMessages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No messages yet. Start a conversation!
                  </p>
                )}
                {threadMessages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  const showDate =
                    i === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(threadMessages[i - 1].createdAt).toDateString();
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-2 my-3">
                          <Separator className="flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.createdAt), 'MMM d')}
                          </span>
                          <Separator className="flex-1" />
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <UserAvatar
                            name={selected.participant.name}
                            avatar={selected.participant.avatar}
                            size="sm"
                          />
                        )}
                        <div
                          className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          }`}
                        >
                          {msg.message}
                          <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2 justify-start">
                    <UserAvatar
                      name={selected.participant.name}
                      avatar={selected.participant.avatar}
                      size="sm"
                    />
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border/60 bg-background/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selected.participant.name}...`}
                  className="h-9 text-sm"
                />
                <Button size="sm" className="h-9 px-3" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">Connect with someone on Matches to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
