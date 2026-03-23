// Each user has a personality and topic-aware replies

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
        'Hey! Great to hear from you 😊',
        'Hi there! How are you doing?',
        'Hello! Always happy to chat!',
      ],
      skillTalk: [
        'I can definitely help you with UI/UX! Figma is my go-to tool 🎨',
        'Design thinking is so important — happy to walk you through my process.',
        'I have been using Figma for 5 years now, we can do a deep dive anytime!',
        'React and design go hand in hand — I would love to learn more React from you!',
      ],
      scheduling: [
        'Sure! How about we schedule a session this weekend? 📅',
        'I am free on Saturday afternoon, does that work for you?',
        'Let us set up a 1-hour session — I can share my screen and walk you through Figma.',
      ],
      compliments: [
        'That is so kind of you, thank you! 🙏',
        'Aww thanks! You are great to work with too!',
        'Really appreciate that, means a lot!',
      ],
      questions: [
        'What specific part of UI/UX are you most interested in?',
        'Have you used Figma before or are you starting from scratch?',
        'What kind of projects are you working on right now?',
      ],
      fallback: [
        'That sounds interesting! Tell me more 😊',
        'I totally agree with that!',
        'Good point! I had not thought of it that way.',
        'Haha yes exactly! 😄',
        'Makes sense to me!',
      ],
    },
  },
  3: {
    name: 'Rahul',
    replies: {
      greetings: [
        'Hey! What is up?',
        'Hi! Good to see you here.',
        'Hello! Ready to talk tech?',
      ],
      skillTalk: [
        'Spring Boot is amazing for building REST APIs — I can show you the full setup.',
        'Java is verbose but very powerful once you get the hang of it 💪',
        'I have built microservices with Spring Boot for 3 years, happy to share what I know.',
        'Node.js is on my learning list — would love to swap knowledge!',
      ],
      scheduling: [
        'Let us do a session next week. I can cover Spring Boot basics in 90 minutes.',
        'How about Tuesday evening? I am free after 7pm.',
        'We can do a live coding session — I will build a REST API from scratch for you.',
      ],
      compliments: [
        'Thanks man, appreciate it!',
        'That means a lot, cheers!',
        'Thanks! You are pretty solid yourself.',
      ],
      questions: [
        'Do you have any Java background or are you completely new to it?',
        'What kind of backend are you trying to build?',
        'Are you more interested in REST APIs or microservices architecture?',
      ],
      fallback: [
        'Yeah that makes sense.',
        'Interesting, I will look into that.',
        'Good to know!',
        'Haha true 😄',
        'Agreed, solid point.',
      ],
    },
  },
  4: {
    name: 'Ananya',
    replies: {
      greetings: [
        'Hi! Excited to connect with you! 🤗',
        'Hello! Data science enthusiast here 👋',
        'Hey! Always happy to talk ML and Python!',
      ],
      skillTalk: [
        'Python for ML is such a fun journey — NumPy, Pandas, Scikit-learn, TensorFlow! 🐍',
        'I have trained models on real datasets, happy to walk you through the whole pipeline.',
        'Machine learning sounds complex but once you understand the math it clicks!',
        'I would love to learn JavaScript from you — it is the one gap in my skill set.',
      ],
      scheduling: [
        'Let us do a Python session! I can start with the basics and go from there 📊',
        'How about a 2-hour deep dive into data science fundamentals?',
        'I am free most evenings — just pick a day and we will get started!',
      ],
      compliments: [
        'Thank you so much! That really motivates me 😊',
        'Aww that is so sweet, thank you!',
        'Really appreciate the kind words!',
      ],
      questions: [
        'What is your goal with ML — research, industry, or just curiosity?',
        'Have you done any Python before or is this your first time?',
        'Are you more interested in data analysis or building predictive models?',
      ],
      fallback: [
        'Oh interesting! I never thought about it that way 🤔',
        'That is a great perspective!',
        'Haha yes, totally agree! 😄',
        'Makes a lot of sense!',
        'Cool, let me know how it goes!',
      ],
    },
  },
  5: {
    name: 'Vikram',
    replies: {
      greetings: [
        'Hey! DevOps guy here 🚀',
        'Hi! What is up?',
        'Hello! Ready to talk Docker and Kubernetes?',
      ],
      skillTalk: [
        'Docker changed the way I deploy apps — containerization is a must-know skill.',
        'Kubernetes is complex at first but once it clicks, it is incredibly powerful ⚙️',
        'AWS has so many services — I can help you navigate the ones that matter most.',
        'CI/CD pipelines are my specialty — happy to set one up with you.',
      ],
      scheduling: [
        'Let us do a hands-on Docker session — we will containerize a real app together.',
        'I can walk you through Kubernetes in 2 sessions — basics first, then advanced.',
        'Free this weekend — want to do a live AWS walkthrough?',
      ],
      compliments: [
        'Thanks! Appreciate it 🙌',
        'Cheers mate!',
        'That is good to hear, thanks!',
      ],
      questions: [
        'Are you deploying to AWS, GCP or Azure?',
        'Have you used Docker before or starting fresh?',
        'What kind of app are you trying to deploy?',
      ],
      fallback: [
        'Yeah solid point.',
        'Makes sense to me.',
        'Interesting approach!',
        'Good to know, thanks!',
        'Haha fair enough 😄',
      ],
    },
  },
  6: {
    name: 'Neha',
    replies: {
      greetings: [
        'Hey! So happy to connect 😊',
        'Hi there! Frontend dev here!',
        'Hello! Vue and React are my world 💻',
      ],
      skillTalk: [
        'Vue 3 with the Composition API is so clean — I love it!',
        'TypeScript makes frontend code so much more maintainable 💪',
        'I have been doing frontend for 4 years — happy to share what I have learned.',
        'React is on my list to master — would love to learn from you!',
      ],
      scheduling: [
        'Let us do a Vue session! I can show you how I structure large projects.',
        'How about a TypeScript deep dive? It will change how you write code.',
        'I am free most mornings — just say when!',
      ],
      compliments: [
        'Aww thank you so much! 😊',
        'That is really sweet, thanks!',
        'You are too kind!',
      ],
      questions: [
        'Are you more into React or open to learning Vue as well?',
        'What kind of frontend projects are you building?',
        'Do you use TypeScript already or still on plain JavaScript?',
      ],
      fallback: [
        'Oh that is cool!',
        'Totally agree with you!',
        'Haha yes exactly 😄',
        'Interesting, tell me more!',
        'Makes sense!',
      ],
    },
  },
  7: {
    name: 'Arjun',
    replies: {
      greetings: [
        'Hey! Cloud architect here ☁️',
        'Hi! Good to connect.',
        'Hello! AWS and Azure are my playground.',
      ],
      skillTalk: [
        'AWS has over 200 services — I can help you focus on the ones you actually need.',
        'Cloud architecture is all about trade-offs — cost, performance, reliability.',
        'I have designed systems that handle millions of requests — happy to share patterns.',
        'React is something I want to learn — would love to exchange knowledge!',
      ],
      scheduling: [
        'Let us do an AWS fundamentals session — I will cover EC2, S3, RDS and Lambda.',
        'How about a system design session? Very useful for interviews too.',
        'I am free on weekends — pick a time and we will get started.',
      ],
      compliments: [
        'Thanks, appreciate it!',
        'That means a lot, cheers!',
        'Thank you! You are great to work with.',
      ],
      questions: [
        'What AWS services are you most interested in?',
        'Are you preparing for AWS certification or just learning for projects?',
        'What scale are you building for — startup or enterprise?',
      ],
      fallback: [
        'Good point!',
        'Interesting perspective.',
        'Makes sense to me.',
        'Haha yeah, fair enough 😄',
        'Noted, thanks for sharing!',
      ],
    },
  },
};

function detectIntent(message: string): keyof ReplySet {
  const msg = message.toLowerCase();
  if (/hi|hello|hey|howdy|sup|what.?s up/.test(msg)) return 'greetings';
  if (/skill|teach|learn|react|python|java|docker|figma|vue|aws|node|ml|machine|design|typescript/.test(msg)) return 'skillTalk';
  if (/schedule|session|meet|time|free|when|available|book|call/.test(msg)) return 'scheduling';
  if (/thanks|thank|great|awesome|amazing|good|nice|excellent|love|appreciate/.test(msg)) return 'compliments';
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

// Random delay between 1.5s and 3.5s to feel natural
export function getReplyDelay(): number {
  return 1500 + Math.random() * 2000;
}
