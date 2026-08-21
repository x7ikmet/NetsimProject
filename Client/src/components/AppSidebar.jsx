import { Bookmark, Network, Settings, UserRound } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

const navigationItems = [
  { href: '/', label: 'Yeni Ürün Ağacı', icon: Network },
  { href: '/scenarios', label: 'Kayıtlı Senaryolar', icon: Bookmark },
]

export function AppSidebar({ pathname, username, onNavigate }) {
  const { setOpenMobile } = useSidebar()

  function handleNavigate(event, href) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    onNavigate(href)
    setOpenMobile(false)
  }

  return (
    <Sidebar className="app-sidebar" variant="floating" collapsible="icon">
      <SidebarHeader className="app-sidebar-header">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="app-brand"
              size="lg"
              render={<div />}
            >
              <span
                className="app-brand-mark size-9 group-data-[collapsible=icon]:size-8"
                aria-hidden="true"
              >
                <img
                  src="https://www.netsim.com.tr/NSResources.nsx?r=/files/Image/Anasayfa/Cozumler/iconN4.png"
                  alt=""
                />
              </span>
              <span className="group-data-[collapsible=icon]:hidden">
                <strong>Netsim</strong>
                <small>Maliyet Yönetimi</small>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="app-navigation pt-[18px] group-data-[collapsible=icon]:pt-0">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    className="group-data-[collapsible=icon]:min-h-8! group-data-[collapsible=icon]:justify-center"
                    isActive={pathname === item.href}
                    size="lg"
                    tooltip={item.label}
                    render={
                      <a
                        href={item.href}
                        onClick={(event) => handleNavigate(event, item.href)}
                      />
                    }
                  >
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="app-sidebar-footer">
        <SidebarMenu className="app-utility-navigation">
          <SidebarMenuItem>
            <SidebarMenuButton
              className="group-data-[collapsible=icon]:min-h-8! group-data-[collapsible=icon]:justify-center"
              isActive={pathname === '/settings'}
              size="lg"
              tooltip="Ayarlar"
              render={
                <a
                  href="/settings"
                  onClick={(event) => handleNavigate(event, '/settings')}
                />
              }
            >
              <Settings />
              <span className="group-data-[collapsible=icon]:hidden">
                Ayarlar
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="app-user-menu">
          <SidebarMenuItem>
            <SidebarMenuButton className="app-user" size="lg" render={<div />}>
              <span
                className="app-user-mark size-9 group-data-[collapsible=icon]:size-8"
                aria-hidden="true"
              >
                <UserRound />
              </span>
              <span className="group-data-[collapsible=icon]:hidden">
                <small>Kullanıcı</small>
                <strong>{username}</strong>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
