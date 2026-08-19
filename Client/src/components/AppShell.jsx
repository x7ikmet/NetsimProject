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
import { ScenariosPage } from '../pages/ScenariosPage'
import { SettingsPage } from '../pages/SettingsPage'
import './AppShell.css'

function currentPathname() {
  const pathname = window.location.pathname
  return ['/scenarios', '/settings'].includes(pathname) ? pathname : '/'
}

export function AppShell({ children, user, error, submitting, onLogout }) {
  const [pathname, setPathname] = useState(currentPathname)

  useEffect(() => {
    function handlePopState() {
      setPathname(currentPathname())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextPathname) {
    if (nextPathname === pathname) return
    window.history.pushState({}, '', nextPathname)
    setPathname(nextPathname)
  }

  return (
    <TooltipProvider>
      <SidebarProvider className="app-shell">
        <AppSidebar
          pathname={pathname}
          username={user.username}
          onNavigate={navigate}
        />

        <SidebarInset className="app-main-shell">
          <header className="app-topbar">
            <SidebarTrigger className="app-sidebar-trigger" />
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

          <div className="app-route" hidden={pathname !== '/'}>
            {children}
          </div>
          {pathname === '/scenarios' ? <ScenariosPage /> : null}
          {pathname === '/settings' ? <SettingsPage /> : null}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
