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

  // Greetings
  if (/^(hi|hello|hey|namaste|hii|helo|yo)\b/.test(msg)) {
    return `Namaste ${userName}! 🙏 Main SkillBridge Assistant hoon. Aapki kaise madad kar sakta hoon?\n\nAap pooch sakte hain:\n• Matches kaise kaam karte hain?\n• Session kaise schedule karein?\n• Skills kaise add karein?\n• Ratings ke baare mein`;
  }

  // Who are you
  if (/who are you|kaun ho|what are you|bot|assistant/.test(msg)) {
    return `Main SkillBridge ka AI Assistant hoon! 🤖\n\nMujhe banaya gaya hai taaki aapko platform use karne mein help mil sake. Main aapke:\n• Skills & Matches\n• Sessions & Scheduling\n• Messages & Conversations\n• Profile & Ratings\n\n...ke baare mein guide kar sakta hoon. Poochiye kuch bhi!`;
  }

  // Skills
  if (/skill|add skill|remove skill|offer|want/.test(msg)) {
    const skillList = skills.length > 0 ? `\n\nAapke current skills: ${skills.join(', ')}` : '';
    return `Skills manage karna bahut easy hai! 🎯${skillList}\n\n**Skills add karne ke liye:**\n1. Profile page pe jaayein\n2. "Add Skill" button click karein\n3. Skill name, type (Offer/Want) aur level select karein\n\nJitne zyaada skills add karenge, utne better matches milenge!`;
  }

  // Matches
  if (/match|matches|compatible|find people|connect/.test(msg)) {
    return `Smart Matching system aapke liye kaam karta hai! 🤝\n\nAapke abhi **${matches} active matches** hain.\n\n**Matching kaise hota hai:**\n• Jo skills aap offer karte ho, woh doosron ki "want" list se match hoti hain\n• Compatibility score 0-100% hota hai\n• Jitna zyaada overlap, utna better match\n\nMatches page pe jaake apne matches dekh sakte hain!`;
  }

  // Sessions
  if (/session|schedule|book|meeting|call|class/.test(msg)) {
    return `Sessions SkillBridge ka dil hain! 📅\n\nAapke **${sessions} sessions** hain abhi.\n\n**Session schedule karne ke steps:**\n1. Sessions page pe jaayein\n2. "New Session" button click karein\n3. Match select karein, topic likhein, date/time choose karein\n4. Submit karein — doosra user accept/reject kar sakta hai\n\n**Tips:**\n• Google Meet ya Zoom link share karein\n• Session ke baad rating zaroor dein!`;
  }

  // Messages / Chat
  if (/message|chat|talk|conversation|inbox/.test(msg)) {
    return `Messages feature se aap apne matches ke saath directly baat kar sakte hain! 💬\n\n**Kaise use karein:**\n1. Messages page pe jaayein\n2. Left sidebar mein conversation select karein\n3. Type karein aur Enter dabayein\n\n**Pro tip:** Session schedule karne se pehle message karke topic decide kar lein — isse session zyaada productive hota hai!`;
  }

  // Ratings
  if (/rating|review|feedback|star|rate/.test(msg)) {
    return `Ratings aapki credibility build karte hain! ⭐\n\n**Rating system:**\n• Completed session ke baad 1-5 stars de sakte hain\n• Feedback likhna optional hai but helpful hai\n• Aapki average rating profile pe dikhti hai\n\n**Ratings page pe:**\n• Apni received ratings dekh sakte hain\n• Doosron ko rate kar sakte hain\n\nAchhi ratings se zyaada matches milte hain!`;
  }

  // Profile
  if (/profile|bio|photo|picture|avatar|location|edit/.test(msg)) {
    return `Profile aapka SkillBridge identity hai! 👤\n\n**Profile mein edit kar sakte hain:**\n• Name aur Bio\n• Location (city, state)\n• Profile picture upload/remove\n• Skills manage karna\n\n**Profile strength badhane ke liye:**\n✅ Bio likhein\n✅ Location add karein\n✅ Skills add karein (offer + want dono)\n✅ Pehla session complete karein`;
  }

  // Collab Board
  if (/collab|project|team|board|collaborate/.test(msg)) {
    return `Collab Board ek exciting feature hai! 🚀\n\n**Kya hai Collab Board:**\n• Yahan aap project ideas post kar sakte hain\n• Doosre users se collaborate kar sakte hain\n• Skills ke basis pe team bana sakte hain\n\n**Kaise use karein:**\n1. Collab Board page pe jaayein\n2. "New Post" se apna project idea share karein\n3. Ya doosron ke posts pe "Request to Join" karein`;
  }

  // How to get started
  if (/start|begin|new|kaise|how|guide|help|tutorial/.test(msg)) {
    return `SkillBridge pe shuru karna bahut easy hai! 🎉\n\n**Step-by-step guide:**\n1. **Profile complete karein** — bio aur location add karein\n2. **Skills add karein** — kya offer karte ho, kya seekhna chahte ho\n3. **Matches dekho** — compatible users se connect karein\n4. **Message karein** — introduce yourself\n5. **Session schedule karein** — date/time fix karein\n6. **Rating dein** — session ke baad feedback share karein\n\nKoi specific step mein help chahiye?`;
  }

  // Thank you
  if (/thanks|thank you|shukriya|dhanyawad|great|awesome|helpful/.test(msg)) {
    return `Khushi hui madad karke! 😊🙏\n\nAur koi sawaal ho toh zaroor poochiye. SkillBridge pe aapka learning journey successful ho — yahi meri dua hai! 🌟`;
  }

  // Bye
  if (/bye|goodbye|alvida|ok thanks|ok bye|chal/.test(msg)) {
    return `Alvida ${userName}! 👋\n\nKhub seekho, khub sikhao! SkillBridge pe milte hain. 🙏`;
  }

  // Default intelligent fallback
  const fallbacks = [
    `Samajh nahi aaya poori baat, lekin main help karne ki koshish karunga! 😊\n\nAap in topics ke baare mein pooch sakte hain:\n• Skills add/remove karna\n• Matches kaise kaam karte hain\n• Session schedule karna\n• Messages aur chat\n• Profile edit karna\n• Ratings aur reviews`,
    `Interesting sawaal! 🤔 Thoda aur detail mein batayein?\n\nYa aap directly pooch sakte hain:\n• "How to add skills?"\n• "How to schedule a session?"\n• "How do matches work?"`,
    `Main abhi is topic pe expert nahi hoon, but SkillBridge ke features ke baare mein zaroor help kar sakta hoon! 💡\n\nKya aap matches, sessions, skills, ya profile ke baare mein jaanna chahte hain?`,
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
      text: 'Namaste! 🙏 Main SkillBridge Assistant hoon.\n\nAapki kaise madad kar sakta hoon? Skills, Matches, Sessions ya kuch aur poochiye!',
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

  const quickReplies = ['How to add skills?', 'How do matches work?', 'Schedule a session', 'How to rate someone?'];

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
                    placeholder="Kuch bhi poochiye..."
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
