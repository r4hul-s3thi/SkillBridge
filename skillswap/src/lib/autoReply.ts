type ReplySet = {
  greetings: string[];
  skillTalk: string[];
  scheduling: string[];
  compliments: string[];
  questions: string[];
  fallback: string[];
};

const personalities: Record<number, { name: string; replies: ReplySet }> = {
  2: {
    name: 'Priya',
    replies: {
      greetings: [
        'Hey Aarav! Kya haal hai? 😊',
        'Hi yaar! Bahut dino baad baat ho rahi hai!',
        'Hello! Flipkart mein aaj bahut kaam tha, ab free hoon 😄',
      ],
      skillTalk: [
        'UI/UX mein main zaroor help karungi! Figma mera favourite tool hai 🎨',
        'Design thinking bahut important hai — apna process share karungi tumse.',
        'Main 5 saal se Figma use kar rahi hoon, deep dive karte hain kabhi!',
        'React aur design saath mein bahut kaam aata hai — mujhe bhi React seekhna hai!',
      ],
      scheduling: [
        'Weekend pe session karte hain? Saturday afternoon free hoon 📅',
        'Kal shaam 6 baje Google Meet pe? Screen share karke Figma dikhaungi.',
        'Ek ghante ka session rakhte hain — main apna Flipkart project bhi dikhaungi!',
      ],
      compliments: [
        'Arre yaar, bahut shukriya! 🙏',
        'Aww thanks! Tum bhi bahut achhe ho!',
        'Dil khush kar diya tumne, thank you!',
      ],
      questions: [
        'UI/UX mein kya specifically seekhna hai — Figma ya design principles?',
        'Pehle kabhi Figma use kiya hai ya bilkul naya hai?',
        'Abhi kaunse projects pe kaam kar rahe ho?',
      ],
      fallback: [
        'Interesting! Aur batao 😊',
        'Haan yaar, bilkul sahi keh rahe ho!',
        'Achha point hai, socha nahi tha is angle se.',
        'Haha sahi hai! 😄',
        'Makes sense yaar!',
      ],
    },
  },
  3: {
    name: 'Rahul',
    replies: {
      greetings: [
        'Hey bhai! Kya chal raha hai?',
        'Hi! TCS se abhi nikla hoon, thoda thaka hoon 😅',
        'Hello! Java aur chai — yahi meri zindagi hai ☕',
      ],
      skillTalk: [
        'Spring Boot REST APIs ke liye main full setup dikhaunga — ekdum production-ready.',
        'Java verbose hai but bahut powerful — ek baar samajh gaye toh maza aata hai 💪',
        '3 saal se microservices bana raha hoon TCS mein — sab share karunga.',
        'Node.js mujhe bhi seekhna hai — knowledge exchange karte hain!',
      ],
      scheduling: [
        'Agli week session karte hain. 90 minute mein Spring Boot basics cover ho jayenge.',
        'Tuesday shaam 7 baje ke baad free hoon — theek rahega?',
        'Live coding session karte hain — ek REST API scratch se banaunga tumhare saath.',
      ],
      compliments: [
        'Thanks bhai, dil khush ho gaya!',
        'Yaar bahut shukriya, matlab rakhta hai!',
        'Thanks! Tum bhi solid developer ho.',
      ],
      questions: [
        'Java background hai ya bilkul naya hai?',
        'Kaunsa backend banana chahte ho — REST ya microservices?',
        'Interview prep ke liye hai ya actual project ke liye?',
      ],
      fallback: [
        'Haan bhai, sahi baat hai.',
        'Interesting, dekhta hoon.',
        'Achha hai yaar!',
        'Haha sach mein 😄',
        'Agreed, solid point.',
      ],
    },
  },
  4: {
    name: 'Ananya',
    replies: {
      greetings: [
        'Hi! Kolkata se bol rahi hoon, chai pi rahi thi 😄',
        'Hello! Data science enthusiast here 👋',
        'Hey! ML aur Python ki baat karni hai? Main ready hoon!',
      ],
      skillTalk: [
        'Python for ML ek mast journey hai — NumPy, Pandas, Scikit-learn, TensorFlow sab sikhenge! 🐍',
        'Infosys mein real datasets pe kaam kiya hai — poora pipeline dikhaungi.',
        'Machine learning complex lagta hai but maths samajh aaye toh click ho jaata hai!',
        'JavaScript mujhe bhi seekhna hai — mera ek weak point hai woh.',
      ],
      scheduling: [
        'Python session karte hain! Basics se shuru karke aage badhenge 📊',
        'Do ghante ka data science fundamentals session kaisa rahega?',
        'Main zyaadatar evenings free hoon — koi bhi din choose karo!',
      ],
      compliments: [
        'Bahut shukriya! Isse motivation milta hai 😊',
        'Aww yaar, bahut sweet ho tum!',
        'Dil se thank you!',
      ],
      questions: [
        'ML ka goal kya hai — research, industry job, ya curiosity?',
        'Python pehle use kiya hai ya bilkul fresh start?',
        'Data analysis mein interest hai ya predictive models banana chahte ho?',
      ],
      fallback: [
        'Oh interesting! Aisa socha nahi tha 🤔',
        'Bahut achha perspective hai!',
        'Haha haan, bilkul agree! 😄',
        'Bahut sense banta hai!',
        'Cool, batate rehna!',
      ],
    },
  },
  5: {
    name: 'Vikram',
    replies: {
      greetings: [
        'Hey! Wipro ka DevOps banda bol raha hoon 🚀',
        'Hi bhai! Kya haal?',
        'Hello! Docker aur Kubernetes ki baat karni hai?',
      ],
      skillTalk: [
        'Docker ne deployment ka tarika hi badal diya — containerization must-know skill hai.',
        'Kubernetes pehle complex lagta hai but ek baar samajh aaye toh bahut powerful hai ⚙️',
        'AWS ke bahut saare services hain — main bataunga kaunse actually kaam ke hain.',
        'CI/CD pipelines meri specialty hai — saath mein ek setup karte hain.',
      ],
      scheduling: [
        'Hands-on Docker session karte hain — ek real app containerize karenge saath mein.',
        'Kubernetes 2 sessions mein cover karunga — pehle basics, phir advanced.',
        'Is weekend free hoon — AWS walkthrough karte hain live?',
      ],
      compliments: [
        'Thanks yaar! 🙌',
        'Shukriya bhai!',
        'Achha laga sunke, thanks!',
      ],
      questions: [
        'AWS, GCP ya Azure — kahan deploy karna hai?',
        'Docker pehle use kiya hai ya fresh start?',
        'Kaunsa app deploy karna chahte ho?',
      ],
      fallback: [
        'Haan solid point hai.',
        'Makes sense yaar.',
        'Interesting approach!',
        'Achha hai, thanks!',
        'Haha fair enough 😄',
      ],
    },
  },
  6: {
    name: 'Neha',
    replies: {
      greetings: [
        'Hey! Swiggy se abhi order kiya aur ab chat kar rahi hoon 😄',
        'Hi yaar! Frontend dev here!',
        'Hello! Vue aur React meri duniya hai 💻',
      ],
      skillTalk: [
        'Vue 3 Composition API bahut clean hai — main love karti hoon isse!',
        'TypeScript frontend code ko bahut maintainable banata hai 💪',
        '4 saal se frontend kar rahi hoon — sab kuch share karungi.',
        'React master karna hai mujhe — tumse seekhna chahti hoon!',
      ],
      scheduling: [
        'Vue session karte hain! Main dikhaungi kaise large projects structure karte hain.',
        'TypeScript deep dive kaisa rahega? Code likhne ka tarika hi badal jaayega.',
        'Main zyaadatar mornings free hoon — bas bolo kab!',
      ],
      compliments: [
        'Aww yaar bahut shukriya! 😊',
        'Bahut sweet ho tum, thanks!',
        'Dil khush kar diya!',
      ],
      questions: [
        'React mein ho ya Vue bhi seekhna chahte ho?',
        'Kaunse frontend projects bana rahe ho abhi?',
        'TypeScript already use karte ho ya plain JavaScript?',
      ],
      fallback: [
        'Oh cool hai yaar!',
        'Bilkul agree karti hoon!',
        'Haha haan exactly 😄',
        'Interesting, aur batao!',
        'Makes sense!',
      ],
    },
  },
  7: {
    name: 'Arjun',
    replies: {
      greetings: [
        'Hey! HCL ka cloud architect bol raha hoon ☁️',
        'Hi! IIT Madras se hoon, Chennai mein hoon abhi.',
        'Hello! AWS aur Azure mera playground hai.',
      ],
      skillTalk: [
        'AWS ke 200+ services hain — main bataunga kaunse actually important hain.',
        'Cloud architecture trade-offs ke baare mein hai — cost, performance, reliability.',
        'Millions of requests handle karne wale systems design kiye hain — patterns share karunga.',
        'React seekhna hai mujhe — knowledge exchange karte hain!',
      ],
      scheduling: [
        'AWS fundamentals session karte hain — EC2, S3, RDS aur Lambda cover karunga.',
        'System design session kaisa rahega? Interviews ke liye bhi bahut useful hai.',
        'Weekends pe free hoon — time choose karo aur shuru karte hain.',
      ],
      compliments: [
        'Thanks yaar, appreciate it!',
        'Bahut shukriya, matlab rakhta hai!',
        'Thank you! Tum bhi bahut achhe ho.',
      ],
      questions: [
        'AWS ke kaunse services mein interest hai?',
        'AWS certification ke liye prepare kar rahe ho ya project ke liye?',
        'Startup scale ke liye hai ya enterprise?',
      ],
      fallback: [
        'Achha point hai!',
        'Interesting perspective.',
        'Makes sense yaar.',
        'Haha haan, fair enough 😄',
        'Noted, thanks for sharing!',
      ],
    },
  },
};

function detectIntent(message: string): keyof ReplySet {
  const msg = message.toLowerCase();
  if (/hi|hello|hey|haan|kya haal|namaste|kaise|sup/.test(msg)) return 'greetings';
  if (/skill|teach|learn|sikho|sikhao|react|python|java|docker|figma|vue|aws|node|ml|machine|design|typescript/.test(msg)) return 'skillTalk';
  if (/schedule|session|meet|time|free|when|available|book|call|kab|milte|kal|aaj/.test(msg)) return 'scheduling';
  if (/thanks|thank|shukriya|great|awesome|amazing|good|nice|excellent|love|appreciate|bahut achha/.test(msg)) return 'compliments';
  if (/\?/.test(msg)) return 'questions';
  return 'fallback';
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAutoReply(userId: number, userMessage: string): string {
  const persona = personalities[userId];
  if (!persona) return 'Got it! 👍';
  const intent = detectIntent(userMessage);
  return getRandom(persona.replies[intent]);
}

export function getReplyDelay(): number {
  return 1500 + Math.random() * 2000;
}
