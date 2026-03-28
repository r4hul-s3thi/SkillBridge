import { Outlet, Navigate } from "react-router-dom"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "./AppSidebar"
import { useAuthStore } from "@/store/authStore"
import { useEffect } from "react"
import { useAppStore } from "@/store/appStore"
import { skillService } from "@/services/skillService"
import { matchService } from "@/services/matchService"
import { sessionService } from "@/services/sessionService"
import { messageService } from "@/services/messageService"
import { ratingService } from "@/services/ratingService"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { ChatBot } from "@/components/shared/ChatBot"
import { Toaster } from "@/components/ui/sonner"

export function AppLayout() {
  const { isAuthenticated } = useAuthStore()
  const { setConversations, setMatches, setSessions, setRatings, setSkills } =
    useAppStore()

  useEffect(() => {
    if (!isAuthenticated) return

    Promise.all([
      skillService.getSkills(),
      matchService.getMatches(),
      sessionService.getSessions(),
      messageService.getConversations(),
      ratingService.getRatings(),
    ])
      .then(([skills, matches, sessions, conversations, ratings]) => {
        setSkills(skills.data)
        setMatches(matches.data)
        setSessions(sessions.data)
        setConversations(conversations.data)
        setRatings(ratings.data)
      })
      .catch(() => {
        // API not reachable — store stays with persisted data
      })
  }, [
    isAuthenticated,
    setSkills,
    setMatches,
    setSessions,
    setConversations,
    setRatings,
  ])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-13 items-center gap-2 border-b border-border/40 bg-background/70 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1 text-muted-foreground transition-colors hover:text-foreground" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1" />
          <ThemeToggle className="border-border/60 bg-background/70 text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted dark:bg-card/70" />
          <div className="gradient-bg-animated h-1.5 w-24 rounded-full opacity-60" />
        </header>
        <main className="animate-fade-up flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <ChatBot />
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  )
}
