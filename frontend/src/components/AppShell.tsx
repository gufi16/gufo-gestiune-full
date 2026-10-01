import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import MobileBottomNav from "./MobileBottomNav"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import GufoAiWidget from "./GufoAiWidget"

export default function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname === "/dashboard"

  return (
    <div className={`erp-workspace min-h-screen overflow-x-hidden bg-[#f1f2f5] text-slate-900${isDashboard ? " xl:h-screen xl:overflow-hidden" : ""}`}>
      <div className={`flex min-h-screen overflow-x-hidden${isDashboard ? " xl:h-screen" : ""}`}>
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileSidebarOpen(true)} />

          <main className={isDashboard
            ? "erp-dashboard-shell flex-1 overflow-x-hidden px-3 pb-24 pt-3 md:px-5 md:pb-5 md:pt-4 xl:overflow-hidden xl:p-3"
            : "erp-desktop-dense flex-1 overflow-x-hidden px-3 pb-24 pt-3 md:px-5 md:pb-5 md:pt-4 xl:px-6 xl:pb-6 xl:pt-5"}
          >
            <div className={`mx-auto w-full min-w-0${isDashboard ? " h-full max-w-none" : " max-w-[1800px]"}`}>
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
