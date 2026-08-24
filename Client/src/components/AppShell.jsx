import { useEffect, useState } from 'react'
import { LoaderCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from './AppSidebar'
import { SettingsPage } from '../pages/SettingsPage'
import { ActivityLogsPage } from '../pages/ActivityLogsPage'
import './AppShell.css'

function currentPathname(canViewActivityLogs) {
  const pathname = window.location.pathname
  if (pathname === '/settings') return pathname
  return pathname === '/activity-logs' && canViewActivityLogs ? pathname : '/'
}

export function AppShell({ children, user, error, submitting, onLogout }) {
  const [pathname, setPathname] = useState(() => currentPathname(user.canViewActivityLogs))

  useEffect(() => {
    function handlePopState() {
      setPathname(currentPathname(user.canViewActivityLogs))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [user.canViewActivityLogs])

  function navigate(nextPathname) {
    if (nextPathname === pathname) return
    window.history.pushState({}, '', nextPathname)
    setPathname(nextPathname)
  }

  return (
    <TooltipProvider>
      <SidebarProvider className="app-shell">
        <header className="app-topbar">
          <SidebarTrigger className="app-sidebar-trigger" />
          <span className="app-topbar-title">Ürün Ağacı Maliyet Aracı</span>
          <div className="app-topbar-spacer" />
          {error ? <p role="alert">{error}</p> : null}
          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            disabled={submitting}
          >
            {submitting ? (
              <LoaderCircle className="auth-spinner" aria-hidden="true" />
            ) : (
              <LogOut data-icon="inline-start" aria-hidden="true" />
            )}
            Çıkış yap
          </Button>
        </header>

        <div className="app-workspace">
          <AppSidebar
            pathname={pathname}
            username={user.username}
            canViewActivityLogs={user.canViewActivityLogs}
            onNavigate={navigate}
          />

          <SidebarInset className="app-main-shell">
            <div className="app-route" hidden={pathname !== '/'}>
              {children}
            </div>
            {pathname === '/settings' ? <SettingsPage /> : null}
            {pathname === '/activity-logs' ? <ActivityLogsPage /> : null}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
