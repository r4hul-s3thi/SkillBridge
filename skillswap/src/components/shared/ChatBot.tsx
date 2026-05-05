import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function getBotReply(input: string, userName: string, skills: string[], matches: number, sessions: number): string {
  const msg = input.toLowerCase().trim();

  if (/^(hi|hello|hey|namaste|hii|helo|yo)\b/.test(msg)) {
    return `Hey ${userName}! I'm the SkillBridge Assistant.\n\nI can help you with:\n• How to find co-builders\n• Posting a project on Collab Board\n• Scheduling build sessions\n• Managing your skills profile`;
  }

  if (/who are you|what are you|bot|assistant/.test(msg)) {
    return `I'm the SkillBridge Assistant! I help you navigate the platform.\n\nSkillBridge is a skill-based collaboration platform — you post what skills you have and what you need, get matched with complementary builders, and build projects together.`;
  }

  if (/skill|add skill|remove skill|offer|want|have|need/.test(msg)) {
    const skillList = skills.length > 0 ? `\n\nYour current skills: ${skills.join(', ')}` : '';
    return `Skills are the core of SkillBridge!${skillList}\n\n**To add skills:**\n1. Go to Profile\n2. Click "Skills I Have" or "Skills I Need"\n3. Add your skill, select level, hit Add\n\nThe more specific your skills, the better your co-builder matches!`;
  }

  if (/match|matches|compatible|find people|connect|co.?build/.test(msg)) {
    return `Smart Matching finds people whose skills complement yours!\n\nYou have **${matches} active matches** right now.\n\n**How it works:**\n• You list skills you have (e.g. React, UI/UX)\n• You list skills you need (e.g. Backend, DevOps)\n• The system matches you with people who have what you need and need what you have\n\nGo to Matches to see your co-builder suggestions!`;
  }

  if (/session|schedule|book|meeting|call|build/.test(msg)) {
    return `Build Sessions are how you collaborate!\n\nYou have **${sessions} sessions** so far.\n\n**To schedule a session:**\n1. Go to Sessions\n2. Click "Schedule"\n3. Pick a match, set a topic and date\n4. They accept and you build together!`;
  }

  if (/message|chat|talk|conversation|inbox/.test(msg)) {
    return `Messages let you talk to your matches in real-time!\n\n**How to use:**\n1. Go to Messages\n2. Select a conversation\n3. Start chatting — messages are instant via Socket.io\n\nTip: Message your match before scheduling a session to align on what you're building.`;
  }

  if (/collab|project|team|board|post/.test(msg)) {
    return `The Collab Board is where projects happen!\n\n**How it works:**\n• Post your project — describe what you're building\n• List skills you have and skills you need\n• Other users send join requests\n• You accept and start building together\n\nGo to Collab Board to post your project or find one to join!`;
  }

  if (/rating|review|feedback|star|rate/.test(msg)) {
    return `Ratings build your reputation as a collaborator!\n\n• After a session, rate your co-builder 1-5 stars\n• Leave feedback about the collaboration\n• Your average rating shows on your profile\n\nHigh ratings = more people want to build with you!`;
  }

  if (/profile|bio|photo|picture|avatar|location|edit/.test(msg)) {
    return `Your profile is your builder identity!\n\n**What to fill in:**\n• Name and Bio — tell others what you build\n• Location\n• Skills I Have — what you bring to a project\n• Skills I Need — what you're looking for in a co-builder\n\nA complete profile gets better matches!`;
  }

  if (/start|begin|new|how|guide|help|tutorial/.test(msg)) {
    return `Getting started on SkillBridge is easy!\n\n1. **Complete your profile** — add bio and location\n2. **Add skills** — what you have and what you need\n3. **Browse Matches** — find complementary builders\n4. **Message them** — introduce yourself and your project\n5. **Post on Collab Board** — share your project idea\n6. **Schedule a session** — start building together!`;
  }

  if (/thanks|thank you|great|awesome|helpful/.test(msg)) {
    return `Happy to help! Good luck with your project. Go build something great!`;
  }

  if (/bye|goodbye|ok thanks|ok bye/.test(msg)) {
    return `See you, ${userName}! Go find your co-builder and ship something awesome!`;
  }

  const fallbacks = [
    `Not sure I understood that. You can ask me about:\n• Finding co-builders\n• Posting a project\n• Scheduling sessions\n• Managing your skills`,
    `Try asking:\n• "How do I find a co-builder?"\n• "How does the Collab Board work?"\n• "How do I add skills?"`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'bot',
      text: 'Hey! I\'m the SkillBridge Assistant.\n\nI can help you find co-builders, post projects, and navigate the platform. What do you need?',
      time: getTime(),
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { skills, matches, sessions } = useAppStore();

  const offeredSkills = skills.filter((s) => s.type === 'offer').map((s) => s.skillName);
  const activeMatches = matches.filter((m) => m.status === 'active').length;
  const totalSessions = sessions.length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getBotReply(text, user?.name?.split(' ')[0] ?? 'User', offeredSkills, activeMatches, totalSessions);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply, time: getTime() }]);
    }, 1000 + Math.random() * 800);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickReplies = ['How do I find a co-builder?', 'How does Collab Board work?', 'How do I add skills?', 'How to schedule a session?'];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 animate-pulse-glow"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${
            minimized ? 'h-14' : 'h-[520px]'
          }`}
          style={{ background: 'linear-gradient(145deg, #0f1729 0%, #0d1120 100%)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold flex items-center gap-1.5">
                SkillBridge Assistant
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </p>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                Online • Always here to help
              </p>
            </div>
            <button onClick={() => setMinimized(!minimized)} className="text-white/40 hover:text-white/80 transition-colors p-1">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm'
                        : 'bg-white/8 text-white/85 border border-white/8 rounded-bl-sm'
                    }`}>
                      {msg.text}
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-white/35'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white/8 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: q, time: getTime() };
                        setMessages((prev) => [...prev, userMsg]);
                        setTyping(true);
                        setTimeout(() => {
                          setTyping(false);
                          const reply = getBotReply(q, user?.name?.split(' ')[0] ?? 'User', offeredSkills, activeMatches, totalSessions);
                          setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply, time: getTime() }]);
                        }, 1000 + Math.random() * 800);
                      }}
                      className="text-[11px] px-2.5 py-1.5 rounded-full border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-white/8 shrink-0">
                <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 py-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-white text-xs placeholder:text-white/30 outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
