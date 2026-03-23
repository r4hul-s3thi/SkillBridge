import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from './AppSidebar';
import { useAuthStore } from '@/store/authStore';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { skillService } from '@/services/skillService';
import { matchService } from '@/services/matchService';
import { sessionService } from '@/services/sessionService';
import { messageService } from '@/services/messageService';
import { ratingService } from '@/services/ratingService';

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const { setConversations, setMatches, setSessions, setRatings, setSkills } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([
      skillService.getSkills(),
      matchService.getMatches(),
      sessionService.getSessions(),
      messageService.getConversations(),
      ratingService.getRatings(),
    ]).then(([skills, matches, sessions, conversations, ratings]) => {
      setSkills(skills.data);
      setMatches(matches.data);
      setSessions(sessions.data);
      setConversations(conversations.data);
      setRatings(ratings.data);
    }).catch(() => {
      // API not reachable — store stays with persisted data
    });
  }, [isAuthenticated, setSkills, setMatches, setSessions, setConversations, setRatings]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border/60 bg-background/80 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}
