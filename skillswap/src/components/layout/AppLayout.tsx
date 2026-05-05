import { Outlet, Navigate } from "react-router-dom"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "./AppSidebar"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"
import { useAppStore } from "@/store/appStore"
import { skillService } from "@/services/skillService"
import { matchService } from "@/services/matchService"
import { sessionService } from "@/services/sessionService"
import { messageService } from "@/services/messageService"
import { ratingService } from "@/services/ratingService"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { ChatBot } from "@/components/shared/ChatBot"
import { Toaster } from "@/components/ui/sonner"

function AppSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 animate-pulse">
      <div className="h-32 rounded-[24px] bg-muted/60" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/50" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-muted/50" />
        <div className="h-64 rounded-2xl bg-muted/50" />
      </div>
    </div>
  )
}

export function AppLayout() {
  const { isAuthenticated } = useAuthStore()
  const { setConversations, setMatches, setSessions, setRatings, setSkills } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    setLoading(true)
    Promise.allSettled([
      skillService.getSkills(),
      matchService.getMatches(),
      sessionService.getSessions(),
      messageService.getConversations(),
      ratingService.getRatings(),
    ]).then(([skills, matches, sessions, conversations, ratings]) => {
      if (skills.status === "fulfilled") setSkills(skills.value.data)
      if (matches.status === "fulfilled") setMatches(matches.value.data)
      if (sessions.status === "fulfilled") setSessions(sessions.value.data)
      if (conversations.status === "fulfilled") setConversations(conversations.value.data)
      if (ratings.status === "fulfilled") setRatings(ratings.value.data)
    }).finally(() => setLoading(false))
  }, [isAuthenticated])

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
        {loading ? (
          <AppSkeleton />
        ) : (
          <main className="animate-fade-up flex-1 p-3 sm:p-4 md:p-6 min-w-0 page-enter">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        )}
      </SidebarInset>
      <ChatBot />
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  )
}
