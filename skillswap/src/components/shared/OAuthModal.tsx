import { useState } from 'react';
import { Github, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OAuthAccount {
  name: string;
  email: string;
  avatar: string;
}

const GOOGLE_ACCOUNTS: OAuthAccount[] = [
  { name: 'Aarav Patel',  email: 'aarav.patel@example.com',  avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Ananya Bose',  email: 'ananya.bose@example.com',  avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Rahul Sethi',  email: 'rahul.sethi@example.com',  avatar: 'https://randomuser.me/api/portraits/men/91.jpg' },
];

const GITHUB_ACCOUNTS: OAuthAccount[] = [
  { name: 'Rahul Singh',  email: 'rahul.singh@example.com',  avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { name: 'Vikram Desai', email: 'vikram.desai@example.com', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
  { name: 'Arjun Mehta',  email: 'arjun.mehta@example.com',  avatar: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { name: 'Rahul Sethi',  email: 'rahul.sethi@example.com',  avatar: 'https://randomuser.me/api/portraits/men/91.jpg' },
];

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M21.35 11.1H12v2.8h5.35c-.23 1.36-1.22 2.59-2.72 3.34l2.2 1.75c1.62-1.5 2.56-3.69 2.56-6.24 0-.42-.04-.84-.09-1.25z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.95-.9 6.6-2.45l-2.2-1.75c-1.05.7-2.4 1.1-4.4 1.1-3.4 0-6.26-2.3-7.29-5.4L2 14.9C3.75 18.8 7.6 22 12 22z" />
      <path fill="#FBBC05" d="M4.71 13.25a7.92 7.92 0 010-2.5L2 9.1a11.98 11.98 0 000 5.8l2.71-1.65z" />
      <path fill="#EA4335" d="M12 6.5c1.56 0 2.97.55 4.08 1.63l3.06-3.06C16.9 3.2 14.7 2 12 2 7.6 2 3.75 5.2 2 9.1l2.71 1.65C5.74 8.8 8.6 6.5 12 6.5z" />
    </svg>
  );
}

interface OAuthModalProps {
  provider: 'google' | 'github';
  onSelect: (account: OAuthAccount) => void;
  onClose: () => void;
  loading: boolean;
}

export function OAuthModal({ provider, onSelect, onClose, loading }: OAuthModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const accounts = provider === 'google' ? GOOGLE_ACCOUNTS : GITHUB_ACCOUNTS;
  const isGoogle = provider === 'google';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isGoogle ? 'bg-white' : 'bg-[#161b22]'}`}>

        {/* Header */}
        <div className={`px-6 pt-6 pb-4 ${isGoogle ? 'bg-white' : 'bg-[#161b22]'}`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${isGoogle ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-500 hover:bg-white/10'}`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center gap-3 text-center">
            {isGoogle ? (
              <GoogleIcon className="w-8 h-8" />
            ) : (
              <Github className={`w-8 h-8 ${isGoogle ? 'text-gray-800' : 'text-white'}`} />
            )}
            <div>
              <h2 className={`font-semibold text-base ${isGoogle ? 'text-gray-800' : 'text-white'}`}>
                Sign in with {isGoogle ? 'Google' : 'GitHub'}
              </h2>
              <p className={`text-xs mt-0.5 ${isGoogle ? 'text-gray-500' : 'text-gray-400'}`}>
                Choose an account to continue to SkillBridge
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${isGoogle ? 'bg-gray-200' : 'bg-white/10'}`} />

        {/* Account list */}
        <div className={`py-2 ${isGoogle ? 'bg-white' : 'bg-[#161b22]'}`}>
          {accounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => { setSelected(acc.email); onSelect(acc); }}
              disabled={loading}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                isGoogle
                  ? 'hover:bg-gray-50 text-gray-800'
                  : 'hover:bg-white/5 text-white'
              } ${loading && selected === acc.email ? 'opacity-70' : ''}`}
            >
              <img
                src={acc.avatar}
                alt={acc.name}
                className="w-9 h-9 rounded-full shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isGoogle ? 'text-gray-800' : 'text-white'}`}>
                  {acc.name}
                </p>
                <p className={`text-xs truncate ${isGoogle ? 'text-gray-500' : 'text-gray-400'}`}>
                  {acc.email}
                </p>
              </div>
              {loading && selected === acc.email ? (
                <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0 ${isGoogle ? 'border-blue-500' : 'border-white'}`} />
              ) : (
                selected === acc.email && <Check className="w-4 h-4 text-green-500 shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-px ${isGoogle ? 'bg-gray-200' : 'bg-white/10'}`} />

        {/* Footer */}
        <div className={`px-6 py-3 flex items-center justify-between ${isGoogle ? 'bg-gray-50' : 'bg-[#0d1117]'}`}>
          <p className={`text-xs ${isGoogle ? 'text-gray-400' : 'text-gray-500'}`}>
            Demo OAuth — no real {isGoogle ? 'Google' : 'GitHub'} login
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`text-xs h-7 ${isGoogle ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-white/10'}`}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { OAuthAccount };
