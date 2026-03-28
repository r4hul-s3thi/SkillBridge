import type { User, Skill, Match, Conversation, Session, Rating } from '@/types';

export const currentUser: User = {
  id: 1,
  name: 'Aarav Patel',
  email: 'aarav.patel@gmail.com',
  bio: 'Full-stack developer from Bengaluru. Passionate about React, Node.js and helping fellow developers grow. IIT Bombay alumnus 🎓',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  location: 'Bengaluru, Karnataka',
  rating: 4.8,
  totalSessions: 24,
};

export const mockUsers: User[] = [
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    bio: 'UI/UX Designer at Flipkart with 5 years of experience. Figma & Adobe XD expert. Based in Mumbai.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Mumbai, Maharashtra',
    rating: 4.9,
    totalSessions: 31,
  },
  {
    id: 3,
    name: 'Rahul Singh',
    email: 'rahul.singh@gmail.com',
    bio: 'Backend engineer at TCS specialising in Java and Spring Boot. 6 years of experience. Delhi boy 🏏',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    location: 'New Delhi, Delhi',
    rating: 4.7,
    totalSessions: 18,
  },
  {
    id: 4,
    name: 'Ananya Bose',
    email: 'ananya.bose@gmail.com',
    bio: 'Data Scientist at Infosys. Python, ML, TensorFlow. Jadavpur University graduate. Love chai and code ☕',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    location: 'Kolkata, West Bengal',
    rating: 4.6,
    totalSessions: 22,
  },
  {
    id: 5,
    name: 'Vikram Desai',
    email: 'vikram.desai@gmail.com',
    bio: 'DevOps engineer at Wipro. Docker, Kubernetes, AWS. Pune-based. Cricket fan and cloud enthusiast ☁️',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    location: 'Pune, Maharashtra',
    rating: 4.5,
    totalSessions: 15,
  },
  {
    id: 6,
    name: 'Neha Reddy',
    email: 'neha.reddy@gmail.com',
    bio: 'Frontend engineer at Swiggy. React and Vue expert. BITS Pilani grad. Hyderabad biryani lover 🍛',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    location: 'Hyderabad, Telangana',
    rating: 4.8,
    totalSessions: 20,
  },
  {
    id: 7,
    name: 'Arjun Mehta',
    email: 'arjun.mehta@gmail.com',
    bio: 'Cloud architect at HCL Technologies. AWS & Azure certified. Chennai-based. IIT Madras alumnus.',
    avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
    location: 'Chennai, Tamil Nadu',
    rating: 4.7,
    totalSessions: 17,
  },
];

export const mockSkills: Skill[] = [
  { id: 1, userId: 1, skillName: 'React', type: 'offer', level: 'Expert' },
  { id: 2, userId: 1, skillName: 'JavaScript', type: 'offer', level: 'Expert' },
  { id: 3, userId: 1, skillName: 'Node.js', type: 'offer', level: 'Advanced' },
  { id: 4, userId: 1, skillName: 'Python', type: 'want', level: 'Beginner' },
  { id: 5, userId: 1, skillName: 'Machine Learning', type: 'want', level: 'Beginner' },
  { id: 6, userId: 1, skillName: 'UI/UX Design', type: 'want', level: 'Intermediate' },
];

export const mockMatches: Match[] = [
  {
    id: 1, user1Id: 1, user2Id: 2, status: 'active',
    matchedUser: mockUsers[0],
    matchedSkills: { offer: ['React', 'JavaScript'], want: ['UI/UX Design', 'Figma'] },
    compatibilityScore: 94,
  },
  {
    id: 2, user1Id: 1, user2Id: 3, status: 'active',
    matchedUser: mockUsers[1],
    matchedSkills: { offer: ['Node.js'], want: ['Java', 'Spring Boot'] },
    compatibilityScore: 87,
  },
  {
    id: 3, user1Id: 1, user2Id: 4, status: 'active',
    matchedUser: mockUsers[2],
    matchedSkills: { offer: ['Python'], want: ['Data Science', 'ML'] },
    compatibilityScore: 88,
  },
  {
    id: 4, user1Id: 1, user2Id: 5, status: 'active',
    matchedUser: mockUsers[3],
    matchedSkills: { offer: ['Docker', 'Kubernetes'], want: ['DevOps', 'Cloud'] },
    compatibilityScore: 85,
  },
  {
    id: 5, user1Id: 1, user2Id: 6, status: 'pending',
    matchedUser: mockUsers[4],
    matchedSkills: { offer: ['JavaScript'], want: ['Vue', 'TypeScript'] },
    compatibilityScore: 79,
  },
  {
    id: 6, user1Id: 1, user2Id: 7, status: 'pending',
    matchedUser: mockUsers[5],
    matchedSkills: { offer: ['React'], want: ['AWS', 'Cloud Architecture'] },
    compatibilityScore: 72,
  },
];

