import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Sparkles, Zap } from 'lucide-react';
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

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

async function getGeminiReply(
  userMessage: string,
  context: { userName: string; skills: string[]; matches: number; sessions: number; history: ChatMessage[] }
): Promise<string> {
  if (!GEMINI_KEY) throw new Error('No API key');

  const systemPrompt = `You are the SkillBridge Assistant — a helpful, friendly AI embedded in SkillBridge, a peer-to-peer skill exchange platform.

About SkillBridge:
- Users list skills they OFFER (teach) and skills they WANT (learn)
- The platform smart-matches users based on skill overlap
- Users can message matches, schedule learning sessions, post collab projects, rate each other, and climb the leaderboard
- Pages: Dashboard, Matches, Messages, Sessions, Ratings, Collab Board, Leaderboard, Profile

Current user context:
- Name: ${context.userName}
- Skills they offer: ${context.skills.length > 0 ? context.skills.join(', ') : 'none added yet'}
- Active matches: ${context.matches}
- Total sessions: ${context.sessions}

Rules:
- Be concise, friendly, and helpful
- Answer only questions related to SkillBridge or skill learning/exchange
- If asked something unrelated, politely redirect to SkillBridge topics
- Use emojis sparingly but naturally
- Keep responses under 150 words
- Format with bullet points when listing steps`;

  const history = context.history.slice(-6).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.';
}

function getFallbackReply(input: string, userName: string, skills: string[], matches: number, sessions: number): string {
  const msg = input.toLowerCase().trim();
  if (/^(hi|hello|hey|namaste)/.test(msg))
    return `Hey ${userName}! 👋 I'm the SkillBridge Assistant.\n\nI can help you with:\n• Finding skill matches\n• Posting collab projects\n• Scheduling sessions\n• Managing your profile`;
  if (/skill/.test(msg))
    return `Skills are the core of SkillBridge!\n\nYour offered skills: ${skills.length > 0 ? skills.join(', ') : 'none yet'}\n\nGo to Profile → add skills you offer and skills you want to learn. Better skills = better matches!`;
  if (/match/.test(msg))
    return `You have ${matches} active matches! 🤝\n\nGo to Matches to see people whose skills complement yours. Connect and start learning together.`;
  if (/session/.test(msg))
    return `You have ${sessions} sessions so far.\n\nGo to Sessions → Schedule → pick a match, topic, and date. They accept and you learn together!`;
  if (/collab|project/.test(msg))
    return `The Collab Board is where projects happen!\n\n• Post your project idea\n• List skills you have and need\n• Accept join requests from interested builders`;
  if (/message|chat/.test(msg))
    return `Go to Messages to chat with your matches in real-time. Say hello before scheduling a session!`;
  if (/rating|review/.test(msg))
    return `After sessions, rate your peers 1-5 stars. High ratings boost your leaderboard rank!`;
  if (/leaderboard|rank/.test(msg))
    return `Score = (Rating × 20) + Sessions Done\n\nComplete more sessions and maintain high ratings to climb the leaderboard! 🏆`;
  return `I can help with:\n• Finding co-learners (Matches)\n• Posting projects (Collab Board)\n• Scheduling sessions\n• Managing skills (Profile)\n\nWhat would you like to know?`;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'bot',
      text: `Hey! I'm the SkillBridge Assistant${GEMINI_KEY ? ' powered by Gemini AI ✨' : ''}.\n\nAsk me anything about the platform — finding matches, posting projects, scheduling sessions, or anything else!`,
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
  const userName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;
    setInput('');

    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: msgText, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      let reply: string;
      if (GEMINI_KEY) {
        reply = await getGeminiReply(msgText, {
          userName,
          skills: offeredSkills,
          matches: activeMatches,
          sessions: totalSessions,
          history: messages,
        });
      } else {
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
        reply = getFallbackReply(msgText, userName, offeredSkills, activeMatches, totalSessions);
      }
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply, time: getTime() }]);
    } catch {
      await new Promise((r) => setTimeout(r, 600));
      const reply = getFallbackReply(msgText, userName, offeredSkills, activeMatches, totalSessions);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply, time: getTime() }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickReplies = ['How do I find matches?', 'How does Collab Board work?', 'How to add skills?', 'How to schedule a session?'];

  return (
    <>
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

      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${minimized ? 'h-14' : 'h-[520px]'}`}
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
                {GEMINI_KEY
                  ? <span className="flex items-center gap-1 text-[10px] font-normal bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-full"><Zap className="w-2.5 h-2.5" />Gemini AI</span>
                  : <Sparkles className="w-3 h-3 text-yellow-400" />
                }
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
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
                      onClick={() => sendMessage(q)}
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
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || typing}
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
