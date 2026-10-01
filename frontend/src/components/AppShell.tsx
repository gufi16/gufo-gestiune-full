import { useState } from "react"
import { Outlet } from "react-router-dom"
import MobileBottomNav from "./MobileBottomNav"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import GufoAiWidget from "./GufoAiWidget"

export default function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="erp-workspace min-h-screen overflow-x-hidden bg-[#f5f1e9] text-slate-900">
      <div className="flex min-h-screen overflow-x-hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileSidebarOpen(true)} />

          <main className="erp-desktop-dense flex-1 overflow-x-hidden px-3 pb-24 pt-3 md:px-4 md:pb-5 md:pt-3 xl:px-4 xl:pb-6 xl:pt-4">
            <div className="mx-auto w-full min-w-0 max-w-[1680px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav onOpenMenu={() => setMobileSidebarOpen(true)} />
      <GufoAiWidget />
    </div>
  )
}