export const mockConversations: Conversation[] = [
  { id: 1, participant: mockUsers[0], lastMessage: 'Haan bhai, kal React session karte hain! 🙌', lastMessageAt: '2026-03-23T09:30:00Z', unreadCount: 2 },
  { id: 2, participant: mockUsers[1], lastMessage: 'Spring Boot ke basics cover kar deta hoon.', lastMessageAt: '2026-03-22T15:00:00Z', unreadCount: 0 },
  { id: 3, participant: mockUsers[2], lastMessage: 'Python for ML sounds great! Kab start karein?', lastMessageAt: '2026-03-21T10:00:00Z', unreadCount: 1 },
];

export const mockMessages = [
  { id: 1, senderId: 2, receiverId: 1, message: 'Hey Aarav! Tumhara React profile dekha. Bahut impressive hai yaar! 😊', createdAt: '2026-03-23T09:00:00Z' },
  { id: 2, senderId: 1, receiverId: 2, message: 'Hi Priya! Thanks yaar. Main React sikhaunga aur tum UI/UX — deal pakka? 🤝', createdAt: '2026-03-23T09:05:00Z' },
  { id: 3, senderId: 2, receiverId: 1, message: 'Bilkul! Figma mein ek project bhi dikhaungi. Kab free ho?', createdAt: '2026-03-23T09:20:00Z' },
  { id: 4, senderId: 1, receiverId: 2, message: 'Kal 3 baje theek rahega? Google Meet pe?', createdAt: '2026-03-23T09:25:00Z' },
  { id: 5, senderId: 2, receiverId: 1, message: 'Haan bhai, kal React session karte hain! 🙌', createdAt: '2026-03-23T09:30:00Z' },
];

export const mockSessions: Session[] = [
  { id: 1, matchId: 1, date: '2026-03-24T15:00:00Z', status: 'accepted', participant: mockUsers[0], topic: 'React Hooks Deep Dive', duration: 60 },
  { id: 2, matchId: 2, date: '2026-03-25T10:00:00Z', status: 'pending', participant: mockUsers[1], topic: 'Spring Boot REST APIs', duration: 90 },
  { id: 3, matchId: 3, date: '2026-03-26T14:00:00Z', status: 'pending', participant: mockUsers[2], topic: 'Python for Data Science', duration: 60 },
  { id: 4, matchId: 1, date: '2026-03-20T15:00:00Z', status: 'completed', participant: mockUsers[0], topic: 'Figma Basics', duration: 45 },
  { id: 5, matchId: 2, date: '2026-03-18T11:00:00Z', status: 'completed', participant: mockUsers[1], topic: 'JavaScript Advanced Patterns', duration: 60 },
  { id: 6, matchId: 5, date: '2026-03-27T11:00:00Z', status: 'pending', participant: mockUsers[2], topic: 'Data Science with Python', duration: 60 },
  { id: 7, matchId: 6, date: '2026-03-28T16:00:00Z', status: 'pending', participant: mockUsers[3], topic: 'Kubernetes for Beginners', duration: 75 },
];

export const mockRatings: Rating[] = [
  { id: 1, fromUser: mockUsers[0], toUserId: 1, rating: 5, feedback: 'Aarav bhai ne React bahut achhe se sikhaya! Bahut patient aur knowledgeable hain. Highly recommend! 🙏', createdAt: '2026-03-21T10:00:00Z' },
  { id: 2, fromUser: mockUsers[1], toUserId: 1, rating: 4, feedback: 'JavaScript session mast tha. Closures aur Promises ab clear ho gaye. Shukriya Aarav!', createdAt: '2026-03-19T12:00:00Z' },
  { id: 3, fromUser: mockUsers[2], toUserId: 1, rating: 5, feedback: 'Async/await ka explanation ekdum clear tha. Definitely recommend karunga apne connections ko!', createdAt: '2026-03-15T09:00:00Z' },
];
