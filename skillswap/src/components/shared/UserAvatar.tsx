import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

// Deterministic gradient per user based on name
const gradients = [
  'from-cyan-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-rose-500',
  'from-pink-400 to-fuchsia-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-indigo-500',
  'from-lime-400 to-green-500',
];

function getGradient(name: string) {
  const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[code % gradients.length];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserAvatar({ name, avatar, size = 'md' }: UserAvatarProps) {
  const gradient = getGradient(name);
  return (
    <Avatar className={`${sizeMap[size]} ring-2 ring-transparent transition-all duration-200 hover:ring-primary/30`}>
      <AvatarImage src={avatar} alt={name} className="object-cover" />
      <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold`}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
